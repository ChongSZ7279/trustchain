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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('user_ic')->nullable();
            $table->foreign('user_ic')->references('ic_number')->on('users')->nullOnDelete();
            $table->foreignId('charity_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 20, 8);
            $table->enum('type', ['charity', 'task'])->default('charity');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('transaction_hash')->nullable();
            $table->string('contract_address')->nullable();
            $table->text('message')->nullable();
            $table->boolean('anonymous')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
