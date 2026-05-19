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
        Schema::create('creations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // assignment, quiz, presentation
            $table->string('title');
            $table->text('content'); // Markdown content from Gemini
            $table->string('file_path')->nullable(); // For PDF path if generated
            $table->string('status')->default('Accepted'); // Accepted, Pending, Rejected
            $table->json('metadata')->nullable(); // Store memory/context or other details
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('creations');
    }
};
