<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('transaction_hash')->unique(); // Blockchain transaction hash
            $table->decimal('amount', 20, 8); // Support for crypto amounts
            $table->string('currency_type'); // ETH, BTC, etc.
            $table->string('cause_id');
            $table->string('status')->default('pending'); // pending, confirmed, verified, completed
            $table->json('smart_contract_data')->nullable(); // Store smart contract details
            $table->text('donor_message')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->json('task_proof')->nullable(); // Store proof of task completion
            $table->text('verification_notes')->nullable(); // Notes from organization about task completion
            $table->timestamp('verified_at')->nullable(); // When the task was verified
            $table->timestamp('completed_at')->nullable(); // When the funds were released
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
