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
        Schema::create('users', function (Blueprint $table) {
            $table->string('ic_number')->primary();
            $table->string('name');
            $table->string('password');
            $table->string('profile_picture')->nullable();
            $table->string('front_ic_picture');
            $table->string('back_ic_picture');
            $table->string('phone_number');
            $table->string('gmail')->unique();
            $table->string('wallet_address')->nullable();
            $table->string('frame_color_code')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
}; 