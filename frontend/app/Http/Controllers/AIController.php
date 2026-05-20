<?php

namespace App\Http\Controllers;

use App\Models\Creation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AIController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                $user = auth()->user();
                if ($user && $user->role === 'teacher' && ($user->status === 'pending' || $user->status === 'rejected')) {
                    abort(403, 'Unauthorized status.');
                }
                return $next($request);
            }),
        ];
    }

    public function creator(Request $request, $type)
    {
        return Inertia::render('Teacher/AICreator', [
            'type' => $type,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'prompt' => 'required|string',
            'history' => 'nullable|array',
            'context' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            return response()->json(['error' => 'Gemini API key not configured.'], 500);
        }

        $type = $request->type;
        $userPrompt = $request->prompt;
        $context = $request->context;
        $history = $request->history ?? [];
        $metadata = $request->metadata ?? [];
        $user = auth()->user();
        $tone = $metadata['tone'] ?? ($user->ai_tone ?? 'Moderate');
        $level = $metadata['level'] ?? ($user->ai_level ?? 'Intermediate (B1-B2)');

        // Build a robust system instruction
        $systemInstruction = "You are an expert educational AI assistant for Bolo Academy. 
Your goal is to help teachers create professional, engaging, and high-quality teaching materials.

Current Creation Type: " . strtoupper($type) . "
Requested Difficulty Level/Tone: " . $tone . "
Target English Level: " . $level . "

GENERAL GUIDELINES:
1. Use clear, professional, yet engaging language suitable for students.
2. Format the output using clean Markdown. Use headers (#, ##), bullet points, and bold text.
3. If a document context is provided below, strictly base the content on that document.
4. ALWAYS return the COMPLETE, UPDATED version of the " . $type . ". Even if the user only asks for a small change, your response MUST be the full, finished document ready for use.
5. DO NOT include any conversational filler like 'Here is your updated assignment' or 'Sure, I can help'. ONLY output the Markdown content of the " . $type . " itself.
6. If the user asks for a change, incorporate it into the existing content and return the whole thing.

TYPE-SPECIFIC INSTRUCTIONS:";

        if ($type === 'assignment') {
            $systemInstruction .= "\n- Structure: Title, Learning Objectives, Instructions, Tasks/Activities, and a 'Submission Instructions' footer.
- Ensure tasks are varied and align with the " . $tone . " difficulty level.
- Include the following footer at the very end:
---
### **Submission Instructions**
* **Format:** Please ensure your name and class are clearly written at the top of your work.
* **Deadline:** Please turn in your work by the date specified by your teacher.
* **How to send:** Upload your files to the Bolo Academy Student Portal or hand them in during class.
**Pro-Tip:** Don't worry about being perfect! We are looking for your ability to explain these cool new concepts in your own unique way. 🚀";
        } elseif ($type === 'quiz' || $type === 'quizzes') {
            $systemInstruction .= "\n- Structure: A strict JSON object representing the quiz.
- ONLY output the JSON object, nothing else. No markdown wrappers.
- The JSON object MUST have the following schema:
  - `title`: String, the title of the quiz
  - `instructions`: String, instructions for the students
  - `questions`: Array of question objects. Each question object MUST have:
    - `question`: String, the text of the question
    - `options`: Array of strings, the possible answers (e.g., [\"A) True\", \"B) False\"])
    - `answer`: String, the correct answer (e.g., \"A\")
    - `type`: String, the type of question (e.g., \"mcq\", \"true_false\", \"short_answer\")
- Example Output:
{
  \"title\": \"AI Basics Quiz\",
  \"instructions\": \"Please read each question carefully.\",
  \"questions\": [
    {
      \"question\": \"What is AI?\",
      \"options\": [\"A) Magic\", \"B) Artificial Intelligence\"],
      \"answer\": \"B\",
      \"type\": \"mcq\"
    }
  ]
}";
        } elseif ($type === 'presentation') {
            $systemInstruction .= "\n- Structure: A strict JSON array of slide objects.
- ONLY output the JSON array, nothing else. No markdown wrappers.
- Each slide object MUST have:
  - `type`: Either \"title\" or \"content\"
  - `title`: The title of the slide
  - `subtitle`: (Only for 'title' type) The subtitle
  - `content`: (Only for 'content' type) An array of short string bullet points
  - `speakerNotes`: Detailed notes for the teacher for this slide
- Example Output:
[
  { \"type\": \"title\", \"title\": \"Introduction to Fractions\", \"subtitle\": \"Understanding parts of a whole\", \"speakerNotes\": \"Welcome the students and introduce the concept of fractions.\" },
  { \"type\": \"content\", \"title\": \"What is a Fraction?\", \"content\": [\"A fraction represents a part of a whole\", \"It consists of a numerator and a denominator\"], \"speakerNotes\": \"Use a pizza as an example to explain numerator and denominator.\" }
]";
        }

        if ($context) {
            $systemInstruction .= "\n\nDOCUMENT CONTEXT (USE THIS AS YOUR PRIMARY SOURCE):\n" . $context;
        }

        $contents = [];
        // Add cleaned history
        foreach ($history as $msg) {
            // Skip empty or system-like messages from history to keep it clean
            if (empty($msg['content'])) continue;
            
            $contents[] = [
                'role' => ($msg['role'] === 'user' || $msg['role'] === 'user') ? 'user' : 'model',
                'parts' => [['text' => $msg['content']]]
            ];
        }

        // Add the current user prompt
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userPrompt ?: "Generate the " . $type]]
        ];

        $models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash-latest'];
        $lastError = null;

        foreach ($models as $modelName) {
            try {
                $response = Http::withoutVerifying()->withHeaders([
                    'Content-Type' => 'application/json',
                ])->post("https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key=" . $apiKey, [
                    'system_instruction' => [
                        'parts' => [['text' => $systemInstruction]]
                    ],
                    'contents' => $contents,
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 4096,
                    ],
                ]);

                if ($response->successful()) {
                    $result = $response->json();
                    $aiText = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
                    if ($aiText) {
                        return response()->json(['content' => trim($aiText)]);
                    }
                }

                $lastError = $response->json()['error']['message'] ?? 'Unknown error';
                \Illuminate\Support\Facades\Log::warning("Gemini Model {$modelName} failed: " . $lastError);
            } catch (\Exception $e) {
                $lastError = $e->getMessage();
                \Illuminate\Support\Facades\Log::error("Gemini Model {$modelName} exception: " . $lastError);
            }
        }

        return response()->json(['error' => "All Gemini models failed. Last error: " . $lastError], 500);
    }

    public function save(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'title' => 'required|string',
            'content' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        $creation = Creation::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'title' => $request->title,
            'content' => $request->input('content'),
            'status' => 'Accepted',
            'metadata' => $request->metadata,
        ]);

        return response()->json([
            'success' => true,
            'creation' => $creation,
        ]);
    }

    public function getCreations(Request $request)
    {
        $creations = Creation::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($creations);
    }
    public function destroy($id)
    {
        $creation = Creation::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $creation->delete();
        return response()->json(['success' => true]);
    }
}
