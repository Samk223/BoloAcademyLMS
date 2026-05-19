<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = \Illuminate\Support\Facades\Auth::id();
        $studentProfile = Student::where('user_id', $userId)->first();
        
        if ($studentProfile) {
            // Student logged in, return classmates who share the same batch
            $students = Student::where('batch_id', $studentProfile->batch_id)->get();
        } else {
            // Teacher logged in
            $students = Student::where('teacher_id', $userId)->get();
        }
        
        return response()->json($students);
    }

    public function assignments()
    {
        $assignments = \App\Models\StudentAssignment::where('teacher_id', \Illuminate\Support\Facades\Auth::id())
            ->with('student')
            ->orderBy('submitted_at', 'desc')
            ->get();
        return response()->json($assignments);
    }

    public function quizScores()
    {
        $scores = \App\Models\StudentQuizScore::where('teacher_id', \Illuminate\Support\Facades\Auth::id())
            ->with('student')
            ->orderBy('taken_at', 'desc')
            ->get();
        return response()->json($scores);
    }

    public function updateAssignmentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected'
        ]);

        $assignment = \App\Models\StudentAssignment::where('teacher_id', \Illuminate\Support\Facades\Auth::id())
            ->findOrFail($id);
            
        $assignment->update(['status' => $request->status]);

        return response()->json($assignment);
    }

    public function stats()
    {
        $teacherId = \Illuminate\Support\Facades\Auth::id();
        
        $totalClasses = \App\Models\CourseClass::where('teacher_id', $teacherId)->count();
        $attendedClasses = \App\Models\CourseClass::where('teacher_id', $teacherId)
            ->whereIn('status', ['live', 'completed'])
            ->count();
            
        $teacherAttendance = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100) : 0;
        
        $students = Student::where('teacher_id', $teacherId)->get();
        $avgStudentAttendance = $students->count() > 0 
            ? round($students->avg('attendance')) 
            : 0;

        return response()->json([
            'teacher_attendance' => $teacherAttendance,
            'avg_student_attendance' => $avgStudentAttendance,
            'total_students' => $students->count()
        ]);
    }

    public function storeFeedback(Request $request, $studentId)
    {
        $request->validate([
            'content' => 'required|string',
            'type' => 'required|string'
        ]);

        $feedback = \App\Models\StudentFeedback::create([
            'student_id' => $studentId,
            'teacher_id' => \Illuminate\Support\Facades\Auth::id(),
            'content' => $request->input('content'),
            'type' => $request->input('type')
        ]);

        return response()->json($feedback);
    }

    public function storeAssignment(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'task' => 'required|string',
            'grade' => 'required|string',
            'file' => 'nullable|file|max:10240',
            'link' => 'nullable|url'
        ]);

        $teacherId = \Illuminate\Support\Facades\Auth::id();
        
        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('student_assignments', 'public');
        }

        $students = Student::where('teacher_id', $teacherId)
            ->where('grade', $request->grade)
            ->get();

        $assignments = [];
        foreach ($students as $student) {
            $assignments[] = \App\Models\StudentAssignment::create([
                'student_id' => $student->id,
                'teacher_id' => $teacherId,
                'title' => $request->title,
                'task' => $request->task,
                'file_path' => $filePath,
                'link' => $request->link,
                'status' => 'pending'
            ]);
        }

        return response()->json(['message' => 'Assignments uploaded successfully', 'count' => count($assignments)]);
    }
}
