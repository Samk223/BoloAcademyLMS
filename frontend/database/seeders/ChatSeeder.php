<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\Student;
use App\Models\User;

class ChatSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('email', 'teacher@bolo.com')->first();
        if (!$teacher) return;

        // Group Chat
        $groupRoom = ChatRoom::firstOrCreate(
            ['teacher_id' => $teacher->id, 'type' => 'group'],
            ['name' => 'Class Group Chat']
        );

        ChatMessage::create([
            'chat_room_id' => $groupRoom->id,
            'sender_id' => $teacher->id,
            'sender_type' => 'teacher',
            'message' => 'Welcome to the class group! Feel free to ask questions here.'
        ]);

        // Direct Chat with first student
        $student = Student::first();
        if ($student) {
            $directRoom = ChatRoom::firstOrCreate(
                ['teacher_id' => $teacher->id, 'student_id' => $student->id, 'type' => 'direct'],
                ['name' => null]
            );

            ChatMessage::create([
                'chat_room_id' => $directRoom->id,
                'sender_id' => $student->id,
                'sender_type' => 'student',
                'message' => 'Hi Teacher, I have a question about the assignment.'
            ]);
        }
    }
}
