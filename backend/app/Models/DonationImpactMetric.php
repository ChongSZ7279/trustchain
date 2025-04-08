<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonationImpactMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'donation_id',
        // Education Impact
        'students_benefited',
        'school_supplies_provided',
        'scholarships_awarded',
        'teachers_trained',
        'classrooms_built',
        
        // Health Impact
        'medical_treatments',
        'vaccines_administered',
        'health_workers_trained',
        'medical_equipment_provided',
        
        // Food & Shelter Impact
        'meals_provided',
        'shelter_nights',
        'clean_water_access',
        'sanitation_facilities',
        
        // Economic Impact
        'jobs_created',
        'training_hours',
        'small_businesses_supported',
        'micro_loans_given',
        
        // Environmental Impact
        'trees_planted',
        'carbon_offset_tons',
        'renewable_energy_projects',
        'waste_recycled_tons',
        
        // Custom Impact Metrics
        'custom_metrics',
        
        // Impact Verification
        'media_evidence',
        'verification_data',
        'verification_date',
        'verification_status',
        
        // Impact Stories
        'impact_story',
        'beneficiary_stories',
        'before_after_data',
        
        // Impact Timeline
        'impact_date',
        'expected_completion_date',
        'milestones'
    ];

    protected $casts = [
        'custom_metrics' => 'array',
        'media_evidence' => 'array',
        'verification_data' => 'array',
        'beneficiary_stories' => 'array',
        'before_after_data' => 'array',
        'milestones' => 'array',
        'impact_date' => 'datetime',
        'verification_date' => 'datetime',
        'expected_completion_date' => 'datetime'
    ];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }
} 