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
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->string('ai_tone')->default('Playful');
            $table->string('ai_level')->default('Intermediate (B1-B2)');
            $table->string('meeting_link')->nullable();
            $table->string('accent_color')->default('#E9D5FF');
            $table->json('notifications_config')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'avatar', 'ai_tone', 'ai_level', 'meeting_link', 'accent_color', 'notifications_config']);
        });
    }
};
