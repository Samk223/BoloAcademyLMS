@extends('admin.layouts.portal')

@section('page-actions')
    <button type="button" onclick="document.querySelector('input[name=\'title\']').focus()" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Send announcement</button>
    <button type="button" data-toast="Push notification queue synced" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Sync queue</button>
@endsection

@section('content')
    <div class="grid gap-8 2xl:grid-cols-[0.95fr,1.05fr]">
        <section class="space-y-8">
            <div class="admin-surface p-6">
                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Announcement composer</p>
                <h3 class="mt-2 text-2xl font-black">Notify students, teachers, or batches</h3>
                <form id="announcementForm" action="{{ route('admin.notifications.store') }}" method="POST" class="mt-6 space-y-4">
                    @csrf
                    <input type="text" name="title" required placeholder="Announcement title" class="w-full rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                    <div class="grid gap-4 md:grid-cols-2">
                        <select name="audience" required class="rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                            <option value="All students">All students</option>
                            <option value="All teachers">All teachers</option>
                            <option value="All users">All users</option>
                        </select>
                        <select name="channel" class="rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                            <option>Email + Push</option>
                            <option>Email only</option>
                            <option>Push only</option>
                        </select>
                    </div>
                    <textarea name="message" required rows="5" placeholder="Write your announcement..." class="w-full rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0"></textarea>
                    <div class="grid gap-4 md:grid-cols-2">
                        <button type="button" data-toast="Announcement saved as draft" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Save draft</button>
                        <button type="submit" data-confirm="Send this announcement to the selected audience now?" data-tone="mint" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Send now</button>
                    </div>
                </form>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                @foreach($deliveryGroups as $group)
                    @php
                        $toneClasses = [
                            'mint' => 'bg-[#D1F2EB]',
                            'purple' => 'bg-[#E9D5FF]',
                            'peach' => 'bg-[#FFE5D9]',
                            'blue' => 'bg-[#BFDBFE]',
                        ];
                    @endphp
                    <div class="admin-surface {{ $toneClasses[$group['tone']] ?? 'bg-white' }} p-5">
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">{{ $group['title'] }}</p>
                        <h3 class="mt-4 text-3xl font-black">{{ $group['count'] }}</h3>
                        <p class="mt-2 text-sm font-bold text-[#1E1E1E]/60">delivery-ready audience buckets</p>
                    </div>
                @endforeach
            </div>
        </section>

        <section class="admin-surface p-6">
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Notification feed</p>
                    <h3 class="mt-2 text-2xl font-black">Recent platform messages</h3>
                </div>
                <x-admin.badge label="Live queue" tone="purple" />
            </div>
            <div class="space-y-4">
                @foreach($notificationsFeed as $notification)
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <h4 class="text-lg font-black">{{ $notification['title'] }}</h4>
                                <p class="mt-2 text-sm font-bold text-[#1E1E1E]/65">{{ $notification['message'] }}</p>
                            </div>
                            <x-admin.badge :label="$notification['type']" tone="blue" />
                        </div>
                        <div class="mt-4 flex flex-wrap items-center gap-3">
                            <span class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/35">{{ $notification['date'] }}</span>
                            <button type="button" onclick="reuseNotification('{{ addslashes($notification['title']) }}', '{{ addslashes($notification['message']) }}')" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">Reuse</button>
                            <a href="{{ route('admin.notifications.archive', $notification['id']) }}" data-confirm="Archive this notification from the live feed?" data-tone="peach" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Archive</a>
                        </div>
                    </div>
                @endforeach
            </div>
        </section>
    </div>

<script>
    function reuseNotification(title, message) {
        const titleInput = document.querySelector('input[name="title"]');
        const messageInput = document.querySelector('textarea[name="message"]');
        if (titleInput && messageInput) {
            titleInput.value = title;
            messageInput.value = message;
            titleInput.scrollIntoView({ behavior: 'smooth' });
            titleInput.focus();
        }
    }
</script>
@endsection
