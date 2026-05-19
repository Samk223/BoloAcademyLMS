@props([
    'name',
    'class' => 'h-5 w-5',
])

@switch($name)
    @case('dashboard')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="4" rx="1.5"></rect>
            <rect x="14" y="10" width="7" height="11" rx="1.5"></rect>
            <rect x="3" y="13" width="7" height="8" rx="1.5"></rect>
        </svg>
        @break
    @case('users')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        @break
    @case('student')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3 2 8l10 5 10-5-10-5Z"></path>
            <path d="M6 10.5V15c0 2.2 2.7 4 6 4s6-1.8 6-4v-4.5"></path>
        </svg>
        @break
    @case('teacher')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="7" r="4"></circle>
            <path d="M5.5 21a6.5 6.5 0 0 1 13 0"></path>
            <path d="M19 3v4"></path>
            <path d="M21 5h-4"></path>
        </svg>
        @break
    @case('curriculum')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path>
        </svg>
        @break
    @case('batches')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z"></path>
            <path d="M3 12l9 4.5 9-4.5"></path>
            <path d="M3 16.5 12 21l9-4.5"></path>
        </svg>
        @break
    @case('schedules')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <path d="M16 2v4"></path>
            <path d="M8 2v4"></path>
            <path d="M3 10h18"></path>
        </svg>
        @break
    @case('reports')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="M7 15l4-4 3 3 6-7"></path>
        </svg>
        @break
    @case('reviews')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3 2.8 5.67L21 9.6l-4.5 4.39 1.06 6.21L12 17.3 6.44 20.2 7.5 14 3 9.6l6.2-.93L12 3Z"></path>
        </svg>
        @break
    @case('notifications')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"></path>
            <path d="M9 17a3 3 0 0 0 6 0"></path>
        </svg>
        @break
    @case('settings')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.88 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"></path>
        </svg>
        @break
    @case('logout')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <path d="M16 17l5-5-5-5"></path>
            <path d="M21 12H9"></path>
        </svg>
        @break
    @case('search')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
        @break
    @case('bell')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"></path>
            <path d="M9 17a3 3 0 0 0 6 0"></path>
        </svg>
        @break
    @case('sparkles')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"></path>
            <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"></path>
            <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"></path>
        </svg>
        @break
    @case('clock')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 7v5l3 2"></path>
        </svg>
        @break
    @case('menu')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <path d="M4 7h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 17h16"></path>
        </svg>
        @break
    @case('close')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <path d="M6 6l12 12"></path>
            <path d="M18 6 6 18"></path>
        </svg>
        @break
    @case('download')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <path d="M7 10l5 5 5-5"></path>
            <path d="M12 15V3"></path>
        </svg>
        @break
    @case('link')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43"></path>
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L12.5 19.57"></path>
        </svg>
        @break
    @case('mail')
        <svg viewBox="0 0 24 24" fill="none" {{ $attributes->merge(['class' => $class]) }} stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <path d="m4 7 8 6 8-6"></path>
        </svg>
        @break
    @default
        <span {{ $attributes->merge(['class' => $class . ' inline-flex items-center justify-center']) }}>•</span>
@endswitch
