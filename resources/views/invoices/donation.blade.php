<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Donation Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 10px;
        }
        h1 {
            color: #4f46e5;
            margin: 0 0 10px;
            font-size: 24px;
        }
        .receipt-info {
            margin-bottom: 30px;
        }
        .receipt-info p {
            margin: 5px 0;
        }
        .section {
            margin-bottom: 20px;
        }
        .section h2 {
            color: #4f46e5;
            font-size: 18px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .info-row {
            display: flex;
            margin-bottom: 5px;
        }
        .info-label {
            width: 150px;
            font-weight: bold;
        }
        .info-value {
            flex: 1;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .amount {
            font-weight: bold;
            color: #4f46e5;
        }
        .thank-you {
            margin-top: 40px;
            text-align: center;
            font-size: 18px;
            color: #4f46e5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Donation Receipt</h1>
            <p>TrustChain Foundation</p>
        </div>
        
        <div class="receipt-info">
            <div class="info-row">
                <div class="info-label">Receipt No:</div>
                <div class="info-value">{{ $invoiceNumber }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">{{ $date }}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Donor Information</h2>
            <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">{{ $user->name ?? 'Anonymous' }}</div>
            </div>
            @if(!($donation->is_anonymous ?? false))
            <div class="info-row">
                <div class="info-label">ID:</div>
                <div class="info-value">{{ $user->ic_number ?? 'N/A' }}</div>
            </div>
            @endif
        </div>
        
        <div class="section">
            <h2>Charity Information</h2>
            <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">{{ $charity->name ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Category:</div>
                <div class="info-value">{{ $charity->category ?? 'N/A' }}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Donation Details</h2>
            <div class="info-row">
                <div class="info-label">Amount:</div>
                <div class="info-value amount">${{ number_format($donation->amount ?? 0, 2) }} {{ $donation->currency_type ?? 'USD' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">{{ $donation->created_at ? date('F j, Y', strtotime($donation->created_at)) : 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Status:</div>
                <div class="info-value">{{ ucfirst($donation->status ?? 'N/A') }}</div>
            </div>
            @if($donation->transaction_hash)
            <div class="info-row">
                <div class="info-label">Transaction Hash:</div>
                <div class="info-value">{{ $donation->transaction_hash }}</div>
            </div>
            @endif
        </div>
        
        <div class="thank-you">
            Thank you for your generous donation!
        </div>
        
        <div class="footer">
            <p>This receipt is generated automatically and is valid without a signature.</p>
            <p>For any inquiries, please contact support@trustchain.com</p>
        </div>
    </div>
</body>
</html> 