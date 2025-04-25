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
        // Alter the enum to include 'donation'
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('charity', 'task', 'fund_release', 'donation') DEFAULT 'charity'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert any 'donation' types back to 'charity' before removing the enum value
        DB::statement("UPDATE transactions SET type = 'charity' WHERE type = 'donation'");
        
        // Revert to original enum
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('charity', 'task', 'fund_release') DEFAULT 'charity'");
    }
};
