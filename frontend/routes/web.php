<?php
use App\Http\Controllers\AdminPortalController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OnboardingController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Controllers\LiveClassController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

Route::get("/", function () {
    return Inertia::render("Welcome", [
        "canLogin" => Route::has("login"),
        "canRegister" => Route::has("register"),
        "laravelVersion" => Application::VERSION,
        "phpVersion" => PHP_VERSION,
    ]);
});

// Public Onboarding Routes
Route::get('/api/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()->toIso8601String()]);
});
Route::get('/api/batches', [OnboardingController::class, 'getAvailableBatches'])->name('api.batches');
Route::post('/student/checkout', [OnboardingController::class, 'checkoutStudent'])->name('student.checkout');
Route::post('/teacher/apply', [OnboardingController::class, 'applyTeacher'])->name('teacher.apply');
Route::post('/google-auth/send-code', [OnboardingController::class, 'sendVerificationCode'])->name('google-auth.send-code');
Route::post('/google-auth/verify-code', [OnboardingController::class, 'verifyVerificationCode'])->name('google-auth.verify-code');

Route::get("/dashboard", function (\Illuminate\Http\Request $request) {
    if (Auth::user()->isStudent()) {
        return redirect()->route('student.dashboard');
    }
    if (Auth::user()->isAdmin()) {
        if ($request->header('X-Inertia')) {
            return Inertia::location(route('admin.dashboard'));
        }
        return redirect()->route('admin.dashboard');
    }
    return app(App\Http\Controllers\TeacherDashboardController::class)->index();
})->middleware(["auth", "verified"])->name("dashboard");

