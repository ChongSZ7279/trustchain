<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    /**
     * Test login endpoint
     */
    public function testLogin(Request $request)
    {
        try {
            // Log the request
            Log::info('Test login request', [
                'email' => $request->input('email', 'not provided'),
                'has_password' => !empty($request->input('password')),
                'request_data' => $request->all(),
                'request_headers' => $request->headers->all()
            ]);
            
            // Validate input
            if (!$request->has('email') || !$request->has('password')) {
                return response()->json([
                    'message' => 'Email and password are required',
                    'received' => $request->all(),
                    'headers' => $request->headers->all()
                ], 422);
            }
            
            $email = $request->input('email');
            
            // Test database connection
            try {
                $dbStatus = \DB::connection()->getPdo() ? 'connected' : 'failed';
                $dbName = \DB::connection()->getDatabaseName();
                Log::info('Database connection test: ' . $dbStatus . ', database: ' . $dbName);
                
                // Test a simple query
                $testQuery = \DB::select('SELECT 1 as test');
                $queryStatus = !empty($testQuery) ? 'success' : 'failed';
                
                // Get database config
                $dbConfig = [
                    'connection' => config('database.default'),
                    'host' => config('database.connections.mysql.host'),
                    'port' => config('database.connections.mysql.port'),
                    'database' => config('database.connections.mysql.database'),
                    'username' => config('database.connections.mysql.username'),
                    'password' => !empty(config('database.connections.mysql.password')) ? 'set' : 'empty'
                ];
            } catch (\Exception $dbException) {
                Log::error('Database connection error: ' . $dbException->getMessage());
                $dbStatus = 'error: ' . $dbException->getMessage();
                $dbName = 'unknown';
                $queryStatus = 'failed';
                $dbConfig = [
                    'connection' => config('database.default'),
                    'host' => config('database.connections.mysql.host'),
                    'port' => config('database.connections.mysql.port'),
                    'database' => config('database.connections.mysql.database'),
                    'username' => config('database.connections.mysql.username'),
                    'password' => !empty(config('database.connections.mysql.password')) ? 'set' : 'empty'
                ];
            }
            
            // Find user or organization
            $user = null;
            $organization = null;
            $userError = null;
            $orgError = null;
            
            try {
                $user = User::where('gmail', $email)->first();
            } catch (\Exception $e) {
                $userError = $e->getMessage();
                Log::error('Error finding user: ' . $e->getMessage());
            }
            
            try {
                $organization = Organization::where('gmail', $email)->first();
            } catch (\Exception $e) {
                $orgError = $e->getMessage();
                Log::error('Error finding organization: ' . $e->getMessage());
            }
            
            // Return debug info
            return response()->json([
                'message' => 'Test login endpoint',
                'request_received' => true,
                'email_received' => $email,
                'password_received' => !empty($request->input('password')),
                'database_status' => $dbStatus,
                'database_name' => $dbName,
                'query_status' => $queryStatus,
                'database_config' => $dbConfig,
                'user_query_error' => $userError,
                'org_query_error' => $orgError,
                'user_found' => $user ? true : false,
                'user_details' => $user ? [
                    'id' => $user->id,
                    'email' => $user->gmail,
                    'name' => $user->name,
                    'has_password' => !empty($user->password)
                ] : null,
                'organization_found' => $organization ? true : false,
                'organization_details' => $organization ? [
                    'id' => $organization->id,
                    'email' => $organization->gmail,
                    'name' => $organization->name,
                    'has_password' => !empty($organization->password)
                ] : null,
                'request_data' => $request->all(),
                'request_headers' => $request->headers->all()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Test login error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'message' => 'Error in test login',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Test database connection
     */
    public function testDatabase()
    {
        try {
            // Test database connection
            $dbStatus = \DB::connection()->getPdo() ? 'connected' : 'failed';
            $dbName = \DB::connection()->getDatabaseName();
            
            // Test a simple query
            $testQuery = \DB::select('SELECT 1 as test');
            $queryStatus = !empty($testQuery) ? 'success' : 'failed';
            
            // Get database config
            $dbConfig = [
                'connection' => config('database.default'),
                'host' => config('database.connections.mysql.host'),
                'port' => config('database.connections.mysql.port'),
                'database' => config('database.connections.mysql.database'),
                'username' => config('database.connections.mysql.username'),
                'password' => !empty(config('database.connections.mysql.password')) ? 'set' : 'empty'
            ];
            
            // Get tables
            $tables = [];
            try {
                $tablesQuery = \DB::select('SHOW TABLES');
                foreach ($tablesQuery as $table) {
                    $tableName = reset($table);
                    $tables[] = $tableName;
                }
            } catch (\Exception $e) {
                $tables = ['error' => $e->getMessage()];
            }
            
            return response()->json([
                'status' => 'success',
                'database_status' => $dbStatus,
                'database_name' => $dbName,
                'query_status' => $queryStatus,
                'database_config' => $dbConfig,
                'tables' => $tables
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database connection error',
                'error' => $e->getMessage(),
                'database_config' => [
                    'connection' => config('database.default'),
                    'host' => config('database.connections.mysql.host'),
                    'port' => config('database.connections.mysql.port'),
                    'database' => config('database.connections.mysql.database'),
                    'username' => config('database.connections.mysql.username'),
                    'password' => !empty(config('database.connections.mysql.password')) ? 'set' : 'empty'
                ]
            ], 500);
        }
    }

    /**
     * Test file upload
     */
    public function testFileUpload(Request $request)
    {
        try {
            // Log request data
            Log::info('Test file upload request', [
                