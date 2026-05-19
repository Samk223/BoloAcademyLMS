@extends('admin.layouts.portal')

@section('page-actions')
    <button type="button" onclick="visitAdminPage(window.location.href)" data-toast="Dashboard widgets refreshed" class="rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">Refresh widgets</button>
    <a href="{{ route('admin.reports') }}" class="rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">Open reports</a>
@endsection

@section('content')
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        @foreach($metrics as $metric)
            <x-admin.stat-card :label="$metric['label']" :value="$metric['value']" :icon="$metric['icon']" :tone="$metric['tone']" :hint="$metric['label'] === 'Total students' ? 'Healthy pipeline across all learning tracks' : null" :href="$metric['href'] ?? null" />
        @endforeach
    </div>

    <div class="mt-8 grid gap-8 xl:grid-cols-[1.3fr,0.7fr]">
        <section class="admin-surface overflow-hidden">
            <div class="grid gap-6 p-7 lg:grid-cols-[1.1fr,0.9fr]">
                <div class="space-y-6">
                    <x-admin.badge label="Real-time admin pulse" tone="mint" />
                    <div>
                        <h3 class="text-4xl font-black leading-tight tracking-tight lg:text-5xl">Monthly growth is <span class="text-[#7C3AED]">{{ $monthlyGrowth }}</span> with stronger enrollment momentum.</h3>
                        <p class="mt-4 max-w-2xl text-lg font-bold leading-relaxed text-[#1E1E1E]/65">Teacher utilization, attendance health, curriculum engagement, and revenue signals are trending in one view so admins can act before bottlenecks spread.</p>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        @foreach($quickActions as $action)
                            @php
                                $toneClasses = [
                                    'mint' => 'bg-[#D1F2EB]',
                                    'purple' => 'bg-[#E9D5FF]',
                                    'peach' => 'bg-[#FFE5D9]',
                                    'lemon' => 'bg-[#FEF08A]',
                                ];
                            @endphp
                            <a href="{{ route($action['route']) }}" class="{{ $toneClasses[$action['tone']] ?? 'bg-white' }} rounded-[2rem] border-[3px] border-[#1E1E1E] p-5 text-left shadow-[3px_3px_0px_0px_#1E1E1E] transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none block hover:text-[#1E1E1E]">
                                <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#1E1E1E] bg-white shadow-[2px_2px_0px_0px_#1E1E1E]">
                                    <x-admin.icon :name="$action['icon']" class="h-6 w-6" />
                                </div>
                                <h4 class="text-lg font-black">{{ $action['label'] }}</h4>
                                <p class="mt-2 text-sm font-bold text-[#1E1E1E]/65">{{ $action['description'] }}</p>
                            </a>
                        @endforeach
                    </div>
                </div>

                <div class="space-y-5">
                    <div class="rounded-[2rem] border-[3px] border-[#1E1E1E] bg-[#1E1E1E] p-6 text-white shadow-[4px_4px_0px_0px_#A78BFA]">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Revenue analytics</p>
                                <h4 class="mt-2 text-2xl font-black">INR {{ number_format($revenueAnalytics[0]['value']) }}</h4>
                            </div>
                            <x-admin.icon name="reports" class="h-7 w-7" />
                        </div>
                        <div class="mt-6 space-y-3">
                            @foreach($revenueAnalytics as $item)
                                <div class="flex items-center justify-between rounded-2xl border-[2px] border-white/15 bg-white/10 px-4 py-3">
                                    <span class="text-sm font-black uppercase tracking-[0.16em]">{{ $item['label'] }}</span>
                                    <span class="text-sm font-black">INR {{ number_format($item['value']) }}</span>
                                </div>
                            @endforeach
                        </div>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div class="rounded-[2rem] border-[3px] border-[#1E1E1E] bg-[#BFDBFE] p-5 shadow-[3px_3px_0px_0px_#1E1E1E]">
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E1E1E]/45">Attendance alerts</p>
                            <h4 class="mt-3 text-3xl font-black">{{ $attendanceOverview['alerts'] }}</h4>
                            <p class="mt-2 text-sm font-bold text-[#1E1E1E]/60">students need intervention this week</p>
                        </div>
                        <div class="rounded-[2rem] border-[3px] border-[#1E1E1E] bg-[#FBCFE8] p-5 shadow-[3px_3px_0px_0px_#1E1E1E]">
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E1E1E]/45">System pulse</p>
                            <h4 class="mt-3 flex items-center gap-3 text-3xl font-black">
                                <span class="inline-flex h-4 w-4 rounded-full border-[2px] border-[#1E1E1E] bg-green-400 animate-pulse"></span>
                                Live
                            </h4>
                            <p class="mt-2 text-sm font-bold text-[#1E1E1E]/60">widgets synced just now</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="space-y-6">
            <div class="admin-surface p-6">
                <div class="mb-5 flex items-center justify-between">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Attendance overview</p>
                        <h3 class="mt-2 text-2xl font-black">{{ $attendanceOverview['rate'] }}% live attendance rate</h3>
                    </div>
                    <x-admin.badge :label="$attendanceOverview['perfect'] . ' strong'" tone="mint" />
                </div>
                <x-admin.progress :value="$attendanceOverview['rate']" tone="mint" />
                <div class="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div class="rounded-2xl border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-3 py-4">
                        <p class="text-2xl font-black">{{ $attendanceOverview['perfect'] }}</p>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em]">Perfect</p>
                    </div>
                    <div class="rounded-2xl border-[3px] border-[#1E1E1E] bg-[#FEF08A] px-3 py-4">
                        <p class="text-2xl font-black">{{ $attendanceOverview['average'] }}</p>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em]">Average</p>
                    </div>
                    <div class="rounded-2xl border-[3px] border-[#1E1E1E] bg-[#FFE5D9] px-3 py-4">
                        <p class="text-2xl font-black">{{ $attendanceOverview['alerts'] }}</p>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em]">Alerts</p>
                    </div>
                </div>
            </div>

            <div class="admin-surface p-6">
                <div class="mb-5 flex items-center justify-between">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Teacher workload monitoring</p>
                        <h3 class="mt-2 text-2xl font-black">Capacity watch</h3>
                    </div>
                    <x-admin.badge label="Premium feature" tone="purple" />
                </div>
                <div class="space-y-4">
                    @foreach($teacherWorkload as $teacher)
                        <a href="{{ route('admin.users', ['tab' => 'teachers', 'teacher_search' => $teacher['name']]) }}" class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-4 block hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200 text-[#1E1E1E] hover:text-[#1E1E1E]">
                            <div class="flex items-center justify-between gap-4">
                                <div>
                                    <h4 class="text-lg font-black">{{ $teacher['name'] }}</h4>
                                    <p class="text-sm font-bold text-[#1E1E1E]/55">{{ $teacher['classes'] }} classes • {{ $teacher['students'] }} learners</p>
                                </div>
                                <x-admin.badge :label="$teacher['load'] . '% load'" :tone="$teacher['load'] > 85 ? 'danger' : ($teacher['load'] > 65 ? 'warning' : 'success')" />
                            </div>
                            <div class="mt-4">
                                <x-admin.progress :value="$teacher['load']" :tone="$teacher['load'] > 85 ? 'peach' : ($teacher['load'] > 65 ? 'lemon' : 'mint')" />
                            </div>
                        </a>
                    @endforeach
                </div>
            </div>
        </section>
    </div>

    <div class="mt-8 grid gap-8 2xl:grid-cols-[1.2fr,0.8fr]">
        <section class="space-y-8">
            <div class="grid gap-8 lg:grid-cols-2">
                <div class="admin-surface p-6">
                    <div class="mb-6 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Student enrollment trends</p>
                            <h3 class="mt-2 text-2xl font-black">Last 6 months</h3>
                        </div>
                        <x-admin.badge :label="$monthlyGrowth . ' growth'" tone="mint" />
                    </div>
                    <div class="flex h-64 items-end gap-4">
                        @foreach($enrollmentTrends as $point)
                            <div class="flex flex-1 flex-col items-center gap-3">
                                <div class="flex w-full items-end justify-center rounded-t-[1.5rem] border-[3px] border-[#1E1E1E] border-b-0 bg-[#E9D5FF]" style="height: {{ max(18, $point['value'] * 18) }}px">
                                    <span class="pb-3 text-sm font-black">{{ $point['value'] }}</span>
                                </div>
                                <span class="text-xs font-black uppercase tracking-[0.2em] text-[#1E1E1E]/55">{{ $point['label'] }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>

                <div class="admin-surface p-6">
                    <div class="mb-6 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Student activity chart</p>
                            <h3 class="mt-2 text-2xl font-black">Weekly active learners</h3>
                        </div>
                        <x-admin.badge label="Daily active" tone="blue" />
                    </div>
                    <div class="flex h-64 items-end gap-4">
                        @foreach($studentActivity as $point)
                            <div class="flex flex-1 flex-col items-center gap-3">
                                <div class="flex w-full items-end justify-center rounded-t-[1.5rem] border-[3px] border-[#1E1E1E] border-b-0 bg-[#BFDBFE]" style="height: {{ max(18, $point['value'] * 28) }}px">
                                    <span class="pb-3 text-sm font-black">{{ $point['value'] }}</span>
                                </div>
                                <span class="text-xs font-black uppercase tracking-[0.2em] text-[#1E1E1E]/55">{{ $point['label'] }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <div class="grid gap-8 xl:grid-cols-2">
                <div class="admin-surface p-6">
                    <div class="mb-6 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Teacher performance graphs</p>
                            <h3 class="mt-2 text-2xl font-black">Top mentors</h3>
                        </div>
                        <x-admin.badge label="Progress-led" tone="purple" />
                    </div>
                    <div class="space-y-4">
                        @foreach($teacherPerformance as $teacher)
                            <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-5">
                                <div class="flex items-center justify-between gap-4">
                                    <div>
                                        <h4 class="text-lg font-black">{{ $teacher['name'] }}</h4>
                                        <p class="text-sm font-bold text-[#1E1E1E]/60">{{ $teacher['students'] }} learners • {{ $teacher['classes'] }} classes</p>
                                    </div>
                                    <x-admin.badge :label="$teacher['rating'] . ' rating'" tone="lemon" />
                                </div>
                                <div class="mt-5 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <div class="mb-2 flex items-center justify-between text-sm font-black"><span>Progress</span><span>{{ $teacher['progress'] }}%</span></div>
                                        <x-admin.progress :value="$teacher['progress']" tone="purple" />
                                    </div>
                                    <div>
                                        <div class="mb-2 flex items-center justify-between text-sm font-black"><span>Attendance</span><span>{{ $teacher['attendance'] }}%</span></div>
                                        <x-admin.progress :value="$teacher['attendance']" tone="mint" />
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                <div class="admin-surface p-6">
                    <div class="mb-6 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Curriculum engagement metrics</p>
                            <h3 class="mt-2 text-2xl font-black">Track engagement</h3>
                        </div>
                        <x-admin.badge label="Core LMS" tone="mint" />
                    </div>
                    <div class="space-y-4">
                        @foreach($curriculumEngagement as $curriculum)
                            <div class="rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5">
                                <div class="flex items-center justify-between gap-4">
                                    <div>
                                        <h4 class="text-lg font-black">{{ $curriculum['title'] }}</h4>
                                        <p class="text-sm font-bold text-[#1E1E1E]/55">{{ $curriculum['students'] }} enrolled learners</p>
                                    </div>
                                    <x-admin.badge :label="$curriculum['engagement'] . '% engaged'" :tone="$curriculum['engagement'] >= 85 ? 'success' : 'warning'" />
                                </div>
                                <div class="mt-4">
                                    <x-admin.progress :value="$curriculum['engagement']" tone="blue" />
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Student performance heatmap moved here for perfect grid column height balancing -->
            <div class="admin-surface p-6 mt-8">
                <div class="mb-6 flex items-center justify-between">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Student performance heatmap</p>
                        <h3 class="mt-2 text-2xl font-black">At-risk and high-growth learners</h3>
                    </div>
                    <x-admin.badge label="Premium feature" tone="pink" />
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                    @foreach($studentHeatmap as $student)
                        @php
                            $heatTone = $student['progress'] >= 80 ? 'bg-[#D1F2EB]' : ($student['progress'] >= 55 ? 'bg-[#FEF08A]' : 'bg-[#FFE5D9]');
                        @endphp
                        <a href="{{ route('admin.users', ['tab' => 'students', 'student_search' => $student['name']]) }}" class="{{ $heatTone }} rounded-[1.5rem] border-[3px] border-[#1E1E1E] p-4 shadow-[3px_3px_0px_0px_#1E1E1E] block hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200 text-[#1E1E1E] hover:text-[#1E1E1E]">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <h4 class="text-base font-black">{{ $student['name'] }}</h4>
                                    <p class="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#1E1E1E]/55">{{ $student['streak'] }} day streak</p>
                                </div>
                                <x-admin.badge :label="$student['progress'] . '%'" :tone="$student['progress'] >= 80 ? 'success' : ($student['progress'] >= 55 ? 'warning' : 'danger')" />
                            </div>
                            <div class="mt-4 space-y-3">
                                <div>
                                    <div class="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em]"><span>Progress</span><span>{{ $student['progress'] }}%</span></div>
                                    <x-admin.progress :value="$student['progress']" tone="purple" />
                                </div>
                                <div>
                                    <div class="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em]"><span>Attendance</span><span>{{ $student['attendance'] }}%</span></div>
                                    <x-admin.progress :value="$student['attendance']" tone="mint" />
                                </div>
                            </div>
                        </a>
                    @endforeach
                </div>
            </div>
        </section>

        <section class="space-y-8">
            <div class="admin-surface p-6">
                <div class="mb-5 flex items-center justify-between">
                    <h3 class="text-2xl font-black">Recent notifications</h3>
                    <a href="{{ route('admin.notifications') }}" class="text-sm font-black uppercase tracking-[0.18em] text-[#1E1E1E]/55">Open hub</a>
                </div>
                <div class="space-y-4">
                    @foreach($recentNotifications as $notification)
                        <div class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-[#FFF8E7] p-4">
                            <div class="flex items-center justify-between gap-4">
                                <h4 class="text-base font-black">{{ $notification['title'] }}</h4>
                                <x-admin.badge :label="$notification['type']" tone="slate" />
                            </div>
                            <p class="mt-2 text-sm font-bold text-[#1E1E1E]/60">{{ $notification['message'] }}</p>
                            <p class="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/35">{{ $notification['date'] }}</p>
                        </div>
                    @endforeach
                </div>
            </div>

            <div class="admin-surface p-6">
                <div class="mb-5 flex items-center justify-between">
                    <h3 class="text-2xl font-black">Upcoming classes</h3>
                    <x-admin.badge label="Today's flow" tone="blue" />
                </div>
                <div class="space-y-4">
                    @forelse($upcomingClasses as $class)
                        <a href="{{ route('admin.schedules') }}" class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white p-4 block hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200 text-[#1E1E1E] hover:text-[#1E1E1E]">
                            <h4 class="text-base font-black">{{ $class['title'] }}</h4>
                            <p class="mt-2 text-sm font-bold text-[#1E1E1E]/60">{{ $class['teacher'] }} • {{ $class['grade'] }}</p>
                            <p class="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/40">{{ $class['time'] }}</p>
                        </a>
                    @empty
                        <div class="rounded-[1.5rem] border-[3px] border-dashed border-[#1E1E1E] bg-white p-5">
                            <p class="text-sm font-bold text-[#1E1E1E]/60">No upcoming classes yet. New schedules will surface here automatically.</p>
                        </div>
                    @endforelse
                </div>
            </div>

            <div class="admin-surface p-6">
                <div class="mb-5 flex items-center justify-between">
                    <h3 class="text-2xl font-black">Recent enrollments</h3>
                    <x-admin.badge label="Admissions" tone="mint" />
                </div>
                <div class="space-y-4">
                    @foreach($recentEnrollments as $enrollment)
                        <a href="{{ route('admin.users', ['tab' => 'students', 'student_search' => $enrollment['name']]) }}" class="rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white p-4 block hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200 text-[#1E1E1E] hover:text-[#1E1E1E]">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <h4 class="text-base font-black">{{ $enrollment['name'] }}</h4>
                                    <p class="mt-1 text-sm font-bold text-[#1E1E1E]/60">{{ $enrollment['email'] }}</p>
                                </div>
                                <x-admin.badge :label="$enrollment['grade']" tone="purple" />
                            </div>
                            <p class="mt-3 text-sm font-bold text-[#1E1E1E]/60">Teacher: {{ $enrollment['teacher'] }}</p>
                            <p class="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/35">{{ $enrollment['created_at'] }}</p>
                        </a>
                    @endforeach
                </div>
            </div>
        </section>
    </div>
@endsection