Route::middleware("auth")->group(function () {
    Broadcast::routes(["middleware" => ["auth"]]);

    Route::get("/profile", [ProfileController::class, "edit"])->name("profile.edit");
    Route::patch("/profile", [ProfileController::class, "update"])->name("profile.update");
    Route::delete("/profile", [ProfileController::class, "destroy"])->name("profile.destroy");

    Route::get("/teacher/create/{type}", [App\Http\Controllers\AIController::class, "creator"])->name("teacher.create");
    Route::post("/teacher/generate", [App\Http\Controllers\AIController::class, "generate"])->name("teacher.generate");
    Route::post("/teacher/save-creation", [App\Http\Controllers\AIController::class, "save"])->name("teacher.save");
    Route::get("/api/creations", [App\Http\Controllers\AIController::class, "getCreations"])->name("api.creations");
    Route::delete("/api/creations/{id}", [App\Http\Controllers\AIController::class, "destroy"])->name("api.creations.destroy");

    Route::apiResource("/api/classes", App\Http\Controllers\ClassController::class);
    Route::get("/api/feedback", [App\Http\Controllers\FeedbackController::class, 'index'])->name("api.feedback");
    Route::get("/api/students/stats", [App\Http\Controllers\StudentController::class, 'stats']);
    Route::get("/api/students/assignments", [App\Http\Controllers\StudentController::class, 'assignments']);
    Route::post("/api/students/assignments", [App\Http\Controllers\StudentController::class, 'storeAssignment']);
    Route::get("/api/students/quiz-scores", [App\Http\Controllers\StudentController::class, 'quizScores']);
    Route::post("/api/students/assignments/{id}/status", [App\Http\Controllers\StudentController::class, 'updateAssignmentStatus']);
    Route::post("/api/students/{student}/feedback", [App\Http\Controllers\StudentController::class, 'storeFeedback']);
    Route::apiResource("/api/students", App\Http\Controllers\StudentController::class);
    Route::apiResource("/api/tickets", App\Http\Controllers\SupportTicketController::class);
    Route::get('/api/tickets', [App\Http\Controllers\SupportTicketController::class, 'index']);
    Route::post('/api/tickets', [App\Http\Controllers\SupportTicketController::class, 'store']);
    
    Route::get('/api/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/api/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::get("/api/chat/rooms", [App\Http\Controllers\ChatRoomController::class, 'index']);
    Route::get("/api/chat/rooms/{roomId}/messages", [App\Http\Controllers\ChatRoomController::class, 'messages']);
    Route::post("/api/chat/messages", [App\Http\Controllers\ChatRoomController::class, 'sendMessage']);
    Route::delete("/api/chat/messages/{id}", [App\Http\Controllers\ChatRoomController::class, 'deleteMessage']);

    Route::get("/teacher/live", [LiveClassController::class, "teacherView"])->name("teacher.live");
    Route::get("/teacher/chat", function() {
        $user = Auth::user();
        if ($user && $user->role === 'teacher' && ($user->status === 'pending' || $user->status === 'rejected')) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Teacher/GroupChat');
    })->name("teacher.chat");
    Route::get("/student/live/{roomId}", [LiveClassController::class, "studentView"])->name("student.live");
    
    // Student Dashboard Routes
    Route::get("/student/dashboard", [App\Http\Controllers\StudentDashboardController::class, 'index'])->name("student.dashboard");
    Route::get("/api/student/dashboard-data", [App\Http\Controllers\StudentDashboardController::class, 'getDashboardData']);
    Route::get("/api/student/live-status", [App\Http\Controllers\StudentDashboardController::class, 'getLiveStatus']);
    Route::get("/api/student/ebooks", [App\Http\Controllers\StudentDashboardController::class, 'getEbooks']);
    Route::get("/api/student/assignments", [App\Http\Controllers\StudentDashboardController::class, 'getAssignments']);
    Route::post("/api/student/assignments/{id}/submit", [App\Http\Controllers\StudentDashboardController::class, 'submitAssignment']);
    Route::get("/api/student/progress", [App\Http\Controllers\StudentDashboardController::class, 'getProgress']);
    Route::post("/api/student/tickets", [App\Http\Controllers\StudentDashboardController::class, 'storeSupportTicket']);
    Route::get("/api/student/teachers", [App\Http\Controllers\StudentDashboardController::class, 'getTeachers']);
    Route::get("/api/student/classes", [App\Http\Controllers\StudentDashboardController::class, 'getClasses']);
    Route::get("/api/student/classes/{id}/join", [App\Http\Controllers\StudentDashboardController::class, 'getJoinUrl']);
    Route::post("/student/payment/settle", [OnboardingController::class, 'settlePayment'])->name("student.payment.settle");

    Route::post("/api/live/{roomId}/chat", [LiveClassController::class, "sendChat"])->name("live.chat");
    Route::post("/api/live/{roomId}/reaction", [LiveClassController::class, "sendReaction"])->name("live.reaction");
    Route::post("/api/live/{roomId}/polls", [LiveClassController::class, "createPoll"])->name("live.polls.create");
    Route::post("/api/live/{roomId}/polls/close", [LiveClassController::class, "closePoll"])->name("live.polls.close");
    Route::post("/api/live/{roomId}/polls/vote", [LiveClassController::class, "votePoll"])->name("live.polls.vote");
    Route::post("/api/live/{roomId}/quiz/generate", [LiveClassController::class, "generateQuiz"])->name("live.quiz.generate");
    Route::post("/api/live/{roomId}/quiz/submit", [LiveClassController::class, "submitQuizAnswers"])->name("live.quiz.submit");
    Route::post("/api/live/{roomId}/quiz/results", [LiveClassController::class, "broadcastQuizResults"])->name("live.quiz.results");
    Route::post("/api/live/{roomId}/ping", [LiveClassController::class, "studentPing"])->name("live.ping");
    Route::get("/api/live/{roomId}/students", [LiveClassController::class, "getActiveStudents"])->name("live.students");
    Route::post("/api/live/{roomId}/ban", [LiveClassController::class, "banStudent"])->name("live.ban");
    Route::post("/api/live/{roomId}/agora/token", [LiveClassController::class, "agoraToken"])->name("live.agora.token");
    Route::post("/api/live/{roomId}/end", [LiveClassController::class, "endClass"])->name("live.end");
    Route::post("/api/teacher/settings", [App\Http\Controllers\ProfileController::class, "updateSettings"]);
    Route::get("/api/teacher/dashboard-data", [App\Http\Controllers\TeacherDashboardController::class, 'getDashboardData']);

    Route::middleware(['verified', EnsureUserIsAdmin::class])
        ->prefix('admin')
        ->name('admin.')
        ->controller(AdminPortalController::class)
        ->group(function () {
            Route::get('/dashboard', 'dashboard')->name('dashboard');
            Route::get('/users', 'users')->name('users');
            Route::post('/teachers/{user}/approve', 'approveTeacher')->name('teachers.approve');
            Route::post('/teachers/{user}/reject', 'rejectTeacher')->name('teachers.reject');
            Route::post('/students/{student}/confirm-payment', 'confirmStudentPayment')->name('students.confirm-payment');
            
            // Student CRUD Operations
            Route::post('/students', 'storeStudent')->name('students.store');
            Route::post('/students/{student}/update', 'updateStudent')->name('students.update');
            Route::get('/students/{student}/suspend', 'suspendStudent')->name('students.suspend');
            Route::get('/students/{student}/delete', 'deleteStudent')->name('students.delete');
            
            // Teacher CRUD Operations
            Route::post('/teachers', 'storeTeacher')->name('teachers.store');
            Route::post('/teachers/{user}/update', 'updateTeacher')->name('teachers.update');
            Route::get('/teachers/{user}/suspend', 'suspendTeacher')->name('teachers.suspend');
            Route::get('/teachers/{user}/delete', 'deleteTeacher')->name('teachers.delete');
            Route::get('/curriculum', 'curriculum')->name('curriculum');
            Route::post('/curriculum', 'storeCurriculum')->name('curriculum.store');
            Route::post('/curriculum/{id}/update', 'updateCurriculum')->name('curriculum.update');
            Route::get('/curriculum/{id}/duplicate', 'duplicateCurriculum')->name('curriculum.duplicate');
            Route::get('/curriculum/{id}/archive', 'archiveCurriculum')->name('curriculum.archive');
            Route::get('/curriculum/export', 'exportCurriculumAnalytics')->name('curriculum.export');

            Route::get('/batches', 'batches')->name('batches');
            Route::post('/batches', 'storeBatch')->name('batches.store');
            Route::post('/batches/{id}/update', 'updateBatch')->name('batches.update');
            Route::post('/batches/{id}/assign', 'assignStudents')->name('batches.assign');
            Route::get('/batches/export', 'exportBatches')->name('batches.export');

            Route::get('/schedules', 'schedules')->name('schedules');
            Route::post('/schedules', 'storeSchedule')->name('schedules.store');
            Route::post('/schedules/{id}/reschedule', 'rescheduleSchedule')->name('schedules.reschedule');
            Route::get('/schedules/{id}/cancel', 'cancelSchedule')->name('schedules.cancel');

            Route::get('/reports', 'reports')->name('reports');
            Route::get('/reports/download', 'downloadReport')->name('reports.download');

            Route::get('/reviews', 'reviews')->name('reviews');
            Route::get('/reviews/feedback/{id}/approve', 'approveFeedback')->name('reviews.feedback.approve');
            Route::get('/reviews/feedback/{id}/hide', 'hideFeedback')->name('reviews.feedback.hide');
            Route::get('/reviews/tickets/{id}/resolve', 'resolveTicket')->name('reviews.tickets.resolve');
            Route::get('/reviews/tickets/{id}/escalate', 'escalateTicket')->name('reviews.tickets.escalate');

            Route::get('/notifications', 'notifications')->name('notifications');
            Route::post('/notifications', 'storeNotification')->name('notifications.store');
            Route::get('/notifications/{id}/archive', 'archiveNotification')->name('notifications.archive');

            Route::get('/settings', 'settings')->name('settings');
            Route::post('/settings', 'storeSettings')->name('settings.store');
            Route::post('/settings/toggle', 'toggleSetting')->name('settings.toggle');
        });
});

require __DIR__."/auth.php";
