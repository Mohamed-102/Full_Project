<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job; 
use App\Models\Application; 
use App\Mail\ApplicantRejectedMail;
use App\Mail\ApplicantAcceptedMail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 

class ApplicationController extends Controller
{
    
    public function store(Request $request, Job $job)
    {
        
        if (Auth::user()->role !== 'applicant') {
            return response(['message' => 'Only applicants can apply for jobs.'], 403); 
        }

       
        $existingApplication = Application::where('user_id', Auth::id())
                                          ->where('job_id', $job->id)
                                          ->first();

        if ($existingApplication) {
            return response(['message' => 'You have already applied for this job.'], 409); 
        }

        // Validate request data
        $validated = $request->validate([
            'fullName' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'coverLetter' => 'nullable|string',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120' // 5MB max
        ]);

        // Handle resume upload
        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
        }

        $application = Application::create([
            'user_id' => Auth::id(), 
            'job_id' => $job->id,
            'cover_letter' => $validated['coverLetter'] ?? null,
            'resume_path' => $resumePath,
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        return response([
            'message' => 'Application submitted successfully!',
            'application' => $application->load(['user:id,name,email', 'job:id,title,location'])
        ], 201); 
    }

    public function getJobApplicants(Job $job)
    {
        if ($job->user_id !== Auth::id()) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $applicants = Application::where('job_id', $job->id)
            ->with(['user:id,name,email,phone'])
            ->get()
            ->map(function ($application) {
                return [
                    'id' => $application->id,
                    'name' => $application->user?->name ?? 'N/A',
                    'email' => $application->user?->email ?? 'N/A',
                    'phone' => $application->user?->phone ?? 'N/A',
                    'status' => $application->status ?? 'pending',
                    'appliedDate' => $application->applied_at ? $application->applied_at->format('M d, Y') : 'N/A',
                    'coverletter' => $application->cover_letter,
                    'resumePath' => $application->resume_path,
                ];
            });
        
        return response($applicants, 200);
    }

    public function getUserApplications($userId)
    {
        if ($userId != Auth::id()) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $applications = Application::where('user_id', $userId)
            ->with(['job.category', 'job.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($application) {
                return [
                    '_id' => $application->id,
                    'id' => $application->id,
                    'job' => $application->job,
                    'status' => $application->status ?? 'pending',
                    'appliedAt' => $application->applied_at ?? $application->created_at,
                    'coverLetter' => $application->cover_letter,
                    'resumePath' => $application->resume_path,
                ];
            });
        
        return response($applications, 200);
    }

    public function downloadCV(Application $applicant)
    {
        // Load relationships
        $applicant->load('job', 'user');
        
        // Verify the logged-in user is the job owner
        $job = $applicant->job;
        if (!$job || $job->user_id !== Auth::id()) {
            return response(['message' => 'Unauthorized'], 403);
        }

        // Check if resume exists
        if (!$applicant->resume_path) {
            return response(['message' => 'CV file not found'], 404);
        }

        if (!Storage::disk('public')->exists($applicant->resume_path)) {
            return response(['message' => 'CV file not found on server'], 404);
        }

        $filePath = storage_path('app/public/' . $applicant->resume_path);
        
        // Verify file exists on filesystem
        if (!file_exists($filePath)) {
            return response(['message' => 'CV file does not exist'], 404);
        }

        $filename = ($applicant->user?->name ?? 'Applicant') . '_CV_' . $applicant->id . '.' . pathinfo($applicant->resume_path, PATHINFO_EXTENSION);

        return response()->download($filePath, $filename, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"'
        ]);
    }

    public function downloadAllCVs(Job $job)
    {
        // Verify the logged-in user is the job owner
        if ($job->user_id !== Auth::id()) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $applications = Application::where('job_id', $job->id)->get();
        
        if ($applications->isEmpty()) {
            return response(['message' => 'No applications for this job'], 404);
        }

        // Create a ZIP file
        $zip = new \ZipArchive();
        $zipPath = storage_path('app/temp/' . uniqid() . '.zip');
        
        // Create temp directory if it doesn't exist
        if (!is_dir(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0755, true);
        }

        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response(['message' => 'Failed to create ZIP file'], 500);
        }

        foreach ($applications as $application) {
            if ($application->resume_path && Storage::disk('public')->exists($application->resume_path)) {
                $filePath = storage_path('app/public/' . $application->resume_path);
                $filename = ($application->user?->name ?? 'Applicant') . '_CV_' . $application->id . '.' . pathinfo($application->resume_path, PATHINFO_EXTENSION);
                $zip->addFile($filePath, $filename);
            }
        }

        $zip->close();

        return response()->download($zipPath, $job->title . '_CVs.zip')->deleteFileAfterSend(true);
    }

    public function acceptApplicant(Application $applicant)
    {
        $job = $applicant->job;
        if ($job->user_id !== Auth::id()) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $applicant->load('user');
        $applicant->update(['status' => 'accepted']);

        // Send acceptance email
        try {
            Mail::to($applicant->user->email)->send(
                new ApplicantAcceptedMail($applicant->user->name, $job->title)
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send acceptance email: ' . $e->getMessage());
        }

        return response(['message' => 'Applicant accepted successfully', 'application' => $applicant], 200);
    }

    public function rejectApplicant(Request $request, Application $applicant)
    {
        $job = $applicant->job;
        if ($job->user_id !== Auth::id()) {
            return response(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $applicant->load('user');
        $applicant->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'] ?? null,
        ]);

        // Send rejection email
        try {
            $rejectionReason = $validated['reason'] ?? 'Your qualifications don\'t match our current requirements.';
            Mail::to($applicant->user->email)->send(
                new ApplicantRejectedMail($rejectionReason, $applicant->user->name, $job->title)
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send rejection email: ' . $e->getMessage());
        }

        return response(['message' => 'Applicant rejected and email sent successfully', 'application' => $applicant], 200);
    }
}
