<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\User;
use App\Models\Batch;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('role', 'teacher')->first();
        $batch = Batch::first();
        
        if (!$teacher) {
            return;
        }

        $students = [
            [
                'name' => 'Max R.',
                'grade' => 'Grade 4',
                'attendance' => 95,
                'progress' => 85,
                'classes_taken' => 28,
                'avatar' => '👦',
                'color' => 'bg-[#D1F2EB]',
                'parent_name' => 'John R.',
                'parent_phone' => '+1 234 567 890',
                'email' => 'student@bolo.com', // Seed this as the core student account for LMS testing
            ],
            [
                'name' => 'Chloe L.',
                'grade' => 'Grade 4',
                'attendance' => 82,
                'progress' => 70,
                'classes_taken' => 24,
                'avatar' => '👧',
                'color' => 'bg-[#FFE5D9]',
                'parent_name' => 'Mary L.',
                'parent_phone' => '+1 234 567 891',
                'email' => 'chloe@bolo.com',
            ],
        ];

        foreach ($students as $studentData) {
            // 1. Create a corresponding authenticated user account
            $user = User::create([
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'password' => bcrypt('password'),
                'role' => 'student',
                'status' => 'approved',
                'avatar' => $studentData['avatar'],
            ]);

            // Remove temporary email key from student details array
            $studentFields = $studentData;
            unset($studentFields['email']);

            // 2. Create student profile record linked to the user, teacher, and batch
            Student::create(array_merge($studentFields, [
                'user_id' => $user->id,
                'teacher_id' => $teacher->id,
                'batch_id' => $batch ? $batch->id : null,
                'package_name' => 'Basic Boost Plan',
                'fee_status' => 'Paid',
            ]));
        }
    }
}
