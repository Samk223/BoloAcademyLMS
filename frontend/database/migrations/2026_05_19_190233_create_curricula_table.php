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
        Schema::create('curricula', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique();
            $table->string('duration');
            $table->text('description');
            $table->json('syllabus');
            $table->json('objectives');
            $table->json('outcomes');
            $table->string('certification');
            $table->string('dates');
            $table->json('milestones');
            $table->integer('engagement')->default(80);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curricula');
    }
};
