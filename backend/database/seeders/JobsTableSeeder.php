<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\File;
use Illuminate\Database\Seeder;
use App\Models\Job;
use App\Models\Category;
use App\Models\User;

class JobsTableSeeder extends Seeder
{
    public function run(): void
    {
        // Load JSON file
        $json = File::get(database_path('seeders/data/jobs.json'));

        // Convert JSON to array
        $jobs = json_decode($json, true);

        // Get or create a default recruiter user
        $recruiter = User::where('role', 'recruiter')->first();
        if (!$recruiter) {
            $recruiter = User::create([
                'name' => 'Default Recruiter',
                'email' => 'recruiter@jobportal.com',
                'password' => bcrypt('password'),
                'role' => 'recruiter',
            ]);
        }

        // Insert jobs into database
        foreach ($jobs as $jobData) {
            // Find category by name
            $category = Category::where('name', $jobData['category'])->first();
            
            if ($category) {
                Job::create([
                    'title'       => $jobData['title'],
                    'location'    => $jobData['location'],
                    'level'       => $jobData['level'],
                    'description' => $jobData['description'],
                    'user_id'     => $recruiter->id,
                    'category_id' => $category->id,
                    'status'      => 'approved', // Set all seeded jobs as approved
                ]);
            }
        }
    }
}
