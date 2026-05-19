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
        if (Schema::hasTable('student_feedbacks')) {
            Schema::table('student_feedbacks', function (Blueprint $table) {
                if (!Schema::hasColumn('student_feedbacks', 'is_visible')) {
                    $table->boolean('is_visible')->default(true);
                }
            });
        }

        if (Schema::hasTable('curricula')) {
            Schema::table('curricula', function (Blueprint $table) {
                if (!Schema::hasColumn('curricula', 'is_archived')) {
                    $table->boolean('is_archived')->default(false);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('student_feedbacks')) {
            Schema::table('student_feedbacks', function (Blueprint $table) {
                if (Schema::hasColumn('student_feedbacks', 'is_visible')) {
                    $table->dropColumn('is_visible');
                }
            });
        }

        if (Schema::hasTable('curricula')) {
            Schema::table('curricula', function (Blueprint $table) {
                if (Schema::hasColumn('curricula', 'is_archived')) {
                    $table->dropColumn('is_archived');
                }
            });
        }
    }
};
