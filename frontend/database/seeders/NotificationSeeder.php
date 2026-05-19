<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Notification;
use App\Models\User;
// use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Curriculum Update',
            'message' => 'Admin added new E-Books and lesson plans to the primary library.',
            'type' => 'admin',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'New Student Message',
            'message' => 'Alex Johnson from Grade 5 sent you a message regarding the homework.',
            'type' => 'student',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'System Maintenance',
            'message' => 'Bolo Academy will be undergoing scheduled maintenance tonight at 12:00 PM.',
            'type' => 'system',
        ]);
    }
}
