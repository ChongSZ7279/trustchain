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
            $table->unsignedBigInteger('charity_id');
            $table->string('user_ic'); // User IC number as foreign key
            $table->timestamps();
            
            // Add foreign key constraints
            $table->foreign('charity_id')->references('id')->on('charities')->onDelete('cascade');
            
            // Create a unique constraint to prevent duplicate follows
            $table->unique(['charity_id', 'user_ic']);
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
