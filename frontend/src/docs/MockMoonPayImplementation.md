# Mock MoonPay Implementation

This document explains how the mock MoonPay implementation works in the TrustChain application.

## Overview

The mock MoonPay implementation provides a simulated MoonPay experience for development and demonstration purposes without requiring a paid MoonPay subscription.

## Components

### 1. MockMoonPayWidget.jsx

This component simulates the MoonPay payment interface with:
- Credit card form with validation
- Processing animation
- Success confirmation
- Test card information helper

### 2. MoonPayIntegration.jsx

This component:
- Determines whether to use the real MoonPay widget or the mock widget
- Provides a toggle in development mode to switch between them
- Handles successful payments and errors
- Communicates with the backend to record donations

### 3. DonationForm.jsx

This component:
- Provides the MoonPay payment option in the payment method selection
- Shows appropriate UI for the MoonPay payment flow
- Clearly indicates when the mock implementation is being used

## How to Use

1. Select the MoonPay payment method in the donation form
2. Enter a donation amount (minimum $5.00)
3. Fill out the mock payment form with test data:
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date in MM/YY format
   - CVV: Any 3 digits
   - Name and Email: Any valid values
4. Submit the form to simulate a successful payment

## Switching to Real MoonPay

When you're ready to switch to the real MoonPay integration:

1. Sign up for a MoonPay developer account
2. Get your API key from the MoonPay dashboard
3. Update the `moonpayApiKey` in MoonPayIntegration.jsx
4. Set `useMockWidget` to `false` by default
5. Remove or hide the development mode toggle
6. Update the UI to remove "Demo Mode" indicators

## Testing

The mock implementation includes form validation to simulate a realistic payment experience. All "transactions" will succeed, but the form validation ensures that users enter data in the correct format.

## Notes

- No real payments are processed with the mock implementation
- The mock implementation is suitable for development and demonstration only
- For production use, a real MoonPay integration is recommended
