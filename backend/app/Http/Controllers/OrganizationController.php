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

        // Validate user has permission to update
        if ($organization->representative_id !== Auth::user()->ic_number && 
            Auth::user()->type !== 'organization') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate basic fields
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'objectives' => 'required|string',
            'wallet_address' => 'required|string',
            'register_address' => 'required|string',
            'gmail' => 'required|email|ends_with:@gmail.com',
            'phone_number' => 'required|string',
            'website' => 'nullable|url',
            'facebook' => 'nullable|string',
            'instagram' => 'nullable|string',
            'others' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'statutory_declaration' => 'nullable|mimes:pdf,doc,docx|max:2048',
            'verified_document' => 'nullable|mimes:pdf,doc,docx|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($organization->logo) {
                Storage::delete($organization->logo);
            }
            $validated['logo'] = $request->file('logo')->store('organizations/logos', 'public');
        }

        if ($request->hasFile('statutory_declaration')) {
            if ($organization->statutory_declaration) {
                Storage::delete($organization->statutory_declaration);
            }
            $validated['statutory_declaration'] = $request->file('statutory_declaration')
                ->store('organizations/statutory_declarations', 'public');
        }

        if ($request->hasFile('verified_document')) {
            if ($organization->verified_document) {
                Storage::delete($organization->verified_document);
            }
            $validated['verified_document'] = $request->file('verified_document')
                ->store('organizations/verified_documents', 'public');
        }

        try {
            $organization->update($validated);
            return response()->json($organization);
        } catch (\Exception $e) {
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
        if ($organization->representative_id !== Auth::user()->ic_number && 
            Auth::user()->type !== 'organization') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete associated files
        if ($organization->logo) {
            Storage::delete($organization->logo);
        }
        if ($organization->statutory_declaration) {
            Storage::delete($organization->statutory_declaration);
        }
        if ($organization->verified_document) {
            Storage::delete($organization->verified_document);
        }

        $organization->delete();

        return response()->json(['message' => 'Organization deleted successfully']);
    }
} 

