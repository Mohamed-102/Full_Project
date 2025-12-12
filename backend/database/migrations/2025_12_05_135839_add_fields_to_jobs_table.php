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
    Schema::table('jobs', function (Blueprint $table) {
        $table->string('location')->after('description');
        $table->string('level')->nullable()->default('Entry Level')->after('location');
        $table->foreignId('category_id')
              ->after('level')
              ->constrained()
              ->onDelete('cascade');
        $table->string('status')->default('pending')->after('category_id'); // pending, approved, rejected
    });
}

public function down(): void
{
    Schema::table('jobs', function (Blueprint $table) {
        if (Schema::hasColumn('jobs', 'location')) {
            $table->dropColumn('location');
        }
        if (Schema::hasColumn('jobs', 'level')) {
            $table->dropColumn('level');
        }
        if (Schema::hasColumn('jobs', 'status')) {
            $table->dropColumn('status');
        }
        if (Schema::hasColumn('jobs', 'category_id')) {
            try {
                $table->dropForeign(['category_id']);
            } catch (\Exception $e) {
                // Ignore if foreign key doesn't exist
            }
            $table->dropColumn('category_id');
        }
    });
}

};
