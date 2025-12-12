<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ViewedJob;
use App\Models\SavedJob;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get user dashboard statistics
     */
    public function getDashboardStats($userId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        // Ensure user can only access their own stats (or is admin)
        if (Auth::id() !== (int)$userId && Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'viewedCount' => ViewedJob::where('user_id', $userId)->count(),
            'savedCount' => SavedJob::where('user_id', $userId)->count(),
            'applicationsCount' => Application::where('user_id', $userId)->count(),
        ];

        return response($stats, 200);
    }

    /**
     * Get user's viewed jobs
     */
    public function getViewedJobs($userId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        if (Auth::id() !== (int)$userId && Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $viewedJobs = ViewedJob::where('user_id', $userId)
            ->with('job.category', 'job.user')
            ->orderBy('viewed_at', 'desc')
            ->get()
            ->map(function ($viewedJob) {
                return [
                    'id' => $viewedJob->id,
                    'job' => $viewedJob->job,
                    'viewedAt' => $viewedJob->viewed_at,
                ];
            });

        return response($viewedJobs, 200);
    }

    /**
     * Add a job to viewed jobs
     */
    public function addViewedJob(Request $request, $userId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        if (Auth::id() !== (int)$userId) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'jobId' => 'required|integer|exists:jobs,id'
        ]);

        // Check if already viewed
        $existing = ViewedJob::where('user_id', $userId)
            ->where('job_id', $request->jobId)
            ->first();

        if ($existing) {
            // Update viewed_at timestamp
            $existing->update(['viewed_at' => now()]);
            return response(['message' => 'Viewed job updated'], 200);
        }

        $viewedJob = ViewedJob::create([
            'user_id' => $userId,
            'job_id' => $request->jobId,
            'viewed_at' => now()
        ]);

        return response($viewedJob->load('job'), 201);
    }

    /**
     * Clear all viewed jobs for a user
     */
    public function clearViewedJobs($userId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        if (Auth::id() !== (int)$userId) {
            return response(['message' => 'Unauthorized'], 403);
        }

        ViewedJob::where('user_id', $userId)->delete();

        return response(['message' => 'All viewed jobs cleared'], 200);
    }

    /**
     * Get user's saved jobs
     */
    public function getSavedJobs($userId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        if (Auth::id() !== (int)$userId && Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $savedJobs = SavedJob::where('user_id', $userId)
            ->with('job.category', 'job.user')
            ->orderBy('saved_at', 'desc')
            ->get()
            ->map(function ($savedJob) {
                return [
                    'id' => $savedJob->id,
                    'job' => $savedJob->job,
                    'savedAt' => $savedJob->saved_at,
                ];
            });

        return response($savedJobs, 200);
    }

    /**
     * Add a job to saved jobs
     */
    public function addSavedJob(Request $request, $userId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        if (Auth::id() !== (int)$userId) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'jobId' => 'required|integer|exists:jobs,id'
        ]);

        // Check if already saved
        $existing = SavedJob::where('user_id', $userId)
            ->where('job_id', $request->jobId)
            ->first();

        if ($existing) {
            return response(['message' => 'Job already saved'], 200);
        }

        $savedJob = SavedJob::create([
            'user_id' => $userId,
            'job_id' => $request->jobId,
            'saved_at' => now()
        ]);

        return response($savedJob->load('job'), 201);
    }

    /**
     * Remove a job from saved jobs
     */
    public function removeSavedJob($userId, $jobId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        if (Auth::id() !== (int)$userId) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $savedJob = SavedJob::where('user_id', $userId)
            ->where('job_id', $jobId)
            ->first();

        if (!$savedJob) {
            return response(['message' => 'Saved job not found'], 404);
        }

        $savedJob->delete();

        return response(['message' => 'Job removed from saved'], 200);
    }

    /**
     * Get user profile
     */
    public function getProfile($userId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        if (Auth::id() !== (int)$userId && Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($userId);

        return response([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ], 200);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request, $userId)
    {
        // Check authentication
        if (!Auth::check()) {
            return response(['message' => 'Unauthenticated'], 401);
        }

        if (Auth::id() !== (int)$userId) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($userId);

        $fields = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $userId,
            'password' => 'sometimes|string|min:6',
        ]);

        if (isset($fields['password'])) {
            $fields['password'] = Hash::make($fields['password']);
        }

        $user->update($fields);

        return response([
            'message' => 'Profile updated successfully',
            'user' => $user
        ], 200);
    }

    /**
     * Get recruiter profile with recruiter details
     */
    public function getRecruiterProfile($recruiterId)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                return response(['message' => 'Unauthenticated'], 401);
            }

            // Get user
            $user = User::find($recruiterId);
            if (!$user || $user->role !== 'recruiter') {
                return response(['message' => 'Recruiter not found'], 404);
            }

            // Get recruiter details
            $recruiter = $user->recruiter()->first();
            if (!$recruiter) {
                return response(['message' => 'Recruiter profile not found'], 404);
            }

            return response([
                'user' => $user,
                'recruiter' => $recruiter
            ], 200);
        } catch (\Exception $e) {
            return response(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update recruiter profile
     */
    public function updateRecruiterProfile(Request $request, $recruiterId)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                return response(['message' => 'Unauthenticated'], 401);
            }

            // Check authorization
            if (Auth::id() !== (int)$recruiterId && Auth::user()->role !== 'admin') {
                return response(['message' => 'Unauthorized'], 403);
            }

            // Get user
            $user = User::find($recruiterId);
            if (!$user || $user->role !== 'recruiter') {
                return response(['message' => 'Recruiter not found'], 404);
            }

            // Validate and update user data
            $userFields = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $recruiterId,
                'password' => 'sometimes|string|min:6',
            ]);

            if (isset($userFields['password'])) {
                $userFields['password'] = Hash::make($userFields['password']);
            }

            $user->update($userFields);

            // Validate and update recruiter data
            $recruiterFields = $request->validate([
                'company_name' => 'sometimes|string|max:255',
                'location' => 'sometimes|string|max:255',
            ]);

            if (!empty($recruiterFields)) {
                $recruiter = $user->recruiter()->first();
                if ($recruiter) {
                    $recruiter->update($recruiterFields);
                }
            }

            return response([
                'message' => 'Profile updated successfully',
                'user' => $user,
                'recruiter' => $user->recruiter()->first()
            ], 200);
        } catch (\Exception $e) {
            return response(['message' => $e->getMessage()], 500);
        }
    }
}
