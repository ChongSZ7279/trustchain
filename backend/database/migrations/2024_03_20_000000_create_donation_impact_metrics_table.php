<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_impact_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained('donations')->onDelete('cascade');
            
            // Education Impact
            $table->integer('students_benefited')->default(0);
            $table->integer('school_supplies_provided')->default(0);
            $table->integer('scholarships_awarded')->default(0);
            $table->integer('teachers_trained')->default(0);
            $table->integer('classrooms_built')->default(0);
            
            // Health Impact
            $table->integer('medical_treatments')->default(0);
            $table->integer('vaccines_administered')->default(0);
            $table->integer('health_workers_trained')->default(0);
            $table->integer('medical_equipment_provided')->default(0);
            
            // Food & Shelter Impact
            $table->integer('meals_provided')->default(0);
            $table->integer('shelter_nights')->default(0);
            $table->integer('clean_water_access')->default(0); // Number of people with new access to clean water
            $table->integer('sanitation_facilities')->default(0); // Number of sanitation facilities built
            
            // Economic Impact
            $table->integer('jobs_created')->default(0);
            $table->integer('training_hours')->default(0);
            $table->integer('small_businesses_supported')->default(0);
            $table->integer('micro_loans_given')->default(0);
            
            // Environmental Impact
            $table->integer('trees_planted')->default(0);
            $table->integer('carbon_offset_tons')->default(0);
            $table->integer('renewable_energy_projects')->default(0);
            $table->integer('waste_recycled_tons')->default(0);
            
            // Custom Impact Metrics
            $table->json('custom_metrics')->nullable(); // For charity-specific metrics
            
            // Impact Verification
            $table->json('media_evidence')->nullable(); // Photos, videos, documents
            $table->json('verification_data')->nullable(); // Third-party verification data
            $table->timestamp('verification_date')->nullable();
            $table->string('verification_status')->default('pending'); // pending, verified, rejected
            
            // Impact Stories
            $table->text('impact_story')->nullable(); // Narrative of the impact
            $table->json('beneficiary_stories')->nullable(); // Stories from beneficiaries
            $table->json('before_after_data')->nullable(); // Before/after comparison data
            
            // Impact Timeline
            $table->timestamp('impact_date')->nullable(); // When the impact was realized
            $table->timestamp('expected_completion_date')->nullable();
            $table->json('milestones')->nullable(); // Key milestones and their completion dates
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_impact_metrics');
    }
}; 