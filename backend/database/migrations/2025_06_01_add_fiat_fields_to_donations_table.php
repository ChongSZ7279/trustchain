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
            // Add fiat amount field
            if (!Schema::hasColumn('donations', 'fiat_amount')) {
                $table->decimal('fiat_amount', 10, 2)->nullable()->after('amount');
            }
            
            // Add fiat currency field
            if (!Schema::hasColumn('donations', 'fiat_currency')) {
                $table->string('fiat_currency', 3)->nullable()->after('fiat_amount');
            }
            
            // Add exchange rate at time of conversion
            if (!Schema::hasColumn('donations', 'exchange_rate')) {
                $table->decimal('exchange_rate', 20, 2)->nullable()->after('fiat_currency');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            // Remove columns if they exist
            if (Schema::hasColumn('donations', 'fiat_amount')) {
                $table->dropColumn('fiat_amount');
            }
            
            if (Schema::hasColumn('donations', 'fiat_currency')) {
                $table->dropColumn('fiat_currency');
            }
            
            if (Schema::hasColumn('donations', 'exchange_rate')) {
                $table->dropColumn('exchange_rate');
            }
        });
    }
}; 