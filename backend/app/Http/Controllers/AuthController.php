<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function registerUser(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ic_number' => 'required|string|unique:users,ic_number',
                'name' => 'required|string|max:255',
                'password' => 'required|string|min:8|confirmed',
                'profile_picture' => 'nullable|image|max:2048',
                'front_ic_picture' => 'required|image|max:2048',
                'back_ic_picture' => 'required|image|max:2048',
                'phone_number' => 'required|string',
                'gmail' => 'required|string|email|unique:users,gmail',
                'wallet_address' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Handle file uploads
            $userData = $request->except(['profile_picture', 'front_ic_picture', 'back_ic_picture']);
            
            if ($request->hasFile('profile_picture')) {
                $userData['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
            }
            
            $userData['front_ic_picture'] = $request->file('front_ic_picture')->store('ic_pictures', 'public');
            $userData['back_ic_picture'] = $request->file('back_ic_picture')->store('ic_pictures', 'public');
            $userData['password'] = Hash::make($request->password);

            $user = User::create($userData);
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'User registration successful'
            ], 201);
        } catch (\Exception $e) {
            Log::error('User registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function registerOrganization(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'logo' => 'required|image|max:2048',
                'cover_image_path' => 'nullable|image|max:5120',
                'category' => 'required|string',
                'description' => 'required|string',
                'objectives' => 'required|string',
                'representative_id' => 'required|string|exists:users,ic_number',
                'statutory_declaration' => 'required|file|mimes:pdf,doc,docx|max:2048',
                'verified_document' => 'required|file|mimes:pdf,doc,docx|max:2048',
                'wallet_address' => 'required|string',
                'register_address' => 'required|string',
                'gmail' => 'required|string|email|unique:organizations,gmail',
                'phone_number' => 'required|string',
                'website' => 'nullable|string|url',
                'facebook' => 'nullable|string',
                'instagram' => 'nullable|string',
                'others' => 'nullable|string',
                'password' => 'required|string|min:8|confirmed'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Handle file uploads
            $orgData = $request->except(['logo', 'cover_image_path', 'statutory_declaration', 'verified_document']);
            
            $orgData['logo'] = $request->file('logo')->store('organization_logos', 'public');
            
            if ($request->hasFile('cover_image_path')) {
                $orgData['cover_image_path'] = $request->file('cover_image_path')->store('organization_covers', 'public');
            }
            
            $orgData['statutory_declaration'] = $request->file('statutory_declaration')->store('organization_documents', 'public');
            $orgData['verified_document'] = $request->file('verified_document')->store('organization_documents', 'public');
            
            // Make sure password is properly hashed and included
            $orgData['password'] = Hash::make($request->password);
            
            // Debug log to see what data is being sent to the database
            Log::info('Organization data before create:', array_keys($orgData));

            $organization = Organization::create($orgData);
            $token = $organization->createToken('auth_token')->plainTextToken;

            return response()->json([
                'organization' => $organization,
                'token' => $token,
                'message' => 'Organization registration successful'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Organization registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'gmail' => 'required|email',
                'password' => 'required',
                'type' => 'required|in:user,organization'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $credentials = $request->only('gmail', 'password');
            $guard = $request->type === 'user' ? 'web' : 'organization';

            // Debug log
            Log::info('Login attempt', [
                'type' => $request->type,
                'guard' => $guard,
                'gmail' => $request->gmail
            ]);

            if (!Auth::guard($guard)->attempt($credentials)) {
                Log::warning('Login failed: Invalid credentials', [
                    'type' => $request->type,
                    'gmail' => $request->gmail
                ]);
                
                return response()->json([
                    'message' => 'The provided credentials are incorrect.'
                ], 401);
            }

            $authenticatable = Auth::guard($guard)->user();
            $token = $authenticatable->createToken('auth_token')->plainTextToken;

            Log::info('Login successful', [
                'type' => $request->type,
                'id' => $authenticatable->id
            ]);

            return response()->json([
                $request->type => $authenticatable,
                'token' => $token,
                'message' => 'Login successful'
            ]);
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            if ($request->user()) {
                $request->user()->currentAccessToken()->delete();
            }
            
            return response()->json([
                'message' => 'Successfully logged out'
            ]);
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function user(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated'
                ], 401);
            }
            return response()->json($user);
        } catch (\Exception $e) {
            Log::error('User fetch error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 