<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recruteur extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'location',
        'fiche_technique',
    ];

    /**
     * Get the user associated with this recruiter.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
