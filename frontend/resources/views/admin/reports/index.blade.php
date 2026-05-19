@extends('admin.layouts.portal')

@section('page-actions')
    <a href="{{ route('admin.reports.download', ['type' => 'students']) }}" data-no-spa class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-transform active:translate-y-[2px]">Download reports</a>
    <button type="button" data-toast="Retention dashboard shared with finance" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-transform active:translate-y-[2px]">Share snapshot</button>
@endsection

@section('content')
    <div class="mb-8 flex items-center gap-3">
        <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
            <span class="text-sm font-bold">‹</span> Back to control room
        </a>
        <span class="text-xs font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">/ Reports and analytics</span>
    </div>

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        @foreach($reportCards as $card)
            @php
                $toneClasses = [
                    'mint' => 'bg-[#D1F2EB]',
                    'purple' => 'bg-[#E9D5FF]',
                    'blue' => 'bg-[#BFDBFE]',
                    'peach' => 'bg-[#FFE5D9]',
                    'lemon' => 'bg-[#FEF08A]',
                    'pink' => 'bg-[#FBCFE8]',
                ];
            @endphp
            <div class="admin-surface {{ $toneClasses[$card['tone']] ?? 'bg-white' }} p-6">
                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">{{ $card['title'] }}</p>
                <h3 class="mt-4 text-2xl font-black leading-tight">{{ $card['metric'] }}</h3>
            </div>
        @endforeach
    </div>

    <div class="mt-8 grid gap-8 xl:grid-cols-2">
        <div class="admin-surface p-6">
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Retention analytics</p>
                    <h3 class="mt-2 text-2xl font-black">6-month learner retention</h3>
                </div>
                <x-admin.badge label="Retention" tone="mint" />
            </div>
            <div class="flex h-72 items-end gap-4">
                @foreach($retentionSeries as $index => $value)
                    <div class="flex flex-1 flex-col items-center gap-3">
                        <div class="flex w-full items-end justify-center rounded-t-[1.5rem] border-[3px] border-[#1E1E1E] border-b-0 bg-[#D1F2EB]" style="height: {{ $value * 2 }}px">
                            <span class="pb-3 text-sm font-black">{{ $value }}%</span>
                        </div>
                        <span class="text-xs font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">M{{ $index + 1 }}</span>
                    </div>
                @endforeach
            </div>
        </div>

        <div class="admin-surface p-6">
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Completion rates</p>
                    <h3 class="mt-2 text-2xl font-black">Track completion momentum</h3>
                </div>
                <x-admin.badge label="Completion" tone="blue" />
            </div>
            <div class="flex h-72 items-end gap-4">
                @foreach($completionSeries as $index => $value)
                    <div class="flex flex-1 flex-col items-center gap-3">
                        <div class="flex w-full items-end justify-center rounded-t-[1.5rem] border-[3px] border-[#1E1E1E] border-b-0 bg-[#BFDBFE]" style="height: {{ $value * 2 }}px">
                            <span class="pb-3 text-sm font-black">{{ $value }}%</span>
                        </div>
                        <span class="text-xs font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">M{{ $index + 1 }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    <div class="mt-8 grid gap-8 2xl:grid-cols-[1.1fr,0.9fr]">
        <div class="admin-surface p-6">
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Teacher workload monitoring</p>
                    <h3 class="mt-2 text-2xl font-black">Capacity distribution</h3>
                </div>
                <x-admin.badge label="Load monitor" tone="purple" />
            </div>
            <div class="space-y-4">
                @foreach($teacherWorkload as $teacher)
                    <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-4">
                        <div class="flex items-center justify-between gap-4">
                            <div>
                                <h4 class="text-base font-black">{{ $teacher['name'] }}</h4>
                                <p class="mt-1 text-sm font-bold text-[#1E1E1E]/55">{{ $teacher['classes'] }} classes • {{ $teacher['students'] }} learners</p>
                            </div>
                            <x-admin.badge :label="$teacher['load'] . '%'" :tone="$teacher['load'] > 85 ? 'warning' : 'success'" />
                        </div>
                        <div class="mt-4"><x-admin.progress :value="$teacher['load']" tone="purple" /></div>
                    </div>
                @endforeach
            </div>
        </div>

        <div class="admin-surface p-6">
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Downloadable reports</p>
                    <h3 class="mt-2 text-2xl font-black">Ops-ready exports</h3>
                </div>
                <x-admin.badge label="PDF • CSV" tone="lemon" />
            </div>
            @php
                $reportsMap = [
                    'Student analytics pack' => ['type' => 'students', 'label' => 'Student analytics pack'],
                    'Teacher quality report' => ['type' => 'teachers', 'label' => 'Teacher quality report'],
                    'Attendance risk report' => ['type' => 'attendance', 'label' => 'Attendance risk report'],
                    'Curriculum performance deck' => ['type' => 'curriculum', 'label' => 'Curriculum performance deck'],
                    'Revenue and renewals sheet' => ['type' => 'revenue', 'label' => 'Revenue and renewals sheet'],
                ];
            @endphp
            <div class="space-y-4">
                @foreach($reportsMap as $label => $info)
                    <div class="flex items-center justify-between rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white px-5 py-4">
                        <div>
                            <h4 class="text-base font-black">{{ $info['label'] }}</h4>
                            <p class="mt-1 text-sm font-bold text-[#1E1E1E]/55">Ready for download and stakeholder sharing</p>
                        </div>
                        <a href="{{ route('admin.reports.download', ['type' => $info['type']]) }}" data-no-spa class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Download</a>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
@endsection
