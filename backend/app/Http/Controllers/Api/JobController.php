<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job; 
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 

class JobController extends Controller
{
    
    public function index(Request $request)
    {
        $query = Job::with(['user:id,name', 'category:id,name,icon']);

        // Only show approved jobs to users
        $query->where('status', 'approved');

        // Filter by title (search)
        if ($request->has('title') && $request->title) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }

        // Filter by single location from search
        if ($request->has('location') && $request->location) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Filter by multiple locations from sidebar checkboxes
        if ($request->has('locations') && $request->locations) {
            $locations = explode(',', $request->locations);
            $query->whereIn('location', $locations);
        }

        // Filter by categories
        if ($request->has('categories') && $request->categories) {
            $categoryNames = explode(',', $request->categories);
            $query->whereHas('category', function($q) use ($categoryNames) {
                $q->whereIn('name', $categoryNames);
            });
        }

        // Filter by levels (if you add level field to jobs table)
        if ($request->has('levels') && $request->levels) {
            $levels = explode(',', $request->levels);
            $query->whereIn('level', $levels);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    
    public function store(Request $request)
    {
       
        $fields = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'location' => 'required|string',
            'level' => 'nullable|string',
            'category_id' => 'required|integer|exists:categories,id'
        ]);

        
        if (Auth::user()->role !== 'recruiter') {
            return response(['message' => 'You are not authorized to post jobs.'], 403);
        }

        
        $job = Job::create([
            'user_id' => Auth::id(), 
            'title' => $fields['title'],
            'description' => $fields['description'],
            'location' => $fields['location'],
            'level' => $fields['level'] ?? null,
            'category_id' => $fields['category_id'],
            'status' => 'pending'
        ]);

        return response($job->load(['user:id,name', 'category:id,name,icon']), 201); 
    }

   
    public function show(Job $job)
    {
        return $job->load(['user:id,name', 'category:id,name,icon']); 
    }

    
    public function update(Request $request, Job $job)
    {
       
        if ($job->user_id !== Auth::id()) {
            return response(['message' => 'Unauthorized action.'], 403);
        }
        
        
        $fields = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'location' => 'required|string',
            'level' => 'nullable|string',
            'category_id' => 'required|integer|exists:categories,id'
        ]);

        
        $job->update($fields);
        
        return response($job->load(['user:id,name', 'category:id,name,icon']), 200); 
    }

    public function destroy(Job $job)
    {

        if ($job->user_id !== Auth::id()) {
            return response(['message' => 'Unauthorized action.'], 403);
        }

        $job->delete();
        
        return response(['message' => 'Job deleted successfully.'], 200);
    }

    public function getLocations()
    {
        $locations = Job::distinct()->pluck('location')->filter()->values();
        return $locations;
    }

    public function getLevels()
    {
        return ['Beginner Level', 'Intermediate Level', 'Senior Level'];
    }

    public function getRecruiterStats($recruiterId)
    {
        // Get total jobs for this recruiter
        $totalJobs = Job::where('user_id', $recruiterId)->count();

        // Get total approved jobs
        $approvedJobs = Job::where('user_id', $recruiterId)
            ->where('status', 'approved')
            ->count();

        // Get total applicants (count applications for jobs by this recruiter)
        $totalApplicants = Application::whereIn('job_id', 
            Job::where('user_id', $recruiterId)->pluck('id')
        )->count();

        // Get pending jobs (not yet approved)
        $pendingJobs = Job::where('user_id', $recruiterId)
            ->where('status', 'pending')
            ->count();

        return response([
            'total_jobs' => $totalJobs,
            'approved_jobs' => $approvedJobs,
            'pending_jobs' => $pendingJobs,
            'total_applicants' => $totalApplicants
        ], 200);
    }

    public function getRecruiterJobs($recruiterId)
    {
        // Get all jobs for this recruiter, including pending and approved
        $jobs = Job::where('user_id', $recruiterId)
            ->with(['user:id,name', 'category:id,name,icon'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response($jobs, 200);
    }
}