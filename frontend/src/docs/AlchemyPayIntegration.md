# Alchemy Pay Integration Guide

This document explains how to use the Alchemy Pay integration in the TrustChain application.

## Overview

Alchemy Pay is a payment gateway that allows users to purchase cryptocurrency using fiat currency (credit/debit cards, bank transfers, etc.). This integration enables users to donate to charities by purchasing ETH, which will then be bridged to Scroll.

## API Keys

To use Alchemy Pay, you'll need to obtain API keys from their developer portal:

1. **Public Key**: Used in frontend code (safe to expose to clients)
2. **Secret Key**: Used for server-side operations (NEVER expose in frontend code)
3. **Webhook Key**: Used to verify webhook signatures from Alchemy Pay

## Current Implementation

The current implementation:

1. Uses a mock Alchemy Pay widget for development and testing
2. Simulates test transactions (no real money movement)
3. Records donations in your database
4. Marks donations as test transactions

## Cryptocurrency Flow

The implementation follows this flow:

1. User purchases ETH using fiat currency through Alchemy Pay
2. ETH is sent to the user's or project's wallet
3. ETH is bridged to Scroll using the Scroll Bridge
4. Scroll tokens are used for the actual donation

## Testing the Integration

To test the Alchemy Pay integration:

1. Start your development server
2. Navigate to a charity page
3. Click the "Donate" button
4. Select the Alchemy Pay payment method
5. Enter a donation amount (at least $5.00)
6. Complete the payment form with test card information:
   - Card Number: 4111 1111 1111 1111 (or any valid test card)
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name and Email: Any valid values

## Server-Side Integration (Future)

For a complete integration, you'll need to:

1. Implement webhook handlers to receive Alchemy Pay transaction updates
2. Use the Secret Key for server-side API calls
3. Verify webhook signatures using the Webhook Key
4. Implement the ETH to Scroll bridging process

## Moving to Production

When you're ready to move to production:

1. Complete the Alchemy Pay business verification process
2. Get production API keys
3. Update your environment variables with the production keys
4. Set `useMockWidget={false}` in the AlchemyPayIntegration component

## Resources

- [Alchemy Pay Documentation](https://alchemypay.org/docs)
- [Alchemy Pay API Reference](https://alchemypay.readme.io/docs)
- [Scroll Bridge Documentation](https://docs.scroll.io/en/developers/bridge/)
