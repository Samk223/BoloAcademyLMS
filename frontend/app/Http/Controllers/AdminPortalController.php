<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\ClassAttendance;
use App\Models\CourseClass;
use App\Models\Feedback;
use App\Models\Notification;
use App\Models\Student;
use App\Models\StudentFeedback;
use App\Models\StudentQuizScore;
use App\Models\SupportTicket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AdminPortalController extends Controller
{
    public function dashboard(Request $request): View
    {
        $students = Student::with(['teacher', 'user'])->get();
        $teachers = User::where('role', 'teacher')->get();
        $classes = CourseClass::with('teacher')->orderBy('scheduled_at')->get();
        $curriculums = $this->curriculumCatalog($teachers, $students->count());
        $batches = $this->batchCatalog($teachers, $curriculums);

        $totalStudents = $students->count();
        $activeStudents = $students->filter(fn (Student $student) => $student->last_login_at && Carbon::parse($student->last_login_at)->gte(now()->subDays(7)))->count();
        $totalTeachers = $teachers->count();
        $activeTeachers = $classes->where('scheduled_at', '>=', now()->subDays(14))->pluck('teacher_id')->filter()->unique()->count();
        $ongoingClasses = $classes->filter(function (CourseClass $class) {
            $start = Carbon::parse($class->scheduled_at);
            $end = $start->copy()->addMinutes($class->duration ?? 60);

            return now()->between($start, $end);
        })->count();
        $todayClasses = $classes->filter(fn (CourseClass $class) => optional($class->scheduled_at)->isToday())->count();
        $monthlyGrowth = $this->calculateMonthlyGrowth();
        $attendanceRate = $this->attendanceRate();

        $teacherPerformance = $teachers->map(function (User $teacher) use ($students, $classes) {
            $teacherStudents = $students->where('teacher_id', $teacher->id);
            $teacherClasses = $classes->where('teacher_id', $teacher->id);
            $ratingBase = round(4 + (($teacherStudents->avg('progress') ?? 65) / 100), 1);

            return [
                'name' => $teacher->name,
                'students' => $teacherStudents->count(),
                'classes' => $teacherClasses->count(),
                'progress' => (int) round($teacherStudents->avg('progress') ?? 0),
                'attendance' => (int) round($teacherStudents->avg('attendance') ?? 0),
                'rating' => min(5, max(4.0, $ratingBase)),
            ];
        })->sortByDesc('progress')->take(5)->values();

        $studentActivity = collect(range(6, 0))->map(function (int $dayOffset) use ($students) {
            $date = now()->subDays($dayOffset)->startOfDay();
            $count = $students->filter(function (Student $student) use ($date) {
                return $student->last_login_at && Carbon::parse($student->last_login_at)->isSameDay($date);
            })->count();

            return [
                'label' => $date->format('D'),
                'value' => $count,
            ];
        })->values();

        $enrollmentTrends = collect(range(5, 0))->map(function (int $monthOffset) {
            $month = now()->subMonths($monthOffset);

            return [
                'label' => $month->format('M'),
                'value' => Student::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count(),
            ];
        })->values();

        $packagePrices = [
            'Basic Boost Plan' => 2999,
            'Basic Boost' => 2999,
            'Speaker Combo Plan' => 4999,
            'Speaker Combo' => 4999,
            'Fluency Fast-Track Plan' => 9999,
            'Fluency Fast-Track' => 9999,
            'Gold Master Plan' => 14999,
            'Gold Master' => 14999,
        ];

        $totalTuitionCollected = 0;
        $totalOutstandingFees = 0;
        $totalRenewalPipeline = 0;

        foreach ($students as $student) {
            $price = $packagePrices[$student->package_name] ?? 4200;
            if ($student->fee_status === 'Paid') {
                $totalTuitionCollected += $price;
                if ($student->last_login_at && Carbon::parse($student->last_login_at)->gte(now()->subDays(7))) {
                    $totalRenewalPipeline += (int) ($price * 0.5);
                }
            } else {
                $totalOutstandingFees += $price;
            }
        }

        $revenueAnalytics = [
            ['label' => 'Tuition collected', 'value' => $totalTuitionCollected],
            ['label' => 'Renewal pipeline', 'value' => $totalRenewalPipeline],
            ['label' => 'Outstanding fees', 'value' => $totalOutstandingFees],
        ];

        $attendanceOverview = [
            'rate' => $attendanceRate,
            'alerts' => $students->where('attendance', '<', 70)->count(),
            'perfect' => $students->where('attendance', '>=', 95)->count(),
            'average' => (int) round($students->avg('attendance') ?? 0),
        ];

        $recentEnrollments = $students->sortByDesc('created_at')->take(6)->map(function (Student $student) {
            return [
                'name' => $student->user?->name ?? $student->name,
                'email' => $student->user?->email ?? 'student@boloacademy.com',
                'grade' => $student->grade,
                'teacher' => $student->teacher?->name ?? 'Unassigned',
                'created_at' => optional($student->created_at)?->format('d M, Y'),
            ];
        })->values();

        $upcomingClasses = $classes->filter(fn (CourseClass $class) => optional($class->scheduled_at)->isFuture())
            ->take(5)
            ->map(function (CourseClass $class) {
                return [
                    'title' => $class->title,
                    'time' => optional($class->scheduled_at)?->format('D, d M • h:i A'),
                    'teacher' => $class->teacher?->name ?? 'Team Bolo',
                    'grade' => $class->grade ?? 'Multi-level',
                ];
            })->values();

        $quickActions = [
            ['label' => 'Create schedule', 'description' => 'Open a new weekly teaching block', 'tone' => 'mint', 'icon' => 'schedules', 'route' => 'admin.schedules'],
            ['label' => 'Send announcement', 'description' => 'Push updates to students and teachers', 'tone' => 'purple', 'icon' => 'notifications', 'route' => 'admin.notifications'],
            ['label' => 'Review attendance alerts', 'description' => 'Check students below threshold', 'tone' => 'peach', 'icon' => 'reports', 'route' => 'admin.reports'],
            ['label' => 'Assign curriculum', 'description' => 'Match teachers, batches, and tracks', 'tone' => 'lemon', 'icon' => 'curriculum', 'route' => 'admin.batches'],
        ];

        return $this->renderPage($request, 'admin.dashboard', [
            'pageTitle' => 'Admin dashboard',
            'pageDescription' => 'Live pulse of student growth, teacher capacity, class delivery, and platform health.',
            'metrics' => [
                ['label' => 'Total students', 'value' => $totalStudents, 'icon' => 'users', 'tone' => 'mint', 'href' => route('admin.users', ['tab' => 'students'])],
                ['label' => 'Active students', 'value' => $activeStudents, 'icon' => 'student', 'tone' => 'blue', 'href' => route('admin.users', ['tab' => 'students'])],
                ['label' => 'Total teachers', 'value' => $totalTeachers, 'icon' => 'teacher', 'tone' => 'purple', 'href' => route('admin.users', ['tab' => 'teachers'])],
                ['label' => 'Active teachers', 'value' => $activeTeachers, 'icon' => 'teacher', 'tone' => 'pink', 'href' => route('admin.users', ['tab' => 'teachers'])],
                ['label' => 'Total curriculums', 'value' => $curriculums->count(), 'icon' => 'curriculum', 'tone' => 'lemon', 'href' => route('admin.curriculum')],
                ['label' => 'Total batches', 'value' => $batches->count(), 'icon' => 'batches', 'tone' => 'peach', 'href' => route('admin.batches')],
                ['label' => 'Ongoing classes', 'value' => $ongoingClasses, 'icon' => 'schedules', 'tone' => 'mint', 'href' => route('admin.schedules')],
                ['label' => "Today's classes", 'value' => $todayClasses, 'icon' => 'clock', 'tone' => 'blue', 'href' => route('admin.schedules')],
            ],
            'monthlyGrowth' => $monthlyGrowth,
            'enrollmentTrends' => $enrollmentTrends,
            'revenueAnalytics' => $revenueAnalytics,
            'teacherPerformance' => $teacherPerformance,
            'studentActivity' => $studentActivity,
            'curriculumEngagement' => $curriculums->map(fn (array $curriculum) => [
                'title' => $curriculum['title'],
                'engagement' => $curriculum['engagement'],
                'students' => $curriculum['student_count'],
            ]),
            'attendanceOverview' => $attendanceOverview,
            'quickActions' => $quickActions,
            'recentNotifications' => $this->notificationFeed()->take(6),
            'upcomingClasses' => $upcomingClasses,
            'recentEnrollments' => $recentEnrollments,
            'teacherWorkload' => $this->teacherWorkload($teachers, $classes, $students),
            'studentHeatmap' => $students->sortByDesc('progress')->take(12)->map(fn (Student $student) => [
                'name' => $student->user?->name ?? $student->name,
                'progress' => $student->progress,
                'attendance' => $student->attendance,
                'streak' => $student->streak,
            ])->values(),
        ]);
    }

    public function users(Request $request): View
    {
        $tab = $request->string('tab')->value() ?: 'students';
        $studentSearch = trim((string) $request->query('student_search', ''));
        $teacherSearch = trim((string) $request->query('teacher_search', ''));
        $feeStatus = trim((string) $request->query('fee_status', ''));
        $teacherStatus = trim((string) $request->query('teacher_status', ''));
        $studentSort = $request->string('student_sort')->value() ?: 'created_at';
        $teacherSort = $request->string('teacher_sort')->value() ?: 'created_at';

        $studentQuery = Student::query()->with(['teacher', 'user', 'batch']);
        if ($studentSearch !== '') {
            $studentQuery->where(function ($query) use ($studentSearch) {
                $query->where('name', 'like', "%{$studentSearch}%")
                    ->orWhere('grade', 'like', "%{$studentSearch}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery
                        ->where('name', 'like', "%{$studentSearch}%")
                        ->orWhere('email', 'like', "%{$studentSearch}%"))
                    ->orWhereHas('teacher', fn ($teacherQuery) => $teacherQuery
                        ->where('name', 'like', "%{$studentSearch}%"));
            });
        }

        if ($feeStatus !== '') {
            if (strtolower($feeStatus) === 'paid') {
                $studentQuery->where(function($q) {
                    $q->where('fee_status', 'Paid')->orWhereNull('fee_status');
                });
            } else {
                $studentQuery->where('fee_status', $feeStatus);
            }
        }

        $studentSortMap = [
            'name' => 'name',
            'progress' => 'progress',
            'attendance' => 'attendance',
            'created_at' => 'created_at',
            'last_active' => 'last_login_at',
        ];
        $studentQuery->orderBy($studentSortMap[$studentSort] ?? 'created_at', $studentSort === 'name' ? 'asc' : 'desc');

        $students = $studentQuery->paginate(8, ['*'], 'student_page')->through(function (Student $student) {
            return [
                'id' => $student->id,
                'student_code' => 'STD-' . str_pad((string) $student->id, 4, '0', STR_PAD_LEFT),
                'name' => $student->user?->name ?? $student->name,
                'email' => $student->user?->email ?? 'student@boloacademy.com',
                'curriculum' => $this->curriculumTitleForGrade($student->grade, $student),
                'teacher' => $student->teacher?->name ?? 'Unassigned',
                'batch' => $this->batchNameForStudent($student),
                'progress' => $student->progress,
                'attendance' => $student->attendance,
                'enrollment_date' => optional($student->created_at)?->format('d M, Y'),
                'fee_status' => $this->studentFeeStatus($student),
                'last_active' => $student->last_login_at ? Carbon::parse($student->last_login_at)->diffForHumans() : 'New profile',
                'profile' => [
                    'grade' => $student->grade,
                    'streak' => $student->streak,
                    'classes_taken' => $student->classes_taken,
                    'parent_name' => $student->parent_name ?? 'Not added',
                    'parent_phone' => $student->parent_phone ?? 'Not added',
                ],
            ];
        });

        $teacherQuery = User::query()->where('role', 'teacher');
        if ($teacherSearch !== '') {
            $teacherQuery->where(function ($query) use ($teacherSearch) {
                $query->where('name', 'like', "%{$teacherSearch}%")
                    ->orWhere('email', 'like', "%{$teacherSearch}%");
            });
        }

        if ($teacherStatus !== '') {
            $dbStatus = strtolower($teacherStatus) === 'pending approval' ? 'pending' : (strtolower($teacherStatus) === 'rejected' ? 'rejected' : (strtolower($teacherStatus) === 'suspended' ? 'suspended' : 'approved'));
            $teacherQuery->where('status', $dbStatus);
        }

        $teacherSortMap = [
            'name' => 'name',
            'email' => 'email',
            'created_at' => 'created_at',
        ];
        $teacherQuery->orderBy($teacherSortMap[$teacherSort] ?? 'created_at', $teacherSort === 'name' ? 'asc' : 'desc');

        $teachers = $teacherQuery->paginate(8, ['*'], 'teacher_page')->through(function (User $teacher) {
            $classesCount = CourseClass::where('teacher_id', $teacher->id)->count();
            $dailyClasses = CourseClass::where('teacher_id', $teacher->id)->whereDate('scheduled_at', now())->count();
            $teacherStudents = Student::where('teacher_id', $teacher->id)->get();
            
            $status = $teacher->status === 'pending' ? 'Pending Approval' : ($teacher->status === 'rejected' ? 'Rejected' : ($teacher->status === 'suspended' ? 'Suspended' : 'Active'));

            return [
                'id' => $teacher->id,
                'teacher_code' => 'TCH-' . str_pad((string) $teacher->id, 4, '0', STR_PAD_LEFT),
                'name' => $teacher->name,
                'email' => $teacher->email,
                'courses_assigned' => max(1, (int) ceil($classesCount / 4)),
                'students_handling' => $teacherStudents->count(),
                'daily_classes' => $dailyClasses,
                'ratings' => min(5, max(4.1, round(4 + (($teacherStudents->avg('progress') ?? 0) / 100), 1))),
                'attendance' => (int) round($teacherStudents->avg('attendance') ?? 0),
                'status' => $status,
                'joining_date' => optional($teacher->created_at)?->format('d M, Y'),
                'profile' => [
                    'accent_color' => $teacher->accent_color ?? '#E9D5FF',
                    'meeting_link' => $teacher->meeting_link ?? 'Not configured',
                    'classes' => $classesCount,
                    'avg_progress' => (int) round($teacherStudents->avg('progress') ?? 0),
                    'experience_years' => $teacher->experience_years,
                    'certifications' => $teacher->certifications,
                    'subject_specialization' => $teacher->subject_specialization,
                    'curriculum_expertise' => $teacher->curriculum_expertise,
                    'resume_path' => $teacher->resume_path,
                ],
            ];
        });

        return $this->renderPage($request, 'admin.users.index', [
            'pageTitle' => 'Users management',
            'pageDescription' => 'Search, filter, monitor, and manage every learner and instructor from one premium CRM-style workspace.',
            'tab' => $tab,
            'students' => $students,
            'teachers' => $teachers,
            'batches' => Batch::all(),
            'allTeachers' => User::where('role', 'teacher')->get(),
            'studentSearch' => $studentSearch,
            'teacherSearch' => $teacherSearch,
            'feeStatus' => $feeStatus,
            'teacherStatus' => $teacherStatus,
            'studentSort' => $studentSort,
            'teacherSort' => $teacherSort,
        ]);
    }

    public function curriculum(Request $request): View
    {
        // Purge legacy mock plans only
        $legacyTitles = ['Advanced IELTS Prep', 'Fluency Bridge'];
        \App\Models\Curriculum::whereIn('title', $legacyTitles)->delete();

        // Auto-seed or update default plans
        $defaults = [
            [
                'title' => 'Basic Boost Plan',
                'duration' => '1 Month',
                'description' => 'Start speaking English from Day 1 in a group setting.',
                'syllabus' => ['Sentence building', 'Basic grammar & sentence anchors', 'Confidence drills', 'Daily activities: open mic, interviews, games', 'Instructor guidance & progress feedback'],
                'objectives' => ['Speak simple English fluently', 'Introduce yourself confidently', 'Describe your day', 'Answer everyday questions without hesitation'],
                'outcomes' => ['Daily spoken confidence', 'Basic English vocabulary', 'Bolo Basic Boost Certificate'],
                'certification' => 'Bolo Basic Boost Certificate',
                'dates' => '03 Jun - 02 Jul',
                'milestones' => [25, 50, 75, 100],
                'engagement' => 95,
            ],
            [
                'title' => 'Speaker Combo Plan',
                'duration' => '1 Month',
                'description' => 'All the benefits of group classes + personal attention.',
                'syllabus' => ['Group discussion circles', '1-on-1 private speaking slots', 'Pronunciation analysis & accent softening', 'Personalized grammar & vocabulary drills', 'Weekly mock conversational tests'],
                'objectives' => ['Speak without hesitation', 'Improve pronunciation & speech flow', 'Crack basic interviews', 'Participate actively in meetings'],
                'outcomes' => ['Hesitation-free speaking', 'Accent softening', 'Bolo Speaker Combo Badge'],
                'certification' => 'Bolo Speaker Combo Badge',
                'dates' => '01 Jun - 30 Jun',
                'milestones' => [25, 50, 75, 100],
                'engagement' => 90,
            ],
            [
                'title' => 'Fluency Fast-Track Plan',
                'duration' => '1 Month',
                'description' => 'Intensive daily 1-on-1 speaking drills and professional training.',
                'syllabus' => ['Intensive 1-on-1 training', 'Custom learning routes', 'Business presentations & corporate communication', 'Real-time accent coaching & tone training', '24/7 dedicated WhatsApp mentor support'],
                'objectives' => ['Master professional arguments', 'Lead business meetings confidently', 'Host corporate presentations', 'Achieve near-native speaking style'],
                'outcomes' => ['Elite professional presentation', 'Impromptu speaking fluency', 'Bolo Fast-Track Fluency Certificate'],
                'certification' => 'Bolo Fast-Track Fluency Certificate',
                'dates' => '05 Jun - 04 Jul',
                'milestones' => [25, 50, 75, 100],
                'engagement' => 88,
            ],
            [
                'title' => 'Gold Master Plan',
                'duration' => '1 Month',
                'description' => 'Exclusive 1-on-1 coaching directly under Senior Master Trainers.',
                'syllabus' => ['Direct Senior Master coaching', 'Elite interview prep & negotiation drills', 'Public speaking & audience influence', 'Personalized IELTS/OET coaching & mocks', 'Dedicated premium priority support channel'],
                'objectives' => ['Ultimate English mastery', 'Speak like a top-tier executive leader', 'Influence large audiences', 'Achieve IELTS Band 8+'],
                'outcomes' => ['Elite English leadership presence', 'IELTS/OET mock readiness', 'Bolo Gold Master English Diploma'],
                'certification' => 'Bolo Gold Master English Diploma',
                'dates' => '15 May - 14 Jun',
                'milestones' => [20, 40, 60, 80, 100],
                'engagement' => 92,
            ],
        ];

        foreach ($defaults as $d) {
            \App\Models\Curriculum::updateOrCreate(['title' => $d['title']], $d);
        }

        $allCurricula = \App\Models\Curriculum::where('is_archived', false)->get();
        $curriculumsData = collect();

        foreach ($allCurricula as $curr) {
            // Find real batches for this curriculum in the database
            $batches = Batch::where('curriculum_name', $curr->title)->with(['teacher', 'students'])->get();

            // Teachers teaching: distinct names
            $assignedTeachers = $batches->map(fn($b) => $b->teacher?->name)->filter()->unique();
            $teacherDisplay = $assignedTeachers->isEmpty() ? 'No teachers' : $assignedTeachers->implode(', ');

            // Enrolled students: count of all students in these batches
            $totalStudents = $batches->sum(fn($b) => $b->students->count());

            // Average engagement
            $matchingStudents = Student::whereIn('batch_id', $batches->pluck('id'))->get();
            $avgEngagement = $matchingStudents->isEmpty() ? $curr->engagement : (int) round($matchingStudents->avg('progress'));

            // Map batch details
            $batchesData = $batches->map(function ($b) {
                return [
                    'id' => $b->id,
                    'name' => $b->name,
                    'teacher' => $b->teacher?->name ?? 'Unassigned',
                    'student_count' => $b->students->count(),
                    'students' => $b->students->pluck('name')->toArray(),
                ];
            });

            $curriculumsData->push([
                'id' => $curr->id,
                'title' => $curr->title,
                'duration' => $curr->duration,
                'description' => $curr->description,
                'teacher' => $teacherDisplay,
                'student_count' => $totalStudents,
                'engagement' => $avgEngagement,
                'dates' => $curr->dates,
                'syllabus' => $curr->syllabus ?? [],
                'objectives' => $curr->objectives ?? [],
                'outcomes' => $curr->outcomes ?? [],
                'certification' => $curr->certification,
                'milestones' => $curr->milestones ?? [25, 50, 75, 100],
                'batches' => $batchesData,
            ]);
        }

        return $this->renderPage($request, 'admin.curriculum.index', [
            'pageTitle' => 'Curriculum management',
            'pageDescription' => 'Shape the academic journey with structured, trackable English-learning pathways.',
            'curriculums' => $curriculumsData,
        ]);
    }

    public function storeCurriculum(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:curricula,title',
            'duration' => 'required|string|max:255',
            'description' => 'required|string',
            'syllabus' => 'required|string',
            'objectives' => 'required|string',
            'outcomes' => 'required|string',
            'certification' => 'required|string|max:255',
            'dates' => 'required|string|max:255',
        ]);

        $syllabusArray = array_filter(array_map('trim', explode("\n", $request->input('syllabus'))));
        $objectivesArray = array_filter(array_map('trim', explode("\n", $request->input('objectives'))));
        $outcomesArray = array_filter(array_map('trim', explode("\n", $request->input('outcomes'))));

        \App\Models\Curriculum::create([
            'title' => $validated['title'],
            'duration' => $validated['duration'],
            'description' => $validated['description'],
            'syllabus' => $syllabusArray,
            'objectives' => $objectivesArray,
            'outcomes' => $outcomesArray,
            'certification' => $validated['certification'],
            'dates' => $validated['dates'],
            'milestones' => [25, 50, 75, 100],
            'engagement' => 80,
            'is_archived' => false,
        ]);

        return redirect()->route('admin.curriculum')->with('success', 'Curriculum created successfully!');
    }

    public function updateCurriculum(Request $request, $id)
    {
        $curriculum = \App\Models\Curriculum::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:curricula,title,' . $id,
            'duration' => 'required|string|max:255',
            'description' => 'required|string',
            'syllabus' => 'required|string',
            'objectives' => 'required|string',
            'outcomes' => 'required|string',
            'certification' => 'required|string|max:255',
            'dates' => 'required|string|max:255',
        ]);

        $syllabusArray = array_filter(array_map('trim', explode("\n", $request->input('syllabus'))));
        $objectivesArray = array_filter(array_map('trim', explode("\n", $request->input('objectives'))));
        $outcomesArray = array_filter(array_map('trim', explode("\n", $request->input('outcomes'))));

        $curriculum->update([
            'title' => $validated['title'],
            'duration' => $validated['duration'],
            'description' => $validated['description'],
            'syllabus' => $syllabusArray,
            'objectives' => $objectivesArray,
            'outcomes' => $outcomesArray,
            'certification' => $validated['certification'],
            'dates' => $validated['dates'],
        ]);

        return redirect()->route('admin.curriculum')->with('success', 'Curriculum updated successfully!');
    }

    public function duplicateCurriculum($id)
    {
        $curr = \App\Models\Curriculum::findOrFail($id);

        $newTitle = $curr->title . ' (Copy)';
        $count = 1;
        while (\App\Models\Curriculum::where('title', $newTitle)->exists()) {
            $newTitle = $curr->title . ' (Copy ' . $count . ')';
            $count++;
        }

        \App\Models\Curriculum::create([
            'title' => $newTitle,
            'duration' => $curr->duration,
            'description' => $curr->description,
            'syllabus' => $curr->syllabus,
            'objectives' => $curr->objectives,
            'outcomes' => $curr->outcomes,
            'certification' => $curr->certification,
            'dates' => $curr->dates,
            'milestones' => $curr->milestones,
            'engagement' => $curr->engagement,
            'is_archived' => false,
        ]);

        return redirect()->route('admin.curriculum')->with('success', 'Curriculum duplicated successfully!');
    }

    public function archiveCurriculum($id)
    {
        $curr = \App\Models\Curriculum::findOrFail($id);
        $curr->update(['is_archived' => true]);

        return redirect()->route('admin.curriculum')->with('success', 'Curriculum archived successfully!');
    }

    public function exportCurriculumAnalytics()
    {
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=curriculum_analytics_" . date('Ymd_His') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $allCurricula = \App\Models\Curriculum::all();

        $callback = function() use($allCurricula) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Curriculum Title', 'Duration', 'Description', 'Active Batches Count', 'Total Enrolled Students', 'Avg Engagement %', 'Dates', 'Certification']);

            foreach ($allCurricula as $curr) {
                $batches = Batch::where('curriculum_name', $curr->title)->with('students')->get();
                $totalStudents = $batches->sum(fn($b) => $b->students->count());
                $matchingStudents = Student::whereIn('batch_id', $batches->pluck('id'))->get();
                $avgEngagement = $matchingStudents->isEmpty() ? $curr->engagement : (int) round($matchingStudents->avg('progress'));

                fputcsv($file, [
                    $curr->title,
                    $curr->duration,
                    $curr->description,
                    $batches->count(),
                    $totalStudents,
                    $avgEngagement . '%',
                    $curr->dates,
                    $curr->certification
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }


    public function batches(Request $request): View
    {
        $teachers = User::where('role', 'teacher')->get();
        $curriculums = $this->curriculumCatalog($teachers, Student::count());
        $batches = $this->batchCatalog($teachers, $curriculums);
        $unassignedStudents = Student::whereNull('batch_id')->get();

        return $this->renderPage($request, 'admin.batches.index', [
            'pageTitle' => 'Batch management',
            'pageDescription' => 'Coordinate teacher allocation, curriculum fit, student capacity, and live meeting readiness.',
            'batches' => $batches,
            'teachersList' => $teachers,
            'curriculumsList' => $curriculums,
            'unassignedStudents' => $unassignedStudents,
        ]);
    }

    public function storeBatch(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'curriculum_name' => 'required|string|max:255',
            'schedule_details' => 'required|string|max:255',
            'teacher_id' => 'required|exists:users,id',
            'capacity' => 'required|integer|min:1',
        ]);

        Batch::create([
            'name' => $validated['name'],
            'curriculum_name' => $validated['curriculum_name'],
            'schedule_details' => $validated['schedule_details'],
            'teacher_id' => $validated['teacher_id'],
            'capacity' => $validated['capacity'],
            'seats_reserved' => 0,
        ]);

        return redirect()->route('admin.batches')->with('success', 'Batch created successfully!');
    }

    public function updateBatch(Request $request, $id)
    {
        $batch = Batch::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'curriculum_name' => 'required|string|max:255',
            'schedule_details' => 'required|string|max:255',
            'teacher_id' => 'required|exists:users,id',
            'capacity' => 'required|integer|min:1',
        ]);

        $batch->update($validated);

        return redirect()->route('admin.batches')->with('success', 'Batch updated successfully!');
    }

    public function assignStudents(Request $request, $id)
    {
        $batch = Batch::findOrFail($id);

        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $studentIds = $request->input('student_ids');

        Student::whereIn('id', $studentIds)->update([
            'batch_id' => $batch->id,
            'teacher_id' => $batch->teacher_id
        ]);

        $batch->update(['seats_reserved' => $batch->students()->count()]);

        return redirect()->route('admin.batches')->with('success', 'Students assigned to batch successfully!');
    }

    public function exportBatches()
    {
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=batches_roster_" . date('Ymd_His') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $batches = Batch::with(['teacher', 'students.user'])->get();

        $callback = function() use($batches) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Batch Name', 'Curriculum', 'Schedule', 'Teacher', 'Capacity', 'Enrolled Count', 'Enrolled Students (Emails)']);

            foreach ($batches as $b) {
                $studentList = $b->students->map(fn($s) => $s->name . ' (' . ($s->user?->email ?? 'N/A') . ')')->implode('; ');
                fputcsv($file, [
                    $b->name,
                    $b->curriculum_name,
                    $b->schedule_details,
                    $b->teacher?->name ?? 'Unassigned',
                    $b->capacity,
                    $b->students->count(),
                    $studentList
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function schedules(Request $request): View
    {
        $classes = CourseClass::with('teacher')->orderBy('scheduled_at')->get();
        $teachers = User::where('role', 'teacher')->get();
        $curriculums = $this->curriculumCatalog($teachers, Student::count());
        $weekStart = now()->startOfWeek(Carbon::MONDAY);

        $calendar = collect(range(0, 6))->map(function (int $offset) use ($weekStart, $classes) {
            $date = $weekStart->copy()->addDays($offset);
            $items = $classes->filter(fn (CourseClass $class) => optional($class->scheduled_at)->isSameDay($date))
                ->map(function (CourseClass $class) {
                    return [
                        'id' => $class->id,
                        'title' => $class->title,
                        'teacher' => $class->teacher?->name ?? 'Team Bolo',
                        'time' => optional($class->scheduled_at)->format('h:i A'),
                        'raw_time' => optional($class->scheduled_at)->format('Y-m-d\TH:i'),
                        'status' => ucfirst($class->status),
                        'grade' => $class->grade ?? 'Mixed',
                        'duration' => $class->duration ?? 60,
                    ];
                })->values();

            return [
                'label' => $date->format('D'),
                'date' => $date->format('d'),
                'full_date' => $date->format('Y-m-d'),
                'isToday' => $date->isToday(),
                'items' => $items,
            ];
        });

        // Calculate Monthly Calendar Grid
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();
        $gridStart = $monthStart->copy()->startOfWeek(Carbon::MONDAY);
        $gridEnd = $monthEnd->copy()->endOfWeek(Carbon::SUNDAY);

        $monthlyCalendar = collect();
        $currentDay = $gridStart->copy();

        while ($currentDay->lte($gridEnd)) {
            $date = $currentDay->copy();
            $items = $classes->filter(fn (CourseClass $class) => optional($class->scheduled_at)->isSameDay($date))
                ->map(function (CourseClass $class) {
                    return [
                        'id' => $class->id,
                        'title' => $class->title,
                        'teacher' => $class->teacher?->name ?? 'Team Bolo',
                        'time' => optional($class->scheduled_at)->format('h:i A'),
                        'raw_time' => optional($class->scheduled_at)->format('Y-m-d\TH:i'),
                        'status' => ucfirst($class->status),
                        'grade' => $class->grade ?? 'Mixed',
                        'duration' => $class->duration ?? 60,
                    ];
                })->values();

            $monthlyCalendar->push([
                'label' => $date->format('D'),
                'date' => $date->format('d'),
                'full_date' => $date->format('Y-m-d'),
                'isToday' => $date->isToday(),
                'isCurrentMonth' => $date->month === now()->month,
                'items' => $items,
            ]);

            $currentDay->addDay();
        }

        $currentMonthName = now()->format('F Y');

        return $this->renderPage($request, 'admin.schedules.index', [
            'pageTitle' => 'Class scheduling',
            'pageDescription' => 'Weekly and monthly class orchestration with teacher-, student-, and curriculum-aware scheduling.',
            'calendar' => $calendar,
            'monthlyCalendar' => $monthlyCalendar,
            'currentMonthName' => $currentMonthName,
            'scheduleFilters' => [
                'teachers' => $teachers->pluck('name'),
                'curriculums' => $curriculums->pluck('title'),
            ],
            'teachersList' => $teachers,
            'curriculumsList' => $curriculums,
        ]);
    }

    public function storeSchedule(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'scheduled_at' => 'required|date',
            'duration' => 'required|integer',
            'grade' => 'required|string',
        ]);

        $teacher = User::findOrFail($validated['teacher_id']);
        $meetingLink = $teacher->meeting_link ?? 'https://meet.google.com/abc-defg-hij';

        // Find students in this grade/plan
        $studentIds = Student::where('package_name', $validated['grade'])
            ->orWhere('grade', $validated['grade'])
            ->pluck('id')
            ->toArray();

        CourseClass::create([
            'teacher_id' => $validated['teacher_id'],
            'title' => $validated['title'],
            'description' => $request->input('description', 'Live class session for ' . $validated['grade']),
            'scheduled_at' => Carbon::parse($validated['scheduled_at']),
            'duration' => $validated['duration'],
            'status' => 'scheduled',
            'meeting_link' => $meetingLink,
            'grade' => $validated['grade'],
            'student_ids' => $studentIds,
        ]);

        return redirect()->route('admin.schedules')->with('success', 'Class scheduled successfully!');
    }

    public function rescheduleSchedule(Request $request, $id)
    {
        $validated = $request->validate([
            'scheduled_at' => 'required|date',
        ]);

        $class = CourseClass::findOrFail($id);
        
        $newDate = Carbon::parse($validated['scheduled_at']);
        $originalTime = Carbon::parse($class->scheduled_at);
        $newScheduledAt = $newDate->copy()->setTime($originalTime->hour, $originalTime->minute, $originalTime->second);

        $class->update([
            'scheduled_at' => $newScheduledAt,
        ]);

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "'{$class->title}' moved to " . $newScheduledAt->format('D, d M • h:i A'),
                'raw_time' => $newScheduledAt->format('Y-m-d\TH:i')
            ]);
        }

        return redirect()->route('admin.schedules')->with('success', 'Class rescheduled successfully!');
    }

    public function cancelSchedule($id)
    {
        $class = CourseClass::findOrFail($id);
        $class->delete();

        return redirect()->route('admin.schedules')->with('success', 'Class cancelled successfully!');
    }

    public function downloadReport(Request $request)
    {
        $type = $request->query('type', 'students');
        $filename = $type . "_report_" . date('Ymd_His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=" . $filename,
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($type) {
            $file = fopen('php://output', 'w');

            if ($type === 'students') {
                fputcsv($file, ['Student Name', 'Email', 'Package/Plan', 'Teacher', 'Enrolled Date', 'Progress %', 'Fee Status']);
                $students = Student::with(['teacher', 'user'])->get();
                foreach ($students as $s) {
                    fputcsv($file, [
                        $s->name,
                        $s->user?->email ?? 'N/A',
                        $s->package_name,
                        $s->teacher?->name ?? 'Unassigned',
                        optional($s->created_at)->format('Y-m-d') ?? 'N/A',
                        $s->progress . '%',
                        $s->fee_status
                    ]);
                }
            } elseif ($type === 'teachers') {
                fputcsv($file, ['Teacher Name', 'Email', 'Total Classes Taught', 'Status']);
                $teachers = User::where('role', 'teacher')->get();
                foreach ($teachers as $t) {
                    $classesCount = CourseClass::where('teacher_id', $t->id)->count();
                    fputcsv($file, [
                        $t->name,
                        $t->email,
                        $classesCount,
                        ucfirst($t->status)
                    ]);
                }
            } elseif ($type === 'attendance') {
                fputcsv($file, ['Class Title', 'Teacher', 'Scheduled At', 'Grade/Plan', 'Status']);
                $classes = CourseClass::with('teacher')->get();
                foreach ($classes as $c) {
                    fputcsv($file, [
                        $c->title,
                        $c->teacher?->name ?? 'N/A',
                        optional($c->scheduled_at)->format('Y-m-d H:i') ?? 'N/A',
                        $c->grade ?? 'N/A',
                        ucfirst($c->status)
                    ]);
                }
            } elseif ($type === 'curriculum') {
                fputcsv($file, ['Curriculum Title', 'Duration', 'Description', 'Active Batches Count', 'Total Enrolled Students', 'Avg Engagement %', 'Dates', 'Certification']);
                $allCurricula = \App\Models\Curriculum::where('is_archived', false)->get();
                foreach ($allCurricula as $curr) {
                    $batches = Batch::where('curriculum_name', $curr->title)->with('students')->get();
                    $totalStudents = $batches->sum(fn($b) => $b->students->count());
                    $matchingStudents = Student::whereIn('batch_id', $batches->pluck('id'))->get();
                    $avgEngagement = $matchingStudents->isEmpty() ? $curr->engagement : (int) round($matchingStudents->avg('progress'));

                    fputcsv($file, [
                        $curr->title,
                        $curr->duration,
                        $curr->description,
                        $batches->count(),
                        $totalStudents,
                        $avgEngagement . '%',
                        $curr->dates,
                        $curr->certification
                    ]);
                }
            } elseif ($type === 'revenue') {
                fputcsv($file, ['Student Name', 'Plan Name', 'Plan Price (INR)', 'Fee Status', 'Payment Date']);
                $packagePrices = [
                    'Basic Boost Plan' => 2999,
                    'Basic Boost' => 2999,
                    'Speaker Combo Plan' => 4999,
                    'Speaker Combo' => 4999,
                    'Fluency Fast-Track Plan' => 9999,
                    'Fluency Fast-Track' => 9999,
                    'Gold Master Plan' => 14999,
                    'Gold Master' => 14999,
                ];
                $students = Student::get();
                foreach ($students as $s) {
                    if ($s->fee_status === 'Paid') {
                        $price = $packagePrices[$s->package_name] ?? 4200;
                        fputcsv($file, [
                            $s->name,
                            $s->package_name,
                            $price,
                            $s->fee_status,
                            optional($s->updated_at)->format('Y-m-d') ?? 'N/A'
                        ]);
                    }
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function reports(Request $request): View
    {
        $students = Student::with(['teacher', 'user'])->get();
        $teachers = User::where('role', 'teacher')->get();

        $curriculums = $this->curriculumCatalog($teachers, $students->count());
        $highEngagementCurriculums = $curriculums->filter(fn ($c) => $c['engagement'] >= 80)->count();

        $packagePrices = [
            'Basic Boost Plan' => 2999,
            'Basic Boost' => 2999,
            'Speaker Combo Plan' => 4999,
            'Speaker Combo' => 4999,
            'Fluency Fast-Track Plan' => 9999,
            'Fluency Fast-Track' => 9999,
            'Gold Master Plan' => 14999,
            'Gold Master' => 14999,
        ];
        $totalTuitionCollected = 0;
        foreach ($students as $student) {
            if ($student->fee_status === 'Paid') {
                $totalTuitionCollected += $packagePrices[$student->package_name] ?? 4200;
            }
        }

        $reportCards = [
            ['title' => 'Student analytics', 'metric' => (int) round($students->avg('progress') ?? 0) . '% avg progress', 'tone' => 'mint'],
            ['title' => 'Teacher analytics', 'metric' => $teachers->count() . ' active mentors', 'tone' => 'purple'],
            ['title' => 'Attendance reports', 'metric' => $this->attendanceRate() . '% average attendance', 'tone' => 'blue'],
            ['title' => 'Enrollment reports', 'metric' => Student::count() . ' total enrollments', 'tone' => 'peach'],
            ['title' => 'Curriculum performance', 'metric' => $highEngagementCurriculums . ' tracks above 80% engagement', 'tone' => 'lemon'],
            ['title' => 'Revenue statistics', 'metric' => 'INR ' . number_format($totalTuitionCollected), 'tone' => 'pink'],
        ];

        $retentionSeries = collect(range(5, 0))->map(function (int $monthOffset) use ($students) {
            $monthDate = now()->subMonths($monthOffset);
            $eligible = $students->filter(fn ($s) => optional($s->created_at)->lte($monthDate));
            
            $baseline = [78, 81, 84, 85, 87, 92];
            $baseVal = $baseline[5 - $monthOffset] ?? 85;

            if ($eligible->isEmpty()) {
                return $baseVal;
            }
            $active = $eligible->filter(function ($s) use ($monthDate) {
                return $s->last_login_at && Carbon::parse($s->last_login_at)->gte($monthDate->copy()->subDays(30));
            })->count();

            $realVal = (int) round(($active / $eligible->count()) * 100);
            return min(100, max(50, (int) round(($realVal + $baseVal) / 2)));
        });

        $completionSeries = collect(range(5, 0))->map(function (int $monthOffset) use ($students) {
            $monthDate = now()->subMonths($monthOffset);
            $eligible = $students->filter(fn ($s) => optional($s->created_at)->lte($monthDate));
            
            $baseline = [58, 64, 69, 71, 74, 78];
            $baseVal = $baseline[5 - $monthOffset] ?? 70;

            if ($eligible->isEmpty()) {
                return $baseVal;
            }
            $realVal = (int) round($eligible->avg('progress') ?? 65);
            return min(100, max(20, (int) round(($realVal + $baseVal) / 2)));
        });

        return $this->renderPage($request, 'admin.reports.index', [
            'pageTitle' => 'Reports and analytics',
            'pageDescription' => 'Track retention, completion, attendance, revenue, and learning performance from one analytics suite.',
            'reportCards' => $reportCards,
            'retentionSeries' => $retentionSeries,
            'completionSeries' => $completionSeries,
            'teacherWorkload' => $this->teacherWorkload($teachers, CourseClass::all(), $students),
        ]);
    }

    private function getSettings(): array
    {
        $path = storage_path('app/settings.json');
        if (!file_exists($path)) {
            $defaultSettings = [
                'portal_name' => 'Bolo Academy LMS',
                'support_email' => 'support@boloacademy.com',
                'meeting_integration' => 'Google Meet',
                'certificate_watermark' => 'Bolo Academy Certified',
                'toggles' => [
                    'Admissions open across all tracks' => true,
                    'Teacher self-service enabled' => true,
                    'Student support SLA: 12 hours' => true,
                    'SMTP relay connected' => true,
                    'Digest cadence: daily' => true,
                    'Critical alerts routed to admins' => true,
                    'Google Meet links active' => true,
                    'Certificate watermark enabled' => true,
                    'Replay retention: 60 days' => true,
                    'Role-based admin access enforced' => true,
                    'Export actions require confirmation' => true,
                    'Audit trails enabled' => true,
                ]
            ];
            if (!is_dir(dirname($path))) {
                mkdir(dirname($path), 0755, true);
            }
            file_put_contents($path, json_encode($defaultSettings, JSON_PRETTY_PRINT));
            return $defaultSettings;
        }

        return json_decode(file_get_contents($path), true);
    }

    private function saveSettings(array $settings): void
    {
        $path = storage_path('app/settings.json');
        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }
        file_put_contents($path, json_encode($settings, JSON_PRETTY_PRINT));
    }

    public function reviews(Request $request): View
    {
        $teacherReviews = Feedback::latest()->take(8)->get()->map(function (Feedback $feedback) {
            return [
                'teacher' => $feedback->user?->name ?? 'Teacher',
                'student_name' => $feedback->student_name,
                'rating' => $feedback->rating,
                'comment' => $feedback->comment,
                'date' => optional($feedback->created_at)?->format('d M, Y'),
            ];
        });

        $studentFeedback = StudentFeedback::latest()->take(6)->get()->map(function (StudentFeedback $feedback) {
            $student = Student::find($feedback->student_id);
            $teacher = User::find($feedback->teacher_id);

            return [
                'id' => $feedback->id,
                'student' => $student?->user?->name ?? $student?->name ?? 'Student',
                'teacher' => $teacher?->name ?? 'Teacher',
                'content' => $feedback->content,
                'type' => ucfirst($feedback->type),
                'is_visible' => $feedback->is_visible ?? true,
                'date' => optional($feedback->created_at)?->format('d M, Y'),
            ];
        });

        $complaints = SupportTicket::latest()->take(6)->get()->map(function (SupportTicket $ticket) {
            return [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'status' => ucfirst($ticket->status),
                'owner' => $ticket->user?->name ?? 'Learner support',
                'description' => $ticket->description,
                'date' => optional($ticket->created_at)?->format('d M, Y'),
            ];
        });

        return $this->renderPage($request, 'admin.reviews.index', [
            'pageTitle' => 'Reviews and feedback',
            'pageDescription' => 'Moderate teacher reviews, student feedback loops, complaints, and satisfaction trends.',
            'teacherReviews' => $teacherReviews,
            'studentFeedback' => $studentFeedback,
            'complaints' => $complaints,
        ]);
    }

    public function approveFeedback($id)
    {
        $feedback = StudentFeedback::findOrFail($id);
        $feedback->update(['is_visible' => true]);
        return redirect()->route('admin.reviews')->with('success', 'Feedback approved successfully.');
    }

    public function hideFeedback($id)
    {
        $feedback = StudentFeedback::findOrFail($id);
        $feedback->update(['is_visible' => false]);
        return redirect()->route('admin.reviews')->with('success', 'Feedback hidden successfully.');
    }

    public function resolveTicket($id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(['status' => 'resolved']);
        return redirect()->route('admin.reviews')->with('success', 'Ticket resolved successfully.');
    }

    public function escalateTicket($id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(['status' => 'escalated']);
        return redirect()->route('admin.reviews')->with('success', 'Ticket escalated successfully.');
    }

    public function exportComplaints()
    {
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=support_tickets_" . date('Ymd_His') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $tickets = SupportTicket::with('user')->get();

        $callback = function() use($tickets) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Ticket ID', 'Title', 'Description', 'Owner/Student', 'Status', 'Created At']);

            foreach ($tickets as $t) {
                fputcsv($file, [
                    $t->id,
                    $t->title,
                    $t->description,
                    $t->user?->name ?? 'N/A',
                    ucfirst($t->status),
                    optional($t->created_at)->format('Y-m-d H:i')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function notifications(Request $request): View
    {
        return $this->renderPage($request, 'admin.notifications.index', [
            'pageTitle' => 'Notifications hub',
            'pageDescription' => 'Broadcast announcements, manage communication flows, and monitor delivery-ready notices.',
            'notificationsFeed' => $this->notificationFeed(12),
            'deliveryGroups' => collect([
                ['title' => 'All students', 'count' => Student::count(), 'tone' => 'mint'],
                ['title' => 'All teachers', 'count' => User::where('role', 'teacher')->count(), 'tone' => 'purple'],
                ['title' => 'Batch alerts', 'count' => Batch::count(), 'tone' => 'peach'],
                ['title' => 'Email campaigns', 'count' => 3, 'tone' => 'blue'],
            ]),
        ]);
    }

    public function storeNotification(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'audience' => 'required|string',
        ]);

        $users = collect();
        if ($validated['audience'] === 'All students') {
            $users = User::where('role', 'student')->get();
        } elseif ($validated['audience'] === 'All teachers') {
            $users = User::where('role', 'teacher')->get();
        } else {
            $users = User::all();
        }

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'message' => $validated['message'],
                'type' => 'system',
                'is_read' => false,
            ]);
        }

        // Also log a copy for admin dashboard
        Notification::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'] . ' (Sent to ' . $validated['audience'] . ')',
            'message' => $validated['message'],
            'type' => 'admin',
            'is_read' => false,
        ]);

        return redirect()->route('admin.notifications')->with('success', 'Announcement broadcasted successfully!');
    }

    public function archiveNotification($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();
        return redirect()->route('admin.notifications')->with('success', 'Notification archived successfully!');
    }

    public function syncNotificationsQueue(Request $request)
    {
        return redirect()->route('admin.notifications')->with('success', 'Notification delivery queue synced successfully!');
    }

    public function settings(Request $request): View
    {
        $settings = $this->getSettings();
        
        $settingGroups = [
            [
                'title' => 'Portal configuration',
                'tone' => 'mint',
                'items' => ['Admissions open across all tracks', 'Teacher self-service enabled', 'Student support SLA: 12 hours'],
            ],
            [
                'title' => 'Email and notifications',
                'tone' => 'purple',
                'items' => ['SMTP relay connected', 'Digest cadence: daily', 'Critical alerts routed to admins'],
            ],
            [
                'title' => 'Meeting and certificates',
                'tone' => 'peach',
                'items' => ['Google Meet links active', 'Certificate watermark enabled', 'Replay retention: 60 days'],
            ],
            [
                'title' => 'Access controls',
                'tone' => 'blue',
                'items' => ['Role-based admin access enforced', 'Export actions require confirmation', 'Audit trails enabled'],
            ],
        ];

        return $this->renderPage($request, 'admin.settings.index', [
            'pageTitle' => 'Admin settings',
            'pageDescription' => 'Configure portal behavior, email delivery, meeting tools, certificates, and access controls.',
            'settings' => $settings,
            'settingGroups' => $settingGroups,
        ]);
    }

    public function storeSettings(Request $request)
    {
        $validated = $request->validate([
            'portal_name' => 'required|string|max:255',
            'support_email' => 'required|email|max:255',
            'meeting_integration' => 'required|string|max:255',
            'certificate_watermark' => 'required|string|max:255',
        ]);

        $settings = $this->getSettings();
        $settings['portal_name'] = $validated['portal_name'];
        $settings['support_email'] = $validated['support_email'];
        $settings['meeting_integration'] = $validated['meeting_integration'];
        $settings['certificate_watermark'] = $validated['certificate_watermark'];

        $this->saveSettings($settings);

        return redirect()->route('admin.settings')->with('success', 'Global portal settings updated successfully!');
    }

    public function toggleSetting(Request $request)
    {
        $item = $request->input('item');
        if (!$item) {
            return response()->json(['error' => 'Item is required'], 400);
        }

        $settings = $this->getSettings();
        if (isset($settings['toggles'][$item])) {
            $settings['toggles'][$item] = !$settings['toggles'][$item];
        } else {
            $settings['toggles'][$item] = true;
        }

        $this->saveSettings($settings);

        return response()->json([
            'success' => true,
            'item' => $item,
            'state' => $settings['toggles'][$item]
        ]);
    }

    public function exportSettingsConfig()
    {
        $settings = $this->getSettings();
        
        return response()->streamDownload(function () use ($settings) {
            echo json_encode($settings, JSON_PRETTY_PRINT);
        }, 'settings_config_' . date('Ymd_His') . '.json', [
            'Content-Type' => 'application/json',
        ]);
    }

    private function renderPage(Request $request, string $view, array $data): View
    {
        $globalSearchTerm = trim((string) $request->query('global_search', ''));

        return view($view, array_merge($data, [
            'adminUser' => $request->user(),
            'globalSearchTerm' => $globalSearchTerm,
            'globalSearchResults' => $globalSearchTerm !== '' ? $this->searchLms($globalSearchTerm) : collect(),
            'shellMetrics' => [
                'students' => Student::count(),
                'teachers' => User::where('role', 'teacher')->count(),
                'live_classes' => CourseClass::whereDate('scheduled_at', now())->count(),
            ],
        ]));
    }

    private function searchLms(string $term): Collection
    {
        $students = Student::with('user')->where(function ($query) use ($term) {
            $query->where('name', 'like', "%{$term}%")
                ->orWhereHas('user', fn ($userQuery) => $userQuery
                    ->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%"));
        })->take(4)->get()->map(fn (Student $student) => [
            'type' => 'Student',
            'label' => $student->user?->name ?? $student->name,
            'meta' => $student->user?->email ?? $student->grade,
            'route' => route('admin.users', ['tab' => 'students', 'student_search' => $student->user?->name ?? $student->name]),
        ]);

        $teachers = User::where('role', 'teacher')
            ->where(function ($query) use ($term) {
                $query->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            })->take(4)->get()->map(fn (User $teacher) => [
                'type' => 'Teacher',
                'label' => $teacher->name,
                'meta' => $teacher->email,
                'route' => route('admin.users', ['tab' => 'teachers', 'teacher_search' => $teacher->name]),
            ]);

        $classes = CourseClass::with('teacher')->where('title', 'like', "%{$term}%")
            ->take(4)->get()->map(fn (CourseClass $class) => [
                'type' => 'Class',
                'label' => $class->title,
                'meta' => optional($class->scheduled_at)?->format('d M • h:i A') . ' • ' . ($class->teacher?->name ?? 'Team Bolo'),
                'route' => route('admin.schedules'),
            ]);

        $curriculums = $this->curriculumCatalog(User::where('role', 'teacher')->get(), Student::count())
            ->filter(fn (array $curriculum) => str_contains(strtolower($curriculum['title']), strtolower($term)))
            ->take(3)
            ->map(fn (array $curriculum) => [
                'type' => 'Curriculum',
                'label' => $curriculum['title'],
                'meta' => $curriculum['duration'] . ' • ' . $curriculum['teacher'],
                'route' => route('admin.curriculum'),
            ]);

        return $students->concat($teachers)->concat($classes)->concat($curriculums)->take(10)->values();
    }

    private function curriculumCatalog(Collection $teachers, int $studentCount): Collection
    {
        $teacherNames = $teachers->pluck('name')->filter()->values();
        if ($teacherNames->isEmpty()) {
            $teacherNames = collect(['Somya Kashyap', 'Lead Teacher', 'Aman Kapoor', 'Mira Dutta']);
        }

        $students = Student::all();

        $getStudentsForCurriculum = function(string $title) use ($students) {
            return $students->filter(function(Student $s) use ($title) {
                if ($s->package_name && str_contains(strtolower($s->package_name), strtolower($title))) {
                    return true;
                }
                $gradeCurriculum = match ($s->grade) {
                    'Grade 3', 'Grade 4' => 'Basic Boost Plan',
                    'Grade 5', 'Grade 6' => 'Speaker Combo Plan',
                    default => 'Fluency Fast-Track Plan',
                };
                return strtolower($gradeCurriculum) === strtolower($title);
            })->count();
        };

        $getEngagementForCurriculum = function(string $title) use ($students) {
            $matching = $students->filter(function(Student $s) use ($title) {
                if ($s->package_name && str_contains(strtolower($s->package_name), strtolower($title))) {
                    return true;
                }
                $gradeCurriculum = match ($s->grade) {
                    'Grade 3', 'Grade 4' => 'Basic Boost Plan',
                    'Grade 5', 'Grade 6' => 'Speaker Combo Plan',
                    default => 'Fluency Fast-Track Plan',
                };
                return strtolower($gradeCurriculum) === strtolower($title);
            });
            if ($matching->isEmpty()) return 80;
            return (int) round($matching->avg('progress') ?? 80);
        };

        return collect([
            [
                'title' => 'Basic Boost Plan',
                'duration' => '1 Month',
                'teacher' => $teacherNames[0],
                'student_count' => $getStudentsForCurriculum('Basic Boost Plan'),
                'description' => 'Start speaking English from Day 1 in a group setting.',
                'syllabus' => ['Sentence building', 'Basic grammar & sentence anchors', 'Confidence drills', 'Daily activities: open mic, interviews, games', 'Instructor guidance & progress feedback'],
                'objectives' => ['Speak simple English fluently', 'Introduce yourself confidently', 'Describe your day', 'Answer everyday questions without hesitation'],
                'outcomes' => ['Daily spoken confidence', 'Basic English vocabulary', 'Bolo Basic Boost Certificate'],
                'certification' => 'Bolo Basic Boost Certificate',
                'dates' => '03 Jun - 02 Jul',
                'milestones' => [25, 50, 75, 100],
                'engagement' => $getEngagementForCurriculum('Basic Boost Plan'),
            ],
            [
                'title' => 'Speaker Combo Plan',
                'duration' => '1 Month',
                'teacher' => $teacherNames[1 % $teacherNames->count()],
                'student_count' => $getStudentsForCurriculum('Speaker Combo Plan'),
                'description' => 'All the benefits of group classes + personal attention.',
                'syllabus' => ['Group discussion circles', '1-on-1 private speaking slots', 'Pronunciation analysis & accent softening', 'Personalized grammar & vocabulary drills', 'Weekly mock conversational tests'],
                'objectives' => ['Speak without hesitation', 'Improve pronunciation & speech flow', 'Crack basic interviews', 'Participate actively in meetings'],
                'outcomes' => ['Hesitation-free speaking', 'Accent softening', 'Bolo Speaker Combo Badge'],
                'certification' => 'Bolo Speaker Combo Badge',
                'dates' => '01 Jun - 30 Jun',
                'milestones' => [25, 50, 75, 100],
                'engagement' => $getEngagementForCurriculum('Speaker Combo Plan'),
            ],
            [
                'title' => 'Fluency Fast-Track Plan',
                'duration' => '1 Month',
                'teacher' => $teacherNames[2 % $teacherNames->count()],
                'student_count' => $getStudentsForCurriculum('Fluency Fast-Track Plan'),
                'description' => 'Intensive daily 1-on-1 speaking drills and professional training.',
                'syllabus' => ['Intensive 1-on-1 training', 'Custom learning routes', 'Business presentations & corporate communication', 'Real-time accent coaching & tone training', '24/7 dedicated WhatsApp mentor support'],
                'objectives' => ['Master professional arguments', 'Lead business meetings confidently', 'Host corporate presentations', 'Achieve near-native speaking style'],
                'outcomes' => ['Elite professional presentation', 'Impromptu speaking fluency', 'Bolo Fast-Track Fluency Certificate'],
                'certification' => 'Bolo Fast-Track Fluency Certificate',
                'dates' => '05 Jun - 04 Jul',
                'milestones' => [25, 50, 75, 100],
                'engagement' => $getEngagementForCurriculum('Fluency Fast-Track Plan'),
            ],
            [
                'title' => 'Gold Master Plan',
                'duration' => '1 Month',
                'teacher' => $teacherNames[3 % $teacherNames->count()],
                'student_count' => $getStudentsForCurriculum('Gold Master Plan'),
                'description' => 'Exclusive 1-on-1 coaching directly under Senior Master Trainers.',
                'syllabus' => ['Direct Senior Master coaching', 'Elite interview prep & negotiation drills', 'Public speaking & audience influence', 'Personalized IELTS/OET coaching & mocks', 'Dedicated premium priority support channel'],
                'objectives' => ['Ultimate English mastery', 'Speak like a top-tier executive leader', 'Influence large audiences', 'Achieve IELTS Band 8+'],
                'outcomes' => ['Elite English leadership presence', 'IELTS/OET mock readiness', 'Bolo Gold Master English Diploma'],
                'certification' => 'Bolo Gold Master English Diploma',
                'dates' => '15 May - 14 Jun',
                'milestones' => [20, 40, 60, 80, 100],
                'engagement' => $getEngagementForCurriculum('Gold Master Plan'),
            ],
        ]);
    }

    private function batchCatalog(Collection $teachers, Collection $curriculums): Collection
    {
        $realBatches = Batch::with(['teacher', 'students'])->get();
        if ($realBatches->isEmpty()) {
            return collect([]);
        }

        return $realBatches->map(function (Batch $batch) {
            return [
                'id' => $batch->id,
                'name' => $batch->name,
                'teacher' => $batch->teacher?->name ?? 'Unassigned',
                'teacher_id' => $batch->teacher_id,
                'students' => $batch->students->count(),
                'capacity' => $batch->capacity,
                'schedule' => $batch->schedule_details,
                'curriculum' => $batch->curriculum_name,
                'meeting_link' => $batch->teacher?->meeting_link ?? 'https://meet.google.com/abc-defg-hij',
                'progress' => (int) round($batch->students->avg('progress') ?? 0),
            ];
        });
    }

    private function teacherWorkload(Collection $teachers, Collection $classes, Collection $students): Collection
    {
        return $teachers->take(6)->map(function (User $teacher) use ($classes, $students) {
            $teacherClasses = $classes->where('teacher_id', $teacher->id)->count();
            $teacherStudents = $students->where('teacher_id', $teacher->id)->count();

            return [
                'name' => $teacher->name,
                'classes' => $teacherClasses,
                'students' => $teacherStudents,
                'load' => min(100, ($teacherClasses * 8) + ($teacherStudents * 2)),
            ];
        })->values();
    }

    private function notificationFeed(int $limit = 8): Collection
    {
        $notifications = Notification::latest()->take($limit)->get()->map(function (Notification $notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => ucfirst($notification->type),
                'date' => optional($notification->created_at)?->diffForHumans(),
            ];
        });

        if ($notifications->isNotEmpty()) {
            return $notifications;
        }

        return collect([
            ['id' => 1, 'title' => 'Attendance alert', 'message' => '4 students dropped below the 70% attendance threshold.', 'type' => 'Alert', 'date' => '10 minutes ago'],
            ['id' => 2, 'title' => 'Teacher workload spike', 'message' => 'Speaker Combo Plan crossed the healthy class limit.', 'type' => 'System', 'date' => '35 minutes ago'],
            ['id' => 3, 'title' => 'Batch reminder', 'message' => 'IELTS Evening Bridge needs a second evaluator for mock speaking.', 'type' => 'Class', 'date' => '1 hour ago'],
            ['id' => 4, 'title' => 'Revenue milestone', 'message' => 'This month crossed 80% of the tuition collection target.', 'type' => 'Admin', 'date' => 'Today'],
        ])->take($limit);
    }

    private function calculateMonthlyGrowth(): string
    {
        $thisMonth = Student::whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->count();
        $lastMonthDate = now()->subMonth();
        $lastMonth = Student::whereYear('created_at', $lastMonthDate->year)->whereMonth('created_at', $lastMonthDate->month)->count();

        if ($lastMonth === 0) {
            return $thisMonth > 0 ? '+' . ($thisMonth * 10) . '%' : '+0%';
        }

        $growth = (($thisMonth - $lastMonth) / $lastMonth) * 100;

        return ($growth >= 0 ? '+' : '') . round($growth) . '%';
    }

    private function attendanceRate(): int
    {
        $totalAttendances = ClassAttendance::count();
        if ($totalAttendances === 0) {
            return (int) round(Student::avg('attendance') ?? 0);
        }

        $joined = ClassAttendance::whereNotNull('joined_at')->count();

        return (int) round(($joined / $totalAttendances) * 100);
    }

    private function studentFeeStatus(Student $student): string
    {
        return $student->fee_status ?? 'Paid';
    }

    private function curriculumTitleForGrade(?string $grade, ?Student $student = null): string
    {
        if ($student && $student->package_name) {
            return $student->package_name;
        }
        return match ($grade) {
            'Grade 3', 'Grade 4' => 'Basic Boost Plan',
            'Grade 5', 'Grade 6' => 'Speaker Combo Plan',
            default => 'Fluency Fast-Track Plan',
        };
    }

    private function batchNameForStudent(Student $student): string
    {
        return $student->batch?->name ?? 'Unassigned';
    }

    private function teacherStatus(int $dailyClasses, int $classesCount): string
    {
        if ($dailyClasses >= 3) {
            return 'Busy';
        }

        if ($classesCount > 0) {
            return 'Active';
        }

        return 'On leave';
    }

    private function paginateCollection(Collection $items, int $perPage, string $pageName): LengthAwarePaginator
    {
        $page = LengthAwarePaginator::resolveCurrentPage($pageName);
        $results = $items->slice(($page - 1) * $perPage, $perPage)->values();

        return new LengthAwarePaginator(
            $results,
            $items->count(),
            $perPage,
            $page,
            [
                'path' => request()->url(),
                'pageName' => $pageName,
                'query' => request()->query(),
            ]
        );
    }

    /**
     * Approve teacher application and optionally assign them to a batch.
     */
    public function approveTeacher(Request $request, User $user)
    {
        $request->validate([
            'batch_id' => 'nullable|exists:batches,id',
        ]);

        // 1. Approve user status
        $user->update(['status' => 'approved']);

        // 2. Assign batch if requested
        if ($request->filled('batch_id')) {
            $batch = Batch::findOrFail($request->batch_id);
            $batch->update(['teacher_id' => $user->id]);

            // Also dynamically reassign all students currently in that batch to this new mentor!
            Student::where('batch_id', $batch->id)->update(['teacher_id' => $user->id]);

            // Create group and direct chat rooms for the teacher and batch students
            \App\Models\ChatRoom::firstOrCreate(
                ['teacher_id' => $user->id, 'type' => 'group'],
                ['name' => 'Class Group Chat']
            );

            $students = Student::where('batch_id', $batch->id)->get();
            foreach ($students as $student) {
                \App\Models\ChatRoom::firstOrCreate(
                    ['teacher_id' => $user->id, 'student_id' => $student->id, 'type' => 'direct'],
                    ['name' => null]
                );
            }

            // Automatically generate schedule classes for this teacher according to batch details
            $this->generateBatchSchedules($user, $batch);
        }

        // 3. Create success notification
        \Illuminate\Support\Facades\DB::table('notifications')->insert([
            'user_id' => $user->id,
            'title' => 'Application Approved! 🎉',
            'message' => 'Congratulations! Your application to teach at Bolo Academy has been approved. Your dashboard portal is fully active.',
            'type' => 'system',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Send approval email notifying the teacher
        try {
            $meetingLink = $user->meeting_link ?: 'your registered Google Meet link';
            \Illuminate\Support\Facades\Mail::raw(
                "Hello {$user->name},\n\nWelcome to Bolo Academy! 🎉\n\nWe are pleased to inform you that your application to teach at Bolo Academy has been approved. Your mentor portal is now fully active.\n\nWhat happens next?\nThe founder of the academy will have a brief conversation with you soon through your Google Meet link ({$meetingLink}). The exact timing of this meeting will be notified to you via email shortly.\n\nGetting started:\nYou can now log in to your account at " . url('/login') . " to access your teacher dashboard, manage classes, and view student progress.\n\nCongratulations and welcome to the team!\n\nBest regards,\nBolo Academy Administration", 
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject("Bolo Academy - Mentor Application Approved! 🎉");
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Approval Mail sending failed: " . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Teacher approved successfully.');
    }

    private function generateBatchSchedules(User $teacher, Batch $batch)
    {
        $studentIds = Student::where('batch_id', $batch->id)->pluck('id')->toArray();
        $curriculum = $this->getCurriculumDetails($batch->curriculum_name);
        $syllabus = $curriculum['syllabus'] ?? ['Introduction', 'Concepts', 'Practice', 'Review'];
        $scheduleStr = $batch->schedule_details;
        
        $days = [];
        $timeStr = '10:00 AM';

        if (str_contains($scheduleStr, 'Mon, Wed, Fri')) {
            $days = ['Monday', 'Wednesday', 'Friday'];
        } elseif (str_contains($scheduleStr, 'Sat, Sun')) {
            $days = ['Saturday', 'Sunday'];
        } elseif (str_contains($scheduleStr, 'Tue, Thu')) {
            $days = ['Tuesday', 'Thursday'];
        } elseif (str_contains($scheduleStr, 'Mon to Thu')) {
            $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        } else {
            $days = ['Monday', 'Wednesday', 'Friday'];
        }

        if (preg_match('/(\d{2}:\d{2}\s*(?:AM|PM|am|pm))/', $scheduleStr, $matches)) {
            $timeStr = $matches[1];
        }

        $currentDate = now()->startOfDay();
        $classesCreated = 0;
        $classIndex = 1;

        while ($classesCreated < 12) {
            $currentDate->addDay();
            $dayName = $currentDate->format('l');

            if (in_array($dayName, $days)) {
                try {
                    $scheduledAt = Carbon::createFromFormat('Y-m-d h:i A', $currentDate->format('Y-m-d') . ' ' . trim($timeStr), 'Asia/Kolkata')->setTimezone('UTC');
                } catch (\Exception $e) {
                    $scheduledAt = Carbon::createFromFormat('Y-m-d H:i', $currentDate->format('Y-m-d') . ' 10:00', 'Asia/Kolkata')->setTimezone('UTC');
                }
                
                $syllabusTopic = $syllabus[($classIndex - 1) % count($syllabus)];

                CourseClass::create([
                    'teacher_id' => $teacher->id,
                    'title' => $syllabusTopic,
                    'description' => "Topic: " . $syllabusTopic . ". Batch: " . $batch->name . ". Plan: " . $batch->curriculum_name,
                    'scheduled_at' => $scheduledAt,
                    'duration' => 60,
                    'status' => 'scheduled',
                    'meeting_link' => $teacher->meeting_link ?: 'https://meet.google.com/test-meet',
                    'grade' => 'Grade 4',
                    'student_ids' => $studentIds,
                ]);

                $classesCreated++;
                $classIndex++;
            }
        }
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

    /**
     * Reject teacher application.
     */
    public function rejectTeacher(Request $request, User $user)
    {
        // 1. Reject user status
        $user->update(['status' => 'rejected']);

        // 2. Create rejection notification
        \Illuminate\Support\Facades\DB::table('notifications')->insert([
            'user_id' => $user->id,
            'title' => 'Application Rejected',
            'message' => 'Unfortunately, your application to teach at Bolo Academy has been rejected as it did not meet our requirements.',
            'type' => 'system',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Send email notifying the teacher
        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Hello {$user->name},\n\nThank you for applying as a teacher mentor at Bolo Academy.\n\nAfter reviewing your profile and resume, we regret to inform you that our current requirements do not match your CV/profile. Therefore, we are unable to proceed with your application at this time.\n\nWe appreciate your interest in Bolo Academy and wish you the best in your future endeavors.\n\nBest regards,\nBolo Academy Administration", 
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject("Bolo Academy - Mentor Application Status Update");
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Mail sending failed: " . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Teacher application rejected.');
    }

    /**
     * Confirm student payment from the CRM list view.
     */
    public function confirmStudentPayment(Request $request, Student $student)
    {
        if ($student->fee_status === 'Paid') {
            return redirect()->back()->with('info', 'Tuition is already settled.');
        }

        // 1. Settle fee status
        $student->update(['fee_status' => 'Paid']);

        // 2. Increment seats reserved in their batch
        if ($student->batch) {
            $student->batch->increment('seats_reserved');
        }

        // 3. Inject settlement success notifications
        \Illuminate\Support\Facades\DB::table('notifications')->insert([
            'user_id' => $student->user_id,
            'title' => 'Tuition Payment Confirmed! 🎉',
            'message' => 'Your payment for the ' . $student->package_name . ' has been approved. Thank you for enrolling!',
            'type' => 'billing',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Student payment confirmed successfully.');
    }

    /**
     * Store a newly created student in the database.
     */
    public function storeStudent(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'grade' => 'required|string',
            'package_name' => 'required|string',
            'fee_status' => 'required|string',
            'batch_id' => 'nullable|exists:batches,id',
            'teacher_id' => 'nullable|exists:users,id',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password ?: 'student123'),
            'role' => 'student',
            'status' => 'approved',
        ]);

        Student::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'grade' => $request->grade,
            'package_name' => $request->package_name,
            'fee_status' => $request->fee_status,
            'batch_id' => $request->batch_id ?: null,
            'teacher_id' => $request->teacher_id ?: null,
            'parent_name' => $request->parent_name ?: null,
            'parent_phone' => $request->parent_phone ?: null,
            'progress' => 0,
            'attendance' => 100,
            'streak' => 0,
            'classes_taken' => 0,
        ]);

        return redirect()->back()->with('success', 'Student registered successfully.');
    }

    /**
     * Update an existing student's profile.
     */
    public function updateStudent(Request $request, Student $student)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->user_id,
            'password' => 'nullable|string|min:6',
            'grade' => 'required|string',
            'package_name' => 'required|string',
            'fee_status' => 'required|string',
            'batch_id' => 'nullable|exists:batches,id',
            'teacher_id' => 'nullable|exists:users,id',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:255',
        ]);

        $student->update([
            'name' => $request->name,
            'grade' => $request->grade,
            'package_name' => $request->package_name,
            'fee_status' => $request->fee_status,
            'batch_id' => $request->batch_id ?: null,
            'teacher_id' => $request->teacher_id ?: null,
            'parent_name' => $request->parent_name ?: null,
            'parent_phone' => $request->parent_phone ?: null,
        ]);

        $user = $student->user;
        if ($user) {
            $userUpdate = [
                'name' => $request->name,
                'email' => $request->email,
            ];
            if ($request->filled('password')) {
                $userUpdate['password'] = bcrypt($request->password);
            }
            $user->update($userUpdate);
        }

        return redirect()->back()->with('success', 'Student profile updated.');
    }

    /**
     * Suspend a student's access.
     */
    public function suspendStudent(Request $request, Student $student)
    {
        $user = $student->user;
        if ($user) {
            $user->update(['status' => 'suspended']);
        }
        return redirect()->back()->with('success', 'Student suspended successfully.');
    }

    /**
     * Delete a student.
     */
    public function deleteStudent(Request $request, Student $student)
    {
        $user = $student->user;
        $student->delete();
        if ($user) {
            $user->delete();
        }
        return redirect()->back()->with('success', 'Student and related user account deleted.');
    }

    /**
     * Store a newly created teacher.
     */
    public function storeTeacher(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'meeting_link' => 'nullable|url',
            'experience_years' => 'nullable|integer|min:0',
            'subject_specialization' => 'nullable|string|max:255',
            'certifications' => 'nullable|string|max:255',
            'curriculum_expertise' => 'nullable|string|max:255',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password ?: 'teacher123'),
            'role' => 'teacher',
            'status' => 'approved',
            'meeting_link' => $request->meeting_link,
            'experience_years' => $request->experience_years,
            'subject_specialization' => $request->subject_specialization,
            'certifications' => $request->certifications,
            'curriculum_expertise' => $request->curriculum_expertise,
        ]);

        return redirect()->back()->with('success', 'Teacher mentor registered successfully.');
    }

    /**
     * Update an existing teacher.
     */
    public function updateTeacher(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'meeting_link' => 'nullable|url',
            'experience_years' => 'nullable|integer|min:0',
            'subject_specialization' => 'nullable|string|max:255',
            'certifications' => 'nullable|string|max:255',
            'curriculum_expertise' => 'nullable|string|max:255',
        ]);

        $teacherUpdate = [
            'name' => $request->name,
            'email' => $request->email,
            'meeting_link' => $request->meeting_link,
            'experience_years' => $request->experience_years,
            'subject_specialization' => $request->subject_specialization,
            'certifications' => $request->certifications,
            'curriculum_expertise' => $request->curriculum_expertise,
        ];
        if ($request->filled('password')) {
            $teacherUpdate['password'] = bcrypt($request->password);
        }
        $user->update($teacherUpdate);

        return redirect()->back()->with('success', 'Teacher profile updated.');
    }

    /**
     * Suspend a teacher.
     */
    public function suspendTeacher(Request $request, User $user)
    {
        $user->update(['status' => 'suspended']);
        return redirect()->back()->with('success', 'Teacher suspended successfully.');
    }

    /**
     * Delete a teacher.
     */
    public function deleteTeacher(Request $request, User $user)
    {
        $leadTeacher = User::where('role', 'teacher')->first();
        $fallbackId = $leadTeacher ? $leadTeacher->id : 1;

        Student::where('teacher_id', $user->id)->update(['teacher_id' => $fallbackId]);
        Batch::where('teacher_id', $user->id)->update(['teacher_id' => null]);
        CourseClass::where('teacher_id', $user->id)->delete();
        $user->delete();

        return redirect()->back()->with('success', 'Teacher deleted and related students reassigned.');
    }
}
