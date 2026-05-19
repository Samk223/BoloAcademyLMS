<?php

namespace App\Http\Controllers;

use App\Models\CourseClass;
use App\Models\Student;
use App\Models\Notification;
use App\Models\StudentAssignment;
use App\Models\StudentQuizScore;
use App\Models\Feedback;
use App\Models\Creation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherDashboardController extends Controller
{
    public function index()
    {
        // Redirect pending or rejected teacher applications to the review status dashboard
        if (Auth::user()->status === 'pending' || Auth::user()->status === 'rejected') {
            return \Inertia\Inertia::render('Teacher/OnboardingPending', [
                'status' => Auth::user()->status
            ]);
        }

        $teacherId = Auth::id();

        // 1. Stats
        $totalClasses = CourseClass::where('teacher_id', $teacherId)->count();
        $attendedClasses = CourseClass::where('teacher_id', $teacherId)
            ->whereIn('status', ['live', 'completed'])
            ->count();
        $teacherAttendance = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100) : 0;
        
        $students = Student::where('teacher_id', $teacherId)->get();
        $avgStudentAttendance = $students->count() > 0 
            ? round($students->avg('attendance')) 
            : 0;

        $stats = [
            'teacher_attendance' => $teacherAttendance,
            'avg_student_attendance' => $avgStudentAttendance,
            'total_students' => $students->count()
        ];

        // 2. Classes
        $classes = CourseClass::where('teacher_id', $teacherId)
            ->orderBy('scheduled_at', 'asc')
            ->get();

        // 3. Notifications
        $notifications = Notification::where('user_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // 4. Assignments
        $assignments = StudentAssignment::where('teacher_id', $teacherId)
            ->with('student')
            ->orderBy('submitted_at', 'desc')
            ->get();

        // 5. Quiz Scores
        $quizScores = StudentQuizScore::where('teacher_id', $teacherId)
            ->with('student')
            ->orderBy('taken_at', 'desc')
            ->get();

        // 6. Feedbacks
        $feedbacks = Feedback::where('teacher_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->get();

        // 7. Creations
        $creations = Creation::where('user_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->get();

        $batches = \App\Models\Batch::where('teacher_id', $teacherId)->get()->map(function ($batch) {
            $batch->curriculum_details = $this->getCurriculumDetails($batch->curriculum_name);
            return $batch;
        });

        $initialData = [
            'stats' => $stats,
            'classes' => $classes,
            'students' => $students,
            'notifications' => $notifications,
            'assignments' => $assignments,
            'quiz_scores' => $quizScores,
            'feedbacks' => $feedbacks,
            'creations' => $creations,
            'batches' => $batches
        ];

        return \Inertia\Inertia::render('Teacher/Dashboard', [
            'initialData' => $initialData
        ]);
    }

    public function getDashboardData()
    {
        $user = Auth::user();
        if ($user->status === 'pending' || $user->status === 'rejected') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $teacherId = Auth::id();

        // 1. Stats
        $totalClasses = CourseClass::where('teacher_id', $teacherId)->count();
        $attendedClasses = CourseClass::where('teacher_id', $teacherId)
            ->whereIn('status', ['live', 'completed'])
            ->count();
        $teacherAttendance = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100) : 0;
        
        $students = Student::where('teacher_id', $teacherId)->get();
        $avgStudentAttendance = $students->count() > 0 
            ? round($students->avg('attendance')) 
            : 0;

        $stats = [
            'teacher_attendance' => $teacherAttendance,
            'avg_student_attendance' => $avgStudentAttendance,
            'total_students' => $students->count()
        ];

        // 2. Classes
        $classes = CourseClass::where('teacher_id', $teacherId)
            ->orderBy('scheduled_at', 'asc')
            ->get();

        // 3. Notifications
        $notifications = Notification::where('user_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // 4. Assignments
        $assignments = StudentAssignment::where('teacher_id', $teacherId)
            ->with('student')
            ->orderBy('submitted_at', 'desc')
            ->get();

        // 5. Quiz Scores
        $quizScores = StudentQuizScore::where('teacher_id', $teacherId)
            ->with('student')
            ->orderBy('taken_at', 'desc')
            ->get();

        // 6. Feedbacks
        $feedbacks = Feedback::where('teacher_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->get();

        // 7. Creations
        $creations = Creation::where('user_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->get();

        $batches = \App\Models\Batch::where('teacher_id', $teacherId)->get()->map(function ($batch) {
            $batch->curriculum_details = $this->getCurriculumDetails($batch->curriculum_name);
            return $batch;
        });

        return response()->json([
            'stats' => $stats,
            'classes' => $classes,
            'students' => $students,
            'notifications' => $notifications,
            'assignments' => $assignments,
            'quiz_scores' => $quizScores,
            'feedbacks' => $feedbacks,
            'creations' => $creations,
            'batches' => $batches
        ]);
    }

    private function getCurriculumDetails($curriculumName)
    {
        $details = [
            'Basic Boost Plan' => [
                'title' => 'Basic Boost Plan',
                'description' => 'Start speaking English from Day 1 in a group setting.',
                'syllabus' => ['Sentence building', 'Basic grammar & sentence anchors', 'Confidence drills', 'Daily activities: open mic, interviews, games', 'Instructor guidance & progress feedback'],
                'objectives' => ['Speak simple English fluently', 'Introduce yourself confidently', 'Describe your day', 'Answer everyday questions without hesitation'],
                'outcomes' => ['Daily spoken confidence', 'Basic English vocabulary', 'Bolo Basic Boost Certificate'],
                'certification' => 'Bolo Basic Boost Certificate',
                'duration' => '1 Month',
            ],
            'Speaker Combo Plan' => [
                'title' => 'Speaker Combo Plan',
                'description' => 'All the benefits of group classes + personal attention.',
                'syllabus' => ['Group discussion circles', '1-on-1 private speaking slots', 'Pronunciation analysis & accent softening', 'Personalized grammar & vocabulary drills', 'Weekly mock conversational tests'],
                'objectives' => ['Speak without hesitation', 'Improve pronunciation & speech flow', 'Crack basic interviews', 'Participate actively in meetings'],
                'outcomes' => ['Hesitation-free speaking', 'Accent softening', 'Bolo Speaker Combo Badge'],
                'certification' => 'Bolo Speaker Combo Badge',
                'duration' => '1 Month',
            ],
            'Fluency Fast-Track Plan' => [
                'title' => 'Fluency Fast-Track Plan',
                'description' => 'Intensive daily 1-on-1 speaking drills and professional training.',
                'syllabus' => ['Intensive 1-on-1 training', 'Custom learning routes', 'Business presentations & corporate communication', 'Real-time accent coaching & tone training', '24/7 dedicated WhatsApp mentor support'],
                'objectives' => ['Master professional arguments', 'Lead business meetings confidently', 'Host corporate presentations', 'Achieve near-native speaking style'],
                'outcomes' => ['Elite professional presentation', 'Impromptu speaking fluency', 'Bolo Fast-Track Fluency Certificate'],
                'certification' => 'Bolo Fast-Track Fluency Certificate',
                'duration' => '1 Month',
            ],
            'Gold Master Plan' => [
                'title' => 'Gold Master Plan',
                'description' => 'Exclusive 1-on-1 coaching directly under Senior Master Trainers.',
                'syllabus' => ['Direct Senior Master coaching', 'Elite interview prep & negotiation drills', 'Public speaking & audience influence', 'Personalized IELTS/OET coaching & mocks', 'Dedicated premium priority support channel'],
                'objectives' => ['Ultimate English mastery', 'Speak like a top-tier executive leader', 'Influence large audiences', 'Achieve IELTS Band 8+'],
                'outcomes' => ['Elite English leadership presence', 'IELTS/OET mock readiness', 'Bolo Gold Master English Diploma'],
                'certification' => 'Bolo Gold Master English Diploma',
                'duration' => '1 Month',
            ],
        ];

        return $details[$curriculumName] ?? [
            'title' => $curriculumName,
            'description' => 'Customized learning curriculum plan.',
            'syllabus' => ['Interactive discussions', 'Targeted homework', 'Quiz assessments', 'Feedback reviews'],
            'objectives' => ['Enhance speaking fluency', 'Broaden comprehension skills'],
            'outcomes' => ['Increased speaking comfort', 'Interactive certificate'],
            'certification' => 'Bolo Completion Certificate',
            'duration' => '1 Month',
        ];
    }
}
