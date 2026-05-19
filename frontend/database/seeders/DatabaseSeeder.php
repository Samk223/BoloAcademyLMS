<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Batch;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed lead teacher
        $teacher = User::factory()->create([
            'name' => 'Lead Teacher',
            'email' => 'teacher@bolo.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'status' => 'approved',
            'bio' => 'Certified ESL Specialist with 6+ years of international teaching experience.',
            'accent_color' => '#D1F2EB',
            'meeting_link' => 'https://meet.google.com/abc-defg-hij',
        ]);

        // 2. Seed system admin
        User::factory()->create([
            'name' => 'Admin Bolo',
            'email' => 'admin@bolo.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'approved',
        ]);

        // 3. Seed the 4 official 1-month program batches
        Batch::create([
            'name' => 'Morning Fluency Circle',
            'curriculum_name' => 'Basic Boost Plan',
            'schedule_details' => 'Mon, Wed, Fri • 07:30 AM',
            'teacher_id' => $teacher->id,
            'capacity' => 24,
            'seats_reserved' => 2, // Seeded students will occupy these
        ]);

        Batch::create([
            'name' => 'Weekend Grammar Pod',
            'curriculum_name' => 'Speaker Combo Plan',
            'schedule_details' => 'Sat, Sun • 10:00 AM',
            'teacher_id' => $teacher->id,
            'capacity' => 24,
            'seats_reserved' => 0,
        ]);

        Batch::create([
            'name' => 'Teen Speaking Sprint',
            'curriculum_name' => 'Fluency Fast-Track Plan',
            'schedule_details' => 'Tue, Thu • 05:30 PM',
            'teacher_id' => $teacher->id,
            'capacity' => 24,
            'seats_reserved' => 0,
        ]);

        Batch::create([
            'name' => 'IELTS Evening Bridge',
            'curriculum_name' => 'Gold Master Plan',
            'schedule_details' => 'Mon to Thu • 07:00 PM',
            'teacher_id' => $teacher->id,
            'capacity' => 24,
            'seats_reserved' => 0,
        ]);

        // 4. Run secondary seeders
        $this->call([
            StudentSeeder::class,
            ChatSeeder::class,
            StudentActivitySeeder::class,
        ]);
    }
}
