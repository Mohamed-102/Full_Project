<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Job;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function getStats()
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'totalRecruiters' => User::where('role', 'recruiter')->count(),
            'totalUsers' => User::where('role', 'applicant')->count(),
            'totalApplications' => Application::count(),
            'totalJobs' => Job::count(),
            'totalInterviews' => Application::where('status', 'accepted')->count(),
        ];

        return response($stats, 200);
    }

    /**
     * Get all recruiters
     */
    public function getRecruiters()
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $recruiters = User::where('role', 'recruiter')
            ->withCount('jobs')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($recruiter) {
                return [
                    'id' => $recruiter->id,
                    'name' => $recruiter->name,
                    'email' => $recruiter->email,
                    'jobsCount' => $recruiter->jobs_count,
                    'isActive' => $recruiter->is_active,
                    'createdAt' => $recruiter->created_at,
                ];
            });

        return response($recruiters, 200);
    }

    /**
     * Get all users (applicants)
     */
    public function getUsers()
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $users = User::where('role', 'applicant')
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'applicationsCount' => $user->applications_count,
                    'isActive' => $user->is_active,
                    'createdAt' => $user->created_at,
                ];
            });

        return response($users, 200);
    }

    /**
     * Get all jobs for approval
     */
    public function getJobsForApproval()
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $jobs = Job::with(['user.recruiter:user_id,company_name', 'category'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($job) {
                $companyName = $job->user && $job->user->recruiter 
                    ? $job->user->recruiter->company_name 
                    : 'Unknown Company';
                
                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'description' => $job->description,
                    'location' => $job->location,
                    'category' => $job->category->name ?? 'Uncategorized',
                    'level' => $job->level,
                    'salary' => $job->salary,
                    'type' => $job->type,
                    'recruiter' => [
                        'id' => $job->user->id,
                        'name' => $job->user->name,
                        'email' => $job->user->email,
                        'company_name' => $companyName,
                    ],
                    'status' => $job->status ?? 'pending',
                    'createdAt' => $job->created_at,
                ];
            });

        return response($jobs, 200);
    }

    /**
     * Approve a job
     */
    public function approveJob($jobId)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $job = Job::find($jobId);
        if (!$job) {
            return response(['message' => 'Job not found'], 404);
        }

        $job->status = 'approved';
        $job->save();

        return response(['message' => 'Job approved successfully', 'job' => $job], 200);
    }

    /**
     * Reject a job
     */
    public function rejectJob($jobId)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $job = Job::find($jobId);
        if (!$job) {
            return response(['message' => 'Job not found'], 404);
        }

        $job->status = 'rejected';
        $job->save();

        return response(['message' => 'Job rejected successfully', 'job' => $job], 200);
    }

    /**
     * Toggle recruiter active status
     */
    public function toggleRecruiterStatus($recruiterId)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $recruiter = User::where('id', $recruiterId)->where('role', 'recruiter')->first();
        if (!$recruiter) {
            return response(['message' => 'Recruiter not found'], 404);
        }

        $recruiter->is_active = !$recruiter->is_active;
        $recruiter->save();

        return response([
            'message' => $recruiter->is_active ? 'Recruiter activated successfully' : 'Recruiter deactivated successfully',
            'isActive' => $recruiter->is_active
        ], 200);
    }

    /**
     * Delete a recruiter
     */
    public function deleteRecruiter($recruiterId)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $recruiter = User::where('id', $recruiterId)->where('role', 'recruiter')->first();
        if (!$recruiter) {
            return response(['message' => 'Recruiter not found'], 404);
        }

        $recruiter->delete();
        return response(['message' => 'Recruiter deleted successfully'], 200);
    }

    /**
     * Delete a user (applicant)
     */
    public function deleteUser($userId)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $user = User::where('id', $userId)->where('role', 'applicant')->first();
        if (!$user) {
            return response(['message' => 'User not found'], 404);
        }

        $user->delete();
        return response(['message' => 'User deleted successfully'], 200);
    }

    /**
     * Approve all pending jobs
     */
    public function approveAllJobs()
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        $pendingJobs = Job::where('status', 'pending')->get();
        $count = $pendingJobs->count();

        foreach ($pendingJobs as $job) {
            $job->status = 'approved';
            $job->save();
        }

        return response([
            'message' => "Successfully approved {$count} jobs",
            'count' => $count
        ], 200);
    }

    /**
     * Get admin profile
     */
    public function getProfile($userId)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        if (Auth::id() !== (int)$userId) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $admin = Auth::user();
        return response([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => $admin->role,
        ], 200);
    }

    /**
     * Update admin profile
     */
    public function updateProfile(Request $request, $userId)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response(['message' => 'Unauthorized'], 403);
        }

        if (Auth::id() !== (int)$userId) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $userId,
            'password' => 'sometimes|string|min:6',
        ]);

        $admin = Auth::user();

        if (isset($validated['name'])) {
            $admin->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $admin->email = $validated['email'];
        }

        if (isset($validated['password'])) {
            $admin->password = Hash::make($validated['password']);
        }

        $admin->save();

        return response([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ]
        ], 200);
    }
}
