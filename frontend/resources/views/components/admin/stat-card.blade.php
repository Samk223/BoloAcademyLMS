@props([
    'label',
    'value',
    'icon' => 'dashboard',
    'tone' => 'purple',
    'hint' => null,
    'href' => null,
])

@php
    $tones = [
        'mint' => 'bg-[#D1F2EB]',
        'peach' => 'bg-[#FFE5D9]',
        'purple' => 'bg-[#E9D5FF]',
        'lemon' => 'bg-[#FEF08A]',
        'blue' => 'bg-[#BFDBFE]',
        'pink' => 'bg-[#FBCFE8]',
    ];
@endphp

@if($href)
    <a href="{{ $href }}" class="admin-surface admin-hover p-6 block text-[#1E1E1E] hover:text-[#1E1E1E]">
@else
    <div class="admin-surface admin-hover p-6 text-[#1E1E1E]">
@endif
    <div class="mb-5 flex items-start justify-between gap-4">
        <div class="space-y-2">
            <p class="text-[11px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/50">{{ $label }}</p>
            <h3 class="text-3xl font-black tracking-tight">{{ $value }}</h3>
        </div>
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#1E1E1E] {{ $tones[$tone] ?? $tones['purple'] }} shadow-[3px_3px_0px_0px_#1E1E1E]">
            <x-admin.icon :name="$icon" class="h-6 w-6" />
        </div>
    </div>

    @if($hint)
        <p class="text-sm font-bold text-[#1E1E1E]/60">{{ $hint }}</p>
    @endif
@if($href)
    </a>
@else
    </div>
@endif
