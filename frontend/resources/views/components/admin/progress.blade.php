@props([
    'value' => 0,
    'tone' => 'purple',
])

@php
    $barColors = [
        'mint' => 'bg-[#D1F2EB]',
        'peach' => 'bg-[#FFE5D9]',
        'purple' => 'bg-[#E9D5FF]',
        'lemon' => 'bg-[#FEF08A]',
        'blue' => 'bg-[#BFDBFE]',
        'pink' => 'bg-[#FBCFE8]',
    ];
@endphp

<div class="h-3 w-full overflow-hidden rounded-full border-[3px] border-[#1E1E1E] bg-white">
    <div class="h-full border-r-[3px] border-[#1E1E1E] {{ $barColors[$tone] ?? $barColors['purple'] }}" style="width: {{ max(0, min(100, (int) $value)) }}%"></div>
</div>
