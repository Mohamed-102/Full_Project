<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedJob extends Model
{
    protected $fillable = [
        'user_id',
        'job_id',
        'saved_at'
    ];

    protected $casts = [
        'saved_at' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Get the job associated with this saved job.
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the user who saved this job.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
