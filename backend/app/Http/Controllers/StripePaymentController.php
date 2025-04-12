<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Models\Donation;
use App\Models\Transaction;

class StripePaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    public function processPayment(Request $request)
    {
        try {
            Log::info('Processing card payment', $request->all());

            // Validate request
            $validated = $request->validate([
                'paymentMethodId' => 'required|string',
                'amount' => 'required|numeric|min:0',
                'currency' => 'required|string|size:3',
                'charity_id' => 'required|exists:charities,id',
                'message' => 'nullable|string|max:500',
                'is_anonymous' => 'boolean'
            ]);

            // Create payment intent
            $paymentIntent = PaymentIntent::create([
                'amount' => $validated['amount'] * 100, // Convert to cents
                'currency' => $validated['currency'],
                'payment_method' => $validated['paymentMethodId'],
                'confirm' => true,
                'return_url' => $request->input('return_url', url('/donations/success')),
            ]);

            if ($paymentIntent->status === 'succeeded') {
                // Create transaction record
                $transaction = Transaction::create([
                    'user_ic' => auth()->user()->ic_number,
                    'charity_id' => $validated['charity_id'],
                    'amount' => $validated['amount'],
                    'type' => 'card',
                    'status' => 'completed',
                    'message' => $validated['message'] ?? null,
                    'anonymous' => $validated['is_anonymous'] ?? false,
                    'payment_intent_id' => $paymentIntent->id
                ]);

                // Create donation record
                $donation = Donation::create([
                    'user_id' => auth()->user()->ic_number,
                    'amount' => $validated['amount'],
                    'currency_type' => $validated['currency'],
                    'cause_id' => $validated['charity_id'],
                    'status' => 'completed',
                    'donor_message' => $validated['message'] ?? null,
                    'is_anonymous' => $validated['is_anonymous'] ?? false,
                    'payment_method' => 'card',
                    'payment_intent_id' => $paymentIntent->id
                ]);

                // Link transaction to donation
                $transaction->donation()->save($donation);

                Log::info('Card payment processed successfully', [
                    'payment_intent_id' => $paymentIntent->id,
                    'donation_id' => $donation->id,
                    'transaction_id' => $transaction->id
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment processed successfully',
                    'donation' => $donation,
                    'transaction' => $transaction
                ]);
            }

            throw new \Exception('Payment failed: ' . $paymentIntent->status);
        } catch (\Exception $e) {
            Log::error('Error processing card payment', [
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