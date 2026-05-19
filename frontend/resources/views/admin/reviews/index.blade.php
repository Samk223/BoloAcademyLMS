@extends('admin.layouts.portal')

@section('page-actions')
    <button type="button" data-toast="Feedback moderation mode enabled" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Moderate feedback</button>
    <button type="button" data-toast="Complaint escalation summary exported" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Export complaints</button>
@endsection

@section('content')
    <div class="grid gap-5 md:grid-cols-3">
        <div class="admin-surface bg-[#D1F2EB] p-6">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Teacher review average</p>
            <h3 class="mt-4 text-3xl font-black">{{ $teacherReviews->avg('rating') ? number_format($teacherReviews->avg('rating'), 1) : '4.8' }}/5</h3>
        </div>
        <div class="admin-surface bg-[#BFDBFE] p-6">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Student feedback notes</p>
            <h3 class="mt-4 text-3xl font-black">{{ $studentFeedback->count() }}</h3>
        </div>
        <div class="admin-surface bg-[#FFE5D9] p-6">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Open complaints</p>
            <h3 class="mt-4 text-3xl font-black">{{ $complaints->count() }}</h3>
        </div>
    </div>

    <div class="mt-8 grid gap-8 2xl:grid-cols-3">
        <section class="admin-surface p-6">
            <div class="mb-5 flex items-center justify-between">
                <h3 class="text-2xl font-black">Student reviews for teachers</h3>
                <x-admin.badge label="Ratings" tone="lemon" />
            </div>
            <div class="space-y-4">
                @forelse($teacherReviews as $review)
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-4">
                        <div class="flex items-center justify-between gap-4">
                            <div>
                                <h4 class="text-base font-black">{{ $review['teacher'] }}</h4>
                                <p class="mt-1 text-sm font-bold text-[#1E1E1E]/60">By {{ $review['student_name'] }}</p>
                            </div>
                            <x-admin.badge :label="$review['rating'] . '/5'" tone="lemon" />
                        </div>
                        <p class="mt-3 text-sm font-bold text-[#1E1E1E]/70">"{{ $review['comment'] }}"</p>
                        <p class="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/35">{{ $review['date'] }}</p>
                    </div>
                @empty
                    <div class="rounded-[1.5rem] border-[3px] border-dashed border-[#1E1E1E] bg-white p-5 text-sm font-bold text-[#1E1E1E]/60">No teacher reviews yet.</div>
                @endforelse
            </div>
        </section>

        <section class="admin-surface p-6">
            <div class="mb-5 flex items-center justify-between">
                <h3 class="text-2xl font-black">Teacher feedback on students</h3>
                <x-admin.badge label="Moderation" tone="mint" />
            </div>
            <div class="space-y-4">
                @forelse($studentFeedback as $feedback)
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white p-4">
                        <div class="flex items-center justify-between gap-4">
                            <div>
                                <h4 class="text-base font-black">{{ $feedback['student'] }}</h4>
                                <p class="mt-1 text-sm font-bold text-[#1E1E1E]/60">Teacher: {{ $feedback['teacher'] }}</p>
                            </div>
                            <x-admin.badge :label="$feedback['type']" tone="blue" />
                        </div>
                        <p class="mt-3 text-sm font-bold text-[#1E1E1E]/70">{{ $feedback['content'] }}</p>
                        <div class="mt-4 flex gap-2">
                            <a href="{{ route('admin.reviews.feedback.approve', $feedback['id']) }}" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Approve</a>
                            <a href="{{ route('admin.reviews.feedback.hide', $feedback['id']) }}" data-confirm="Hide this feedback entry from the teacher feed?" data-tone="peach" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#FFE5D9] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Hide</a>
                        </div>
                    </div>
                @empty
                    <div class="rounded-[1.5rem] border-[3px] border-dashed border-[#1E1E1E] bg-white p-5 text-sm font-bold text-[#1E1E1E]/60">No student feedback yet.</div>
                @endforelse
            </div>
        </section>

        <section class="admin-surface p-6">
            <div class="mb-5 flex items-center justify-between">
                <h3 class="text-2xl font-black">Complaint handling</h3>
                <x-admin.badge label="Escalations" tone="peach" />
            </div>
            <div class="space-y-4">
                @forelse($complaints as $complaint)
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-4">
                        <div class="flex items-center justify-between gap-4">
                            <div>
                                <h4 class="text-base font-black">{{ $complaint['title'] }}</h4>
                                <p class="mt-1 text-sm font-bold text-[#1E1E1E]/60">{{ $complaint['owner'] }}</p>
                            </div>
                            <x-admin.badge :label="$complaint['status']" tone="warning" />
                        </div>
                        <p class="mt-3 text-sm font-bold text-[#1E1E1E]/70">{{ $complaint['description'] }}</p>
                        <div class="mt-4 flex gap-2">
                            <a href="{{ route('admin.reviews.tickets.escalate', $complaint['id']) }}" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Escalate</a>
                            <a href="{{ route('admin.reviews.tickets.resolve', $complaint['id']) }}" data-confirm="Resolve complaint: {{ $complaint['title'] }}?" data-tone="mint" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Resolve</a>
                        </div>
                    </div>
                @empty
                    <div class="rounded-[1.5rem] border-[3px] border-dashed border-[#1E1E1E] bg-white p-5 text-sm font-bold text-[#1E1E1E]/60">No complaints found.</div>
                @endforelse
            </div>
        </section>
    </div>
@endsection
