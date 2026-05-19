<?php
namespace App\Http\Controllers;

use App\Events\LiveChatMessageSent;
use App\Events\LivePollClosed;
use App\Events\LivePollCreated;
use App\Events\LivePollVoted;
use App\Events\LiveQuizSent;
use App\Events\LiveQuizAnswerSubmitted;
use App\Events\LiveQuizResultsBroadcasted;
use App\Events\LiveStudentKicked;
use App\Events\LiveReactionSent;
use App\Services\Agora\RtcTokenBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Illuminate\Support\Str;

class LiveClassController extends Controller
{
    public function teacherView(Request $request)
    {
        $user = auth()->user();
        if ($user && $user->role === 'teacher' && ($user->status === 'pending' || $user->status === 'rejected')) {
            return redirect()->route('dashboard');
        }

        $roomId = $request->query("room", "BOLO-" . strtoupper(Str::random(6)));
        $this->rememberLiveRoom($request, $roomId);

        // Find or create active live class session in database
        $classQuery = \App\Models\CourseClass::where('meeting_link', $roomId);
        if (is_numeric($roomId)) {
            $classQuery->orWhere('id', (int) $roomId);
        }
        $class = $classQuery->first();

        if ($class) {
            $class->update([
                'status' => 'live',
                'meeting_link' => $roomId,
            ]);
        } else {
            // Spontaneous live class!
            \App\Models\CourseClass::updateOrCreate(
                ['meeting_link' => $roomId],
                [
                    'teacher_id' => auth()->id() ?? 1,
                    'title' => 'Spontaneous Live Class',
                    'description' => 'Join the teacher in a live learning session!',
                    'scheduled_at' => now(),
                    'duration' => 60,
                    'status' => 'live',
                    'grade' => null, // null targets all grades so any student can join
                ]
            );
        }

        $studentJoinUrl = URL::temporarySignedRoute(
            "student.live",
            now()->addHours(8),
            ["roomId" => $roomId],
            false
        );

        return Inertia::render("Teacher/LiveClass", [
            "roomId" => $roomId,
            "userName" => auth()->user()->name ?? "Teacher",
            "userId" => (string) auth()->id(),
            "studentJoinUrl" => $request->getSchemeAndHttpHost().'/'.ltrim($studentJoinUrl, '/'),
        ]);
    }

    public function studentView(Request $request, $roomId)
    {
        abort_unless($request->hasValidSignature(false), 403);
        $this->rememberLiveRoom($request, $roomId);

        $user = auth()->user();
        if ($user && $user->isStudent() && $user->studentProfile) {
            $class = \App\Models\CourseClass::where('meeting_link', $roomId)->first();
            if ($class) {
                $attendance = \App\Models\ClassAttendance::where('class_id', $class->id)
                    ->where('student_id', $user->studentProfile->id)
                    ->first();

                if ($attendance && $attendance->is_banned) {
                    abort(403, 'You have been banned from this live class by the teacher.');
                }

                \App\Models\ClassAttendance::updateOrCreate(
                    ['class_id' => $class->id, 'student_id' => $user->studentProfile->id],
                    ['joined_at' => now()]
                );
            }
        }

        return Inertia::render("Student/LiveClass", [
            "roomId" => $roomId,
            "userName" => auth()->user()->name ?? "Student",
            "userId" => (string) auth()->id(),
        ]);
    }

    public function sendChat(Request $request, string $roomId)
    {
        $this->authorizeLiveRoomAccess($request, $roomId);

        $data = $request->validate([
            'text' => ['required', 'string', 'max:1000'],
        ]);

        $message = [
            'id' => (string) Str::uuid(),
            'text' => $data['text'],
            'user' => [
                'id' => (string) (auth()->id() ?? '0'),
                'name' => auth()->user()->name ?? 'User',
            ],
            'ts' => now()->toIso8601String(),
        ];

        broadcast(new LiveChatMessageSent($roomId, $message))->toOthers();

        return response()->json(['ok' => true, 'message' => $message]);
    }

