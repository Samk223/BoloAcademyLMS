<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'ai_tone' => 'nullable|string',
            'ai_level' => 'nullable|string',
            'meeting_link' => 'nullable|string',
            'accent_color' => 'nullable|string',
            'gender' => 'nullable|string',
            'notifications_config' => 'nullable', // Handle manually below
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = '/storage/' . $path;
        }

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('bio')) $user->bio = $request->bio;
        if ($request->has('ai_tone')) $user->ai_tone = $request->ai_tone;
        if ($request->has('ai_level')) $user->ai_level = $request->ai_level;
        if ($request->has('meeting_link')) $user->meeting_link = $request->meeting_link;
        if ($request->has('accent_color')) $user->accent_color = $request->accent_color;
        if ($request->has('gender')) $user->gender = $request->gender;

        if ($request->has('notifications_config')) {
            $config = $request->notifications_config;
            if (is_string($config)) {
                $config = json_decode($config, true);
            }
            $user->notifications_config = $config;
        }

        $user->save();

        return response()->json($user);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
