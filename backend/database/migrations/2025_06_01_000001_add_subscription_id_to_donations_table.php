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
            $table->foreignId('subscription_id')->nullable()->after('cause_id');
            $table->boolean('is_recurring_payment')->default(false)->after('is_anonymous');
            
            // Add foreign key constraint
            $table->foreign('subscription_id')
                  ->references('id')
                  ->on('subscription_donations')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['subscription_id']);
            $table->dropColumn('subscription_id');
            $table->dropColumn('is_recurring_payment');
        });
    }
}; 