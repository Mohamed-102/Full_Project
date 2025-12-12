<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category; 

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Developpement Web', 'icon' => 'fa-laptop-code'],
            ['name' => 'Developpement Mobile', 'icon' => 'fa-mobile-alt'],
            ['name' => 'Data Science', 'icon' => 'fa-database'],
            ['name' => 'Cybersecurity', 'icon' => 'fa-shield-alt'],
            ['name' => 'DevOps', 'icon' => 'fa-cogs'],
            ['name' => 'Reseaux', 'icon' => 'fa-network-wired'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }
    }
}
