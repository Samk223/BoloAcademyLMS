@extends('admin.layouts.portal')

@section('page-actions')
    <button type="submit" form="settingsForm" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Save settings</button>
    <button type="button" data-toast="Certificate settings exported" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Export config</button>
@endsection

@section('content')
    <div class="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
        <section class="admin-surface p-6">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Portal controls</p>
            <h3 class="mt-2 text-2xl font-black">Global LMS settings</h3>
            <form id="settingsForm" action="{{ route('admin.settings.store') }}" method="POST" class="mt-6 space-y-5">
                @csrf
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Portal name</span>
                    <input type="text" name="portal_name" value="{{ $settings['portal_name'] ?? 'Bolo Academy LMS' }}" required class="w-full rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                </label>
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Support email</span>
                    <input type="email" name="support_email" value="{{ $settings['support_email'] ?? 'support@boloacademy.com' }}" required class="w-full rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                </label>
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Meeting integration</span>
                    <select name="meeting_integration" required class="w-full rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="Google Meet" {{ ($settings['meeting_integration'] ?? '') === 'Google Meet' ? 'selected' : '' }}>Google Meet</option>
                        <option value="Zoom" {{ ($settings['meeting_integration'] ?? '') === 'Zoom' ? 'selected' : '' }}>Zoom</option>
                        <option value="Microsoft Teams" {{ ($settings['meeting_integration'] ?? '') === 'Microsoft Teams' ? 'selected' : '' }}>Microsoft Teams</option>
                    </select>
                </label>
                <label class="block">
                    <span class="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Certificate watermark</span>
                    <input type="text" name="certificate_watermark" value="{{ $settings['certificate_watermark'] ?? 'Bolo Academy Certified' }}" required class="w-full rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                </label>
            </form>
        </section>

        <section class="grid gap-6">
            @foreach($settingGroups as $group)
                @php
                    $toneClasses = [
                        'mint' => 'bg-[#D1F2EB]',
                        'purple' => 'bg-[#E9D5FF]',
                        'peach' => 'bg-[#FFE5D9]',
                        'blue' => 'bg-[#BFDBFE]',
                    ];
                @endphp
                <article class="admin-surface overflow-hidden">
                    <div class="border-b-[3px] border-[#1E1E1E] {{ $toneClasses[$group['tone']] ?? 'bg-white' }} px-6 py-5">
                        <h3 class="text-2xl font-black">{{ $group['title'] }}</h3>
                    </div>
                    <div class="space-y-4 p-6">
                        @foreach($group['items'] as $item)
                            @php
                                $isEnabled = $settings['toggles'][$item] ?? false;
                            @endphp
                            <div class="flex items-center justify-between gap-4 rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white px-5 py-4">
                                <div>
                                    <p class="text-sm font-black">{{ $item }}</p>
                                </div>
                                <button type="button" onclick="toggleSettingAjax('{{ $item }}', this)" class="relative h-8 w-16 rounded-full border-[3px] border-[#1E1E1E] {{ $isEnabled ? 'bg-[#D1F2EB]' : 'bg-white' }} transition-colors duration-200">
                                    <span class="absolute top-[4px] h-[18px] w-[18px] rounded-full border-[2.5px] border-[#1E1E1E] bg-white transition-all duration-200 {{ $isEnabled ? 'left-[36px]' : 'left-[4px]' }}"></span>
                                </button>
                            </div>
                        @endforeach
                    </div>
                </article>
            @endforeach
        </section>
    </div>

<script>
    function toggleSettingAjax(item, button) {
        const csrfToken = '{{ csrf_token() }}';
        
        fetch('{{ route('admin.settings.toggle') }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ item: item })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const ball = button.querySelector('span');
                if (data.state) {
                    button.classList.remove('bg-white');
                    button.classList.add('bg-[#D1F2EB]');
                    ball.classList.remove('left-[4px]');
                    ball.classList.add('left-[36px]');
                    window.showToast(item + ' enabled', 'mint');
                } else {
                    button.classList.remove('bg-[#D1F2EB]');
                    button.classList.add('bg-white');
                    ball.classList.remove('left-[36px]');
                    ball.classList.add('left-[4px]');
                    window.showToast(item + ' disabled', 'peach');
                }
            } else {
                window.showToast('Failed to toggle setting', 'peach');
            }
        })
        .catch(() => {
            window.showToast('Network error while toggling setting', 'peach');
        });
    }
</script>
@endsection
