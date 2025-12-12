<?php

namespace App\Http\Controllers\Api; 

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Recruteur;
use Illuminate\Support\Facades\Hash; 
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
        // Recruiter registration
    public function registerRecruiter(Request $request)
    {
        try {
            $fields = $request->validate([
                'firstName' => 'required|string',
                'lastName' => 'required|string',
                'email' => 'required|string|unique:users,email',
                'password' => 'required|string',
                'companyName' => 'required|string',
                'companyLocation' => 'required|string',
                'ficheTechnique' => 'required|file|mimes:pdf,doc,docx,jpg,png|max:10240',
            ]);

            $name = $fields['firstName'] . ' ' . $fields['lastName'];
            $role = 'recruiter';

            $path = $request->file('ficheTechnique')->store('fiche_technique', 'public');

            $user = User::create([
                'name' => $name,
                'email' => $fields['email'],
                'password' => Hash::make($fields['password']),
                'role' => $role
            ]);

            // Create recruiter profile record
            Recruteur::create([
                'user_id' => $user->id,
                'company_name' => $fields['companyName'],
                'location' => $fields['companyLocation'],
                'fiche_technique' => $path,
            ]);

            $token = $user->createToken('myapptoken')->plainTextToken;

            $response = [
                'user' => $user,
                'company_name' => $fields['companyName'],
                'company_location' => $fields['companyLocation'],
                'fiche_technique_path' => $path,
                'token' => $token
            ];

            return response($response, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response(['message' => $e->getMessage()], 500);
        }
    }

    // Recruiter login
    public function loginRecruiter(Request $request)
    {
        try {   
            $fields = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string'
            ]);

            $user = User::where('email', $fields['email'])->where('role', 'recruiter')->first();

            if (!$user || !Hash::check($fields['password'], $user->password)) {
                return response([
                    'message' => 'Email or password incorrect'
                ], 401);
            }

            // Check if recruiter is active
            if (!$user->is_active) {
                return response([
                    'message' => 'Your account has been deactivated. Please contact the administrator.'
                ], 403);
            }

            $token = $user->createToken('myapptoken')->plainTextToken;

            $response = [
                'user' => $user,
                'token' => $token
            ];

            return response($response, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response(['message' => $e->getMessage()], 500);
        }
    }

    public function register(Request $request)
    {
        try {
            $fields = $request->validate([
                'firstName' => 'required|string',
                'lastName' => 'required|string',
                'email' => 'required|string|unique:users,email',
                'password' => 'required|string',
            ]);

            // Combine firstName and lastName for the name field
            $name = $fields['firstName'] . ' ' . $fields['lastName'];
            // Default role to 'applicant'
            $role = 'applicant';

            $user = User::create([
                'name' => $name,
                'email' => $fields['email'],
                'password' => Hash::make($fields['password']),
                'role' => $role
            ]);

            $token = $user->createToken('myapptoken')->plainTextToken;

            $response = [
                'user' => $user,
                'token' => $token,
            ];

            return response($response, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response(['message' => 'Validation error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            return response(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

   
    public function login(Request $request)
    {
        try {
            $fields = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string'
            ]);

            $user = User::where('email', $fields['email'])->first();

            if (!$user || !Hash::check($fields['password'], $user->password)) {
                return response([
                    'message' => 'Email or password incorrect'
                ], 401); 
            }

            $token = $user->createToken('myapptoken')->plainTextToken;

            $response = [
                'user' => $user,
                'token' => $token
            ];

            return response($response, 200); 
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response(['message' => 'Validation error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response(['message' => 'Login failed: ' . $e->getMessage()], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response([
            'message' => 'Logged out'
        ], 200);
    }
}