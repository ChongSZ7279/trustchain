<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo');
            $table->string('category');
            $table->text('description');
            $table->text('objectives');
            $table->string('representative_id');
            $table->string('statutory_declaration');
            $table->string('verified_document');
            $table->string('wallet_address');
            $table->text('register_address');
            $table->string('gmail')->unique();
            $table->string('phone_number');
            $table->string('website')->nullable();
            $table->string('facebook')->nullable();
            $table->string('instagram')->nullable();
            $table->text('others')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('representative_id')
                ->references('ic_number')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
}; 