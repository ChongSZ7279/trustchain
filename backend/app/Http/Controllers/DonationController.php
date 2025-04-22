<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Transaction;
use App\Models\Charity;
use App\Helpers\DonationSyncHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Web3\Web3;
use Web3\Providers\HttpProvider;
use Web3\RequestManagers\HttpRequestManager;
use Web3\Contract;
use Illuminate\Support\Str;

class DonationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Add debug logging
        \Log::info('Donations index request received', [
            'user' => Auth::user() ? [
                'id' => Auth::id(),
                'ic_number' => Auth::user()->ic_number,
                'type' => get_class(Auth::user())
            ] : 'guest',
            'request' => $request->all()
        ]);

        $query = Donation::with(['charity', 'user']);

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

        // Get paginated results with consistent per_page value
        $perPage = $request->input('per_page', 10);
        $donations = $query->latest()->paginate($perPage);

        // Log pagination details
        \Log::info('Donation pagination details:', [
            'requested_per_page' => $perPage,
            'actual_per_page' => $donations->perPage(),
            'total' => $donations->total(),
            'current_page' => $donations->currentPage(),
            'last_page' => $donations->lastPage()
        ]);

        // Add source field to each donation
        $donations->getCollection()->transform(function ($donation) {
            $donation->source = 'Donation';
            return $donation;
        });

        \Log::info('Donations query results:', [
            'total' => $donations->total(),
            'current_page' => $donations->currentPage(),
            'per_page' => $donations->perPage(),
            'last_page' => $donations->lastPage(),
            'has_data' => $donations->isNotEmpty()
        ]);

        return $donations;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        \Log::info('Received donation data: ' . json_encode($request->all()));

        try {
            // Validate request data
            $validated = $request->validate([
                'user_id' => 'required|string',
                'transaction_hash' => 'required|string',
                'amount' => 'required|numeric',
                'currency_type' => 'required|string',
                'cause_id' => 'required|integer',
                'donor_message' => 'nullable|string',
                'is_anonymous' => 'boolean',
                'smart_contract_data' => 'nullable|string'
            ]);

            // Create donation record
            $donation = new Donation();
            $donation->user_id = $validated['user_id'];
            $donation->transaction_hash = $validated['transaction_hash'];
            $donation->amount = $validated['amount'];
            $donation->currency_type = $validated['currency_type'];
            $donation->cause_id = $validated['cause_id'];
            $donation->status = 'verified'; // Automatically mark as verified
            $donation->donor_message = $validated['donor_message'] ?? null;
            $donation->is_anonymous = $validated['is_anonymous'] ?? false;
            $donation->smart_contract_data = $validated['smart_contract_data'] ?? null;
            $donation->verified_at = now(); // Set verification timestamp
            $donation->save();

            \Log::info('Donation created with ID: ' . $donation->id);

            // Sync with transactions table
            $syncResult = DonationSyncHelper::syncDonationWithTransaction($donation);
            \Log::info('Donation sync result: ' . ($syncResult ? 'success' : 'failed'));

            return response()->json([
                'success' => true,
                'message' => 'Donation created successfully',
                'id' => $donation->id,
                'sync_status' => $syncResult ? 'synced' : 'not_synced'
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to create donation: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
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
        // First, ensure all donations are synced with transactions
        try {
            // Get all donations for this charity
            $donations = Donation::where('cause_id', $charityId)->get();

            // Sync each donation with transactions
            foreach ($donations as $donation) {
                DonationSyncHelper::syncDonationWithTransaction($donation);
            }

            \Log::info("Synced {$donations->count()} donations with transactions for charity {$charityId}");
        } catch (\Exception $e) {
            \Log::error("Error syncing donations with transactions: {$e->getMessage()}");
        }

        // Now fetch the donations with relationships
        $donations = Donation::with(['user', 'transaction'])
            ->where('cause_id', $charityId)
            ->when(Auth::check() && !Auth::user()->is_admin, function ($query) {
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

            // Start a database transaction
            DB::beginTransaction();

            try {
                // Create transaction record first
                $transaction = Transaction::create([
                    'user_ic' => $userId,
                    'charity_id' => $validated['charity_id'],
                    'amount' => $validated['amount'],
                    'type' => 'charity',
                    'status' => 'completed', // Blockchain transactions are considered complete
                    'message' => $validated['message'] ?? null,
                    'anonymous' => false,
                    'transaction_hash' => $validated['transaction_hash']
                ]);

                \Log::info('Transaction record created for blockchain donation', ['transaction_id' => $transaction->id]);

                // Create the donation with transaction_id
                $donation = new Donation();
                $donation->cause_id = $validated['charity_id'];
                $donation->amount = $validated['amount'];
                $donation->transaction_hash = $validated['transaction_hash'];
                $donation->transaction_id = $transaction->id; // Link to transaction record
                $donation->donor_message = $validated['message'] ?? null;
                $donation->status = 'completed';
                $donation->currency_type = 'ETH';
                $donation->is_anonymous = false;
                $donation->user_id = $userId;
                $donation->payment_method = 'blockchain';
                $donation->save();

                \Log::info('Blockchain donation saved', ['donation_id' => $donation->id]);

                // Ensure donation is synced with transaction
                $syncResult = DonationSyncHelper::syncDonationWithTransaction($donation);
                \Log::info('Blockchain donation sync result: ' . ($syncResult ? 'success' : 'failed'));

                // Try to verify the transaction on-chain
                try {
                    $this->verifyBlockchainTransaction($validated['transaction_hash']);
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
            } catch (\Exception $e) {
                DB::rollBack();
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

            DB::commit();

            return response()->json([
                'success' => true,
                'donation_id' => $donation->id,
                'message' => 'Blockchain donation recorded successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
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

    // Create a duplicate of storeBlockchainDonation but for unauthenticated requests
    public function storeBlockchainDonationNoAuth(Request $request)
    {
        try {
            \Log::info('Anonymous blockchain donation request received', [
                'data' => $request->all()
            ]);

            // Validate with more detailed error messages
            $validator = \Validator::make($request->all(), [
                'charity_id' => 'required|exists:charities,id',
                'amount' => 'required|numeric|min:0',
                'transaction_hash' => 'required|string',
                'message' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed for anonymous blockchain donation', [
                    'errors' => $validator->errors()->toArray()
                ]);

                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed'
                ], 422);
            }

            $validated = $validator->validated();

            \Log::info('Anonymous blockchain donation validated', $validated);

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

            // Simply get the first user - don't filter by email which might not exist
            $systemUser = \App\Models\User::first();

            if (!$systemUser) {
                return response()->json([
                    'success' => false,
                    'error' => 'No valid user found in the system to associate with anonymous donations',
                    'error_code' => 'NO_VALID_USER'
                ], 500);
            }

            $systemUserId = $systemUser->ic_number;
            \Log::info('Using first available user for anonymous donation', [
                'system_user_id' => $systemUserId
            ]);

            // Start a database transaction
            DB::beginTransaction();

            try {
                // Skip transaction record and create donation directly
                $donation = new Donation();
                $donation->cause_id = $validated['charity_id'];
                $donation->amount = $validated['amount'];
                $donation->transaction_hash = $validated['transaction_hash'];
                $donation->donor_message = $validated['message'] ?? null;
                $donation->status = 'verified'; // Automatically mark as verified
                $donation->verified_at = now(); // Set verification timestamp
                $donation->currency_type = 'ETH';
                $donation->is_anonymous = true;
                $donation->user_id = $systemUserId; // Use system user ID
                $donation->payment_method = 'blockchain';

                // Catch any validation errors during save
                try {
                    $donation->save();
                    \Log::info('Anonymous blockchain donation saved', ['donation_id' => $donation->id]);
                } catch (\Exception $e) {
                    \Log::error('Failed to save donation', [
                        'error' => $e->getMessage(),
                        'sql' => $e instanceof \Illuminate\Database\QueryException ? $e->getSql() : 'No SQL available',
                        'bindings' => $e instanceof \Illuminate\Database\QueryException ? $e->getBindings() : [],
                        'donation_data' => $donation->toArray()
                    ]);
                    throw $e;
                }

                // Try to verify the transaction on-chain (but don't fail if verification fails)
                try {
                    $this->verifyBlockchainTransaction($validated['transaction_hash']);
                    $donation->status = 'confirmed';
                    $donation->save();
                } catch (\Exception $e) {
                    \Log::warning('Blockchain verification failed but continuing', [
                        'error' => $e->getMessage(),
                        'transaction_hash' => $validated['transaction_hash']
                    ]);
                    // Don't throw exception here, just log the warning
                }
            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Anonymous blockchain donation error', [
                    'error' => $e->getMessage(),
                    'error_code' => $e->getCode(),
                    'error_type' => get_class($e),
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                // Return detailed error for debugging
                return response()->json([
                    'success' => false,
                    'error' => $e->getMessage(),
                    'error_code' => $e->getCode(),
                    'error_type' => get_class($e)
                ], 500);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'donation_id' => $donation->id,
                'message' => 'Anonymous blockchain donation recorded successfully'
            ]);
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            \Log::error('Anonymous blockchain donation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => $e->getCode()
            ], 500);
        }
    }

    protected function verifyBlockchainTransaction($transactionHash)
    {
        try {
            // Update to use Sepolia testnet
            $provider = new HttpProvider(
                new HttpRequestManager(
                    'https://sepolia.infura.io/v3/' . env('INFURA_PROJECT_ID'),
                    [
                        'timeout' => 30,
                    ]
                )
            );

            $web3 = new Web3($provider);
            $eth = $web3->eth;

            // Get transaction receipt
            $receipt = null;
            $eth->getTransactionReceipt($transactionHash, function ($err, $result) use (&$receipt) {
                if ($err !== null) {
                    throw $err;
                }
                $receipt = $result;
            });

            if (!$receipt) {
                throw new \Exception('Transaction not found or not mined yet');
            }

            // Check if transaction was successful
            if ($receipt->status === '0x0') {
                throw new \Exception('Transaction failed');
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('Error verifying blockchain transaction: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle completing a donation and releasing funds
     */
    public function handleComplete(Donation $donation)
    {
        try {
            // Check if donation can be completed
            if (!$donation->canBeCompleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This donation cannot be completed at this time'
                ], 400);
            }

            // Get the organization's wallet address
            $charity = \App\Models\Charity::find($donation->cause_id);
            $organization = \App\Models\Organization::find($charity->organization_id);

            if (!$organization || !$organization->wallet_address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Organization wallet address not found'
                ], 400);
            }

            // If this is a blockchain donation, transfer the funds
            if ($donation->transaction_hash) {
                $result = $this->transferFundsOnBlockchain(
                    $donation->transaction_hash,
                    $organization->wallet_address,
                    $donation->amount
                );

                if (!$result['success']) {
                    \Log::error('Failed to transfer funds on blockchain', $result);
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to transfer funds: ' . $result['error']
                    ], 500);
                }

                // Save the transfer transaction hash
                $donation->transfer_transaction_hash = $result['transactionHash'];
            }

            // Update donation status
            $donation->status = 'completed';
            $donation->completed_at = now();
            $donation->save();

            // Update charity fund progress
            $this->updateCharityFundProgress($charity);

            return response()->json([
                'success' => true,
                'message' => 'Funds released successfully',
                'donation' => $donation
            ]);
        } catch (\Exception $e) {
            \Log::error('Error completing donation', [
                'error' => $e->getMessage(),
                'donation_id' => $donation->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to complete donation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transfer funds on blockchain
     */
    private function transferFundsOnBlockchain($transactionHash, $recipientAddress, $amount)
    {
        try {
            // Initialize Web3
            $web3 = new Web3(env('BLOCKCHAIN_PROVIDER_URL'));
            $eth = $web3->eth;

            // Get the contract instance
            $contractAddress = env('CONTRACT_ADDRESS');
            $contract = new Contract($web3->provider, $this->getContractABI());

            // Get the private key for signing transactions
            $privateKey = env('BLOCKCHAIN_PRIVATE_KEY');
            if (substr($privateKey, 0, 2) === '0x') {
                $privateKey = substr($privateKey, 2);
            }

            // Create transaction data for withdrawFunds function
            $data = $contract->getData('withdrawFunds', [$recipientAddress, $this->toWei($amount)]);

            // Create and sign transaction
            $transaction = [
                'from' => $this->getFromAddress(),
                'to' => $contractAddress,
                'data' => '0x' . $data,
                'gas' => '0x' . dechex(300000),
                'gasPrice' => '0x' . dechex(20000000000),
            ];

            // Get nonce
            $eth->getTransactionCount($this->getFromAddress(), 'latest', function ($err, $nonce) use (&$transaction) {
                if ($err !== null) {
                    throw new \Exception('Failed to get nonce: ' . $err->getMessage());
                }
                $transaction['nonce'] = '0x' . dechex($nonce);
            });

            // Sign and send transaction
            $signedTransaction = $this->signTransaction($transaction, $privateKey);
            $transactionHash = null;

            $eth->sendRawTransaction('0x' . $signedTransaction, function ($err, $hash) use (&$transactionHash) {
                if ($err !== null) {
                    throw new \Exception('Failed to send transaction: ' . $err->getMessage());
                }
                $transactionHash = $hash;
            });

            return [
                'success' => true,
                'transactionHash' => $transactionHash
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Update charity fund progress
     */
    private function updateCharityFundProgress($charity)
    {
        // Calculate total completed donations
        $totalCompleted = \App\Models\Donation::where('cause_id', $charity->id)
            ->where('status', 'completed')
            ->sum('amount');

        // Update charity fund progress
        $charity->funds_raised = $totalCompleted;

        // Check if target is reached
        if ($charity->funds_raised >= $charity->funding_goal) {
            $charity->is_fully_funded = true;
        }

        $charity->save();

        return $charity;
    }

    /**
     * Get contract ABI
     */
    private function getContractABI()
    {
        return json_decode(file_get_contents(base_path('resources/contracts/DonationContract.json')), true)['abi'];
    }

    /**
     * Get from address from private key
     */
    private function getFromAddress()
    {
        $privateKey = env('BLOCKCHAIN_PRIVATE_KEY');
        if (substr($privateKey, 0, 2) === '0x') {
            $privateKey = substr($privateKey, 2);
        }

        // Generate address from private key
        // This is a simplified version - you may need a proper library for this
        return '0x' . substr(hash('sha256', hex2bin($privateKey)), 0, 40);
    }

    /**
     * Sign transaction
     */
    private function signTransaction($transaction, $privateKey)
    {
        // This is a placeholder - you'll need to use a proper Ethereum transaction signing library
        // For example, you might use web3.php or ethereum-tx-decoder

        // For now, we'll return a dummy signed transaction for demonstration
        return 'dummySignedTransaction';
    }

    /**
     * Convert ETH to Wei
     */
    private function toWei($eth)
    {
        return bcmul($eth, '1000000000000000000');
    }

    /**
     * Test endpoint for donations
     */
    public function testDonation(Request $request, $id)
    {
        try {
            \Log::info('Test donation request received:', [
                'data' => $request->all(),
                'charity_id' => $id
            ]);

            // Validate the request
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'payment_method' => 'required|string',
                'message' => 'nullable|string'
            ]);

            // Check if charity exists
            $charity = \App\Models\Charity::find($id);
            if (!$charity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Charity not found'
                ], 404);
            }

            // Return success response without actually creating a donation
            return response()->json([
                'success' => true,
                'message' => 'Test donation received successfully',
                'charity_id' => $id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method']
            ]);
        } catch (\Exception $e) {
            \Log::error('Test donation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Test donation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * A simplified endpoint for recording blockchain donations with minimal constraints
     */
    public function storeSimpleDonation(Request $request)
    {
        try {
            \Log::info('Simple donation request received', [
                'data' => $request->all()
            ]);

            // Validate with minimal requirements
            $validator = \Validator::make($request->all(), [
                'charity_id' => 'required|exists:charities,id',
                'amount' => 'required|numeric|min:0',
                'transaction_hash' => 'required|string',
                'message' => 'nullable|string',
                'test_mode' => 'boolean',
                'is_fiat' => 'boolean',
                'currency_type' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed for simple donation', [
                    'errors' => $validator->errors()->toArray()
                ]);

                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed'
                ], 422);
            }

            $validated = $validator->validated();
            $isTestMode = $request->input('test_mode', false);
            $isFiat = $request->input('is_fiat', false);

            // Check if a donation with this transaction hash already exists
            $existingDonation = Donation::where('transaction_hash', $validated['transaction_hash'])->first();
            if ($existingDonation) {
                return response()->json([
                    'success' => true,
                    'id' => $existingDonation->id,
                    'donation_id' => $existingDonation->id,
                    'message' => 'Donation already recorded',
                    'already_exists' => true
                ]);
            }

            // Find the first valid user in the system
            $user = \App\Models\User::first();

            if (!$user) {
                \Log::error('No users found in the system');
                return response()->json([
                    'success' => false,
                    'error' => 'No users found in the system',
                ], 500);
            }

            // Start transaction
            DB::beginTransaction();

            try {
                // Create a transaction record if it's a fiat donation
                $transactionId = null;

                if ($isFiat) {
                    $transactionId = DB::table('transactions')->insertGetId([
                        'user_ic' => $user->ic_number,
                        'charity_id' => $validated['charity_id'],
                        'amount' => $validated['amount'],
                        'type' => 'charity', // Using 'charity' type for all donations as per the enum constraint
                        'status' => 'completed',
                        'message' => $validated['message'] ?? null,
                        'anonymous' => true,
                        'payment_intent_id' => $validated['transaction_hash'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Use direct DB insert to bypass model constraints
                $donationId = DB::table('donations')->insertGetId([
                    'user_id' => $user->ic_number,
                    'transaction_id' => $transactionId,
                    'cause_id' => $validated['charity_id'],
                    'amount' => $validated['amount'],
                    'transaction_hash' => $validated['transaction_hash'],
                    'donor_message' => $validated['message'] ?? null,
                    'status' => 'verified',
                    'currency_type' => $validated['currency_type'] ?? ($isFiat ? 'SCROLL' : 'ETH'),
                    'is_anonymous' => true,
                    'payment_method' => $isFiat ? ($isTestMode ? 'test_payment' : 'fiat_to_scroll') : 'blockchain',
                    'created_at' => now(),
                    'updated_at' => now(),
                    'verified_at' => now(),
                ]);

                // Also update the charity's fund data
                $charity = \App\Models\Charity::find($validated['charity_id']);
                if ($charity) {
                    $charity->funds_raised = $charity->funds_raised + $validated['amount'];
                    $charity->save();
                }

                // Commit transaction
                DB::commit();

                \Log::info('Simple donation recorded successfully', [
                    'donation_id' => $donationId,
                    'transaction_id' => $transactionId,
                    'charity_id' => $validated['charity_id'],
                    'amount' => $validated['amount'],
                    'transaction_hash' => $validated['transaction_hash'],
                    'is_fiat' => $isFiat,
                    'test_mode' => $isTestMode
                ]);

                return response()->json([
                    'success' => true,
                    'id' => $donationId,
                    'transaction_id' => $transactionId,
                    'message' => 'Donation recorded successfully'
                ]);

            } catch (\Exception $dbError) {
                // Rollback on error
                DB::rollBack();
                throw $dbError;
            }
        } catch (\Exception $e) {
            \Log::error('Error recording simple donation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync donations with transactions
     */
    public function syncDonations(Request $request)
    {
        try {
            // Check if user is authenticated and is admin
            if (!Auth::check() || !Auth::user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admins can sync donations.'
                ], 403);
            }

            \Log::info('Starting donation sync with transactions');

            $stats = DonationSyncHelper::syncAllDonations();

            \Log::info('Donation sync completed', $stats);

            return response()->json([
                'success' => true,
                'message' => 'Donations synced successfully',
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            \Log::error('Donation sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to sync donations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Direct donation insertion using raw SQL to bypass Eloquent constraints
     */
    public function directDonation(Request $request)
    {
        try {
            \Log::info('Direct donation request received', [
                'data' => $request->all()
            ]);

            // Validate with minimal requirements
            $validator = \Validator::make($request->all(), [
                'charity_id' => 'required|integer',
                'amount' => 'required|numeric|min:0',
                'transaction_hash' => 'required|string',
                'message' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed for direct donation', [
                    'errors' => $validator->errors()->toArray()
                ]);

                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed'
                ], 422);
            }

            // Get the first user from the system
            $user = DB::table('users')->first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'No users found in the system',
                ], 500);
            }

            $userId = $user->ic_number;
            \Log::info('Using user for direct donation', ['user_id' => $userId]);

            // Get validated data
            $charityId = $request->input('charity_id');
            $amount = $request->input('amount');
            $transactionHash = $request->input('transaction_hash');
            $message = $request->input('message');

            // Check if donation exists using raw query
            $existingDonation = DB::select(
                'SELECT id FROM donations WHERE transaction_hash = ?',
                [$transactionHash]
            );

            if (count($existingDonation) > 0) {
                return response()->json([
                    'success' => true,
                    'donation_id' => $existingDonation[0]->id,
                    'message' => 'Donation already recorded',
                    'already_exists' => true
                ]);
            }

            // Insert donation using raw query
            $now = now()->format('Y-m-d H:i:s');
            $donationId = DB::insert(
                'INSERT INTO donations (user_id, cause_id, amount, transaction_hash, donor_message, status, currency_type, is_anonymous, payment_method, created_at, updated_at, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $userId,
                    $charityId,
                    $amount,
                    $transactionHash,
                    $message,
                    'verified',
                    'ETH',
                    1, // is_anonymous = true
                    'blockchain',
                    $now,
                    $now,
                    $now
                ]
            );

            // Get the last inserted ID
            $lastId = DB::getPdo()->lastInsertId();

            \Log::info('Direct donation recorded successfully', [
                'donation_id' => $lastId,
                'charity_id' => $charityId,
                'amount' => $amount,
                'transaction_hash' => $transactionHash
            ]);

            return response()->json([
                'success' => true,
                'id' => $lastId,
                'message' => 'Direct donation recorded successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error recording direct donation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
