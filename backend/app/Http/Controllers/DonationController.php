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
    public function index(Request $request)
    {
        $query = Donation::query();
        
        // Apply search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('transaction_hash', 'like', "%{$search}%")
                  ->orWhere('donor_message', 'like', "%{$search}%");
            });
        }
        
        // Apply status filter
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        
        // Apply date range filter
        if ($request->has('dateRange')) {
            $dateRange = $request->input('dateRange');
            if (!empty($dateRange['start'])) {
                $query->whereDate('created_at', '>=', $dateRange['start']);
            }
            if (!empty($dateRange['end'])) {
                $query->whereDate('created_at', '<=', $dateRange['end']);
            }
        }
        
        // Apply amount range filter
        if ($request->has('amountRange')) {
            $amountRange = $request->input('amountRange');
            if (!empty($amountRange['min'])) {
                $query->where('amount', '>=', $amountRange['min']);
            }
            if (!empty($amountRange['max'])) {
                $query->where('amount', '<=', $amountRange['max']);
            }
        }
        
        // Add source field to identify as donation
        $donations = $query->paginate($request->input('per_page', 10));
        
        // Add source field to each donation
        $donations->getCollection()->transform(function ($donation) {
            $donation->source = 'Donation';
            return $donation;
        });
        
        return $donations;
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
        // Load relationships that might be needed in the frontend
        return response()->json($donation->load(['user', 'transaction', 'charity']));
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

    public function getCharityDonations(Request $request, $charityId)
    {
        $query = Donation::where('cause_id', $charityId);
        
        // Apply search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('transaction_hash', 'like', "%{$search}%")
                  ->orWhere('donor_message', 'like', "%{$search}%");
            });
        }
        
        // Apply status filter
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        
        // Apply date range filter
        if ($request->has('dateRange')) {
            $dateRange = $request->input('dateRange');
            if (!empty($dateRange['start'])) {
                $query->whereDate('created_at', '>=', $dateRange['start']);
            }
            if (!empty($dateRange['end'])) {
                $query->whereDate('created_at', '<=', $dateRange['end']);
            }
        }
        
        // Apply amount range filter
        if ($request->has('amountRange')) {
            $amountRange = $request->input('amountRange');
            if (!empty($amountRange['min'])) {
                $query->where('amount', '>=', $amountRange['min']);
            }
            if (!empty($amountRange['max'])) {
                $query->where('amount', '<=', $amountRange['max']);
            }
        }
        
        // Add source field to identify as donation
        $donations = $query->paginate($request->input('per_page', 10));
        
        // Add source field to each donation
        $donations->getCollection()->transform(function ($donation) {
            $donation->source = 'Donation';
            return $donation;
        });
        
        return $donations;
    }

    /**
     * Generate an invoice for a donation
     */
    public function generateInvoice(Request $request, $donationId)
    {
        try {
            \Log::info('Starting invoice generation', ['donation_id' => $donationId]);
            
            // Find the donation with relationships
            $donation = Donation::findOrFail($donationId);
            
            // Manually load relationships to ensure they're available
            $donation->load(['user', 'charity']);
            
            \Log::info('Donation loaded', [
                'donation_id' => $donation->id,
                'has_user' => isset($donation->user),
                'has_charity' => isset($donation->charity)
            ]);
            
            // Prepare data for the view
            $data = [
                'donation' => $donation,
                'user' => $donation->user,
                'charity' => $donation->charity,
                'date' => now()->format('F j, Y'),
                'invoiceNumber' => 'INV-' . str_pad($donation->id, 6, '0', STR_PAD_LEFT)
            ];
            
            \Log::info('Data prepared for view', ['data_keys' => array_keys($data)]);
            
            // Generate PDF with explicit options
            $pdf = \PDF::loadView('invoices.donation', $data);
            $pdf->setPaper('a4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'sans-serif',
            ]);
            
            \Log::info('PDF generated successfully');
            
            // Return the PDF
            return $pdf->download("donation-invoice-{$donationId}.pdf");
        } catch (\Exception $e) {
            \Log::error('Invoice generation failed', [
                'donation_id' => $donationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to generate invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate an invoice HTML for client-side PDF generation
     */
    public function generateInvoiceHtml(Request $request, $donationId)
    {
        try {
            \Log::info('Starting invoice HTML generation', ['donation_id' => $donationId]);
            
            // Find the donation
            $donation = Donation::find($donationId);
            
            if (!$donation) {
                \Log::error('Donation not found', ['donation_id' => $donationId]);
                return response()->json([
                    'message' => 'Donation not found',
                    'error' => 'The requested donation does not exist'
                ], 404);
            }
            
            // Manually load relationships to ensure they're available
            $donation->load(['user', 'charity']);
            
            \Log::info('Donation loaded for HTML generation', [
                'donation_id' => $donation->id,
                'has_user' => isset($donation->user),
                'has_charity' => isset($donation->charity),
                'donation_data' => $donation->toArray()
            ]);
            
            // Prepare data for the view with fallbacks for missing relationships
            $data = [
                'donation' => $donation,
                'user' => $donation->user ?? (object)['name' => 'Anonymous', 'ic_number' => 'N/A'],
                'charity' => $donation->charity ?? (object)['name' => 'Unknown Charity', 'category' => 'N/A'],
                'date' => now()->format('F j, Y'),
                'invoiceNumber' => 'INV-' . str_pad($donation->id, 6, '0', STR_PAD_LEFT)
            ];
            
            // Render the view to HTML
            $html = view('invoices.donation', $data)->render();
            
            \Log::info('Invoice HTML generated successfully');
            
            return response()->json([
                'html' => $html,
                'filename' => "donation-invoice-{$donationId}.pdf"
            ]);
        } catch (\Exception $e) {
            \Log::error('Invoice HTML generation failed', [
                'donation_id' => $donationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to generate invoice HTML',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a blockchain donation in the database
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeBlockchainDonation(Request $request)
    {
        try {
            \Log::info('Blockchain donation request received', [
                'data' => $request->all(),
                'user' => auth()->check() ? auth()->id() : 'unauthenticated'
            ]);
            
            // Check if user is authenticated
            if (!auth()->check()) {
                return response()->json([
                    'success' => false,
                    'error' => 'User not authenticated'
                ], 401);
            }
            
            $validated = $request->validate([
                'charity_id' => 'required|exists:charities,id',
                'amount' => 'required|numeric|min:0',
                'transaction_hash' => 'required|string',
                'message' => 'nullable|string',
            ]);
            
            \Log::info('Blockchain donation validated', $validated);
            
            // Check if a donation with this transaction hash already exists
            $existingDonation = Donation::where('transaction_hash', $validated['transaction_hash'])->first();
            if ($existingDonation) {
                return response()->json([
                    'success' => true,
                    'donation_id' => $existingDonation->id,
                    'message' => 'Donation already recorded',
                    'already_exists' => true
                ]);
            }
            
            // Get the user ID - use ic_number instead of id
            $userId = auth()->user()->ic_number;
            \Log::info('User ID for donation', ['user_id' => $userId, 'ic_number' => $userId]);
            
            // Create the donation with explicit values for all required fields
            $donation = new Donation();
            $donation->cause_id = $validated['charity_id'];
            $donation->amount = $validated['amount'];
            $donation->transaction_hash = $validated['transaction_hash'];
            $donation->donor_message = $validated['message'] ?? null;
            $donation->status = 'completed';
            $donation->currency_type = 'ETH';
            $donation->is_anonymous = false;
            $donation->user_id = $userId; // This should be the ic_number
            
            // Add created_at and updated_at timestamps manually if needed
            $now = now();
            $donation->created_at = $now;
            $donation->updated_at = $now;
            
            $donation->save();
            
            \Log::info('Blockchain donation saved', ['donation_id' => $donation->id]);
            
            return response()->json([
                'success' => true,
                'donation_id' => $donation->id,
                'message' => 'Blockchain donation recorded successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Blockchain donation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    protected function verifyBlockchainTransaction($transactionHash)
    {
        try {
            // Update to use Sepolia testnet
            $provider = new \Web3\Providers\HttpProvider(
                new \Web3\RequestManagers\HttpRequestManager(
                    'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID', // Replace with your Infura project ID
                    [
                        'timeout' => 30,
                    ]
                )
            );
            
            // ... existing code ...
            
            return [
                'verified' => true,
                'network' => 'sepolia',
                // ... existing code ...
            ];
        } catch (\Exception $e) {
            // ... existing code ...
        }
    }
}
