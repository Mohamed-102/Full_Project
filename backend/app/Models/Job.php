<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'location',
        'location_id',
        'category_id',
        'level',
        'level_id',
        'salary',
        'type',
        'status'
    ];

    /**
     * Get the user (recruiter) who posted this job.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of this job.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the level of this job.
     */
    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    /**
     * Get the location of this job.
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get all applications for this job.
     */
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Get all users who viewed this job.
     */
    public function viewedBy()
    {
        return $this->hasMany(ViewedJob::class);
    }

    /**
     * Get all users who saved this job.
     */
    public function savedBy()
    {
        return $this->hasMany(SavedJob::class);
    }
}
