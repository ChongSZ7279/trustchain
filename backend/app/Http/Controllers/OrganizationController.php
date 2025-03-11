<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;


class OrganizationController extends Controller
{
    public function index()
    {
        $organizations = Organization::all();
        return response()->json($organizations);
    }

    public function show($id)
    {
        $organization = Organization::findOrFail($id);
        return response()->json($organization);
    }

    public function update(Request $request, $id)
    {
        $organization = Organization::findOrFail($id);

        // Get authenticated user/organization
        $authenticatedOrg = Auth::user();

        // Debug information
        \Log::info('Organization update attempt:', [
            'organization_id' => $id,
            'organization_data' => $organization->toArray(),
            'authenticated_org' => $authenticatedOrg ? $authenticatedOrg->toArray() : null,
            'request_data' => $request->all()
        ]);

        // Check if organization is authenticated
        if (!$authenticatedOrg) {
            \Log::warning('Update attempt with no authenticated organization');
            return response()->json(['message' => 'Unauthorized - Not authenticated'], 403);
        }

        // Check if authenticated organization matches the one being updated
        if ($organization->id !== $authenticatedOrg->id) {
            \Log::warning('Update attempt by wrong organization', [
                'target_organization_id' => $organization->id,
                'authenticated_org_id' => $authenticatedOrg->id
            ]);
            return response()->json(['message' => 'Unauthorized - You can only update your own organization'], 403);
        }

        // Validate basic fields
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'objectives' => 'required|string',
            'register_address' => 'required|string',
            'phone_number' => 'required|string',
            'website' => 'nullable|url',
            'facebook' => 'nullable|url',
            'instagram' => 'nullable|url',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'statutory_declaration' => 'nullable|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:2048',
            'verified_document' => 'nullable|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($organization->logo) {
                Storage::disk('public')->delete($organization->logo);
            }
            $validated['logo'] = $request->file('logo')->store('organization_logos', 'public');
        }

        if ($request->hasFile('statutory_declaration')) {
            if ($organization->statutory_declaration) {
                Storage::disk('public')->delete($organization->statutory_declaration);
            }
            $validated['statutory_declaration'] = $request->file('statutory_declaration')
                ->store('organization_documents', 'public');
        }

        if ($request->hasFile('verified_document')) {
            if ($organization->verified_document) {
                Storage::disk('public')->delete($organization->verified_document);
            }
            $validated['verified_document'] = $request->file('verified_document')
                ->store('organization_documents', 'public');
        }

        try {
            $organization->update($validated);
            \Log::info('Organization updated successfully', [
                'organization_id' => $organization->id,
                'updated_data' => $validated
            ]);
            return response()->json($organization);
        } catch (\Exception $e) {
            \Log::error('Organization update error:', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to update organization',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $organization = Organization::findOrFail($id);

        // Validate user has permission to delete
        if (Auth::user()->type !== 'organization' || Auth::user()->id !== $organization->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete associated files
        if ($organization->logo) {
            Storage::disk('public')->delete($organization->logo);
        }
        if ($organization->statutory_declaration) {
            Storage::disk('public')->delete($organization->statutory_declaration);
        }
        if ($organization->verified_document) {
            Storage::disk('public')->delete($organization->verified_document);
        }

        $organization->delete();

        return response()->json(['message' => 'Organization deleted successfully']);
    }
} 

