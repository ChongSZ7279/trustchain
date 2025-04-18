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
        // Update the type enum to include 'fund_release'
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('charity', 'task', 'fund_release') DEFAULT 'charity'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('charity', 'task') DEFAULT 'charity'");
    }
};
