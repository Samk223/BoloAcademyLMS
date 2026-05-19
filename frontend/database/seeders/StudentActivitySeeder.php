<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teacher = \App\Models\User::where('email', 'teacher@bolo.com')->first();
        if (!$teacher) return;

        $students = \App\Models\Student::where('teacher_id', $teacher->id)->get();

        foreach ($students as $student) {
            // Random assignments
            \App\Models\StudentAssignment::create([
                'student_id' => $student->id,
                'teacher_id' => $teacher->id,
                'title' => 'Weekly Worksheet',
                'task' => 'Past Tense Practice',
                'status' => 'pending',
                'submitted_at' => now()->subDays(rand(0, 5)),
            ]);

            // Random quiz scores
            \App\Models\StudentQuizScore::create([
                'student_id' => $student->id,
                'teacher_id' => $teacher->id,
                'quiz_name' => 'Vocabulary Test ' . rand(1, 3),
                'score' => rand(70, 100),
                'taken_at' => now()->subDays(rand(1, 10)),
            ]);
        }

        // Add some classes for Teacher Attendance calculation
        \App\Models\CourseClass::create([
            'teacher_id' => $teacher->id,
            'title' => 'Introduction to Grammar',
            'scheduled_at' => now()->subDays(2),
            'status' => 'completed',
            'meeting_link' => 'intro-grammar'
        ]);

        \App\Models\CourseClass::create([
            'teacher_id' => $teacher->id,
            'title' => 'Reading Comprehension',
            'scheduled_at' => now()->subDays(1),
            'status' => 'completed',
            'meeting_link' => 'reading-comp'
        ]);

        \App\Models\CourseClass::create([
            'teacher_id' => $teacher->id,
            'title' => 'Active Vocabulary',
            'scheduled_at' => now()->addDays(1),
            'status' => 'scheduled',
            'meeting_link' => 'active-vocab'
        ]);
    }
}
