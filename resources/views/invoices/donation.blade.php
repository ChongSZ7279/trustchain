<!DOCTYPE html>
<html>
<head>
    <title>Donation Receipt</title>
</head>
<body>
    <h1>Donation Receipt</h1>
    <p>Receipt No: {{ $invoiceNumber }}</p>
    <p>Date: {{ $date }}</p>
    
    <h2>Donor Information</h2>
    <p>Name: {{ $user->name ?? 'N/A' }}</p>
    <p>ID: {{ $user->ic_number ?? 'N/A' }}</p>
    
    <h2>Charity Information</h2>
    <p>Name: {{ $charity->name ?? 'N/A' }}</p>
    
    <h2>Donation Details</h2>
    <p>Amount: ${{ number_format($donation->amount ?? 0, 2) }}</p>
    <p>Date: {{ $donation->created_at ? date('F j, Y', strtotime($donation->created_at)) : 'N/A' }}</p>
    
    <p>Thank you for your donation!</p>
</body>
</html> 