@extends('admin.layouts.portal')

@section('page-actions')
    <button type="button" onclick="const d = document.getElementById('createBatchDrawer'); d.classList.remove('drawer-closed'); d.classList.add('drawer-open')" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-transform active:translate-y-[2px]">Create batch</button>
    <a href="{{ route('admin.batches.export') }}" class="inline-block rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-transform active:translate-y-[2px]">Export roster</a>
@endsection

@section('content')
    <div class="grid gap-6 xl:grid-cols-2">
        @foreach($batches as $batch)
            @php($capacityPercent = (int) round(($batch['students'] / $batch['capacity']) * 100))
            <article class="admin-surface p-6">
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <x-admin.badge :label="$batch['schedule']" tone="blue" />
                        <h3 class="mt-4 text-3xl font-black">{{ $batch['name'] }}</h3>
                        <p class="mt-3 text-base font-bold text-[#1E1E1E]/65">Teacher assigned: <span class="font-black text-[#1E1E1E]">{{ $batch['teacher'] }}</span></p>
                        <p class="mt-1 text-base font-bold text-[#1E1E1E]/65">Curriculum attached: <span class="font-black text-[#1E1E1E]">{{ $batch['curriculum'] }}</span></p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <button type="button" data-batch="{{ json_encode($batch) }}" onclick="openEditBatchDrawer(this)" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-transform active:translate-y-[2px]">Edit</button>
                        <button type="button" data-batch-id="{{ $batch['id'] }}" data-batch-name="{{ $batch['name'] }}" onclick="openAssignStudentsDrawer(this)" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-transform active:translate-y-[2px]">Assign students</button>
                    </div>
                </div>

                <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#D1F2EB] p-4">
                        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Student count</p>
                        <p class="mt-2 text-2xl font-black">{{ $batch['students'] }}</p>
                    </div>
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FFE5D9] p-4">
                        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Capacity</p>
                        <p class="mt-2 text-2xl font-black">{{ $batch['capacity'] }}</p>
                    </div>
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#BFDBFE] p-4">
                        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Progress</p>
                        <p class="mt-2 text-2xl font-black">{{ $batch['progress'] }}%</p>
                    </div>
                    <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FEF08A] p-4">
                        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Meeting link</p>
                        <p class="mt-2 text-sm font-black break-all">{{ $batch['meeting_link'] }}</p>
                    </div>
                </div>

                <div class="mt-6 grid gap-6 lg:grid-cols-2">
                    <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                        <div class="mb-3 flex items-center justify-between">
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Capacity health</p>
                            <x-admin.badge :label="$capacityPercent . '% filled'" :tone="$capacityPercent > 90 ? 'warning' : 'success'" />
                        </div>
                        <x-admin.progress :value="$capacityPercent" tone="mint" />
                    </div>
                    <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                        <div class="mb-3 flex items-center justify-between">
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Batch progress tracking</p>
                            <x-admin.badge :label="$batch['progress'] . '% delivered'" tone="blue" />
                        </div>
                        <x-admin.progress :value="$batch['progress']" tone="blue" />
                    </div>
                </div>
            </article>
        @endforeach
    </div>

