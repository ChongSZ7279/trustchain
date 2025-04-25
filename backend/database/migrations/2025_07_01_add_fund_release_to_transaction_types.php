<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the type enum to include 'fund_release' and preserve 'donation'
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('charity', 'task', 'fund_release', 'donation') DEFAULT 'charity'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values but keep 'donation'
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('charity', 'task', 'donation') DEFAULT 'charity'");
    }
};
