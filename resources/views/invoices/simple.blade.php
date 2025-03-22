<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Simple Donation Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #4f46e5;
            margin-bottom: 20px;
        }
        .info-row {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Donation Receipt</h1>
        
        <div class="info-row">
            <span class="info-label">Receipt No:</span>
            <span>{{ $invoiceNumber }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Date:</span>
            <span>{{ $date }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Amount:</span>
            <span>${{ number_format($donation->amount ?? 0, 2) }} {{ $donation->currency_type ?? 'USD' }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span>{{ ucfirst($donation->status ?? 'N/A') }}</span>
        </div>
        
        <p>Thank you for your donation!</p>
    </div>
</body>
</html> 