@extends('admin.layouts.portal')

@section('page-actions')
    <button type="button" onclick="document.getElementById('createScheduleDialog').showModal()" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-transform active:translate-y-[2px]">Create schedule</button>
    <button type="button" id="toggleViewBtn" onclick="toggleCalendarView()" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#BFDBFE] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-transform active:translate-y-[2px]">Monthly View</button>
@endsection

@section('content')
    <div class="grid gap-8 2xl:grid-cols-[1.2fr,0.8fr]">
        <section class="admin-surface overflow-hidden">
            <div class="border-b-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-6 py-5">
                <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Calendar Board</p>
                        <h3 class="mt-2 text-2xl font-black">Teacher-wise and curriculum-wise scheduling board</h3>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        @foreach($scheduleFilters['teachers'] as $teacher)
                            <x-admin.badge :label="$teacher" tone="slate" />
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Weekly View -->
            <div id="weeklyCalendarView" class="overflow-x-auto p-6">
                <div class="grid min-w-[980px] grid-cols-7 gap-4">
                    @foreach($calendar as $day)
                        <div class="space-y-4">
                            <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] {{ $day['isToday'] ? 'bg-[#E9D5FF]' : 'bg-white' }} p-4 text-center shadow-[3px_3px_0px_0px_#1E1E1E]">
                                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">{{ $day['label'] }}</p>
                                <p class="mt-2 text-3xl font-black">{{ $day['date'] }}</p>
                            </div>
                            <div class="weekly-day-items space-y-3" data-date="{{ $day['full_date'] }}" style="min-height: 250px;">
                                @forelse($day['items'] as $item)
                                    <div class="schedule-card rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-4 shadow-[2px_2px_0px_0px_#1E1E1E] transition-all" data-id="{{ $item['id'] }}" data-teacher="{{ $item['teacher'] }}" data-grade="{{ $item['grade'] }}">
                                        <h4 class="text-sm font-black leading-tight">{{ $item['title'] }}</h4>
                                        <p class="mt-2 text-xs font-bold text-[#1E1E1E]/60">{{ $item['teacher'] }}</p>
                                        <p class="mt-1 text-xs font-bold text-[#1E1E1E]/60">{{ $item['time'] }} • {{ $item['grade'] }}</p>
                                        <div class="mt-3 flex flex-wrap items-center gap-2">
                                            <x-admin.badge :label="$item['status']" tone="mint" />
                                            <button type="button" onclick="openRescheduleModal({{ $item['id'] }}, '{{ $item['raw_time'] }}')" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]">Reschedule</button>
                                            <a href="{{ route('admin.schedules.cancel', $item['id']) }}" data-confirm="Cancel this class session: '{{ $item['title'] }}'?" data-tone="peach" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#FFE5D9] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Cancel</a>
                                        </div>
                                    </div>
                                @empty
                                    <button type="button" onclick="openCreateModalForDate('{{ $day['full_date'] }}')" class="flex h-28 w-full items-center justify-center rounded-[1.5rem] border-[3px] border-dashed border-[#1E1E1E] bg-white text-xs font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45 transition-all hover:bg-gray-50 active:translate-y-[2px]">+ Add class</button>
                                @endforelse
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Monthly View -->
            <div id="monthlyCalendarView" class="hidden overflow-x-auto p-6">
                <div class="mb-6 flex items-center justify-between">
                    <h4 class="text-xl font-black uppercase tracking-wider text-[#1E1E1E] bg-[#FEF08A] px-4 py-2 rounded-xl border-3 border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E]">{{ $currentMonthName }}</h4>
                </div>
                <div class="grid min-w-[980px] grid-cols-7 gap-4">
                    <!-- Day Headers -->
                    @foreach(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as $dayName)
                        <div class="text-center text-xs font-black uppercase tracking-[0.18em] text-[#1E1E1E] py-2.5 bg-[#E9D5FF] rounded-xl border-[3px] border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]">
                            {{ $dayName }}
                        </div>
                    @endforeach

                    <!-- Calendar Days -->
                    @foreach($monthlyCalendar as $day)
                        <div class="calendar-day-cell min-h-[150px] rounded-[1.75rem] border-[3px] border-[#1E1E1E] {{ $day['isToday'] ? 'bg-[#FFF8E7] ring-4 ring-[#E9D5FF]' : ($day['isCurrentMonth'] ? 'bg-white' : 'bg-gray-100 opacity-60') }} p-4 shadow-[3px_3px_0px_0px_#1E1E1E] flex flex-col justify-between transition-all" data-date="{{ $day['full_date'] }}">
                            <div>
                                <div class="flex items-center justify-between mb-2 border-b-[2px] border-[#1E1E1E]/10 pb-1.5">
                                    <span class="text-[10px] font-black text-[#1E1E1E]/40 uppercase">{{ $day['label'] }}</span>
                                    <span class="text-sm font-black {{ $day['isToday'] ? 'bg-[#E9D5FF] px-2 py-0.5 rounded-lg border-2 border-[#1E1E1E]' : '' }}">{{ $day['date'] }}</span>
                                </div>
                                <div class="space-y-2 calendar-day-items" style="min-height: 50px;">
                                    @foreach($day['items'] as $item)
                                        <div class="schedule-card rounded-xl border-2 border-[#1E1E1E] bg-[#FFF8E7] p-2.5 text-[10px] font-black leading-tight shadow-[1px_1px_0px_0px_#1E1E1E] transition-all hover:scale-[1.02]" data-id="{{ $item['id'] }}" data-teacher="{{ $item['teacher'] }}" data-grade="{{ $item['grade'] }}">
                                            <div class="truncate text-[#1E1E1E]">{{ $item['title'] }}</div>
                                            <div class="text-[8px] text-[#1E1E1E]/60 mt-1 truncate">{{ $item['teacher'] }} • {{ $item['time'] }}</div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                            <button type="button" onclick="openCreateModalForDate('{{ $day['full_date'] }}')" class="mt-3 w-full text-center py-1.5 text-[9px] font-black uppercase tracking-wider border-2 border-dashed border-[#1E1E1E] rounded-xl bg-white hover:bg-gray-50 text-[#1E1E1E]/50 transition-all hover:translate-y-[1px]">+ Add</button>
                        </div>
                    @endforeach
                </div>
            </div>
        </section>

        <section class="space-y-6">
            <div class="admin-surface p-6">
                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Scheduling controls</p>
                <h3 class="mt-2 text-2xl font-black">Filters and quick actions</h3>
                <div class="mt-5 space-y-4">
                    <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1E1E1E]/45">Teacher-wise schedules</label>
                    <select id="teacherFilter" class="w-full rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="all">All Teachers</option>
                        @foreach($scheduleFilters['teachers'] as $teacher)
                            <option value="{{ $teacher }}">{{ $teacher }}</option>
                        @endforeach
                    </select>
                    <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1E1E1E]/45">Curriculum-wise schedules</label>
                    <select id="curriculumFilter" class="w-full rounded-[1.25rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="all">All Curriculums</option>
                        @foreach($scheduleFilters['curriculums'] as $curriculum)
                            <option value="{{ $curriculum }}">{{ $curriculum }}</option>
                        @endforeach
                    </select>
                    <button type="button" id="dragModeBtn" onclick="toggleDragMode()" class="w-full rounded-full border-[3px] border-[#1E1E1E] bg-[#FEF08A] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all duration-200">Enable Drag-Ready Mode</button>
                </div>
            </div>

            <div class="admin-surface p-6">
                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Operations checklist</p>
                <div class="mt-5 space-y-4">
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#D1F2EB] p-4">
                        <h4 class="text-lg font-black">Reschedule classes</h4>
                        <p class="mt-2 text-sm font-bold text-[#1E1E1E]/65">Move classes while keeping teacher and batch context visible.</p>
                    </div>
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#BFDBFE] p-4">
                        <h4 class="text-lg font-black">Teacher-wise load balancing</h4>
                        <p class="mt-2 text-sm font-bold text-[#1E1E1E]/65">Spot overbooked teachers before live sessions begin.</p>
                    </div>
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FFE5D9] p-4">
                        <h4 class="text-lg font-black">Cancel with confirmation</h4>
                        <p class="mt-2 text-sm font-bold text-[#1E1E1E]/65">Every cancellation is ready for modal-confirmed admin review.</p>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <dialog id="createScheduleDialog" class="admin-dialog rounded-[2rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-0 shadow-[8px_8px_0px_0px_#1E1E1E] w-full max-w-lg overflow-hidden">
        <div class="flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-4">
                <h3 class="text-xl font-black uppercase tracking-wider text-[#1E1E1E]">Schedule Live Class</h3>
                <button type="button" onclick="document.getElementById('createScheduleDialog').close()" class="rounded-full border-[3px] border-[#1E1E1E] bg-white p-2 shadow-[2px_2px_0px_0px_#1E1E1E] transition-all hover:bg-gray-100 active:translate-y-[2px]">
                    <svg class="h-5 w-5 text-[#1E1E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <form action="{{ route('admin.schedules.store') }}" method="POST" class="p-6 space-y-5">
                @csrf
                
                <div>
                    <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Class Title</label>
                    <input type="text" name="title" required placeholder="e.g. Daily Conversation Anchor" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Teacher</label>
                        <select name="teacher_id" required class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                            <option value="">Select Teacher</option>
                            @foreach($teachersList as $teacher)
                                <option value="{{ $teacher->id }}">{{ $teacher->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Target Plan/Grade</label>
                        <select name="grade" required class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                            <option value="Basic Boost Plan">Basic Boost Plan</option>
                            <option value="Speaker Combo Plan">Speaker Combo Plan</option>
                            <option value="Fluency Fast-Track Plan">Fluency Fast-Track Plan</option>
                            <option value="Gold Master Plan">Gold Master Plan</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Scheduled Time</label>
                        <input type="datetime-local" id="create_scheduled_at" name="scheduled_at" required class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Duration (mins)</label>
                        <input type="number" name="duration" value="60" required min="15" max="300" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Description</label>
                    <textarea name="description" rows="2" placeholder="Brief details about what will be covered..." class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
                </div>

                <div class="pt-4 flex items-center gap-3">
                    <button type="submit" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Schedule Class</button>
                    <button type="button" onclick="document.getElementById('createScheduleDialog').close()" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-white py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Cancel</button>
                </div>
            </form>
        </div>
    </dialog>

    <dialog id="rescheduleClassDialog" class="admin-dialog rounded-[2rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-0 shadow-[8px_8px_0px_0px_#1E1E1E] w-full max-w-md overflow-hidden">
        <div class="flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-4">
                <h3 class="text-xl font-black uppercase tracking-wider text-[#1E1E1E]">Reschedule Class</h3>
                <button type="button" onclick="document.getElementById('rescheduleClassDialog').close()" class="rounded-full border-[3px] border-[#1E1E1E] bg-white p-2 shadow-[2px_2px_0px_0px_#1E1E1E] transition-all hover:bg-gray-100 active:translate-y-[2px]">
                    <svg class="h-5 w-5 text-[#1E1E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <form id="rescheduleClassForm" action="" method="POST" class="p-6 space-y-5">
                @csrf
                
                <div>
                    <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-2">New Scheduled Time</label>
                    <input type="datetime-local" id="reschedule_scheduled_at" name="scheduled_at" required class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                </div>

                <div class="pt-4 flex items-center gap-3">
                    <button type="submit" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Confirm Reschedule</button>
                    <button type="button" onclick="document.getElementById('rescheduleClassDialog').close()" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-white py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Cancel</button>
                </div>
            </form>
        </div>
    </dialog>

<script>
    // Create/Reschedule Modals
    function openCreateModalForDate(dateStr) {
        const scheduledAtInput = document.getElementById('create_scheduled_at');
        if (scheduledAtInput) {
            scheduledAtInput.value = dateStr + 'T10:00';
        }
        document.getElementById('createScheduleDialog').showModal();
    }
    
    function openRescheduleModal(classId, rawTime) {
        const form = document.getElementById('rescheduleClassForm');
        if (form) {
            form.action = '/admin/schedules/' + classId + '/reschedule';
        }
        const timeInput = document.getElementById('reschedule_scheduled_at');
        if (timeInput) {
            timeInput.value = rawTime || '';
        }
        document.getElementById('rescheduleClassDialog').showModal();
    }

    // Toggle Calendar View (Weekly vs Monthly)
    let currentView = 'weekly';
    function toggleCalendarView() {
        const toggleBtn = document.getElementById('toggleViewBtn');
        const weeklyView = document.getElementById('weeklyCalendarView');
        const monthlyView = document.getElementById('monthlyCalendarView');

        if (currentView === 'weekly') {
            currentView = 'monthly';
            toggleBtn.innerText = 'Weekly View';
            toggleBtn.classList.remove('bg-[#BFDBFE]');
            toggleBtn.classList.add('bg-[#D1F2EB]');
            weeklyView.classList.add('hidden');
            monthlyView.classList.remove('hidden');
            showToast('Switched to Monthly View');
        } else {
            currentView = 'weekly';
            toggleBtn.innerText = 'Monthly View';
            toggleBtn.classList.remove('bg-[#D1F2EB]');
            toggleBtn.classList.add('bg-[#BFDBFE]');
            monthlyView.classList.add('hidden');
            weeklyView.classList.remove('hidden');
            showToast('Switched to Weekly View');
        }
    }

    // Live Client-Side Filters
    const teacherFilter = document.getElementById('teacherFilter');
    const curriculumFilter = document.getElementById('curriculumFilter');

    function filterSchedules() {
        const selectedTeacher = teacherFilter.value;
        const selectedCurriculum = curriculumFilter.value;
        const cards = document.querySelectorAll('.schedule-card');

        cards.forEach(card => {
            const cardTeacher = card.getAttribute('data-teacher');
            const cardGrade = card.getAttribute('data-grade');

            const teacherMatch = selectedTeacher === 'all' || cardTeacher === selectedTeacher;
            const curriculumMatch = selectedCurriculum === 'all' || cardGrade === selectedCurriculum;

            if (teacherMatch && curriculumMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (teacherFilter) teacherFilter.addEventListener('change', filterSchedules);
    if (curriculumFilter) curriculumFilter.addEventListener('change', filterSchedules);

    // Interactive Drag and Drop Mode
    let dragModeActive = false;
    let draggedCardId = null;

    function toggleDragMode() {
        dragModeActive = !dragModeActive;
        const dragBtn = document.getElementById('dragModeBtn');
        const cards = document.querySelectorAll('.schedule-card');
        
        if (dragModeActive) {
            dragBtn.innerText = 'Disable Drag-Ready Mode';
            dragBtn.classList.remove('bg-[#FEF08A]');
            dragBtn.classList.add('bg-[#FFE5D9]', 'translate-y-[2px]', 'shadow-none');
            
            cards.forEach(card => {
                card.setAttribute('draggable', 'true');
                card.classList.add('cursor-grab', 'hover:rotate-1', 'active:cursor-grabbing');
                card.style.borderStyle = 'dashed';
            });
            
            showToast('Drag-and-drop mode enabled! Drag classes to reschedule them.');
        } else {
            dragBtn.innerText = 'Enable Drag-Ready Mode';
            dragBtn.classList.add('bg-[#FEF08A]');
            dragBtn.classList.remove('bg-[#FFE5D9]', 'translate-y-[2px]', 'shadow-none');
            
            cards.forEach(card => {
                card.removeAttribute('draggable');
                card.classList.remove('cursor-grab', 'hover:rotate-1', 'active:cursor-grabbing');
                card.style.borderStyle = 'solid';
            });
            
            showToast('Drag-and-drop mode disabled.');
        }
    }

    document.addEventListener('dragstart', (e) => {
        if (!dragModeActive) return;
        const card = e.target.closest('.schedule-card');
        if (card) {
            draggedCardId = card.getAttribute('data-id');
            e.dataTransfer.setData('text/plain', draggedCardId);
            card.classList.add('opacity-40');
        }
    });

    document.addEventListener('dragend', (e) => {
        const card = e.target.closest('.schedule-card');
        if (card) {
            card.classList.remove('opacity-40');
        }
    });

    document.addEventListener('dragover', (e) => {
        if (!dragModeActive) return;
        const dropZone = e.target.closest('.weekly-day-items, .calendar-day-cell');
        if (dropZone) {
            e.preventDefault();
            dropZone.classList.add('bg-gray-100/50');
        }
    });

    document.addEventListener('dragleave', (e) => {
        const dropZone = e.target.closest('.weekly-day-items, .calendar-day-cell');
        if (dropZone) {
            dropZone.classList.remove('bg-gray-100/50');
        }
    });

    document.addEventListener('drop', async (e) => {
        if (!dragModeActive) return;
        const dropZone = e.target.closest('.weekly-day-items, .calendar-day-cell');
        if (dropZone) {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-100/50');
            const targetDate = dropZone.getAttribute('data-date');
            const classId = draggedCardId;
            
            if (classId && targetDate) {
                try {
                    const response = await fetch(`/admin/schedules/${classId}/reschedule`, {
                         method: 'POST',
                         headers: {
                             'Content-Type': 'application/json',
                             'X-Requested-With': 'XMLHttpRequest',
                             'X-CSRF-TOKEN': '{{ csrf_token() }}'
                         },
                         body: JSON.stringify({ scheduled_at: targetDate })
                    });
                     
                    const result = await response.json();
                    if (result.success) {
                        showToast(result.message);
                        setTimeout(() => {
                            if (window.replaceFrame) {
                                window.replaceFrame(window.location.href);
                            } else {
                                window.location.reload();
                            }
                        }, 800);
                    } else {
                        showToast('Rescheduling failed: ' + (result.message || 'unknown error'), 'error');
                    }
                } catch (err) {
                    showToast('Network error while rescheduling class.', 'error');
                    console.error(err);
                }
            }
        }
    });

    // Premium Neobrutalist Toast Utility
    function showToast(message, type = 'success') {
        const container = document.getElementById('neobrutalist-toast-container') || (() => {
            const div = document.createElement('div');
            div.id = 'neobrutalist-toast-container';
            div.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(div);
            return div;
        })();

        const toast = document.createElement('div');
        toast.className = `pointer-events-auto rounded-[1.25rem] border-[3px] border-[#1E1E1E] ${
            type === 'success' ? 'bg-[#D1F2EB]' : 'bg-[#FFE5D9]'
        } px-5 py-4 font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_#1E1E1E] transform translate-y-10 opacity-0 transition-all duration-300 flex items-center gap-3`;
        
        const icon = document.createElement('span');
        icon.innerText = type === 'success' ? '⚡' : '⚠️';
        toast.appendChild(icon);

        const text = document.createElement('span');
        text.innerText = message;
        toast.appendChild(text);

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        }, 10);

        setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }
</script>
@endsection
