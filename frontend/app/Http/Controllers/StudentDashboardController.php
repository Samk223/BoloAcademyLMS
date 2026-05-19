<?php

namespace App\Http\Controllers;

use App\Models\Ebook;
use App\Models\StudentAssignment;
use App\Models\StudentQuizScore;
use App\Models\StudentFeedback;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $student = \App\Models\Student::with(['batch.teacher', 'teacher'])->where('user_id', $user->id)->first();

        if (!$student) {
            return Inertia::render('Student/Dashboard', [
                'initialData' => null
            ]);
        }

        // Map program prices from the official 1-month packages list
        $feesMap = [
            'Basic Boost Plan' => 2999,
            'Speaker Combo Plan' => 4999,
            'Fluency Fast-Track Plan' => 9999,
            'Gold Master Plan' => 14999,
        ];
        $programFee = $feesMap[$student->package_name] ?? 4200;

        // Force suspension lockout screen if 7-day trial is exceeded without payment
        if ($student->isTrialExpired()) {
            return Inertia::render('Student/SuspendedCheckout', [
                'student' => $student,
                'programFee' => $programFee,
            ]);
        }

        $shouldSaveStudent = false;

        // Simple streak logic
        $today = now()->startOfDay();
        $lastLogin = $student->last_login_at ? \Carbon\Carbon::parse($student->last_login_at)->startOfDay() : null;

        if (!$lastLogin) {
            $student->streak = 1;
            $student->last_login_at = now();
            $shouldSaveStudent = true;
        } elseif ($today->gt($lastLogin)) {
            if ($today->diffInDays($lastLogin) === 1) {
                $student->streak += 1;
            } else {
                $student->streak = 1;
            }
            $student->last_login_at = now();
            $shouldSaveStudent = true;
        }

        $pendingAssignments = StudentAssignment::where('student_id', $student->id)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        $quizScores = StudentQuizScore::where('student_id', $student->id)
            ->orderBy('taken_at', 'desc')
            ->get();

        // Optimized assignments metrics query
        $assignmentStats = StudentAssignment::where('student_id', $student->id)
            ->selectRaw("
                COUNT(*) as total_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) as total_today_count,
                SUM(CASE WHEN DATE(submitted_at) = ? AND status = 'completed' THEN 1 ELSE 0 END) as completed_today_count
            ", [now()->toDateString(), now()->toDateString()])
            ->first();

        $totalAssignments = (int) ($assignmentStats->total_count ?? 0);
        $completedAssignments = (int) ($assignmentStats->completed_count ?? 0);
        $totalAssignedToday = (int) ($assignmentStats->total_today_count ?? 0);
        $completedToday = (int) ($assignmentStats->completed_today_count ?? 0);

        $dailyProgress = $totalAssignedToday > 0 ? round(($completedToday / $totalAssignedToday) * 100) : 0;

        // Calculate real attendance based on batch classes
        $batchName = $student->batch ? $student->batch->name : 'NonExistentBatchName';
        $totalClassesForGrade = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
            $q->whereJsonContains('student_ids', $student->id)
              ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
        })->count();

        $attendedClassesCount = \App\Models\ClassAttendance::where('student_id', $student->id)->count();
        $attendance = $totalClassesForGrade > 0 ? round(($attendedClassesCount / $totalClassesForGrade) * 100) : 0;

        // Progress = 50% assignment completion + 50% class attendance
        $assignmentProgress = $totalAssignments > 0 ? ($completedAssignments / $totalAssignments) * 100 : 0;
        $classProgress = $totalClassesForGrade > 0 ? ($attendedClassesCount / $totalClassesForGrade) * 100 : 0;

        if ($totalClassesForGrade > 0 && $totalAssignments > 0) {
            $progress = (int) round(($assignmentProgress + $classProgress) / 2);
        } elseif ($totalClassesForGrade > 0) {
            $progress = (int) round($classProgress);
        } else {
            $progress = (int) round($assignmentProgress);
        }

        if ($student->attendance !== $attendance || $student->progress !== $progress) {
            $student->attendance = $attendance;
            $student->progress = $progress;
            $shouldSaveStudent = true;
        }

        if ($shouldSaveStudent) {
            $student->save();
        }

        // Check for active live class in student's batch
        $liveClass = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
                $q->whereJsonContains('student_ids', $student->id)
                  ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
            })
            ->where('status', 'live')
            ->first();

        $liveJoinUrl = null;
        if ($liveClass) {
            $liveJoinUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                "student.live",
                now()->addHours(2),
                ["roomId" => $liveClass->meeting_link],
                false
            );
        }

        $todayClasses = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
                $q->whereJsonContains('student_ids', $student->id)
                  ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
            })
            ->whereDate('scheduled_at', now()->toDateString())
            ->orderBy('scheduled_at', 'asc')
            ->get();

        // Pre-hydrate all tabs data for instant, blazingly fast loads!
        $classes = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
            $q->whereJsonContains('student_ids', $student->id)
              ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
        })
        ->orderBy('scheduled_at', 'asc')
        ->get();

        $ebooks = Ebook::where('grade', $student->grade)
            ->orWhere('teacher_id', $student->teacher_id)
            ->get();

        $assignments = StudentAssignment::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $feedbacks = StudentFeedback::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $teachers = \App\Models\User::where('id', 1)->orWhere('email', 'like', '%teacher%')->get(['id', 'name', 'email']);

        $notifications = \App\Models\Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $initialData = [
            'student' => $student,
            'curriculum' => $student ? $this->getCurriculumDetails($student->package_name) : null,
            'trial_active' => $student->fee_status === 'Pending',
            'days_remaining' => $student->daysRemaining(),
            'program_fee' => $programFee,
            'pending_assignments' => $pendingAssignments,
            'quiz_scores' => $quizScores,
            'daily_progress' => $dailyProgress,
            'live_class' => $liveClass,
            'live_join_url' => $liveJoinUrl,
            'today_classes' => $todayClasses,
            'badges' => $this->calculateBadges($student, $quizScores),
            'classes' => $classes,
            'ebooks' => $ebooks,
            'assignments' => $assignments,
            'progress' => [
                'attendance' => $student->attendance,
                'progress' => $student->progress,
                'feedbacks' => $feedbacks
            ],
            'teachers' => $teachers,
            'notifications' => $notifications
        ];

        return Inertia::render('Student/Dashboard', [
            'initialData' => $initialData
        ]);
    }

    public function getDashboardData()
    {
        $user = Auth::user();
        $student = \App\Models\Student::with(['batch.teacher', 'teacher'])->where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $shouldSaveStudent = false;

        // Simple streak logic
        $today = now()->startOfDay();
        $lastLogin = $student->last_login_at ? \Carbon\Carbon::parse($student->last_login_at)->startOfDay() : null;

        if (!$lastLogin) {
            $student->streak = 1;
            $student->last_login_at = now();
            $shouldSaveStudent = true;
        } elseif ($today->gt($lastLogin)) {
            if ($today->diffInDays($lastLogin) === 1) {
                $student->streak += 1;
            } else {
                $student->streak = 1;
            }
            $student->last_login_at = now();
            $shouldSaveStudent = true;
        }

        $pendingAssignments = StudentAssignment::where('student_id', $student->id)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        $quizScores = StudentQuizScore::where('student_id', $student->id)
            ->orderBy('taken_at', 'desc')
            ->get();

        // Optimized assignments metrics query (reduces 4 remote HTTP roundtrips to 1!)
        $assignmentStats = StudentAssignment::where('student_id', $student->id)
            ->selectRaw("
                COUNT(*) as total_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) as total_today_count,
                SUM(CASE WHEN DATE(submitted_at) = ? AND status = 'completed' THEN 1 ELSE 0 END) as completed_today_count
            ", [now()->toDateString(), now()->toDateString()])
            ->first();

        $totalAssignments = (int) ($assignmentStats->total_count ?? 0);
        $completedAssignments = (int) ($assignmentStats->completed_count ?? 0);
        $totalAssignedToday = (int) ($assignmentStats->total_today_count ?? 0);
        $completedToday = (int) ($assignmentStats->completed_today_count ?? 0);

        $dailyProgress = $totalAssignedToday > 0 ? round(($completedToday / $totalAssignedToday) * 100) : 0;

        // Calculate real attendance based on batch classes
        $batchName = $student->batch ? $student->batch->name : 'NonExistentBatchName';
        $totalClassesForGrade = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
            $q->whereJsonContains('student_ids', $student->id)
              ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
        })->count();

        $attendedClassesCount = \App\Models\ClassAttendance::where('student_id', $student->id)->count();
        $attendance = $totalClassesForGrade > 0 ? round(($attendedClassesCount / $totalClassesForGrade) * 100) : 0;

        // Progress = 50% assignment completion + 50% class attendance
        $assignmentProgress = $totalAssignments > 0 ? ($completedAssignments / $totalAssignments) * 100 : 0;
        $classProgress = $totalClassesForGrade > 0 ? ($attendedClassesCount / $totalClassesForGrade) * 100 : 0;

        if ($totalClassesForGrade > 0 && $totalAssignments > 0) {
            $progress = (int) round(($assignmentProgress + $classProgress) / 2);
        } elseif ($totalClassesForGrade > 0) {
            $progress = (int) round($classProgress);
        } else {
            $progress = (int) round($assignmentProgress);
        }

        // Only save changes to the database to prevent heavy write overhead on simple page views!
        if ($student->attendance !== $attendance || $student->progress !== $progress) {
            $student->attendance = $attendance;
            $student->progress = $progress;
            $shouldSaveStudent = true;
        }

        if ($shouldSaveStudent) {
            $student->save();
        }

        // Check for active live class
        $liveClass = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
                $q->whereJsonContains('student_ids', $student->id)
                  ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
            })
            ->where('status', 'live')
            ->first();

        $liveJoinUrl = null;
        if ($liveClass) {
            $liveJoinUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                "student.live",
                now()->addHours(2),
                ["roomId" => $liveClass->meeting_link],
                false
            );
        }

        $todayClasses = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
                $q->whereJsonContains('student_ids', $student->id)
                  ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
            })
            ->whereDate('scheduled_at', now()->toDateString())
            ->orderBy('scheduled_at', 'asc')
            ->get();

        // Load all pre-hydrated collections for rapid tab switching
        $classes = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
            $q->whereJsonContains('student_ids', $student->id)
              ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
        })
        ->orderBy('scheduled_at', 'asc')
        ->get();

        $ebooks = Ebook::where('grade', $student->grade)
            ->orWhere('teacher_id', $student->teacher_id)
            ->get();

        $assignments = StudentAssignment::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $feedbacks = StudentFeedback::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $teachers = \App\Models\User::where('id', 1)->orWhere('email', 'like', '%teacher%')->get(['id', 'name', 'email']);

        $notifications = \App\Models\Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'student' => $student,
            'curriculum' => $student ? $this->getCurriculumDetails($student->package_name) : null,
            'pending_assignments' => $pendingAssignments,
            'quiz_scores' => $quizScores,
            'daily_progress' => $dailyProgress,
            'live_class' => $liveClass,
            'live_join_url' => $liveJoinUrl,
            'today_classes' => $todayClasses,
            'badges' => $this->calculateBadges($student, $quizScores),
            'classes' => $classes,
            'ebooks' => $ebooks,
            'assignments' => $assignments,
            'progress' => [
                'attendance' => $student->attendance,
                'progress' => $student->progress,
                'feedbacks' => $feedbacks
            ],
            'teachers' => $teachers,
            'notifications' => $notifications
        ]);
    }

    public function getEbooks()
    {
        $user = Auth::user();
        $student = $user->studentProfile;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $ebooks = Ebook::where('grade', $student->grade)
            ->orWhere('teacher_id', $student->teacher_id)
            ->get();

        return response()->json($ebooks);
    }

    public function getClasses()
    {
        $user = Auth::user();
        $student = $user->studentProfile;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $batchName = $student->batch ? $student->batch->name : 'NonExistentBatchName';
        $classes = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
            $q->whereJsonContains('student_ids', $student->id)
              ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
        })
        ->orderBy('scheduled_at', 'asc')
        ->get();

        return response()->json($classes);
    }

    public function getJoinUrl($id)
    {
        $user = Auth::user();
        $student = $user->studentProfile;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $batchName = $student->batch ? $student->batch->name : 'NonExistentBatchName';
        $class = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
            $q->whereJsonContains('student_ids', $student->id)
              ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
        })->findOrFail($id);

        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            "student.live",
            now()->addHours(2),
            ["roomId" => $class->meeting_link],
            false
        );

        return response()->json(['url' => $url]);
    }

    public function getAssignments()
    {
        $user = Auth::user();
        $student = $user->studentProfile;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $assignments = StudentAssignment::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($assignments);
    }

    public function getProgress()
    {
        $user = Auth::user();
        $student = $user->studentProfile;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $feedbacks = StudentFeedback::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'attendance' => $student->attendance,
            'progress' => $student->progress,
            'feedbacks' => $feedbacks
        ]);
    }

    public function submitAssignment(Request $request, $id)
    {
        $request->validate([
            'submission_file' => 'nullable|file|max:10240',
            'submission_text' => 'nullable|string'
        ]);

        $user = Auth::user();
        $student = $user->studentProfile;

        $assignment = StudentAssignment::where('student_id', $student->id)
            ->findOrFail($id);

        $filePath = $assignment->submission_file;
        if ($request->hasFile('submission_file')) {
            $filePath = $request->file('submission_file')->store('submissions', 'public');
        }

        $assignment->update([
            'status' => 'completed',
            'submitted_at' => now(),
            'submission_file' => $filePath,
            'submission_text' => $request->submission_text
        ]);

        return response()->json($assignment);
    }

    public function storeSupportTicket(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'teacher_id' => 'nullable|integer'
        ]);

        $user = Auth::user();

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'open'
        ]);

        // Get target teacher ID
        $teacherId = $request->teacher_id;
        if (!$teacherId) {
            $studentProfile = \App\Models\Student::where('user_id', $user->id)->first();
            $teacherId = $studentProfile ? $studentProfile->teacher_id : 1;
        }

        // Duplicate support ticket into teacher's feedback wall
        \App\Models\Feedback::create([
            'teacher_id' => $teacherId,
            'student_name' => $user->name,
            'rating' => 5,
            'comment' => "🚨 [Support Request] " . $request->title . ": " . $request->description
        ]);

        // Get teacher model and send notification/email
        $teacher = \App\Models\User::find($teacherId);
        if ($teacher) {
            // Create a system notification for the teacher
            \Illuminate\Support\Facades\DB::table('notifications')->insert([
                'user_id' => $teacher->id,
                'title' => '🚨 New Student Support Request!',
                'message' => "Student {$user->name} has requested support: '{$request->title}'. Description: {$request->description}",
                'type' => 'system',
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Send an email to the teacher
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Hello {$teacher->name},\n\nYou have received a new support request from student {$user->name}.\n\nTicket Details:\n----------------------------------------\nTitle: {$request->title}\nDescription: {$request->description}\n----------------------------------------\n\nPlease log in to your mentor dashboard to reply or assist your student.\n\nBest regards,\nBolo Academy Administration",
                    function ($message) use ($teacher, $user) {
                        $message->to($teacher->email)
                            ->subject("🚨 Bolo Academy - Support Request from {$user->name}");
                    }
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Support Mail sending failed: " . $e->getMessage());
            }
        }

        return response()->json($ticket, 201);
    }

    public function getTeachers()
    {
        // Fetch all teachers
        $teachers = \App\Models\User::where('id', 1)->orWhere('email', 'like', '%teacher%')->get(['id', 'name', 'email']);
        return response()->json($teachers);
    }

    private function calculateBadges($student, $quizScores)
    {
        $badges = [];
        
        if ($student->attendance >= 95) {
            $badges[] = [
                'id' => 'attendance_master', 
                'name' => 'Attendance Master', 
                'icon' => '🌟', 
                'color' => 'bg-yellow-200',
                'description' => 'Maintained over 95% attendance!'
            ];
        }
        
        if ($quizScores->where('score', '>=', 90)->count() >= 3) {
            $badges[] = [
                'id' => 'quiz_wiz', 
                'name' => 'Quiz Wiz', 
                'icon' => '🧙‍♂️', 
                'color' => 'bg-purple-200',
                'description' => 'Scored 90+ on 3 different quizzes!'
            ];
        }

        if ($student->progress >= 80) {
            $badges[] = [
                'id' => 'fast_learner', 
                'name' => 'Fast Learner', 
                'icon' => '🚀', 
                'color' => 'bg-blue-200',
                'description' => 'Reached 80% overall progress!'
            ];
        }

        // Support tickets count
        $ticketsCount = \App\Models\SupportTicket::where('user_id', $student->user_id)->count();
        if ($ticketsCount >= 1) {
            $badges[] = [
                'id' => 'help_hero',
                'name' => 'Help Hero',
                'icon' => '🛟',
                'color' => 'bg-pink-200',
                'description' => 'Asked for help through a Support Ticket!'
            ];
        }

        // Completed homework count
        $completedHomeworkCount = \App\Models\StudentAssignment::where('student_id', $student->id)->where('status', 'completed')->count();
        if ($completedHomeworkCount >= 1) {
            $badges[] = [
                'id' => 'creative_mind',
                'name' => 'Creative Mind',
                'icon' => '🎨',
                'color' => 'bg-green-200',
                'description' => 'Turned in homework or drawing assignments!'
            ];
        }

        return $badges;
    }

    public function getLiveStatus()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['live_class' => null, 'live_join_url' => null]);
        }

        $student = $user->studentProfile;
        if (!$student) {
            return response()->json(['live_class' => null, 'live_join_url' => null]);
        }

        $batchName = $student->batch ? $student->batch->name : 'NonExistentBatchName';
        $liveClass = \App\Models\CourseClass::where(function($q) use ($student, $batchName) {
                $q->whereJsonContains('student_ids', $student->id)
                  ->orWhere('description', 'like', "%Batch: " . $batchName . "%");
            })
            ->where('status', 'live')
            ->first();

        $liveJoinUrl = null;
        if ($liveClass) {
            $liveJoinUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                "student.live",
                now()->addHours(2),
                ["roomId" => $liveClass->meeting_link],
                false
            );
        }

        $notifications = \App\Models\Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'live_class' => $liveClass,
            'live_join_url' => $liveJoinUrl,
            'notifications' => $notifications,
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

        return $details[$curriculumName] ?? $details['Basic Boost Plan'];
    }
}
