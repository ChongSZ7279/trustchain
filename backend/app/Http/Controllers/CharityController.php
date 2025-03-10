<?php

namespace App\Http\Controllers;

use App\Models\Charity;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class CharityController extends Controller
{
    public function index()
    {
        $charities = Charity::with('organization')->get();
        return response()->json($charities);
    }

    public function show($id)
    {
        $charity = Charity::with('organization')->findOrFail($id);
        return response()->json($charity);
    }

    public function store(Request $request)
    {
        // Check if user is associated with an organization
        $organization = Organization::where('representative_id', Auth::user()->ic_number)
            ->orWhere('id', Auth::user()->organization_id)
            ->first();

        if (!$organization) {
            return response()->json(['message' => 'Only organizations can create charities'], 403);
        }

        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'fund_targeted' => 'required|numeric|min:0',
            'picture_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'verified_document' => 'required|mimes:pdf,doc,docx|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('picture_path')) {
            $validated['picture_path'] = $request->file('picture_path')
                ->store('charities/pictures', 'public');
        }

        if ($request->hasFile('verified_document')) {
            $validated['verified_document'] = $request->file('verified_document')
                ->store('charities/documents', 'public');
        }

        $validated['organization_id'] = $organization->id;
        $validated['fund_received'] = 0;
        $validated['is_verified'] = false;

        $charity = Charity::create($validated);

        return response()->json($charity, 201);
    }

    public function update(Request $request, $id)
    {
        $charity = Charity::findOrFail($id);

        // Check if user has permission to update
        if (!$this->canManageCharity($charity)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'fund_targeted' => 'required|numeric|min:0',
            'picture_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'verified_document' => 'nullable|mimes:pdf,doc,docx|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('picture_path')) {
            if ($charity->picture_path) {
                Storage::delete($charity->picture_path);
            }
            $validated['picture_path'] = $request->file('picture_path')
                ->store('charities/pictures', 'public');
        }

        if ($request->hasFile('verified_document')) {
            if ($charity->verified_document) {
                Storage::delete($charity->verified_document);
            }
            $validated['verified_document'] = $request->file('verified_document')
                ->store('charities/documents', 'public');
        }

        $charity->update($validated);

        return response()->json($charity);
    }

    public function destroy($id)
    {
        $charity = Charity::findOrFail($id);

        // Check if user has permission to delete
        if (!$this->canManageCharity($charity)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete associated files
        if ($charity->picture_path) {
            Storage::delete($charity->picture_path);
        }
        if ($charity->verified_document) {
            Storage::delete($charity->verified_document);
        }

        $charity->delete();

        return response()->json(['message' => 'Charity deleted successfully']);
    }

    private function canManageCharity($charity)
    {
        $user = Auth::user();
        return $charity->organization->representative_id === $user->ic_number ||
               $charity->organization_id === $user->organization_id;
    }
} 