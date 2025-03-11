<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function update(Request $request, $ic_number)
    {
        // Find user by IC number
        $user = User::where('ic_number', $ic_number)->firstOrFail();

        // Validate user has permission to update
        if (Auth::user()->ic_number !== $ic_number) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'front_ic_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'back_ic_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
        }

        if ($request->hasFile('front_ic_picture')) {
            // Delete old front IC picture if exists
            if ($user->front_ic_picture) {
                Storage::disk('public')->delete($user->front_ic_picture);
            }
            $validated['front_ic_picture'] = $request->file('front_ic_picture')->store('ic_pictures', 'public');
        }

        if ($request->hasFile('back_ic_picture')) {
            // Delete old back IC picture if exists
            if ($user->back_ic_picture) {
                Storage::disk('public')->delete($user->back_ic_picture);
            }
            $validated['back_ic_picture'] = $request->file('back_ic_picture')->store('ic_pictures', 'public');
        }

        try {
            $user->update($validated);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 