@push('modals')
    <!-- Create Batch Drawer -->
    <div id="createBatchDrawer" class="admin-drawer drawer-closed">
        <!-- Header -->
        <div class="flex items-center justify-between border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-3.5 rounded-t-[2.2rem]">
            <h3 class="text-xl font-black uppercase tracking-wider text-[#1E1E1E]">Create New Batch</h3>
            <button type="button" onclick="const d = document.getElementById('createBatchDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="rounded-full border-[3px] border-[#1E1E1E] bg-white p-2 shadow-[2px_2px_0px_0px_#1E1E1E] transition-all hover:bg-gray-100 active:translate-y-[2px]">
                <svg class="h-5 w-5 text-[#1E1E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <!-- Body -->
        <form action="{{ route('admin.batches.store') }}" method="POST" class="flex-initial overflow-y-auto p-5 space-y-3">
            @csrf
            
            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Batch Name</label>
                <input type="text" name="name" required placeholder="e.g. IELTS Evening Bridge" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Curriculum Plan</label>
                <select name="curriculum_name" required class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                    <option value="" disabled selected>Select a curriculum template</option>
                    @foreach($curriculumsList as $curr)
                        <option value="{{ $curr['title'] }}">{{ $curr['title'] }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Schedule Details</label>
                <input type="text" name="schedule_details" required placeholder="e.g. Mon, Wed, Fri • 07:00 PM" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Teacher Assigned</label>
                <select name="teacher_id" required class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                    <option value="" disabled selected>Assign a mentor</option>
                    @foreach($teachersList as $t)
                        <option value="{{ $t->id }}">{{ $t->name }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Capacity (Max Students)</label>
                <input type="number" name="capacity" required min="1" max="40" placeholder="e.g. 15" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div class="pt-2 flex items-center gap-3">
                <button type="submit" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Create Batch</button>
                <button type="button" onclick="const d = document.getElementById('createBatchDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-white py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Cancel</button>
            </div>
        </form>
    </div>

    <!-- Edit Batch Drawer -->
    <div id="editBatchDrawer" class="admin-drawer drawer-closed">
        <!-- Header -->
        <div class="flex items-center justify-between border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-3.5 rounded-t-[2.2rem]">
            <h3 class="text-xl font-black uppercase tracking-wider text-[#1E1E1E]">Edit Batch Details</h3>
            <button type="button" onclick="const d = document.getElementById('editBatchDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="rounded-full border-[3px] border-[#1E1E1E] bg-white p-2 shadow-[2px_2px_0px_0px_#1E1E1E] transition-all hover:bg-gray-100 active:translate-y-[2px]">
                <svg class="h-5 w-5 text-[#1E1E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <!-- Body -->
        <form id="editBatchForm" action="" method="POST" class="flex-initial overflow-y-auto p-5 space-y-3">
            @csrf
            
            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Batch Name</label>
                <input type="text" id="edit_batch_name" name="name" required placeholder="e.g. IELTS Evening Bridge" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Curriculum Plan</label>
                <select id="edit_batch_curriculum" name="curriculum_name" required class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                    <option value="" disabled>Select a curriculum template</option>
                    @foreach($curriculumsList as $curr)
                        <option value="{{ $curr['title'] }}">{{ $curr['title'] }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Schedule Details</label>
                <input type="text" id="edit_batch_schedule" name="schedule_details" required placeholder="Mon, Wed, Fri • 07:00 PM" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Teacher Assigned</label>
                <select id="edit_batch_teacher" name="teacher_id" required class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
                    <option value="" disabled>Assign a mentor</option>
                    @foreach($teachersList as $t)
                        <option value="{{ $t->id }}">{{ $t->name }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Capacity (Max Students)</label>
                <input type="number" id="edit_batch_capacity" name="capacity" required min="1" max="40" placeholder="e.g. 15" class="w-full rounded-2xl border-[3px] border-[#1E1E1E] bg-white px-4 py-2 font-bold text-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] focus:outline-none focus:ring-0">
            </div>

            <div class="pt-2 flex items-center gap-3">
                <button type="submit" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Save Changes</button>
                <button type="button" onclick="const d = document.getElementById('editBatchDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-white py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Cancel</button>
            </div>
        </form>
    </div>

    <!-- Assign Students Drawer -->
    <div id="assignStudentsDrawer" class="admin-drawer drawer-closed">
        <!-- Header -->
        <div class="flex items-center justify-between border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-3.5 rounded-t-[2.2rem]">
            <div>
                <h3 class="text-xl font-black uppercase tracking-wider text-[#1E1E1E]">Assign Students</h3>
                <p class="text-[10px] font-black uppercase text-[#1E1E1E]/60">Batch: <span id="assign_batch_name_display" class="text-[#1E1E1E]"></span></p>
            </div>
            <button type="button" onclick="const d = document.getElementById('assignStudentsDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="rounded-full border-[3px] border-[#1E1E1E] bg-white p-2 shadow-[2px_2px_0px_0px_#1E1E1E] transition-all hover:bg-gray-100 active:translate-y-[2px]">
                <svg class="h-5 w-5 text-[#1E1E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <!-- Body -->
        <form id="assignStudentsForm" action="" method="POST" class="flex-initial overflow-y-auto p-5 space-y-3">
            @csrf
            
            <div>
                <label class="block text-xs font-black uppercase tracking-widest text-[#1E1E1E]/60 mb-1">Select Unassigned Students</label>
                
                @if($unassignedStudents->isEmpty())
                    <div class="rounded-2xl border-[3px] border-dashed border-[#1E1E1E]/20 p-6 text-center text-sm font-bold text-[#1E1E1E]/50 bg-[#FBFBFA]">
                        All active students are currently assigned to batches.
                    </div>
                @else
                    <div class="border-[3px] border-[#1E1E1E] rounded-2xl bg-white p-3 max-h-60 overflow-y-auto space-y-2.5 shadow-[3px_3px_0px_0px_#1E1E1E]">
                        @foreach($unassignedStudents as $student)
                            <label class="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF8E7] cursor-pointer transition-colors">
                                <input type="checkbox" name="student_ids[]" value="{{ $student->id }}" class="rounded border-[2.5px] border-[#1E1E1E] text-[#7C3AED] focus:ring-0 h-5 w-5">
                                <div class="text-left">
                                    <p class="text-sm font-black text-[#1E1E1E]">{{ $student->name }}</p>
                                    <p class="text-[10px] font-bold text-[#1E1E1E]/50 uppercase tracking-wider">{{ $student->grade }} • {{ $student->user?->email ?? 'N/A' }}</p>
                                </div>
                            </label>
                        @endforeach
                    </div>
                @endif
            </div>

            <div class="pt-2 flex items-center gap-3">
                <button type="submit" @if($unassignedStudents->isEmpty()) disabled @endif class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none">Assign Selected</button>
                <button type="button" onclick="const d = document.getElementById('assignStudentsDrawer'); d.classList.add('drawer-closed'); d.classList.remove('drawer-open')" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-white py-2.5 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] text-[#1E1E1E] transition-all active:translate-y-[2px]">Cancel</button>
            </div>
        </form>
    </div>
@endpush

@push('scripts')
<script>
    function openEditBatchDrawer(element) {
        const batch = JSON.parse(element.getAttribute('data-batch'));
        document.getElementById('editBatchForm').action = '/admin/batches/' + batch.id + '/update';
        document.getElementById('edit_batch_name').value = batch.name || '';
        document.getElementById('edit_batch_schedule').value = batch.schedule || '';
        document.getElementById('edit_batch_capacity').value = batch.capacity || '';
        document.getElementById('edit_batch_teacher').value = batch.teacher_id || '';
        document.getElementById('edit_batch_curriculum').value = batch.curriculum || '';

        const drawer = document.getElementById('editBatchDrawer');
        drawer.classList.remove('drawer-closed');
        drawer.classList.add('drawer-open');
    }

    function openAssignStudentsDrawer(element) {
        const batchId = element.getAttribute('data-batch-id');
        const batchName = element.getAttribute('data-batch-name');
        document.getElementById('assignStudentsForm').action = '/admin/batches/' + batchId + '/assign';
        document.getElementById('assign_batch_name_display').textContent = batchName;

        const drawer = document.getElementById('assignStudentsDrawer');
        drawer.classList.remove('drawer-closed');
        drawer.classList.add('drawer-open');
    }
</script>
@endpush
@endsection
