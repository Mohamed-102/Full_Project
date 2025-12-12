<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    protected $fillable = ['name', 'order'];

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
