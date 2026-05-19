@props([
    'label',
    'tone' => 'purple',
    'size' => 'sm',
])

@php
    $tones = [
        'mint' => 'bg-[#D1F2EB] text-[#1E1E1E]',
        'peach' => 'bg-[#FFE5D9] text-[#1E1E1E]',
        'purple' => 'bg-[#E9D5FF] text-[#1E1E1E]',
        'lemon' => 'bg-[#FEF08A] text-[#1E1E1E]',
        'blue' => 'bg-[#BFDBFE] text-[#1E1E1E]',
        'pink' => 'bg-[#FBCFE8] text-[#1E1E1E]',
        'slate' => 'bg-white text-[#1E1E1E]',
        'success' => 'bg-[#D1F2EB] text-[#166534]',
        'warning' => 'bg-[#FEF08A] text-[#854D0E]',
        'danger' => 'bg-[#FFE5D9] text-[#B91C1C]',
    ];
    $sizes = [
        'sm' => 'px-3 py-1 text-[10px]',
        'md' => 'px-4 py-2 text-xs',
    ];
@endphp

<span {{ $attributes->merge(['class' => 'inline-flex items-center gap-2 rounded-full border-[3px] border-[#1E1E1E] font-black uppercase tracking-[0.18em] ' . ($tones[$tone] ?? $tones['purple']) . ' ' . ($sizes[$size] ?? $sizes['sm'])]) }}>
    {{ $label }}
</span>
