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
        Schema::table('donations', function (Blueprint $table) {
            // Add payment_method column if it doesn't exist
            if (!Schema::hasColumn('donations', 'payment_method')) {
                $table->string('payment_method')->default('blockchain')->after('status'); // blockchain, api, card
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            // Remove payment_method column if it exists
            if (Schema::hasColumn('donations', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });
    }
};
