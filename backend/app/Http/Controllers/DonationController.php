<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Transaction;
use App\Models\Charity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DonationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $donations = Donation::with(['user', 'transaction'])
            ->when(!Auth::user()->is_admin, function ($query) {
                return $query->where('user_id', Auth::id())
                    ->orWhere(function ($q) {
                        $q->where('is_anonymous', false);
                    });
            })
            ->latest()
            ->paginate(10);

        return response()->json($donations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Log the incoming request data
            \Log::info('Donation request received:', [
                'data' => $request->all(),
                'headers' => $request->headers->all(),
                'user' => Auth::user() ? [
                    'id' => Auth::id(),
                    'ic_number' => Auth::user()->ic_number
                ] : null
            ]);

            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'currency_type' => 'required|string',
                'cause_id' => 'required|exists:charities,id',
                'donor_message' => 'nullable|string|max:500',
                'is_anonymous' => 'boolean',
                'transaction_hash' => 'nullable|string',
                'smart_contract_data' => 'nullable|array'
            ]);

            // Log validated data
            \Log::info('Validated donation data:', $validated);

            // Check if charity exists
            $charity = Charity::find($validated['cause_id']);
            if (!$charity) {
                \Log::error('Charity not found:', ['cause_id' => $validated['cause_id']]);
                return response()->json(['message' => 'Charity not found'], 404);
            }

            \Log::info('Charity found:', ['charity' => $charity->toArray()]);

            DB::beginTransaction();

            // Create transaction first
            $transaction = Transaction::create([
                'user_ic' => Auth::user()->ic_number,
                'charity_id' => $validated['cause_id'],
                'amount' => $validated['amount'],
                'type' => 'charity',
                'status' => 'pending',
                'message' => $validated['donor_message'] ?? null,
                'anonymous' => $validated['is_anonymous'] ?? false,
                'transaction_hash' => $validated['transaction_hash'] ?? null
            ]);

            // Log transaction creation
            \Log::info('Transaction created:', $transaction->toArray());

            // Create donation record with transaction_id
            $donation = Donation::create([
                'user_id' => Auth::user()->ic_number,
                'transaction_hash' => $validated['transaction_hash'] ?? null,
                'amount' => $validated['amount'],
                'currency_type' => $validated['currency_type'],
                'cause_id' => $validated['cause_id'],
                'status' => 'pending',
                'donor_message' => $validated['donor_message'] ?? null,
                'is_anonymous' => $validated['is_anonymous'] ?? false,
                'smart_contract_data' => $validated['smart_contract_data'] ?? null
            ]);

            // Log donation creation
            \Log::info('Donation created:', $donation->toArray());

            // Link the transaction to the donation
            $transaction->donation()->save($donation);

            DB::commit();

            \Log::info('Donation process completed successfully', [
                'donation_id' => $donation->id,
                'transaction_id' => $transaction->id
            ]);

            return response()->json([
                'message' => 'Donation created successfully',
                'id' => $donation->id,
                'donation' => $donation->load(['transaction', 'charity'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            \Log::error('Validation error:', [
                'errors' => $e->errors(),
                'data' => $request->all(),
                'user' => Auth::user() ? [
                    'id' => Auth::id(),
                    'ic_number' => Auth::user()->ic_number
                ] : null
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Donation creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all(),
                'user' => Auth::user() ? [
                    'id' => Auth::id(),
                    'ic_number' => Auth::user()->ic_number
                ] : null
            ]);
            
            return response()->json([
                'message' => 'Failed to create donation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Donation $donation)
    {
        if (!Auth::user()->is_admin && 
            $donation->user_id !== Auth::id() && 
            $donation->is_anonymous) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($donation->load(['user', 'transaction']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Donation $donation)
    {
        // Check if user is authorized
        $charity = Charity::find($donation->cause_id);
        if (!Auth::user()->is_admin && 
            Auth::id() !== $charity->organization_id && 
            Auth::id() !== $donation->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate request based on action
        $action = $request->input('action');
        
        try {
            DB::beginTransaction();

            switch ($action) {
                case 'verify':
                    if (!$donation->canBeVerified()) {
                        throw new \Exception('Donation cannot be verified at this time');
                    }

                    if (Auth::id() !== $charity->organization_id && !Auth::user()->is_admin) {
                        throw new \Exception('Only the organization can verify donations');
                    }

                    $validated = $request->validate([
                        'proof' => 'required|array',
                        'proof.*.file' => 'required|file|mimes:jpeg,png,pdf|max:10240',
                        'verification_notes' => 'required|string|max:1000',
                    ]);

                    // Handle file uploads
                    $proofFiles = [];
                    foreach ($request->file('proof') as $file) {
                        $path = $file->store('task-proofs', 'public');
                        $proofFiles[] = [
                            'path' => $path,
                            'name' => $file->getClientOriginalName(),
                            'type' => $file->getMimeType(),
                            'uploaded_at' => now()->toISOString()
                        ];
                    }

                    $donation->verify($proofFiles, $validated['verification_notes']);
                    break;

                case 'complete':
                    if (!$donation->canBeCompleted()) {
                        throw new \Exception('Donation cannot be completed at this time');
                    }

                    if (!Auth::user()->is_admin) {
                        throw new \Exception('Only administrators can release funds');
                    }

                    $donation->complete();
                    break;

                default:
                    if (!$donation->canBeModified()) {
                        throw new \Exception('Donation cannot be modified at this time');
                    }

                    $validated = $request->validate([
                        'transaction_hash' => 'nullable|string',
                        'status' => 'nullable|in:pending,confirmed',
                        'smart_contract_data' => 'nullable|array',
                    ]);

                    $donation->update($validated);

                    if (isset($validated['status'])) {
                        $donation->transaction->update(['status' => $validated['status']]);
                    }

                    if (isset($validated['transaction_hash'])) {
                        $donation->transaction->update(['transaction_hash' => $validated['transaction_hash']]);
                    }
            }

            DB::commit();

            return response()->json([
                'message' => 'Donation updated successfully',
                'donation' => $donation->fresh(['user', 'transaction', 'charity']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update donation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Donation $donation)
    {
        if (!Auth::user()->is_admin && $donation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$donation->isPending()) {
            return response()->json([
                'message' => 'Cannot delete a donation that is not in pending status'
            ], 400);
        }

        try {
            DB::beginTransaction();
            
            // Delete any uploaded files if they exist
            if ($donation->task_proof) {
                foreach ($donation->task_proof as $proof) {
                    Storage::disk('public')->delete($proof['path']);
                }
            }
            
            $donation->transaction()->delete();
            $donation->delete();
            
            DB::commit();

            return response()->json(['message' => 'Donation deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete donation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function userDonations()
    {
        $donations = Donation::with(['transaction'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return response()->json($donations);
    }

    public function charityDonations($charityId)
    {
        $donations = Donation::with(['user', 'transaction'])
            ->where('cause_id', $charityId)
            ->when(!Auth::user()->is_admin, function ($query) {
                return $query->where(function ($q) {
                    $q->where('user_id', Auth::id())
                        ->orWhere('is_anonymous', false);
                });
            })
            ->latest()
            ->paginate(10);

        return response()->json($donations);
    }
}
