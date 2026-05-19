<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    public function index()
    {
        $tickets = SupportTicket::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string'
        ]);

        $ticket = SupportTicket::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'open'
        ]);

        // Create notification for admin
        $admin = \App\Models\User::where('role', 'admin')->first();
        if ($admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'title' => 'New Support Ticket: ' . $ticket->title,
                'message' => 'Teacher ' . Auth::user()->name . ' submitted a ticket: ' . $ticket->description,
                'type' => 'system',
                'is_read' => false
            ]);
        }

        return response()->json($ticket, 201);
    }
}
