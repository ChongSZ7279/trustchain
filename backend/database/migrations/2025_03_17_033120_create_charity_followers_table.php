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
        Schema::create('charity_followers', function (Blueprint $table) {
            $table->id();
            $table->string('user_ic');
            $table->foreignId('charity_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Add a unique constraint to prevent duplicate follows
            $table->unique(['user_ic', 'charity_id']);
            
            // Add foreign key constraint for user_ic
            $table->foreign('user_ic')
                ->references('ic_number')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charity_followers');
    }
}; 