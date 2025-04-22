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
        Schema::create('subscription_donations', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 20, 8); // Support for crypto amounts
            $table->string('currency_type'); // ETH, SCROLL, etc.
            $table->string('frequency')->default('monthly'); // monthly, quarterly, yearly
            $table->string('status')->default('active'); // active, paused, cancelled
            $table->string('payment_method')->default('blockchain'); // blockchain, stripe, etc.
            $table->string('stripe_subscription_id')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->text('donor_message')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->timestamp('last_payment_date')->nullable();
            $table->timestamp('next_payment_date')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('ic_number')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_donations');
    }
};