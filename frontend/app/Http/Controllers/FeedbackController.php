<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    public function index()
    {
        $feedbacks = Feedback::where('teacher_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($feedbacks);
    }
}