    public function sendReaction(Request $request, string $roomId)
    {
        $this->authorizeLiveRoomAccess($request, $roomId);

        $data = $request->validate([
            'emoji' => ['required', 'string', 'max:16'],
        ]);

        $reaction = [
            'id' => (string) Str::uuid(),
            'emoji' => $data['emoji'],
            'user' => [
                'id' => (string) (auth()->id() ?? '0'),
                'name' => auth()->user()->name ?? 'User',
            ],
            'ts' => now()->toIso8601String(),
        ];

        broadcast(new LiveReactionSent($roomId, $reaction))->toOthers();

        return response()->json(['ok' => true, 'reaction' => $reaction]);
    }

    public function createPoll(Request $request, string $roomId)
    {
        $this->authorizeLiveRoomAccess($request, $roomId);

        $data = $request->validate([
            'question' => ['required', 'string', 'max:200'],
            'options' => ['required', 'array', 'min:2', 'max:6'],
            'options.*' => ['required', 'string', 'max:80'],
        ]);

        $poll = [
            'id' => (string) Str::uuid(),
            'question' => $data['question'],
            'options' => array_values(array_map(fn ($o) => ['id' => (string) Str::uuid(), 'label' => $o, 'votes' => 0], $data['options'])),
            'createdBy' => [
                'id' => (string) (auth()->id() ?? '0'),
                'name' => auth()->user()->name ?? 'Teacher',
            ],
            'ts' => now()->toIso8601String(),
        ];

        broadcast(new LivePollCreated($roomId, $poll))->toOthers();

        return response()->json(['ok' => true, 'poll' => $poll]);
    }

    public function closePoll(Request $request, string $roomId)
    {
        $this->authorizeLiveRoomAccess($request, $roomId);

        $data = $request->validate([
            'pollId' => ['required', 'string'],
            'results' => ['nullable', 'array'],
        ]);

        $poll = [
            'id' => $data['pollId'],
            'results' => $data['results'] ?? [],
            'closedBy' => [
                'id' => (string) (auth()->id() ?? '0'),
                'name' => auth()->user()->name ?? 'Teacher',
            ],
            'ts' => now()->toIso8601String(),
        ];

        broadcast(new LivePollClosed($roomId, $poll))->toOthers();

        return response()->json(['ok' => true, 'poll' => $poll]);
    }

    public function votePoll(Request $request, string $roomId)
    {
        $this->authorizeLiveRoomAccess($request, $roomId);

        $data = $request->validate([
            'pollId' => ['required', 'string'],
            'optionId' => ['required', 'string'],
        ]);

        $vote = [
            'pollId' => $data['pollId'],
            'optionId' => $data['optionId'],
            'user' => [
                'id' => (string) (auth()->id() ?? '0'),
                'name' => auth()->user()->name ?? 'Student',
            ],
            'ts' => now()->toIso8601String(),
        ];

        broadcast(new LivePollVoted($roomId, $vote))->toOthers();

        return response()->json(['ok' => true, 'vote' => $vote]);
    }

