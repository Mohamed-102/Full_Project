<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ViewedJob extends Model
{
    protected $fillable = [
        'user_id',
        'job_id',
        'viewed_at'
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Get the job associated with this viewed job.
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the user who viewed this job.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
