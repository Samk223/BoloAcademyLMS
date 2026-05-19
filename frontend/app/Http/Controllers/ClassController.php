<?php

namespace App\Http\Controllers;

use App\Models\CourseClass;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CourseClass::where('teacher_id', Auth::id());
        
        if ($request->has('start') && $request->has('end')) {
            $query->whereBetween('scheduled_at', [$request->start, $request->end]);
        }
        
        $classes = $query->orderBy('scheduled_at', 'asc')->get();
        return response()->json($classes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'duration' => 'nullable|integer',
            'status' => 'nullable|string|in:scheduled,completed,missed,rescheduled',
            'grade' => 'nullable|string',
            'student_ids' => 'nullable|array',
        ]);

        $validated['teacher_id'] = Auth::id();
        
        // Generate a random meeting room ID if not provided
        if (!isset($validated['meeting_link'])) {
            $validated['meeting_link'] = 'BOLO-' . strtoupper(Str::random(6));
        }

        $courseClass = CourseClass::create($validated);

        return response()->json($courseClass, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $courseClass = CourseClass::where('teacher_id', Auth::id())->findOrFail($id);
        return response()->json($courseClass);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $courseClass = CourseClass::where('teacher_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'sometimes|required|date',
            'duration' => 'nullable|integer',
            'status' => 'nullable|string|in:scheduled,completed,missed,rescheduled',
            'grade' => 'nullable|string',
            'student_ids' => 'nullable|array',
        ]);

        $courseClass->update($validated);

        return response()->json($courseClass);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $courseClass = CourseClass::where('teacher_id', Auth::id())->findOrFail($id);
        $courseClass->delete();

        return response()->json(['message' => 'Class deleted successfully']);
    }
}
