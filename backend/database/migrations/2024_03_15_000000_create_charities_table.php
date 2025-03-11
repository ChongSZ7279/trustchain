<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('charities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->string('name');
            $table->string('category');
            $table->text('description');
            $table->text('objective');
            $table->decimal('fund_targeted', 10, 2);
            $table->string('picture_path')->nullable();
            $table->string('verified_document')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('charities');
    }
}; 