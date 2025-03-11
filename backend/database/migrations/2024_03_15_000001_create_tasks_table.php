<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('charity_id')->constrained('charities')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->decimal('fund_targeted', 10, 2);
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->string('proof')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tasks');
    }
}; 