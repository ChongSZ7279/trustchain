<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Donation Receipt</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 200px;
            margin-bottom: 15px;
        }
        .receipt-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
        }
        .receipt-info {
            margin-bottom: 30px;
        }
        .receipt-info table {
            width: 100%;
            border-collapse: collapse;
        }
        .receipt-info td {
            padding: 8px;
            vertical-align: top;
        }
        .receipt-info td:first-child {
            font-weight: bold;
            width: 200px;
        }
        .donation-details {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
        .amount {
            font-size: 20px;
            color: #2c5282;
            font-weight: bold;
        }
        .footer {
            margin-top: 50px;
            font-size: 12px;
            color: #666;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .transaction-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .qr-code {
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/logo.png') }}" alt="Logo" class="logo">
        <h1 class="receipt-title">Donation Receipt</h1>
    </div>

    <div class="receipt-info">
        <table>
            <tr>
                <td>Receipt Number:</td>
                <td>{{ $donation->receipt_number }}</td>
            </tr>
            <tr>
                <td>Date:</td>
                <td>{{ $donation->created_at->format('F j, Y') }}</td>
            </tr>
            <tr>
                <td>Donor Name:</td>
                <td>{{ $donation->user->name ?? 'Anonymous' }}</td>
            </tr>
            <tr>
                <td>Donor IC:</td>
                <td>{{ $donation->user->ic_number ?? 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <div class="donation-details">
        <h2>Donation Details</h2>
        <p>Amount: <span class="amount">{{ number_format($donation->amount, 2) }} {{ $donation->currency }}</span></p>
        <p>Payment Method: {{ $donation->payment_method }}</p>
        @if($donation->message)
            <p>Message: {{ $donation->message }}</p>
        @endif
    </div>

    <div class="transaction-info">
        <h3>Transaction Information</h3>
        <p>Transaction ID: {{ $donation->transaction_id }}</p>
        <p>Status: {{ ucfirst($donation->status) }}</p>
        @if($donation->transaction_hash)
            <p>Transaction Hash: {{ $donation->transaction_hash }}</p>
        @endif
    </div>

    @if($donation->transaction_hash)
        <div class="qr-code">
            <img src="data:image/png;base64,{{ $qrCode }}" alt="Transaction QR Code">
            <p>Scan to verify transaction on blockchain</p>
        </div>
    @endif

    <div class="footer">
        <p>Thank you for your generous donation!</p>
        <p>This receipt was automatically generated on {{ now()->format('F j, Y') }}</p>
        <p>For any questions, please contact support at {{ config('app.support_email') }}</p>
    </div>
</body>
</html> 