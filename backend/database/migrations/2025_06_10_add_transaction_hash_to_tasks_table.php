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
        Schema::table('tasks', function (Blueprint $table) {
            // Add transaction_hash column if it doesn't exist
            if (!Schema::hasColumn('tasks', 'transaction_hash')) {
                $table->string('transaction_hash')->nullable()->after('proof');
            }
            
            // Add funds_released column if it doesn't exist
            if (!Schema::hasColumn('tasks', 'funds_released')) {
                $table->boolean('funds_released')->default(false)->after('transaction_hash');
            }
            
            // Add pictures_count column if it doesn't exist
            if (!Schema::hasColumn('tasks', 'pictures_count')) {
                $table->integer('pictures_count')->default(0)->after('funds_released');
            }
            
            // Add 'verified' to status enum if it doesn't exist
            // This is a bit tricky in migrations, so we'll use DB::statement
            DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'verified') DEFAULT 'pending'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Remove columns if they exist
            if (Schema::hasColumn('tasks', 'transaction_hash')) {
                $table->dropColumn('transaction_hash');
            }
            
            if (Schema::hasColumn('tasks', 'funds_released')) {
                $table->dropColumn('funds_released');
            }
            
            if (Schema::hasColumn('tasks', 'pictures_count')) {
                $table->dropColumn('pictures_count');
            }
            
            // Revert status enum to original values
            DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending'");
        });
    }
};
