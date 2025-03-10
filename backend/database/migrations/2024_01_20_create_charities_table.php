<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('category');
            $table->text('description');
            $table->decimal('fund_targeted', 15, 2);
            $table->decimal('fund_received', 15, 2)->default(0);
            $table->string('picture_path')->nullable();
            $table->string('verified_document')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('charities');
    }
}; 