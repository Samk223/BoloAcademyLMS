@extends('admin.layouts.portal')

@section('page-actions')
    <button type="button" data-export-target="{{ $tab === 'teachers' ? 'teachers-table' : 'students-table' }}" data-export-type="csv" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Export CSV</button>
    <button type="button" data-export-target="{{ $tab === 'teachers' ? 'teachers-table' : 'students-table' }}" data-export-type="pdf" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#BFDBFE] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Export PDF</button>
    <button type="button" data-dialog-open="{{ $tab === 'teachers' ? 'add-teacher-dialog' : 'add-student-dialog' }}" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Add user</button>
@endsection

@section('content')
    <div class="mb-8 flex flex-wrap gap-3">
        <a href="{{ route('admin.users', array_merge(request()->except('tab', 'student_page', 'teacher_page'), ['tab' => 'students'])) }}" class="rounded-full border-[3px] border-[#1E1E1E] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] {{ $tab === 'students' ? 'bg-[#E9D5FF] shadow-[3px_3px_0px_0px_#1E1E1E]' : 'bg-white' }}">Students</a>
        <a href="{{ route('admin.users', array_merge(request()->except('tab', 'student_page', 'teacher_page'), ['tab' => 'teachers'])) }}" class="rounded-full border-[3px] border-[#1E1E1E] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] {{ $tab === 'teachers' ? 'bg-[#D1F2EB] shadow-[3px_3px_0px_0px_#1E1E1E]' : 'bg-white' }}">Teachers</a>
    </div>

    <section class="{{ $tab === 'students' ? '' : 'hidden' }} admin-surface overflow-hidden">
        <div class="border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-5">
            <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Students CRM</p>
                    <h3 class="mt-2 text-2xl font-black">Searchable, filterable learner registry</h3>
                </div>
                <form method="GET" action="{{ route('admin.users') }}" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <input type="hidden" name="tab" value="students">
                    <label class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-3">
                        <input type="text" name="student_search" value="{{ $studentSearch }}" placeholder="Search students..." class="w-full border-0 bg-transparent p-0 text-sm font-bold placeholder:text-[#1E1E1E]/35 focus:ring-0">
                    </label>
                    <select name="fee_status" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="">All fee states</option>
                        <option value="Paid" @selected($feeStatus === 'Paid')>Paid</option>
                        <option value="Pending" @selected($feeStatus === 'Pending')>Pending</option>
                        <option value="Partial" @selected($feeStatus === 'Partial')>Partial</option>
                    </select>
                    <select name="student_sort" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="created_at" @selected($studentSort === 'created_at')>Newest</option>
                        <option value="name" @selected($studentSort === 'name')>Name</option>
                        <option value="progress" @selected($studentSort === 'progress')>Progress</option>
                        <option value="attendance" @selected($studentSort === 'attendance')>Attendance</option>
                        <option value="last_active" @selected($studentSort === 'last_active')>Last active</option>
                    </select>
                    <button class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Apply</button>
                </form>
            </div>
        </div>

        <div class="overflow-x-auto p-6">
            <table id="students-table" class="min-w-full border-separate border-spacing-y-3">
                <thead>
                    <tr class="text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">
                        <th class="px-4">Student ID</th>
                        <th class="px-4">Name</th>
                        <th class="px-4">Email</th>
                        <th class="px-4">Assigned Curriculum</th>
                        <th class="px-4">Assigned Teacher</th>
                        <th class="px-4">Batch</th>
                        <th class="px-4">Progress</th>
                        <th class="px-4">Attendance</th>
                        <th class="px-4">Enrollment Date</th>
                        <th class="px-4">Fee Status</th>
                        <th class="px-4">Last Active</th>
                        <th class="px-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($students as $student)
                        @php
                            $feeTone = $student['fee_status'] === 'Paid' ? 'success' : ($student['fee_status'] === 'Partial' ? 'warning' : 'danger');
                        @endphp
                        <tr class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white shadow-[3px_3px_0px_0px_#1E1E1E]">
                            <td class="rounded-l-[1.5rem] px-4 py-4 text-sm font-black">{{ $student['student_code'] }}</td>
                            <td class="px-4 py-4">
                                <p class="text-sm font-black">{{ $student['name'] }}</p>
                                <p class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/35">{{ $student['profile']['grade'] }}</p>
                            </td>
                            <td class="px-4 py-4 text-sm font-bold text-[#1E1E1E]/65">{{ $student['email'] }}</td>
                            <td class="px-4 py-4 text-sm font-bold">{{ $student['curriculum'] }}</td>
                            <td class="px-4 py-4 text-sm font-bold">{{ $student['teacher'] }}</td>
                            <td class="px-4 py-4 text-sm font-bold">{{ $student['batch'] }}</td>
                            <td class="px-4 py-4">
                                <div class="flex min-w-[120px] items-center gap-3">
                                    <span class="text-sm font-black">{{ $student['progress'] }}%</span>
                                    <div class="flex-1"><x-admin.progress :value="$student['progress']" tone="purple" /></div>
                                </div>
                            </td>
                            <td class="px-4 py-4">
                                <div class="flex min-w-[120px] items-center gap-3">
                                    <span class="text-sm font-black">{{ $student['attendance'] }}%</span>
                                    <div class="flex-1"><x-admin.progress :value="$student['attendance']" tone="mint" /></div>
                                </div>
                            </td>
                            <td class="px-4 py-4 text-sm font-bold">{{ $student['enrollment_date'] }}</td>
                            <td class="px-4 py-4"><x-admin.badge :label="$student['fee_status']" :tone="$feeTone" /></td>
                            <td class="px-4 py-4 text-sm font-bold text-[#1E1E1E]/60">{{ $student['last_active'] }}</td>
                            <td class="rounded-r-[1.5rem] px-4 py-4">
                                <details class="relative">
                                    <summary class="cursor-pointer list-none rounded-full border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">Actions</summary>
                                    <div class="absolute right-0 top-12 z-20 w-48 rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white p-3 shadow-[6px_6px_0px_0px_#1E1E1E]">
                                        @if($student['fee_status'] === 'Pending')
                                            <form method="POST" action="{{ route('admin.students.confirm-payment', $student['id']) }}" class="mb-2">
                                                @csrf
                                                <button type="submit" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#BBF0E5] hover:bg-[#A3EBDD] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] shadow-[2px_2px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">Confirm Pay</button>
                                            </form>
                                        @endif
                                        <button type="button" data-dialog-open="student-modal-{{ $student['id'] }}" class="mb-2 w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#BFDBFE] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em]">View profile</button>
                                        <button type="button" data-dialog-open="edit-student-modal-{{ $student['id'] }}" class="mb-2 w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em]">Edit</button>
                                        <a href="{{ route('admin.students.suspend', $student['id']) }}" data-confirm="Suspend {{ $student['name'] }} from current LMS access?" class="mb-2 w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#FFE5D9] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] block">Suspend</a>
                                        <a href="{{ route('admin.students.delete', $student['id']) }}" data-confirm="Delete {{ $student['name'] }} from the admin registry?" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] block">Delete</a>
                                    </div>
                                </details>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="12" class="rounded-[1.5rem] border-[3px] border-dashed border-[#1E1E1E] px-6 py-10 text-center text-sm font-bold text-[#1E1E1E]/60">No students match the current filters.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
            <x-admin.pager :paginator="$students" />
        </div>
    </section>

    <section class="{{ $tab === 'teachers' ? '' : 'hidden' }} admin-surface overflow-hidden">
        <div class="border-b-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-6 py-5">
            <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Teachers CRM</p>
                    <h3 class="mt-2 text-2xl font-black">Team, course, and workload management</h3>
                </div>
                <form method="GET" action="{{ route('admin.users') }}" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <input type="hidden" name="tab" value="teachers">
                    <label class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-3">
                        <input type="text" name="teacher_search" value="{{ $teacherSearch }}" placeholder="Search teachers..." class="w-full border-0 bg-transparent p-0 text-sm font-bold placeholder:text-[#1E1E1E]/35 focus:ring-0">
                    </label>
                    <select name="teacher_status" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="">All statuses</option>
                        <option value="Active" @selected($teacherStatus === 'Active')>Active</option>
                        <option value="Pending Approval" @selected($teacherStatus === 'Pending Approval')>Pending Approval</option>
                        <option value="Rejected" @selected($teacherStatus === 'Rejected')>Rejected</option>
                        <option value="Suspended" @selected($teacherStatus === 'Suspended')>Suspended</option>
                    </select>
                    <select name="teacher_sort" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="created_at" @selected($teacherSort === 'created_at')>Newest</option>
                        <option value="name" @selected($teacherSort === 'name')>Name</option>
                        <option value="email" @selected($teacherSort === 'email')>Email</option>
                    </select>
                    <button class="rounded-full border-[3px] border-[#1E1E1E] bg-[#BFDBFE] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Apply</button>
                </form>
            </div>
        </div>

        <div class="overflow-x-auto p-6">
            <table id="teachers-table" class="min-w-full border-separate border-spacing-y-3">
                <thead>
                    <tr class="text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">
                        <th class="px-4">Teacher ID</th>
                        <th class="px-4">Name</th>
                        <th class="px-4">Email</th>
                        <th class="px-4">Courses Assigned</th>
                        <th class="px-4">Students Handling</th>
                        <th class="px-4">Daily Classes</th>
                        <th class="px-4">Ratings</th>
                        <th class="px-4">Attendance</th>
                        <th class="px-4">Status</th>
                        <th class="px-4">Joining Date</th>
                        <th class="px-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($teachers as $teacher)
                        @php
                            $statusTone = $teacher['status'] === 'Rejected' ? 'danger' : ($teacher['status'] === 'Pending Approval' ? 'warning' : ($teacher['status'] === 'Suspended' ? 'dark' : 'success'));
                        @endphp
                        <tr class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white shadow-[3px_3px_0px_0px_#1E1E1E]">
                            <td class="rounded-l-[1.5rem] px-4 py-4 text-sm font-black">{{ $teacher['teacher_code'] }}</td>
                            <td class="px-4 py-4">
                                <p class="text-sm font-black">{{ $teacher['name'] }}</p>
                                <p class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/35">avg progress {{ $teacher['profile']['avg_progress'] }}%</p>
                            </td>
                            <td class="px-4 py-4 text-sm font-bold text-[#1E1E1E]/65">{{ $teacher['email'] }}</td>
                            <td class="px-4 py-4 text-sm font-black">{{ $teacher['courses_assigned'] }}</td>
                            <td class="px-4 py-4 text-sm font-black">{{ $teacher['students_handling'] }}</td>
                            <td class="px-4 py-4 text-sm font-black">{{ $teacher['daily_classes'] }}</td>
                            <td class="px-4 py-4 text-sm font-black">{{ $teacher['ratings'] }}</td>
                            <td class="px-4 py-4">
                                <div class="flex min-w-[120px] items-center gap-3">
                                    <span class="text-sm font-black">{{ $teacher['attendance'] }}%</span>
                                    <div class="flex-1"><x-admin.progress :value="$teacher['attendance']" tone="mint" /></div>
                                </div>
                            </td>
                            <td class="px-4 py-4"><x-admin.badge :label="$teacher['status']" :tone="$statusTone" /></td>
                            <td class="px-4 py-4 text-sm font-bold">{{ $teacher['joining_date'] }}</td>
                            <td class="rounded-r-[1.5rem] px-4 py-4">
                                <details class="relative">
                                    <summary class="cursor-pointer list-none rounded-full border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">Actions</summary>
                                    <div class="absolute right-0 top-12 z-20 w-48 rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white p-3 shadow-[6px_6px_0px_0px_#1E1E1E]">
                                        @if($teacher['status'] === 'Pending Approval')
                                            <form method="POST" action="{{ route('admin.teachers.approve', $teacher['id']) }}" class="mb-2">
                                                @csrf
                                                <div class="mb-2">
                                                    <label class="block text-[8px] font-black uppercase tracking-widest text-[#1E1E1E]/50 mb-1">Assign Active Batch</label>
                                                    <select name="batch_id" class="w-full rounded-lg border-[2px] border-[#1E1E1E] bg-[#FFF8E7] px-2 py-1 text-[10px] font-bold focus:border-[#1E1E1E] focus:ring-0">
                                                        <option value="">No batch (Unassigned)</option>
                                                        @foreach($batches as $batch)
                                                            <option value="{{ $batch->id }}">{{ $batch->name }}</option>
                                                        @endforeach
                                                    </select>
                                                </div>
                                                <button type="submit" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#D1F2EB] hover:bg-[#b5ede0] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] shadow-[2px_2px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">Approve Teacher</button>
                                            </form>
                                            <form method="POST" action="{{ route('admin.teachers.reject', $teacher['id']) }}" class="mb-2" onsubmit="return confirm('Are you sure you want to reject this teacher application? This will send a notification email.');">
                                                @csrf
                                                <button type="submit" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#FFE5D9] hover:bg-[#ffd6c4] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] shadow-[2px_2px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-[#DC2626]">Disapprove Application</button>
                                            </form>
                                        @endif
                                        <button type="button" data-dialog-open="teacher-modal-{{ $teacher['id'] }}" class="mb-2 w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#BFDBFE] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em]">View profile</button>
                                        <button type="button" data-dialog-open="edit-teacher-modal-{{ $teacher['id'] }}" class="mb-2 w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em]">Edit</button>
                                        <a href="{{ route('admin.teachers.suspend', $teacher['id']) }}" data-confirm="Suspend {{ $teacher['name'] }} from live scheduling?" class="mb-2 w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#FFE5D9] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] block">Suspend</a>
                                        <a href="{{ route('admin.teachers.delete', $teacher['id']) }}" data-confirm="Delete {{ $teacher['name'] }} from the teaching roster?" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] block">Delete</a>
                                    </div>
                                </details>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="11" class="rounded-[1.5rem] border-[3px] border-dashed border-[#1E1E1E] px-6 py-10 text-center text-sm font-bold text-[#1E1E1E]/60">No teachers match the current filters.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
            <x-admin.pager :paginator="$teachers" />
        </div>
    </section>

    @foreach($students as $student)
        <dialog id="student-modal-{{ $student['id'] }}" class="admin-dialog w-full max-w-2xl rounded-[2.5rem] border-[3px] border-[#1E1E1E] bg-white p-0 shadow-[8px_8px_0px_0px_#1E1E1E]">
            <div class="border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-5">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Student profile</p>
                        <h3 class="mt-2 text-2xl font-black">{{ $student['name'] }}</h3>
                    </div>
                    <button type="button" data-dialog-close class="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-white"><x-admin.icon name="close" class="h-5 w-5" /></button>
                </div>
            </div>
            <div class="grid gap-6 p-6 md:grid-cols-2">
                <div class="space-y-4 rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-5">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E1E1E]/45">Academic snapshot</p>
                    <p class="text-sm font-bold">Curriculum: {{ $student['curriculum'] }}</p>
                    <p class="text-sm font-bold">Teacher: {{ $student['teacher'] }}</p>
                    <p class="text-sm font-bold">Batch: {{ $student['batch'] }}</p>
                    <p class="text-sm font-bold">Classes taken: {{ $student['profile']['classes_taken'] }}</p>
                    <p class="text-sm font-bold">Streak: {{ $student['profile']['streak'] }} days</p>
                </div>
                <div class="space-y-4 rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E1E1E]/45">Support contacts</p>
                    <p class="text-sm font-bold">Parent: {{ $student['profile']['parent_name'] }}</p>
                    <p class="text-sm font-bold">Phone: {{ $student['profile']['parent_phone'] }}</p>
                    <p class="text-sm font-bold">Last active: {{ $student['last_active'] }}</p>
                    <p class="text-sm font-bold">Fee status: {{ $student['fee_status'] }}</p>
                </div>
            </div>
        </dialog>

        <dialog id="edit-student-modal-{{ $student['id'] }}" class="admin-dialog w-full max-w-2xl rounded-[2.5rem] border-[3px] border-[#1E1E1E] bg-white p-0 shadow-[8px_8px_0px_0px_#1E1E1E]">
            <div class="border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-5">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Edit Student Profile</p>
                        <h3 class="mt-2 text-2xl font-black">Update {{ $student['name'] }}</h3>
                    </div>
                    <button type="button" data-dialog-close class="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-white"><x-admin.icon name="close" class="h-5 w-5" /></button>
                </div>
            </div>
            <form method="POST" action="{{ route('admin.students.update', $student['id']) }}" class="p-6 space-y-4">
                @csrf
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Student Name</label>
                        <input type="text" name="name" value="{{ $student['name'] }}" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Email Address</label>
                        <input type="email" name="email" value="{{ $student['email'] }}" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">New Password (optional)</label>
                        <input type="password" name="password" placeholder="Leave blank to keep current" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Grade Level</label>
                        <select name="grade" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                            <option value="Grade 3" @selected($student['profile']['grade'] === 'Grade 3')>Grade 3</option>
                            <option value="Grade 4" @selected($student['profile']['grade'] === 'Grade 4')>Grade 4</option>
                            <option value="Grade 5" @selected($student['profile']['grade'] === 'Grade 5')>Grade 5</option>
                            <option value="Grade 6" @selected($student['profile']['grade'] === 'Grade 6')>Grade 6</option>
                        </select>
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Package / Curriculum Plan</label>
                        <select name="package_name" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                            <option value="Basic Boost Plan" @selected($student['curriculum'] === 'Basic Boost Plan')>Basic Boost (₹2,999)</option>
                            <option value="Speaker Combo Plan" @selected($student['curriculum'] === 'Speaker Combo Plan')>Speaker Combo (₹4,999)</option>
                            <option value="Fluency Fast-Track Plan" @selected($student['curriculum'] === 'Fluency Fast-Track Plan')>Fluency Fast-Track (₹9,999)</option>
                            <option value="Gold Master Plan" @selected($student['curriculum'] === 'Gold Master Plan')>Gold Master (₹14,999)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Fee Status</label>
                        <select name="fee_status" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                            <option value="Pending" @selected($student['fee_status'] === 'Pending')>Pending</option>
                            <option value="Paid" @selected($student['fee_status'] === 'Paid')>Paid</option>
                            <option value="Partial" @selected($student['fee_status'] === 'Partial')>Partial</option>
                        </select>
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Assigned Batch</label>
                        <select name="batch_id" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                            <option value="">Unassigned</option>
                            @foreach($batches as $b)
                                <option value="{{ $b->id }}" @selected($student['batch'] === $b->name)>{{ $b->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Assigned Teacher</label>
                        <select name="teacher_id" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                            <option value="">Unassigned</option>
                            @foreach($allTeachers as $t)
                                <option value="{{ $t->id }}" @selected($student['teacher'] === $t->name)>{{ $t->name }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Parent Name</label>
                        <input type="text" name="parent_name" value="{{ $student['profile']['parent_name'] !== 'Not added' ? $student['profile']['parent_name'] : '' }}" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Parent Phone</label>
                        <input type="text" name="parent_phone" value="{{ $student['profile']['parent_phone'] !== 'Not added' ? $student['profile']['parent_phone'] : '' }}" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                </div>
                <div class="mt-6 flex justify-end gap-3">
                    <button type="button" data-dialog-close class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Cancel</button>
                    <button type="submit" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Save Changes</button>
                </div>
            </form>
        </dialog>
    @endforeach

    @foreach($teachers as $teacher)
        <dialog id="teacher-modal-{{ $teacher['id'] }}" class="admin-dialog w-full max-w-2xl rounded-[2.5rem] border-[3px] border-[#1E1E1E] bg-white p-0 shadow-[8px_8px_0px_0px_#1E1E1E]">
            <div class="border-b-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-6 py-5">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Teacher profile</p>
                        <h3 class="mt-2 text-2xl font-black">{{ $teacher['name'] }}</h3>
                    </div>
                    <button type="button" data-dialog-close class="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-white"><x-admin.icon name="close" class="h-5 w-5" /></button>
                </div>
            </div>
            <div class="grid gap-6 p-6 md:grid-cols-2">
                <div class="space-y-4 rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-5">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E1E1E]/45">Workload</p>
                    <p class="text-sm font-bold">Courses assigned: {{ $teacher['courses_assigned'] }}</p>
                    <p class="text-sm font-bold">Students handling: {{ $teacher['students_handling'] }}</p>
                    <p class="text-sm font-bold">Daily classes: {{ $teacher['daily_classes'] }}</p>
                    <p class="text-sm font-bold">Classes created: {{ $teacher['profile']['classes'] }}</p>
                </div>
                <div class="space-y-4 rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E1E1E]/45">Ops details</p>
                    <p class="text-sm font-bold">Meeting link: {{ $teacher['profile']['meeting_link'] }}</p>
                    <p class="text-sm font-bold">Accent color: {{ $teacher['profile']['accent_color'] }}</p>
                    <p class="text-sm font-bold">Attendance: {{ $teacher['attendance'] }}%</p>
                    <p class="text-sm font-bold">Status: {{ $teacher['status'] }}</p>
                    @if($teacher['profile']['resume_path'])
                        <p class="text-sm font-bold">
                            Resume: 
                            <a href="{{ asset('storage/' . $teacher['profile']['resume_path']) }}" target="_blank" class="rounded-lg border-[2px] border-[#1E1E1E] bg-[#BFDBFE] px-2 py-1 text-xs font-black uppercase tracking-wider text-[#1E1E1E] inline-block shadow-[1px_1px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                                View Resume
                            </a>
                        </p>
                    @else
                        <p class="text-sm font-bold text-gray-400">Resume: Not uploaded</p>
                    @endif
                </div>
            </div>
        </dialog>

        <dialog id="edit-teacher-modal-{{ $teacher['id'] }}" class="admin-dialog w-full max-w-2xl rounded-[2.5rem] border-[3px] border-[#1E1E1E] bg-white p-0 shadow-[8px_8px_0px_0px_#1E1E1E]">
            <div class="border-b-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-6 py-5">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Edit Teacher Profile</p>
                        <h3 class="mt-2 text-2xl font-black">Update {{ $teacher['name'] }}</h3>
                    </div>
                    <button type="button" data-dialog-close class="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-white"><x-admin.icon name="close" class="h-5 w-5" /></button>
                </div>
            </div>
            <form method="POST" action="{{ route('admin.teachers.update', $teacher['id']) }}" class="p-6 space-y-4">
                @csrf
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Teacher Name</label>
                        <input type="text" name="name" value="{{ $teacher['name'] }}" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Email Address</label>
                        <input type="email" name="email" value="{{ $teacher['email'] }}" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">New Password (optional)</label>
                        <input type="password" name="password" placeholder="Leave blank to keep current" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Meeting Link (Google Meet)</label>
                        <input type="url" name="meeting_link" value="{{ $teacher['profile']['meeting_link'] !== 'Not configured' ? $teacher['profile']['meeting_link'] : '' }}" placeholder="https://meet.google.com/..." class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Years of Experience</label>
                        <input type="number" name="experience_years" value="{{ $teacher['profile']['experience_years'] }}" min="0" max="40" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Subject Specialization</label>
                        <input type="text" name="subject_specialization" value="{{ $teacher['profile']['subject_specialization'] }}" placeholder="e.g. Spoken English, Pronunciation" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Certifications</label>
                        <input type="text" name="certifications" value="{{ $teacher['profile']['certifications'] }}" placeholder="e.g. TEFL, CELTA" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase tracking-wider mb-2">Curriculum Expertise</label>
                        <input type="text" name="curriculum_expertise" value="{{ $teacher['profile']['curriculum_expertise'] }}" placeholder="e.g. IELTS Prep, Foundation English" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                    </div>
                </div>
                <div class="mt-6 flex justify-end gap-3">
                    <button type="button" data-dialog-close class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Cancel</button>
                    <button type="submit" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#BFDBFE] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Save Changes</button>
                </div>
            </form>
        </dialog>
    @endforeach

    <!-- Add Student Dialog -->
    <dialog id="add-student-dialog" class="admin-dialog w-full max-w-2xl rounded-[2.5rem] border-[3px] border-[#1E1E1E] bg-white p-0 shadow-[8px_8px_0px_0px_#1E1E1E]">
        <div class="border-b-[3px] border-[#1E1E1E] bg-[#E9D5FF] px-6 py-5">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">New Student Form</p>
                    <h3 class="mt-2 text-2xl font-black">Register a new learner</h3>
                </div>
                <button type="button" data-dialog-close class="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-white"><x-admin.icon name="close" class="h-5 w-5" /></button>
            </div>
        </div>
        <form method="POST" action="{{ route('admin.students.store') }}" class="p-6 space-y-4">
            @csrf
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Student Name</label>
                    <input type="text" name="name" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Email Address</label>
                    <input type="email" name="email" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Password</label>
                    <input type="password" name="password" placeholder="Leave blank for student123" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Grade Level</label>
                    <select name="grade" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                    </select>
                </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Package / Curriculum Plan</label>
                    <select name="package_name" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="Basic Boost Plan">Basic Boost (₹2,999)</option>
                        <option value="Speaker Combo Plan">Speaker Combo (₹4,999)</option>
                        <option value="Fluency Fast-Track Plan">Fluency Fast-Track (₹9,999)</option>
                        <option value="Gold Master Plan">Gold Master (₹14,999)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Fee Status</label>
                    <select name="fee_status" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                    </select>
                </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Assigned Batch</label>
                    <select name="batch_id" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="">Unassigned</option>
                        @foreach($batches as $b)
                            <option value="{{ $b->id }}">{{ $b->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Assigned Teacher</label>
                    <select name="teacher_id" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                        <option value="">Unassigned</option>
                        @foreach($allTeachers as $t)
                            <option value="{{ $t->id }}">{{ $t->name }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Parent Name</label>
                    <input type="text" name="parent_name" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Parent Phone</label>
                    <input type="text" name="parent_phone" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
                <button type="button" data-dialog-close class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Cancel</button>
                <button type="submit" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Create Student</button>
            </div>
        </form>
    </dialog>

    <!-- Add Teacher Dialog -->
    <dialog id="add-teacher-dialog" class="admin-dialog w-full max-w-2xl rounded-[2.5rem] border-[3px] border-[#1E1E1E] bg-white p-0 shadow-[8px_8px_0px_0px_#1E1E1E]">
        <div class="border-b-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-6 py-5">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">New Teacher Form</p>
                    <h3 class="mt-2 text-2xl font-black">Register a new instructor</h3>
                </div>
                <button type="button" data-dialog-close class="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-white"><x-admin.icon name="close" class="h-5 w-5" /></button>
            </div>
        </div>
        <form method="POST" action="{{ route('admin.teachers.store') }}" class="p-6 space-y-4">
            @csrf
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Teacher Name</label>
                    <input type="text" name="name" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-[#FFF8E7] px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Email Address</label>
                    <input type="email" name="email" required class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Password</label>
                    <input type="password" name="password" placeholder="Leave blank for teacher123" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Meeting Link (Google Meet)</label>
                    <input type="url" name="meeting_link" placeholder="https://meet.google.com/..." class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Years of Experience</label>
                    <input type="number" name="experience_years" min="0" max="40" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Subject Specialization</label>
                    <input type="text" name="subject_specialization" placeholder="e.g. Spoken English, Pronunciation" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Certifications</label>
                    <input type="text" name="certifications" placeholder="e.g. TEFL, CELTA" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
                <div>
                    <label class="block text-xs font-black uppercase tracking-wider mb-2">Curriculum Expertise</label>
                    <input type="text" name="curriculum_expertise" placeholder="e.g. IELTS Prep, Foundation English" class="w-full rounded-xl border-[3px] border-[#1E1E1E] bg-white px-4 py-3 text-sm font-bold focus:border-[#1E1E1E] focus:ring-0">
                </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
                <button type="button" data-dialog-close class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Cancel</button>
                <button type="submit" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#BFDBFE] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Create Teacher</button>
            </div>
        </form>
    </dialog>
@endsection
