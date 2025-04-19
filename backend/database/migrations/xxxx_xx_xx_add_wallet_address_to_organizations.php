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
        // Check if wallet_address column already exists
        if (Schema::hasColumn('organizations', 'wallet_address')) {
            // Do nothing, the column already exists
            return;
        }
        
        // If the column doesn't exist for some reason, add it
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('wallet_address')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't drop the column since it was part of the original schema
    }
}; 