    public function generateQuiz(Request $request, string $roomId)
    {
        $this->authorizeLiveRoomAccess($request, $roomId);

        $data = $request->validate([
            'topic' => ['required', 'string', 'max:120'],
            'count' => ['nullable', 'integer', 'min:1', 'max:10'],
            'level' => ['nullable', 'string', 'max:30'],
        ]);

        $count = (int) ($data['count'] ?? 5);
        $level = $data['level'] ?? 'easy';

        $apiKey = config('services.gemini.key');
        $decoded = null;

        if ($apiKey) {
            $prompt = "Generate a short live MCQ quiz for students.\n".
                "Topic: {$data['topic']}\n".
                "Difficulty: {$level}\n".
                "Number of questions: {$count}\n\n".
                "Return ONLY strict JSON with this shape:\n".
                "{ \"title\": string, \"questions\": [ { \"id\": string, \"q\": string, \"options\": [ { \"id\": string, \"text\": string } ], \"answerId\": string } ] }\n".
                "Use short questions and options. Do not wrap the JSON in markdown.";

            try {
                $response = Http::withoutVerifying()
                    ->timeout(25)
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=".$apiKey, [
                        'contents' => [
                            ['role' => 'user', 'parts' => [['text' => $prompt]]],
                        ],
                        'generationConfig' => [
                            'temperature' => 0.6,
                            'maxOutputTokens' => 2048,
                        ],
                    ]);

                $raw = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? null;
                $decoded = $raw ? $this->decodeQuizJson($raw) : null;
            } catch (\Throwable $e) {
                $decoded = null;
            }
        }

        $decoded = $this->normalizeQuiz($decoded, $data['topic'], $count);

        $quiz = [
            'id' => (string) Str::uuid(),
            'title' => $decoded['title'] ?? ('Live Quiz: '.$data['topic']),
            'questions' => $decoded['questions'],
            'topic' => $data['topic'],
            'ts' => now()->toIso8601String(),
        ];

        broadcast(new LiveQuizSent($roomId, $quiz))->toOthers();

        return response()->json(['ok' => true, 'quiz' => $quiz]);
    }

    public function submitQuizAnswers(Request $request, $roomId)
    {
        $quizId = $request->input('quizId');
        $studentName = $request->input('studentName') ?: 'Anonymous student';
        $score = $request->input('score') ?: ['correct' => 0, 'total' => 0];

        broadcast(new LiveQuizAnswerSubmitted($roomId, $quizId, $studentName, $score))->toOthers();

        return response()->json(['ok' => true]);
    }

    public function broadcastQuizResults(Request $request, $roomId)
    {
        $quizId = $request->input('quizId');
        $results = $request->input('results') ?: [];

        broadcast(new LiveQuizResultsBroadcasted($roomId, $quizId, $results))->toOthers();

        return response()->json(['ok' => true]);
    }

    private function decodeQuizJson(string $raw): ?array
    {
        $raw = trim($raw);
        $raw = preg_replace('/^```(?:json)?\s*/i', '', $raw);
        $raw = preg_replace('/\s*```$/', '', $raw);

        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        $start = strpos($raw, '{');
        $end = strrpos($raw, '}');
        if ($start === false || $end === false || $end <= $start) {
            return null;
        }

        $decoded = json_decode(substr($raw, $start, $end - $start + 1), true);

        return is_array($decoded) ? $decoded : null;
    }

    private function normalizeQuiz(?array $decoded, string $topic, int $count): array
    {
        if (!is_array($decoded) || empty($decoded['questions']) || !is_array($decoded['questions'])) {
            return $this->fallbackQuiz($topic, $count);
        }

        $questions = array_slice($decoded['questions'], 0, $count);
        $questions = array_map(function ($question, int $index) use ($topic) {
            $options = $question['options'] ?? [];
            $options = array_values(array_filter($options, fn ($option) => isset($option['text']) || isset($option['label'])));
            if (count($options) < 2) {
                $options = [
                    ['id' => 'a', 'text' => $topic],
                    ['id' => 'b', 'text' => 'Not sure'],
                    ['id' => 'c', 'text' => 'None of these'],
                ];
            }

            $options = array_slice(array_map(fn ($option, int $optionIndex) => [
                'id' => (string) ($option['id'] ?? chr(97 + $optionIndex)),
                'text' => (string) ($option['text'] ?? $option['label']),
            ], $options, array_keys($options)), 0, 4);

            return [
                'id' => (string) ($question['id'] ?? 'q'.($index + 1)),
                'q' => (string) ($question['q'] ?? $question['question'] ?? "Question about {$topic}?"),
                'options' => $options,
                'answerId' => (string) ($question['answerId'] ?? $options[0]['id']),
            ];
        }, $questions, array_keys($questions));

        return [
            'title' => (string) ($decoded['title'] ?? ('Live Quiz: '.$topic)),
            'questions' => $questions,
        ];
    }

    private function fallbackQuiz(string $topic, int $count): array
    {
        $templates = [
            "Which option best relates to {$topic}?",
            "What is one key idea about {$topic}?",
            "Which statement about {$topic} is most accurate?",
            "What should a student remember about {$topic}?",
            "Which answer is connected to {$topic}?",
        ];

        $questions = [];
        for ($i = 0; $i < max(1, min($count, 5)); $i++) {
            $questions[] = [
                'id' => 'q'.($i + 1),
                'q' => $templates[$i % count($templates)],
                'options' => [
                    ['id' => 'a', 'text' => ucfirst($topic)],
                    ['id' => 'b', 'text' => 'An unrelated idea'],
                    ['id' => 'c', 'text' => 'No answer'],
                    ['id' => 'd', 'text' => 'Skip this question'],
                ],
                'answerId' => 'a',
            ];
        }

        return [
            'title' => 'Live Quiz: '.$topic,
            'questions' => $questions,
        ];
    }

    public function agoraToken(Request $request, string $roomId)
    {
        $this->authorizeLiveRoomAccess($request, $roomId);

        $data = $request->validate([
            'role' => ['required', 'string', 'in:publisher,subscriber'],
        ]);

        $appId = config('services.agora.app_id');
        $appCertificate = config('services.agora.app_certificate');
        $expiresIn = (int) config('services.agora.token_expiration_seconds', 3600);

        abort_unless($appId && $appCertificate, 500, 'Agora credentials are not configured.');

        $uid = 'user-'.auth()->id().'-'.Str::random(4);
        $role = $data['role'] === 'publisher'
            ? RtcTokenBuilder::ROLE_PUBLISHER
            : RtcTokenBuilder::ROLE_SUBSCRIBER;

        $token = RtcTokenBuilder::buildTokenWithUserAccount(
            $appId,
            $appCertificate,
            $roomId,
            $uid,
            $role,
            $expiresIn,
            $expiresIn
        );

        abort_unless($token !== '', 500, 'Agora token could not be generated.');

        return response()->json([
            'appId' => $appId,
            'channel' => $roomId,
            'uid' => $uid,
            'token' => $token,
            'expiresIn' => $expiresIn,
        ]);
    }

    public function endClass(Request $request, string $roomId)
    {
        $this->authorizeLiveRoomAccess($request, $roomId);

        $class = \App\Models\CourseClass::where('meeting_link', $roomId)->first();
        if ($class) {
            $class->update(['status' => 'completed']);
        }

        return response()->json(['ok' => true]);
    }

    public function studentPing(Request $request, string $roomId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['ok' => false], 401);
        }

        $class = \App\Models\CourseClass::where('meeting_link', $roomId)->first();
        if (!$class) {
            return response()->json(['ok' => false], 404);
        }

        if ($user->isStudent() && $user->studentProfile) {
            $attendance = \App\Models\ClassAttendance::where('class_id', $class->id)
                ->where('student_id', $user->studentProfile->id)
                ->first();

            if ($attendance && $attendance->is_banned) {
                return response()->json(['ok' => true, 'banned' => true]);
            }

            \App\Models\ClassAttendance::updateOrCreate(
                ['class_id' => $class->id, 'student_id' => $user->studentProfile->id],
                ['last_ping_at' => now()]
            );
        }

        return response()->json(['ok' => true, 'banned' => false]);
    }

    public function getActiveStudents(Request $request, string $roomId)
    {
        $class = \App\Models\CourseClass::where('meeting_link', $roomId)->first();
        if (!$class) {
            return response()->json(['students' => []]);
        }

        $activeThreshold = now()->subSeconds(15);

        $attendances = \App\Models\ClassAttendance::where('class_id', $class->id)
            ->where('last_ping_at', '>=', $activeThreshold)
            ->where('is_banned', false)
            ->with(['student.user'])
            ->get();

        $students = $attendances->map(function ($att) {
            return [
                'id' => $att->student->id,
                'userId' => (string) ($att->student->user->id ?? ''),
                'name' => $att->student->user->name ?? 'Anonymous student',
                'email' => $att->student->user->email ?? '',
            ];
        });

        return response()->json(['students' => $students]);
    }

    public function banStudent(Request $request, string $roomId)
    {
        $studentId = $request->input('studentId');
        
        $class = \App\Models\CourseClass::where('meeting_link', $roomId)->first();
        if (!$class) {
            return response()->json(['ok' => false], 404);
        }

        $attendance = \App\Models\ClassAttendance::where('class_id', $class->id)
            ->where('student_id', $studentId)
            ->first();

        if ($attendance) {
            $attendance->update([
                'is_banned' => true,
                'last_ping_at' => null
            ]);
            
            $userId = (string) ($attendance->student->user->id ?? '');
            broadcast(new LiveStudentKicked($roomId, $userId))->toOthers();
        }

        return response()->json(['ok' => true]);
    }

    private function rememberLiveRoom(Request $request, string $roomId): void
    {
        $rooms = $request->session()->get('liveclass.rooms', []);

        if (!in_array($roomId, $rooms, true)) {
            $rooms[] = $roomId;
            $request->session()->put('liveclass.rooms', $rooms);
        }
    }

    private function authorizeLiveRoomAccess(Request $request, string $roomId): void
    {
        abort_unless(
            in_array($roomId, $request->session()->get('liveclass.rooms', []), true),
            403
        );
    }
}
