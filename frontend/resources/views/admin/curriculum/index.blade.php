@extends('admin.layouts.portal')

@section('page-actions')
    <button type="button" onclick="const d = document.getElementById('createCurriculumDrawer'); d.classList.remove('drawer-closed'); d.classList.add('drawer-open')" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-transform active:translate-y-[2px]">Create curriculum</button>
    <a href="{{ route('admin.curriculum.export') }}" class="inline-block rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-transform active:translate-y-[2px]">Export analytics</a>
@endsection

@section('content')
    <div class="grid gap-6 lg:grid-cols-2">
        @foreach($curriculums as $curriculum)
            <article class="admin-surface overflow-hidden">
                <div class="border-b-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-6 py-5">
                    <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                            <x-admin.badge :label="$curriculum['duration']" tone="purple" />
                            <h3 class="mt-4 text-3xl font-black">{{ $curriculum['title'] }}</h3>
                            <p class="mt-3 text-base font-bold leading-relaxed text-[#1E1E1E]/65">{{ $curriculum['description'] }}</p>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            <button type="button" data-curriculum="{{ json_encode($curriculum) }}" onclick="openEditDrawer(this)" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">Edit</button>
                            <a href="{{ route('admin.curriculum.duplicate', $curriculum['id']) }}" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#BFDBFE] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Duplicate</a>
                            <a href="{{ route('admin.curriculum.archive', $curriculum['id']) }}" data-confirm="Archive {{ $curriculum['title'] }} from active curriculum publishing?" data-tone="peach" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#FFE5D9] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all hover:translate-y-[2px] active:translate-y-[4px]">Archive</a>
                        </div>
                    </div>
                </div>

                <div class="grid gap-6 p-6">
                    <div class="grid gap-4 md:grid-cols-4">
                        <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#E9D5FF] p-4">
                            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Teachers</p>
                            <p class="mt-2 text-sm font-black leading-tight">{{ $curriculum['teacher'] }}</p>
                        </div>
                        <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#D1F2EB] p-4">
                            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Total Students</p>
                            <p class="mt-2 text-lg font-black">{{ $curriculum['student_count'] }}</p>
                        </div>
                        <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#BFDBFE] p-4">
                            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Engagement</p>
                            <p class="mt-2 text-lg font-black">{{ $curriculum['engagement'] }}%</p>
                        </div>
                        <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FEF08A] p-4">
                            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Dates</p>
                            <p class="mt-2 text-xs font-black leading-tight">{{ $curriculum['dates'] }}</p>
                        </div>
                    </div>

                    <!-- Batches Section -->
                    <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Active Batches & Enrolled Students</p>
                        <div class="mt-4 space-y-3">
                            @if(empty($curriculum['batches']))
                                <div class="rounded-2xl border-[3px] border-dashed border-[#1E1E1E]/20 p-4 text-center text-sm font-bold text-[#1E1E1E]/50 bg-[#FBFBFA]">
                                    No batches assigned to this curriculum
                                </div>
                            @else
                                <div class="grid gap-4 sm:grid-cols-2">
                                    @foreach($curriculum['batches'] as $batch)
                                        <div class="rounded-2xl border-[3px] border-[#1E1E1E] p-4 flex flex-col justify-between shadow-[3px_3px_0px_0px_#1E1E1E] {{ $batch['student_count'] > 0 ? 'bg-[#D1F2EB]' : 'bg-[#FFE5D9]' }}">
                                            <div>
                                                <div class="flex items-start justify-between gap-2">
                                                    <h4 class="text-base font-black leading-tight">{{ $batch['name'] }}</h4>
                                                    @if($batch['student_count'] > 0)
                                                        <span class="shrink-0 rounded-full border-[2px] border-[#1E1E1E] bg-[#BFDBFE] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]">
                                                            {{ $batch['student_count'] }} Enrolled
                                                        </span>
                                                    @else
                                                        <span class="shrink-0 rounded-full border-[2px] border-[#1E1E1E] bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#1E1E1E]/60">
                                                            No Students
                                                        </span>
                                                    @endif
                                                </div>
                                                <p class="text-xs font-bold text-[#1E1E1E]/60 mt-1">Teacher: <span class="font-black text-[#1E1E1E]">{{ $batch['teacher'] }}</span></p>
                                            </div>

                                            @if($batch['student_count'] > 0)
                                                <div class="mt-3 border-t-2 border-[#1E1E1E]/10 pt-2">
                                                    <p class="text-[9px] font-black uppercase tracking-wider text-[#1E1E1E]/50">Students</p>
                                                    <div class="mt-1 flex flex-wrap gap-1">
                                                        @foreach($batch['students'] as $studentName)
                                                            <span class="rounded-md border-[1.5px] border-[#1E1E1E] bg-white px-1.5 py-0.5 text-[10px] font-black">{{ $studentName }}</span>
                                                        @endforeach
                                                    </div>
                                                </div>
                                            @else
                                                <div class="mt-3 border-t-2 border-[#1E1E1E]/10 pt-2 text-center">
                                                    <p class="text-[10px] font-bold text-[#1E1E1E]/40 italic">Waiting for student enrollments...</p>
                                                </div>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            @endif
                        </div>
                    </div>

                    <div class="grid gap-6 lg:grid-cols-2">
                        <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Syllabus structure</p>
                            <ul class="mt-4 space-y-3">
                                @foreach($curriculum['syllabus'] as $item)
                                    <li class="rounded-2xl border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-3 text-sm font-bold">{{ $item }}</li>
                                @endforeach
                            </ul>
                        </div>
                        <div class="space-y-6">
                            <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Objectives</p>
                                <ul class="mt-4 space-y-3 text-sm font-bold text-[#1E1E1E]/70">
                                    @foreach($curriculum['objectives'] as $item)
                                        <li>• {{ $item }}</li>
                                    @endforeach
                                </ul>
                            </div>
                            <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Outcomes and certification</p>
                                <ul class="mt-4 space-y-3 text-sm font-bold text-[#1E1E1E]/70">
                                    @foreach($curriculum['outcomes'] as $item)
                                        <li>• {{ $item }}</li>
                                    @endforeach
                                </ul>
                                <div class="mt-4"><x-admin.badge :label="$curriculum['certification']" tone="mint" size="md" /></div>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-[#1E1E1E] p-5 text-white shadow-[4px_4px_0px_0px_#E9D5FF]">
                        <div class="mb-4 flex items-center justify-between">
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Progress milestones</p>
                            <span class="text-sm font-black">{{ $curriculum['engagement'] }}% engagement</span>
                        </div>
                        <div class="grid gap-4 md:grid-cols-4">
                            @foreach($curriculum['milestones'] as $milestone)
                                <div class="rounded-[1.5rem] border-[2px] border-white/20 bg-white/10 px-4 py-4 text-center">
                                    <p class="text-2xl font-black">{{ $milestone }}%</p>
                                    <p class="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Milestone</p>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </article>
        @endforeach
    </div>

@push('modals')
    <!-- Create Curriculum Drawer -->
    <div id="createCurriculumDrawer" class="admin-drawer drawer-closed">
        <!-- Header -->
        <div class="flex items-center justify-between border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-3.5 rounded-t-[2.2rem]">
            <h3 class="text-xl font-black uppercase tracking-wider text-[#1E1E1E]">Create New Curriculum</h3>
            <button type="button" onclick="const d = document.getElementById('createCurriculumDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="rounded-full border-[3px] border-[#1E1E1E] bg-white p-2 shadow-[2px_2px_0px_0px_#1E1E1E] transition-all hover:bg-gray-100 active:translate-y-[2px]">
                <svg class="h-5 w-5 text-[#1E1E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <!-- Body (Scrollable form) -->
        <form action="{{ route('admin.curriculum.store') }}" method="POST" class="flex-initial overflow-y-auto p-5 space-y-3">
            @csrf
            
            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Curriculum Title</label>
                <input type="text" name="title" required placeholder="e.g. Basic Boost Plan" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Duration</label>
                    <input type="text" name="duration" required placeholder="e.g. 1 Month" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Dates Range</label>
                    <input type="text" name="dates" required placeholder="e.g. 03 Jun - 02 Jul" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                </div>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Description</label>
                <textarea name="description" required rows="2" placeholder="Describe the core focus of this curriculum..." class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Syllabus Structure (One item per line)</label>
                <textarea name="syllabus" required rows="2" placeholder="Grammar anchors&#10;Listening circles&#10;Micro speaking practice" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Objectives (One item per line)</label>
                <textarea name="objectives" required rows="2" placeholder="Build sentence confidence&#10;Improve listening accuracy&#10;Strengthen vocabulary recall" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Outcomes & Certification (One item per line)</label>
                <textarea name="outcomes" required rows="2" placeholder="Daily spoken confidence&#10;Improved class participation&#10;Certificate on completion" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Certificate Name</label>
                <input type="text" name="certification" required placeholder="e.g. Bolo Foundation Certificate" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div class="pt-2 flex items-center gap-3">
                <button type="submit" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Create Curriculum</button>
                <button type="button" onclick="const d = document.getElementById('createCurriculumDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-white py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Cancel</button>
            </div>
        </form>
    </div>

    <!-- Edit Curriculum Drawer -->
    <div id="editCurriculumDrawer" class="admin-drawer drawer-closed">
        <!-- Header -->
        <div class="flex items-center justify-between border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-3.5 rounded-t-[2.2rem]">
            <h3 class="text-xl font-black uppercase tracking-wider text-[#1E1E1E]">Edit Curriculum</h3>
            <button type="button" onclick="const d = document.getElementById('editCurriculumDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="rounded-full border-[3px] border-[#1E1E1E] bg-white p-2 shadow-[2px_2px_0px_0px_#1E1E1E] transition-all hover:bg-gray-100 active:translate-y-[2px]">
                <svg class="h-5 w-5 text-[#1E1E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <!-- Body (Scrollable form) -->
        <form id="editCurriculumForm" action="" method="POST" class="flex-initial overflow-y-auto p-5 space-y-3">
            @csrf
            
            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Curriculum Title</label>
                <input type="text" id="edit_title" name="title" required placeholder="e.g. Basic Boost Plan" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Duration</label>
                    <input type="text" id="edit_duration" name="duration" required placeholder="e.g. 1 Month" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Dates Range</label>
                    <input type="text" id="edit_dates" name="dates" required placeholder="e.g. 03 Jun - 02 Jul" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                </div>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Description</label>
                <textarea id="edit_description" name="description" required rows="2" placeholder="Describe the core focus of this curriculum..." class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Syllabus Structure (One item per line)</label>
                <textarea id="edit_syllabus" name="syllabus" required rows="2" placeholder="Grammar anchors&#10;Listening circles&#10;Micro speaking practice" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Objectives (One item per line)</label>
                <textarea id="edit_objectives" name="objectives" required rows="2" placeholder="Build sentence confidence&#10;Improve listening accuracy&#10;Strengthen vocabulary recall" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Outcomes & Certification (One item per line)</label>
                <textarea id="edit_outcomes" name="outcomes" required rows="2" placeholder="Daily spoken confidence&#10;Improved class participation&#10;Certificate on completion" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0"></textarea>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Certificate Name</label>
                <input type="text" id="edit_certification" name="certification" required placeholder="e.g. Bolo Foundation Certificate" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-3.5 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div class="pt-2 flex items-center gap-3">
                <button type="submit" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Save Changes</button>
                <button type="button" onclick="const d = document.getElementById('editCurriculumDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-white py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Cancel</button>
            </div>
        </form>
    </div>
@endpush

<script>
    function openEditDrawer(element) {
        const curriculum = JSON.parse(element.getAttribute('data-curriculum'));
        document.getElementById('editCurriculumForm').action = '/admin/curriculum/' + curriculum.id + '/update';
        document.getElementById('edit_title').value = curriculum.title || '';
        document.getElementById('edit_duration').value = curriculum.duration || '';
        document.getElementById('edit_dates').value = curriculum.dates || '';
        document.getElementById('edit_description').value = curriculum.description || '';
        document.getElementById('edit_certification').value = curriculum.certification || '';
        
        // join array values by newline
        document.getElementById('edit_syllabus').value = (curriculum.syllabus || []).join('\n');
        document.getElementById('edit_objectives').value = (curriculum.objectives || []).join('\n');
        document.getElementById('edit_outcomes').value = (curriculum.outcomes || []).join('\n');

        const drawer = document.getElementById('editCurriculumDrawer');
        drawer.classList.remove('drawer-closed');
        drawer.classList.add('drawer-open');
    }
</script>
@endsection
