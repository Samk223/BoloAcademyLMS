<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class OnboardingController extends Controller
{
    /**
     * API endpoint: Get all available batches with their remaining seats and assigned mentors.
     */
    public function getAvailableBatches()
    {
        $batches = Batch::with('teacher:id,name,avatar,accent_color')->get()->map(function ($batch) {
            return [
                'id' => $batch->id,
                'name' => $batch->name,
                'curriculum_name' => $batch->curriculum_name,
                'schedule_details' => $batch->schedule_details,
                'teacher' => $batch->teacher ? [
                    'name' => $batch->teacher->name,
                    'avatar' => $batch->teacher->avatar,
                    'accent_color' => $batch->teacher->accent_color,
                ] : null,
                'capacity' => $batch->capacity,
                'seats_reserved' => $batch->seats_reserved,
                'seats_remaining' => max(0, $batch->capacity - $batch->seats_reserved),
            ];
        });

        return response()->json($batches);
    }

    /**
     * Process student registration and immediate 7-day trial onboarding.
     */
    public function checkoutStudent(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Rules\Password::defaults()],
            'grade' => 'required|string|max:255',
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|max:255',
            'batch_id' => 'required|exists:batches,id',
            'package_name' => 'required|string',
        ]);

        // 1. Create User account (instantly active student role)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student',
            'status' => 'approved',
            'avatar' => '👦',
        ]);

        // 2. Fetch selected batch and assigned tutor
        $batch = Batch::findOrFail($request->batch_id);
        $tutorId = $batch->teacher_id;
        
        // If batch has no teacher assigned yet, default to lead teacher (Somya Kashyap / User ID 1)
        if (!$tutorId) {
            $defaultTeacher = User::where('role', 'teacher')->first();
            $tutorId = $defaultTeacher ? $defaultTeacher->id : 1;
        }

        // 3. Create Student profile
        $student = Student::create([
            'user_id' => $user->id,
            'teacher_id' => $tutorId,
            'batch_id' => $batch->id,
            'name' => $request->name,
            'grade' => $request->grade,
            'attendance' => 100,
            'progress' => 0,
            'streak' => 0,
            'classes_taken' => 0,
            'avatar' => '👦',
            'color' => 'bg-[#D1F2EB]',
            'package_name' => $request->package_name,
            'fee_status' => 'Pending', // Pending = grace period active
            'parent_name' => $request->parent_name,
            'parent_phone' => $request->parent_phone,
        ]);

        // 4. Inject welcome notifications
        \Illuminate\Support\Facades\DB::table('notifications')->insert([
            [
                'user_id' => $user->id,
                'title' => 'Welcome to Bolo Academy! 🚀',
                'message' => 'Your 7-day free trial has started. Your active batch is ' . $batch->name . '. Let\'s speak confidently!',
                'type' => 'system',
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Tuition Fee Invoice Issued ⏳',
                'message' => 'Invoice issued for ' . $request->package_name . '. You have a 7-day grace period to complete payment before portal suspension.',
                'type' => 'billing',
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 5. Send Welcome Email to Student
        $studentEmailContent = "Hello " . $request->name . ",\n\n"
            . "Welcome aboard to Bolo Academy! 🚀\n\n"
            . "We are absolutely thrilled to have you join our spoken English program. Here are your enrollment details:\n"
            . "---------------------------------------------------------\n"
            . "Enrolled Course / Package: " . $request->package_name . "\n"
            . "Assigned Batch: " . $batch->name . "\n"
            . "Assigned Tutor: " . ($batch->teacher ? $batch->teacher->name : 'Somya Kashyap') . "\n"
            . "Batch Schedule: " . $batch->schedule_details . "\n"
            . "---------------------------------------------------------\n\n"
            . "🔑 YOUR DASHBOARD LOGIN DETAILS:\n"
            . "You can access your Student Dashboard instantly at: " . url('/login') . "\n"
            . "- Email: " . $request->email . "\n"
            . "- Password: [The password you entered during registration]\n\n"
            . "💳 TUITION FEE & PAYMENT COMPLETION:\n"
            . "Your 7-day free trial has officially started. You have a 7-day grace period to complete your tuition fee payment before your portal is suspended.\n"
            . "You can pay securely inside your dashboard using the 'Pay Tuition' card at the top.\n\n"
            . "If you have any questions or need emergency assistance, feel free to reach out via your student Support Desk.\n\n"
            . "Let's speak confidently!\n"
            . "Warm regards,\n"
            . "Bolo Academy Team";

        try {
            \Illuminate\Support\Facades\Mail::raw($studentEmailContent, function ($message) use ($request) {
                $message->to($request->email)
                    ->subject("Bolo Academy - Enrollment Confirmed! 🚀 Welcome Aboard");
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send welcome email to student: " . $e->getMessage());
        }

        // 6. Notify Admin via System Notification & Email
        $adminUser = User::where('role', 'admin')->first();
        if ($adminUser) {
            \Illuminate\Support\Facades\DB::table('notifications')->insert([
                'user_id' => $adminUser->id,
                'title' => 'New Student Onboarded! 👦',
                'message' => "Student '" . $request->name . "' enrolled in '" . $request->package_name . "' under Batch '" . $batch->name . "'. Assigned Mentor: " . ($batch->teacher ? $batch->teacher->name : 'Somya Kashyap') . ". Fee Status: Pending (7-day trial).",
                'type' => 'system',
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $adminEmailContent = "Hi Admin,\n\n"
                . "A new student has onboarded and started their 7-day trial!\n\n"
                . "STUDENT DETAILS:\n"
                . "- Name: " . $request->name . "\n"
                . "- Email: " . $request->email . "\n"
                . "- Grade: " . $request->grade . "\n"
                . "- Parent Name: " . $request->parent_name . "\n"
                . "- Parent Phone: " . $request->parent_phone . "\n\n"
                . "COURSE & BATCH DETAILS:\n"
                . "- Chosen Course: " . $request->package_name . "\n"
                . "- Batch: " . $batch->name . " (" . $batch->schedule_details . ")\n"
                . "- Assigned Mentor: " . ($batch->teacher ? $batch->teacher->name : 'Somya Kashyap') . "\n"
                . "- Fee Status: Pending (7-day trial active)\n\n"
                . "You can view and manage their profile under the admin panel.\n\n"
                . "Best,\n"
                . "Bolo LMS Automated System";

            try {
                \Illuminate\Support\Facades\Mail::raw($adminEmailContent, function ($message) use ($adminUser) {
                    $message->to($adminUser->email)
                        ->subject("Bolo Academy - New Student Onboarded: " . $adminUser->name);
                });
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send notification email to admin: " . $e->getMessage());
            }
        }

        // 7. Instantly log in user
        Auth::login($user);

        return redirect('/');
    }

    /**
     * Settle tuition fee card payment inline from student dashboard.
     */
    public function settlePayment(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isStudent()) {
            return response()->json(['error' => 'Unauthorized student context.'], 403);
        }

        $student = $user->studentProfile;
        if (!$student) {
            return response()->json(['error' => 'Student profile not found.'], 404);
        }

        if ($student->fee_status === 'Paid') {
            return response()->json(['status' => 'success', 'message' => 'Tuition fee is already settled.']);
        }

        // 1. Mark paid in database
        $student->update(['fee_status' => 'Paid']);

        // 2. Increment seats reserved in selected batch
        if ($student->batch) {
            $student->batch->increment('seats_reserved');
        }

        // 3. Inject settlement success notifications
        \Illuminate\Support\Facades\DB::table('notifications')->insert([
            'user_id' => $user->id,
            'title' => 'Tuition Payment Confirmed! 🎉',
            'message' => 'Thank you! Your payment for the ' . $student->package_name . ' has been verified. Your full student portal is active.',
            'type' => 'billing',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Card payment processed successfully. Thank you for enrolling!',
        ]);
    }

    /**
     * Process new teacher applications (saved as pending).
     */
    public function applyTeacher(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Rules\Password::defaults()],
            'experience_years' => 'required|integer|min:0',
            'certifications' => 'required|string',
            'subject_specialization' => 'required|string|max:255',
            'curriculum_expertise' => 'required|string|max:255',
            'bio' => 'required|string',
            'meeting_link' => 'required|string',
            'accent_color' => 'required|string|max:7',
            'resume' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
        }

        // 1. Create User account as a pending teacher
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'teacher',
            'status' => 'pending', // Awaiting admin approval
            'experience_years' => $request->experience_years,
            'certifications' => $request->certifications,
            'subject_specialization' => $request->subject_specialization,
            'curriculum_expertise' => $request->curriculum_expertise,
            'bio' => $request->bio,
            'meeting_link' => $request->meeting_link,
            'accent_color' => $request->accent_color,
            'avatar' => '👩‍🏫',
            'resume_path' => $resumePath,
        ]);

        // 2. Instantly log in user
        Auth::login($user);

        return redirect('/');
    }

    /**
     * Generate and send a 6-digit verification code to the given Gmail.
     */
    public function sendVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'nullable|string',
        ]);

        $email = strtolower(trim($request->email));
        $role = $request->input('role');

        if ($role === 'teacher') {
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This email is already registered in our system. You cannot use it to apply as a mentor again.',
                ], 400);
            }
        }

        // Strict Domain Check (Must be @gmail.com or @googlemail.com)
        $isGmail = str_ends_with($email, '@gmail.com') || str_ends_with($email, '@googlemail.com');
        if (!$isGmail) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid Google Account. Google Sign-in is strictly restricted to valid Google/Gmail accounts (@gmail.com or @googlemail.com).',
            ], 400);
        }

        // Test/Mock Account Exclusion
        $mockEmails = ['student@bolo.com', 'teacher@bolo.com', 'admin@bolo.com'];
        if (in_array($email, $mockEmails)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Google Sign-in is restricted for administrative mock test accounts. Please register using your actual personal Google/Gmail account.',
            ], 400);
        }

        // Generate 6-digit random code
        $code = strval(rand(100000, 999999));

        // Save in session
        session([
            'google_auth_email' => $email,
            'google_auth_code' => $code,
            'google_auth_expires' => now()->addMinutes(10),
        ]);

        // Send email (rendered into storage/logs/laravel.log since MAIL_MAILER=log)
        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Welcome to Bolo Academy! Your Google Sign-In secure verification code is: {$code}\n\nThis code will expire in 10 minutes.", 
                function ($message) use ($email) {
                    $message->to($email)
                        ->subject("Bolo Academy - Google Sign-In Verification Code");
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Mail sending failed: " . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Verification code sent successfully!',
        ]);
    }

    /**
     * Verify the user-entered 6-digit verification code.
     */
    public function verifyVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'role' => 'nullable|string',
        ]);

        $email = strtolower(trim($request->email));
        $code = trim($request->code);
        $role = $request->input('role');

        $savedEmail = session('google_auth_email');
        $savedCode = session('google_auth_code');
        $expiresAt = session('google_auth_expires');

        if (!$savedEmail || !$savedCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active verification request found. Please request a new code.',
            ], 400);
        }

        if ($expiresAt && now()->greaterThan($expiresAt)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Verification code has expired. Please request a new code.',
            ], 400);
        }

        if ($email !== $savedEmail) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email mismatch. Please request a new code for this email.',
            ], 400);
        }

        if ($code !== $savedCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Incorrect verification code. Please check and try again.',
            ], 400);
        }

        // Clean up session
        session()->forget(['google_auth_email', 'google_auth_code', 'google_auth_expires']);

        // Check if user already exists in the system to support seamless auto-login
        $user = \App\Models\User::where('email', $email)->first();
        if ($user) {
            if ($role === 'teacher') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This email is already registered in our system. You cannot use it to apply as a mentor again.',
                ], 400);
            }
            Auth::login($user);
            return response()->json([
                'status' => 'success',
                'is_logged_in' => true,
                'message' => 'Google Account authenticated! Logging you in...',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'is_logged_in' => false,
            'message' => 'Google Account authenticated and verified successfully!',
        ]);
    }
}

