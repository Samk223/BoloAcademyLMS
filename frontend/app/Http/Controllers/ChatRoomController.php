<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatRoomController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        
        // Check if the logged-in user is a student
        $studentProfile = \App\Models\Student::with('batch')->where('user_id', $userId)->first();
        if ($studentProfile) {
            $teacherId = $studentProfile->teacher_id;
            $batch = $studentProfile->batch;
            
            // Ensure a group chat room exists for this batch
            $batchRoom = ChatRoom::firstOrCreate(
                ['teacher_id' => $teacherId, 'type' => 'group', 'name' => $batch ? $batch->name : 'Class Group Chat'],
                []
            );

            // Ensure a direct room exists with the teacher
            $directRoom = ChatRoom::firstOrCreate(
                ['teacher_id' => $teacherId, 'student_id' => $studentProfile->id, 'type' => 'direct'],
                ['name' => 'Direct Message with Tutor']
            );

            // Fetch exactly these two rooms for the student
            $rooms = ChatRoom::where('id', $batchRoom->id)
                ->orWhere('id', $directRoom->id)
                ->with(['student'])
                ->get();
                
            return response()->json($rooms);
        } else {
            $teacherId = $userId;
            
            // Teacher logged in. Ensure a group room exists for each batch assigned to this teacher
            $batches = \App\Models\Batch::where('teacher_id', $teacherId)->get();
            foreach ($batches as $batch) {
                ChatRoom::firstOrCreate(
                    ['teacher_id' => $teacherId, 'type' => 'group', 'name' => $batch->name],
                    []
                );
            }
            
            // Ensure at least one default group chat exists if no batches are found
            if ($batches->isEmpty()) {
                ChatRoom::firstOrCreate(
                    ['teacher_id' => $teacherId, 'type' => 'group', 'name' => 'Class Group Chat'],
                    []
                );
            }

            // Fetch all rooms for this teacher
            $rooms = ChatRoom::where('teacher_id', $teacherId)
                ->with(['student'])
                ->get();
                
            return response()->json($rooms);
        }
    }

    public function messages($roomId)
    {
        $messages = ChatMessage::where('chat_room_id', $roomId)
            ->orderBy('created_at', 'asc')
            ->get();
            
        // Dynamically resolve and inject the actual sender names for the frontend UIs
        $messages->map(function ($msg) {
            if ($msg->sender_type === 'teacher') {
                $teacher = \App\Models\User::find($msg->sender_id);
                $msg->sender_name = $teacher ? $teacher->name : 'Teacher';
            } else {
                $student = \App\Models\Student::find($msg->sender_id);
                $msg->sender_name = $student ? $student->name : 'Student';
            }
            return $msg;
        });
            
        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'chat_room_id' => 'required|exists:chat_rooms,id',
            'message' => 'required_without:attachment|nullable|string',
            'attachment' => 'nullable|file|max:10240', // 10MB
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('chat_attachments', 'public');
        }

        $userId = Auth::id();
        $studentProfile = \App\Models\Student::where('user_id', $userId)->first();
        
        if ($studentProfile) {
            $senderId = $studentProfile->id;
            $senderType = 'student';
            $senderName = $studentProfile->name;
        } else {
            $senderId = $userId;
            $senderType = 'teacher';
            $teacher = \App\Models\User::find($userId);
            $senderName = $teacher ? $teacher->name : 'Teacher';
        }

        $message = ChatMessage::create([
            'chat_room_id' => $request->chat_room_id,
            'sender_id' => $senderId,
            'sender_type' => $senderType,
            'message' => $request->message,
            'attachment_path' => $attachmentPath
        ]);

        $message->sender_name = $senderName;

        return response()->json($message, 201);
    }

    public function deleteMessage($id)
    {
        $message = ChatMessage::findOrFail($id);
        
        $userId = Auth::id();
        $studentProfile = \App\Models\Student::where('user_id', $userId)->first();
        
        // Ensure only the sender can delete their own message
        if ($studentProfile) {
            $isSender = ($message->sender_id === $studentProfile->id && $message->sender_type === 'student');
        } else {
            $isSender = ($message->sender_id === $userId && $message->sender_type === 'teacher');
        }

        if (!$isSender) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($message->attachment_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($message->attachment_path);
        }

        $message->delete();

        return response()->json(['success' => true]);
    }
}
