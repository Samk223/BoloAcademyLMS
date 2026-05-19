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
        // 1. Update users table with teacher onboarding parameters
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('approved')->after('role'); // pending, approved, rejected
            $table->integer('experience_years')->nullable()->after('status');
            $table->text('certifications')->nullable()->after('experience_years');
            $table->string('subject_specialization')->nullable()->after('certifications');
            $table->string('curriculum_expertise')->nullable()->after('subject_specialization');
            $table->string('resume_path')->nullable()->after('curriculum_expertise');
        });

        // 2. Update students table with trial and batch parameters (avoiding duplicate parent_name and parent_phone)
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('batch_id')->nullable()->after('user_id')->constrained('batches')->onDelete('set null');
            $table->string('package_name')->nullable()->after('batch_id');
            $table->string('fee_status')->default('Paid')->after('package_name'); // Pending, Paid
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn(['batch_id', 'package_name', 'fee_status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'experience_years', 'certifications', 'subject_specialization', 'curriculum_expertise', 'resume_path']);
        });
    }
};
