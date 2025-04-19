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
    /**
     * Register a new user or organization
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            // Validate common fields
            $validator = Validator::make($request->all(), [
                'email' => 'required_without:gmail|email|max:255',
                'gmail' => 'required_without:email|email|max:255',
                'password' => 'required|min:8',
                'type' => 'required|in:user,organization',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the email from either field
            $email = $request->email ?? $request->gmail;

            // Check if email already exists in either users or organizations table
            $userExists = User::where('gmail', $email)->exists();
            $organizationExists = Organization::where('gmail', $email)->exists();

            if ($userExists || $organizationExists) {
                return response()->json([
                    'message' => 'This email is already registered. Please use a different email or login to your existing account.',
                    'errors' => ['email' => ['This email is already registered.']]
                ], 422);
            }

            // Register based on account type
            if ($request->type === 'user') {
                return $this->registerUser($request);
            } else {
                return $this->registerOrganization($request);
            }
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred during registration. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register a new user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerUser(Request $request)
    {
        // Debug the incoming request
        Log::info('User registration request received', [
            'all_data' => $request->all(),
            'has_files' => $request->hasFile('profile_picture') || $request->hasFile('front_ic_picture') || $request->hasFile('back_ic_picture'),
            'files' => $request->allFiles(),
            'headers' => $request->header(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
            'is_json' => $request->isJson(),
            'is_ajax' => $request->ajax(),
            'request_size' => $request->header('Content-Length'),
        ]);
        
        // Check if files are properly uploaded
        if ($request->hasFile('front_ic_picture')) {
            $frontIcFile = $request->file('front_ic_picture');
            Log::info('Front IC picture details', [
                'name' => $frontIcFile->getClientOriginalName(),
                'size' => $frontIcFile->getSize(),
                'mime' => $frontIcFile->getMimeType(),
                'extension' => $frontIcFile->getClientOriginalExtension(),
                'error' => $frontIcFile->getError(),
            ]);
        } else {
            Log::warning('Front IC picture not found in request');
        }
        
        // Validate user-specific fields
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'ic_number' => 'required|string|max:20',
            'phone_number' => 'required|string|max:20',
            'wallet_address' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'front_ic_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'back_ic_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gmail' => 'required|email|max:255|unique:users,gmail',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        if ($validator->fails()) {
            Log::warning('User registration validation failed', [
                'errors' => $validator->errors()->toArray(),
                'data' => $request->all(),
            ]);
            
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle file uploads
        $profilePicturePath = null;
        $frontIcPicturePath = null;
        $backIcPicturePath = null;

        if ($request->hasFile('profile_picture')) {
            $profilePicturePath = $request->file('profile_picture')->store('profile_pictures', 'public');
        }

        if ($request->hasFile('front_ic_picture')) {
            $frontIcPicturePath = $request->file('front_ic_picture')->store('ic_pictures', 'public');
        }

        if ($request->hasFile('back_ic_picture')) {
            $backIcPicturePath = $request->file('back_ic_picture')->store('ic_pictures', 'public');
        }

        // Create user
        $user = User::create([
            'name' => $request->name,
            'gmail' => $request->email ?? $request->gmail,
            'password' => Hash::make($request->password),
            'ic_number' => $request->ic_number,
            'phone_number' => $request->phone_number,
            'wallet_address' => $request->wallet_address,
            'profile_picture' => $profilePicturePath,
            'front_ic_picture' => $frontIcPicturePath,
            'back_ic_picture' => $backIcPicturePath,
        ]);

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
            'account_type' => 'user'
        ], 201);
    }

    /**
     * Register a new organization
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerOrganization(Request $request)
    {
        // Validate organization-specific fields
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'register_address' => 'required|string|max:255',
            'postcode' => 'required|string|max:20',
            'city' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'website' => 'nullable|url|max:255',
            'facebook' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'wallet_address' => 'nullable|string|max:255',
            'representative_id' => 'required|string|max:100|exists:users,ic_number',
            'description' => 'required|string',
            'objectives' => 'required|string',
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'statutory_declaration' => 'required|file|mimes:pdf,doc,docx|max:5120',
            'verified_document' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle file uploads
        $logoPath = null;
        $statutoryDeclarationPath = null;
        $verifiedDocumentPath = null;

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('organization_logos', 'public');
        }

        if ($request->hasFile('statutory_declaration')) {
            $statutoryDeclarationPath = $request->file('statutory_declaration')->store('organization_documents', 'public');
        }

        if ($request->hasFile('verified_document')) {
            $verifiedDocumentPath = $request->file('verified_document')->store('organization_documents', 'public');
        }

        // Create organization
        $organization = Organization::create([
            'name' => $request->name,
            'gmail' => $request->email ?? $request->gmail,
            'password' => Hash::make($request->password),
            'category' => $request->category,
            'country' => $request->country,
            'state' => $request->state,
            'register_address' => $request->register_address,
            'postcode' => $request->postcode,
            'city' => $request->city,
            'phone_number' => $request->phone_number,
            'website' => $request->website,
            'facebook' => $request->facebook,
            'instagram' => $request->instagram,
            'wallet_address' => $request->wallet_address,
            'representative_id' => $request->representative_id,
            'description' => $request->description,
            'objectives' => $request->objectives,
            'logo' => $logoPath,
            'statutory_declaration' => $statutoryDeclarationPath,
            'verified_document' => $verifiedDocumentPath,
        ]);

        // Generate token
        $token = $organization->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Organization registered successfully',
            'user' => $organization,
            'token' => $token,
            'account_type' => 'organization'
        ], 201);
    }

    /**
     * Login user or organization
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            Log::info('Login attempt started', ['email' => $request->input('email', '')]);
            
            // Check database connection first
            try {
                \DB::connection()->getPdo();
            } catch (\Exception $e) {
                Log::error('Database connection error: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Database connection error. Please make sure your database server is running.',
                    'error' => 'Database connection failed: ' . $e->getMessage(),
                    'error_type' => 'database_connection'
                ], 500);
            }
            
            // Validate login credentials
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if ($validator->fails()) {
                Log::info('Login validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the email and password from the request
            $email = $request->input('email');
            $password = $request->input('password');
            
            Log::info('Processing login request', ['email' => $email]);

            // First, try to find a user with this email
            $user = null;
            $accountType = null;
            
            try {
                // Check if user exists - using parameter binding with 'gmail' field
                $userModel = User::where('gmail', $email)->first();
                if ($userModel) {
                    $user = $userModel;
                    $accountType = 'user';
                    Log::info('Found user account', ['userId' => $user->id]);
                } else {
                    // Check if organization exists - using parameter binding with 'gmail' field
                    $orgModel = Organization::where('gmail', $email)->first();
                    if ($orgModel) {
                        $user = $orgModel;
                        $accountType = 'organization';
                        Log::info('Found organization account', ['orgId' => $user->id]);
                    }
                }
            } catch (\Exception $dbException) {
                Log::error('Database error during login', [
                    'email' => $email,
                    'error' => $dbException->getMessage(),
                    'trace' => $dbException->getTraceAsString()
                ]);
                
                return response()->json([
                    'message' => 'A database error occurred. Please try again later.',
                    'error' => $dbException->getMessage(),
                    'error_type' => 'database_query'
                ], 500);
            }
            
            // If no user or organization found
            if (!$user) {
                Log::info('No account found with this email', ['email' => $email]);
                return response()->json([
                    'message' => 'These credentials do not match our records.'
                ], 401);
            }
            
            // Verify password
            if (!Hash::check($password, $user->password)) {
                Log::info('Invalid password for account', ['email' => $email]);
                return response()->json([
                    'message' => 'These credentials do not match our records.'
                ], 401);
            }
            
            // Password is correct, create token
            Log::info('Password verified, creating token', ['email' => $email]);
            $token = $user->createToken('auth_token')->plainTextToken;
            
            Log::info('Login successful', [
                'email' => $email,
                'accountType' => $accountType,
                'userId' => $user->id
            ]);
            
            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token,
                'account_type' => $accountType
            ]);
            
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage(), [
                'email' => $request->input('email', 'not provided'),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'An error occurred during login. Please try again later.',
                'error' => $e->getMessage(),
                'error_type' => 'general'
            ], 500);
        }
    }

    /**
     * Logout the authenticated user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // Revoke the token that was used to authenticate the current request
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Successfully logged out'
            ]);
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred during logout. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the authenticated user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        try {
            $user = $request->user();
            $accountType = 'user';

            // Determine account type based on the model class
            if ($user instanceof Organization) {
                $accountType = 'organization';
            }

            return response()->json([
                'user' => $user,
                'account_type' => $accountType
            ]);
        } catch (\Exception $e) {
            Log::error('User fetch error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching user data. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a password reset link
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if email exists in users or organizations table
            $userExists = User::where('gmail', $request->email)->exists();
            $organizationExists = Organization::where('gmail', $request->email)->exists();

            // If email doesn't exist in either table
            if (!$userExists && !$organizationExists) {
                // For security reasons, we still return a success message
                return response()->json([
                    'message' => 'If your email exists in our system, you will receive a password reset link shortly.'
                ]);
            }

            // TODO: Implement actual password reset logic here
            // This would typically involve:
            // 1. Generating a password reset token
            // 2. Storing it in the password_resets table
            // 3. Sending an email with the reset link

            return response()->json([
                'message' => 'Password reset link sent to your email'
            ]);
        } catch (\Exception $e) {
            Log::error('Forgot password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while processing your request. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset the user's password
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
                'email' => 'required|email',
                'password' => 'required|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // TODO: Implement actual password reset logic here
            // This would typically involve:
            // 1. Validating the token against the password_resets table
            // 2. Updating the user's password
            // 3. Deleting the token from the password_resets table

            return response()->json([
                'message' => 'Password has been reset successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while resetting your password. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 