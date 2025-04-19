<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Config;

class StripeController extends Controller
{
    /**
     * Create a payment intent for the client
     * Using test mode implementation for debugging
     */
    public function createPaymentIntent(Request $request)
    {
        try {
            Log::info('Creating payment intent (test mode)', [
                'request_data' => $request->all(),
                'headers' => $request->header(),
            ]);
            
            // Validate request
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.10',
                'currency' => 'required|string|max:3'
            ], [
                'amount.min' => 'The minimum donation amount is $0.10.'
            ]);
            
            if ($validator->fails()) {
                Log::error('Validation failed for payment intent', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed: ' . $validator->errors()->first()
                ], 422);
            }
            
            $validated = $validator->validated();
            
            // Convert amount to cents (for compatibility with Stripe)
            $amountInCents = round($validated['amount'] * 100);
            
            Log::info('Creating test payment intent', [
                'amount' => $validated['amount'],
                'amount_in_cents' => $amountInCents,
                'currency' => $validated['currency']
            ]);

            // Generate a fake client secret instead of calling Stripe API
            $fakePaymentIntentId = 'pi_' . uniqid();
            $fakeClientSecret = $fakePaymentIntentId . '_secret_' . uniqid();
            
            Log::info('Test payment intent created', [
                'payment_intent_id' => $fakePaymentIntentId,
                'amount' => $amountInCents,
                'currency' => $validated['currency'],
                'client_secret' => substr($fakeClientSecret, 0, 10) . '...'
            ]);
            
            return response()->json([
                'success' => true,
                'clientSecret' => $fakeClientSecret,
                'paymentIntentId' => $fakePaymentIntentId,
                'testMode' => true
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error creating payment intent', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to create payment intent: ' . $e->getMessage()
            ], 500);
        }
    }
} 