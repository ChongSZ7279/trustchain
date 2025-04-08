<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\DonationImpactMetric;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DonationImpactController extends Controller
{
    public function store(Request $request, $donationId)
    {
        try {
            $donation = Donation::findOrFail($donationId);
            
            $validated = $request->validate([
                // Education Impact
                'students_benefited' => 'nullable|integer|min:0',
                'school_supplies_provided' => 'nullable|integer|min:0',
                'scholarships_awarded' => 'nullable|integer|min:0',
                'teachers_trained' => 'nullable|integer|min:0',
                'classrooms_built' => 'nullable|integer|min:0',
                
                // Health Impact
                'medical_treatments' => 'nullable|integer|min:0',
                'vaccines_administered' => 'nullable|integer|min:0',
                'health_workers_trained' => 'nullable|integer|min:0',
                'medical_equipment_provided' => 'nullable|integer|min:0',
                
                // Food & Shelter Impact
                'meals_provided' => 'nullable|integer|min:0',
                'shelter_nights' => 'nullable|integer|min:0',
                'clean_water_access' => 'nullable|integer|min:0',
                'sanitation_facilities' => 'nullable|integer|min:0',
                
                // Economic Impact
                'jobs_created' => 'nullable|integer|min:0',
                'training_hours' => 'nullable|integer|min:0',
                'small_businesses_supported' => 'nullable|integer|min:0',
                'micro_loans_given' => 'nullable|integer|min:0',
                
                // Environmental Impact
                'trees_planted' => 'nullable|integer|min:0',
                'carbon_offset_tons' => 'nullable|integer|min:0',
                'renewable_energy_projects' => 'nullable|integer|min:0',
                'waste_recycled_tons' => 'nullable|integer|min:0',
                
                // Custom Impact Metrics
                'custom_metrics' => 'nullable|array',
                
                // Impact Verification
                'media_evidence' => 'nullable|array',
                'verification_data' => 'nullable|array',
                'verification_date' => 'nullable|date',
                'verification_status' => 'nullable|string|in:pending,verified,rejected',
                
                // Impact Stories
                'impact_story' => 'nullable|string',
                'beneficiary_stories' => 'nullable|array',
                'before_after_data' => 'nullable|array',
                
                // Impact Timeline
                'impact_date' => 'nullable|date',
                'expected_completion_date' => 'nullable|date',
                'milestones' => 'nullable|array'
            ]);

            // Handle media evidence uploads
            if ($request->hasFile('media_evidence')) {
                $mediaPaths = [];
                foreach ($request->file('media_evidence') as $file) {
                    $path = $file->store('impact_evidence', 'public');
                    $mediaPaths[] = $path;
                }
                $validated['media_evidence'] = $mediaPaths;
            }

            // Handle beneficiary stories media
            if (isset($validated['beneficiary_stories'])) {
                foreach ($validated['beneficiary_stories'] as &$story) {
                    if (isset($story['media']) && $story['media'] instanceof \Illuminate\Http\UploadedFile) {
                        $path = $story['media']->store('beneficiary_stories', 'public');
                        $story['media'] = $path;
                    }
                }
            }

            $impactMetric = $donation->impactMetrics()->create($validated);

            Log::info('Impact metrics created', [
                'donation_id' => $donationId,
                'impact_metric_id' => $impactMetric->id
            ]);

            return response()->json([
                'message' => 'Impact metrics recorded successfully',
                'data' => $impactMetric
            ]);
        } catch (\Exception $e) {
            Log::error('Error recording impact metrics', [
                'donation_id' => $donationId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to record impact metrics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($donationId)
    {
        try {
            $donation = Donation::with('impactMetrics')->findOrFail($donationId);
            
            return response()->json([
                'donation' => $donation,
                'impact_metrics' => $donation->impactMetrics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch impact metrics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $donationId)
    {
        try {
            $donation = Donation::findOrFail($donationId);
            $impactMetric = $donation->impactMetrics;

            if (!$impactMetric) {
                return response()->json([
                    'message' => 'No impact metrics found for this donation'
                ], 404);
            }

            $validated = $request->validate([
                'students_benefited' => 'nullable|integer|min:0',
                'meals_provided' => 'nullable|integer|min:0',
                'medical_treatments' => 'nullable|integer|min:0',
                'shelter_nights' => 'nullable|integer|min:0',
                'training_hours' => 'nullable|integer|min:0',
                'custom_metrics' => 'nullable|array',
                'impact_story' => 'nullable|string',
                'media_evidence' => 'nullable|array',
                'impact_date' => 'nullable|date'
            ]);

            // Handle media evidence updates
            if ($request->hasFile('media_evidence')) {
                // Delete old media files
                if ($impactMetric->media_evidence) {
                    foreach ($impactMetric->media_evidence as $oldPath) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                // Upload new media files
                $mediaPaths = [];
                foreach ($request->file('media_evidence') as $file) {
                    $path = $file->store('impact_evidence', 'public');
                    $mediaPaths[] = $path;
                }
                $validated['media_evidence'] = $mediaPaths;
            }

            $impactMetric->update($validated);

            return response()->json([
                'message' => 'Impact metrics updated successfully',
                'data' => $impactMetric
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update impact metrics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 