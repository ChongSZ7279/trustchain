<?php
// Simple script to check database structure
require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get schema information for the transactions table
try {
    // Get column type information
    $columns = \Illuminate\Support\Facades\DB::select("
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'transactions'
    ");

    echo "=== Transactions Table Schema ===\n";
    foreach ($columns as $column) {
        echo "Column: {$column->COLUMN_NAME}, Type: {$column->COLUMN_TYPE}, Nullable: {$column->IS_NULLABLE}, Default: " . 
             ($column->COLUMN_DEFAULT === null ? 'NULL' : $column->COLUMN_DEFAULT) . "\n";
    }

    // Get sample data
    echo "\n=== Sample Transactions Data ===\n";
    $transactions = \App\Models\Transaction::take(5)->get();
    foreach ($transactions as $transaction) {
        echo "ID: {$transaction->id}, Type: {$transaction->type}, ";
        echo "Amount: {$transaction->amount}, ";
        echo "Task ID: " . ($transaction->task_id ?? 'NULL') . "\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 