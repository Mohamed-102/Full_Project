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
        Schema::table('applications', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('applications', 'cover_letter')) {
                $table->text('cover_letter')->nullable();
            }
            if (!Schema::hasColumn('applications', 'resume_path')) {
                $table->string('resume_path')->nullable();
            }
            if (!Schema::hasColumn('applications', 'applied_at')) {
                $table->timestamp('applied_at')->nullable();
            }
            if (!Schema::hasColumn('applications', 'status')) {
                $table->string('status')->default('pending');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            if (Schema::hasColumn('applications', 'cover_letter')) {
                $table->dropColumn('cover_letter');
            }
            if (Schema::hasColumn('applications', 'resume_path')) {
                $table->dropColumn('resume_path');
            }
            if (Schema::hasColumn('applications', 'applied_at')) {
                $table->dropColumn('applied_at');
            }
            if (Schema::hasColumn('applications', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
