# MoonPay Integration Guide

This document explains how to use the MoonPay integration in the TrustChain application.

## API Keys

You have three MoonPay API keys:

1. **Public Key**: `pk_test_GuiwqtgmYRgQrDui8ws97odTqUWj7`
   - Used in frontend code
   - Safe to expose to clients
   - Stored in frontend/.env as VITE_MOONPAY_API_KEY

2. **Secret Key**: `sk_test_3oscXOqCPZeQYihgFu3v96IuPPQu900F`
   - Used for server-side operations
   - NEVER expose in frontend code or commit to version control
   - Should be stored in backend/.env (not .env.example)

3. **Webhook Key**: `wk_test_FhH2lkGtKS1pAKNVj6MOO2JigCTI9uk`
   - Used to verify webhook signatures from MoonPay
   - Should be stored in backend/.env (not .env.example)

## Current Implementation

The current implementation:

1. Uses the real MoonPay widget with your test API key
2. Processes test transactions (no real money movement)
3. Records donations in your database
4. Marks donations as test transactions

## Cryptocurrency Support

MoonPay may not directly support Scroll. The current implementation:

1. Uses ETH (Ethereum) as the target cryptocurrency
2. You may need to implement a bridge to convert ETH to Scroll
3. Alternatively, you can use your existing Fiat-to-Scroll conversion method

## Testing the Integration

To test the MoonPay integration:

1. Start your development server
2. Navigate to a charity page
3. Click the "Donate" button
4. Select the MoonPay payment method
5. Enter a donation amount (at least $5.00)
6. Complete the payment form with test card information:
   - Card Number: 4000 0209 5159 5032 (or any valid test card)
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name and Email: Any valid values

## Server-Side Integration (Future)

For a complete integration, you'll need to:

1. Implement webhook handlers to receive MoonPay transaction updates
2. Use the Secret Key for server-side API calls
3. Verify webhook signatures using the Webhook Key

## Moving to Production

When you're ready to move to production:

1. Complete the MoonPay business verification process
2. Get production API keys (they will start with `pk_live_`, `sk_live_`, and `wk_live_`)
3. Update your environment variables with the production keys
4. Set `testMode={false}` in the MoonPayBuyWidget component

## Resources

- [MoonPay Documentation](https://www.moonpay.com/developers)
- [MoonPay React SDK](https://www.npmjs.com/package/@moonpay/moonpay-react)
- [MoonPay Test Cards](https://www.moonpay.com/developers/test-cards)
