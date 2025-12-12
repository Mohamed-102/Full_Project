<?php

use App\Http\Controllers\Api\AuthController; 
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\CategoryController; 


Route::group(['prefix' => 'auth'], function () {
    // User
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    // Recruiter
    Route::post('/register-recruiter', [AuthController::class, 'registerRecruiter']);
    Route::post('/login-recruiter', [AuthController::class, 'loginRecruiter']);
    // Common
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function(Request $request) {
        return $request->user();
    });

});

Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/locations', [JobController::class, 'getLocations']);
Route::get('/jobs/levels', [JobController::class, 'getLevels']);
Route::get('/jobs/categories', [CategoryController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

Route::group(['middleware' => ['auth:sanctum']], function () {
Route::post('/jobs', [JobController::class, 'store']); 
Route::put('/jobs/{job}', [JobController::class, 'update']); 
Route::delete('/jobs/{job}', [JobController::class, 'destroy']); 
Route::post('/jobs/{job}/apply', [ApplicationController::class, 'store']);
Route::get('/jobs/{job}/applicants', [ApplicationController::class, 'getJobApplicants']);
Route::get('/users/{userId}/applications', [ApplicationController::class, 'getUserApplications']);

// User Dashboard & Profile endpoints
Route::get('/users/{userId}/stats', [UserController::class, 'getDashboardStats']);
Route::get('/users/{userId}/viewed-jobs', [UserController::class, 'getViewedJobs']);
Route::post('/users/{userId}/viewed-jobs', [UserController::class, 'addViewedJob']);
Route::delete('/users/{userId}/viewed-jobs', [UserController::class, 'clearViewedJobs']);
Route::get('/users/{userId}/saved-jobs', [UserController::class, 'getSavedJobs']);
Route::post('/users/{userId}/saved-jobs', [UserController::class, 'addSavedJob']);
Route::delete('/users/{userId}/saved-jobs/{jobId}', [UserController::class, 'removeSavedJob']);
Route::get('/users/{userId}/profile', [UserController::class, 'getProfile']);
Route::put('/users/{userId}/profile', [UserController::class, 'updateProfile']);

// Admin endpoints
Route::get('/admin/stats', [AdminController::class, 'getStats']);
Route::get('/admin/recruiters', [AdminController::class, 'getRecruiters']);
Route::get('/admin/users', [AdminController::class, 'getUsers']);
Route::get('/admin/jobs', [AdminController::class, 'getJobsForApproval']);
Route::post('/admin/jobs/{jobId}/approve', [AdminController::class, 'approveJob']);
Route::post('/admin/jobs/{jobId}/reject', [AdminController::class, 'rejectJob']);
Route::post('/admin/jobs/approve-all', [AdminController::class, 'approveAllJobs']);
Route::post('/admin/recruiters/{recruiterId}/toggle-status', [AdminController::class, 'toggleRecruiterStatus']);
Route::delete('/admin/recruiters/{recruiterId}', [AdminController::class, 'deleteRecruiter']);
Route::delete('/admin/users/{userId}', [AdminController::class, 'deleteUser']);
Route::get('/admin/profile/{userId}', [AdminController::class, 'getProfile']);
Route::put('/admin/profile/{userId}', [AdminController::class, 'updateProfile']);


//Recruteur Part
Route::get('/recruiter-stats/{recruiterId}', [JobController::class, 'getRecruiterStats']);
Route::get('/recruiters/{recruiterId}/jobs', [JobController::class, 'getRecruiterJobs']);
// CV Download endpoints
Route::get('/applicants/{applicant}/cv', [ApplicationController::class, 'downloadCV']);
Route::get('/jobs/{job}/applicants/download-all', [ApplicationController::class, 'downloadAllCVs']);
// Applicant status updates
Route::post('/applicants/{applicant}/accept', [ApplicationController::class, 'acceptApplicant']);
Route::post('/applicants/{applicant}/reject', [ApplicationController::class, 'rejectApplicant']);
// Recruiter Profile routes
Route::get('/recruiters/{recruiterId}/profile', [UserController::class, 'getRecruiterProfile']);
Route::put('/recruiters/{recruiterId}/profile', [UserController::class, 'updateRecruiterProfile']);
});
Route::get('/jobs/{job}', [JobController::class, 'show']);
