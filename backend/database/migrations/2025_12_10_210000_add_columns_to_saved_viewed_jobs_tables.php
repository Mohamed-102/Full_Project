<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add missing columns to saved_jobs table
        Schema::table('saved_jobs', function (Blueprint $table) {
            if (!Schema::hasColumn('saved_jobs', 'user_id')) {
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->after('id');
            }
            if (!Schema::hasColumn('saved_jobs', 'job_id')) {
                $table->foreignId('job_id')->constrained('jobs')->onDelete('cascade')->after('user_id');
            }
            if (!Schema::hasColumn('saved_jobs', 'saved_at')) {
                $table->timestamp('saved_at')->nullable()->after('job_id');
            }
            if (!Schema::hasColumn('saved_jobs', 'created_at')) {
                $table->timestamps();
            }
        });

        // Add missing columns to viewed_jobs table
        Schema::table('viewed_jobs', function (Blueprint $table) {
            if (!Schema::hasColumn('viewed_jobs', 'user_id')) {
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->after('id');
            }
            if (!Schema::hasColumn('viewed_jobs', 'job_id')) {
                $table->foreignId('job_id')->constrained('jobs')->onDelete('cascade')->after('user_id');
            }
            if (!Schema::hasColumn('viewed_jobs', 'viewed_at')) {
                $table->timestamp('viewed_at')->nullable()->after('job_id');
            }
            if (!Schema::hasColumn('viewed_jobs', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saved_jobs', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['user_id']);
            $table->dropForeignKeyIfExists(['job_id']);
            if (Schema::hasColumn('saved_jobs', 'user_id')) {
                $table->dropColumn('user_id');
            }
            if (Schema::hasColumn('saved_jobs', 'job_id')) {
                $table->dropColumn('job_id');
            }
            if (Schema::hasColumn('saved_jobs', 'saved_at')) {
                $table->dropColumn('saved_at');
            }
        });

        Schema::table('viewed_jobs', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['user_id']);
            $table->dropForeignKeyIfExists(['job_id']);
            if (Schema::hasColumn('viewed_jobs', 'user_id')) {
                $table->dropColumn('user_id');
            }
            if (Schema::hasColumn('viewed_jobs', 'job_id')) {
                $table->dropColumn('job_id');
            }
            if (Schema::hasColumn('viewed_jobs', 'viewed_at')) {
                $table->dropColumn('viewed_at');
            }
        });
    }
};
