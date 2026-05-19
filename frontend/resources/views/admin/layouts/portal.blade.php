<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $pageTitle ?? 'Admin Portal' }} | Bolo Academy</title>
        <!-- Favicons -->
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png">
        <link rel="shortcut icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/favicon.png">
        <meta name="theme-color" content="#7C6FC1">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        @vite(['resources/css/app.css'])
        <style>
            .admin-shell {
                background: #FFF8E7;
                color: #1E1E1E;
            }

            .admin-border {
                border: 3px solid #1E1E1E;
            }

            .admin-shadow {
                box-shadow: 4px 4px 0 0 #1E1E1E;
            }

            .admin-shadow-sm {
                box-shadow: 3px 3px 0 0 #1E1E1E;
            }

            .admin-hover {
                transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
            }

            .admin-hover:hover {
                transform: translate(3px, 3px);
                box-shadow: none;
            }

            .admin-surface {
                border: 3px solid #1E1E1E;
                border-radius: 2rem;
                background: white;
                box-shadow: 4px 4px 0 0 #1E1E1E;
            }

            .admin-sidebar {
                width: 285px;
                transition: width .3s ease, transform .3s ease;
                z-index: 30;
            }

            .admin-shell.admin-sidebar-collapsed .admin-sidebar {
                width: 106px;
            }

            .admin-shell.admin-sidebar-collapsed .sidebar-label,
            .admin-shell.admin-sidebar-collapsed .sidebar-subtext,
            .admin-shell.admin-sidebar-collapsed .sidebar-brand-text,
            .admin-shell.admin-sidebar-collapsed .sidebar-branch {
                display: none !important;
            }

            .sidebar-nav-link {
                position: relative;
            }

            .admin-shell.admin-sidebar-collapsed .sidebar-nav-link {
                justify-content: center;
                align-items: center !important;
                gap: 0 !important;
                padding: 0.65rem !important;
                border-radius: 1.25rem !important;
            }

            .admin-shell.admin-sidebar-collapsed .sidebar-nav-link span[data-admin-nav-icon] {
                margin-top: 0 !important;
                width: 2.75rem !important;
                height: 2.75rem !important;
                border-radius: 1rem !important;
            }

            .admin-shell.admin-sidebar-collapsed .sidebar-nav-link span[data-admin-nav-icon] svg {
                width: 1.25rem !important;
                height: 1.25rem !important;
            }

            .sidebar-tooltip {
                display: none;
                position: absolute;
                left: calc(100% + 15px);
                top: 50%;
                transform: translateY(-50%);
                z-index: 99;
                white-space: nowrap;
                pointer-events: none;
                background: #FFF8E7;
                color: #1E1E1E;
                border: 3px solid #1E1E1E;
                border-radius: 0.75rem;
                padding: 0.5rem 1rem;
                font-family: 'Fredoka', 'Inter', sans-serif;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                font-size: 0.75rem;
                box-shadow: 3px 3px 0px 0px #1E1E1E;
            }

            .admin-shell.admin-sidebar-collapsed .sidebar-nav-link:hover .sidebar-tooltip {
                display: block !important;
            }

            .admin-shell.admin-sidebar-collapsed .sidebar-stats-card {
                display: none !important;
            }

            .admin-shell.admin-sidebar-collapsed .collapsed-brand-container {
                align-items: center !important;
                padding-inline: 0 !important;
            }

            .admin-shell.admin-sidebar-collapsed .collapsed-brand-container > div {
                margin-bottom: 0 !important;
            }

            .admin-mobile-open .admin-sidebar {
                transform: translateX(0);
            }

            @media (max-width: 1023px) {
                .admin-sidebar {
                    position: fixed;
                    inset: 0 auto 0 0;
                    z-index: 60;
                    transform: translateX(-105%);
                    height: 100vh;
                }
            }

            .admin-fade-up {
                animation: adminFadeUp .35s ease both;
            }

            .admin-frame-enter {
                animation: adminFrameEnter .28s ease both;
            }

            .admin-frame-leave {
                animation: adminFrameLeave .18s ease both;
            }

            @keyframes adminFadeUp {
                from {
                    opacity: 0;
                    transform: translateY(18px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes adminFrameEnter {
                from {
                    opacity: 0;
                    transform: translateY(18px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes adminFrameLeave {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(10px);
                }
            }

            dialog.admin-dialog::backdrop {
                background: rgba(30, 30, 30, 0.4);
                backdrop-filter: blur(5px);
            }

            @media print {
                body {
                    overflow: visible !important;
                }

                .admin-sidebar,
                .admin-topbar,
                .admin-no-print {
                    display: none !important;
                }

                main {
                    padding: 0 !important;
                }
            }

            /* Hide scrollbar for sidebar nav */
            .sidebar-nav-no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .sidebar-nav-no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }

            /* Premium Neobrutalist Floating Drawers */
            .admin-drawer {
                position: fixed;
                top: 1.5rem; /* 24px */
                right: 1.5rem; /* 24px */
                z-index: 100;
                width: calc(100% - 3rem);
                max-width: 32rem; /* max-w-lg is 512px */
                max-height: calc(100vh - 7rem);
                border: 4px solid #1E1E1E;
                background-color: #FFF8E7;
                border-radius: 2.5rem;
                box-shadow: -10px 10px 0px 0px #1E1E1E;
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-in-out;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .admin-drawer.drawer-closed {
                transform: translateX(calc(100% + 250px)) !important;
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
            }

            .admin-drawer.drawer-open {
                transform: translateX(0) !important;
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
            }
        </style>
        @stack('styles')
    </head>
    <body class="admin-shell font-sans antialiased selection:bg-[#E9D5FF]">
        <!-- Dynamic neobrutalist top loading bar -->
        <div id="admin-top-loader" class="fixed top-0 left-0 right-0 z-50 h-[6px] bg-[#7C3AED] border-b-[2px] border-[#1E1E1E] transition-all duration-300 pointer-events-none" style="width: 0%; opacity: 0;"></div>

        @php
            $navItems = [
                ['label' => 'Dashboard', 'route' => 'admin.dashboard', 'icon' => 'dashboard'],
                ['label' => 'Users', 'route' => 'admin.users', 'icon' => 'users', 'children' => ['Students', 'Teachers']],
                ['label' => 'Curriculum', 'route' => 'admin.curriculum', 'icon' => 'curriculum'],
                ['label' => 'Batches', 'route' => 'admin.batches', 'icon' => 'batches'],
                ['label' => 'Schedules', 'route' => 'admin.schedules', 'icon' => 'schedules'],
                ['label' => 'Reports', 'route' => 'admin.reports', 'icon' => 'reports'],
                ['label' => 'Reviews', 'route' => 'admin.reviews', 'icon' => 'reviews'],
                ['label' => 'Notifications', 'route' => 'admin.notifications', 'icon' => 'notifications'],
                ['label' => 'Settings', 'route' => 'admin.settings', 'icon' => 'settings'],
            ];
        @endphp

        <div id="admin-shell" class="admin-shell flex h-screen overflow-hidden">
            <aside class="admin-sidebar relative flex shrink-0 flex-col bg-[#E9D5FF] px-5 py-8">
                <div class="pointer-events-none absolute inset-y-0 -right-[24px] w-[24px]">
                    <svg width="24" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="overflow: visible;">
                        <defs>
                            <pattern id="adminWave" x="0" y="0" width="24" height="60" patternUnits="userSpaceOnUse">
                                <path d="M0,0 C20,15 20,45 0,60" fill="#E9D5FF" stroke="#1E1E1E" stroke-width="4" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="24" height="100%" fill="url(#adminWave)" />
                    </svg>
                </div>

                <button type="button" data-sidebar-toggle class="admin-no-print absolute -right-4 top-[44px] z-20 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-white shadow-[2px_2px_0px_0px_#1E1E1E] transition-colors hover:bg-gray-100">
                    <span class="sidebar-collapse-open text-lg font-black">‹</span>
                    <span class="sidebar-collapse-closed hidden text-lg font-black">›</span>
                </button>

                <div class="collapsed-brand-container mb-10 px-2 flex flex-col items-start">
                    <img src="/images/bolo_logo.png" alt="Bolo Academy" class="w-28 h-28 object-contain mb-2 drop-shadow-sm">
                    <div class="sidebar-brand-text">
                        <h1 class="text-3xl font-black leading-tight tracking-tight uppercase">Bolo<br>Academy</h1>
                        <p class="sidebar-subtext mt-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#1E1E1E]/55">Admin portal</p>
                    </div>
                </div>

                <nav class="flex-1 space-y-4 overflow-y-auto pr-1 sidebar-nav-no-scrollbar">
                    @foreach ($navItems as $item)
                        @php($active = request()->routeIs($item['route']))
                        <a href="{{ route($item['route']) }}" data-admin-nav class="sidebar-nav-link group flex items-start gap-4 rounded-[1.75rem] border-[3px] border-[#1E1E1E] px-4 py-4 {{ $active ? 'bg-white shadow-[3px_3px_0px_0px_#1E1E1E]' : 'bg-transparent hover:bg-white/70' }} transition-all duration-200">
                            <span class="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#1E1E1E] {{ $active ? 'bg-[#D1F2EB]' : 'bg-white/80' }} shadow-[2px_2px_0px_0px_#1E1E1E]" data-admin-nav-icon>
                                <x-admin.icon :name="$item['icon']" class="h-6 w-6" />
                            </span>
                            <span class="sidebar-label min-w-0 flex-1">
                                <span class="block text-[15px] font-black leading-tight">{{ $item['label'] }}</span>
                                @if(!empty($item['children']))
                                    <span class="sidebar-branch mt-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">{{ implode(' • ', $item['children']) }}</span>
                                @else
                                    <span class="sidebar-branch mt-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">Manage section</span>
                                @endif
                            </span>
                            <span class="sidebar-tooltip">{{ $item['label'] }}</span>
                        </a>
                    @endforeach

                    <!-- Logout inside the original sidebar sections -->
                    <form method="POST" action="{{ route('logout') }}" id="sidebar-logout-form" class="hidden">
                        @csrf
                    </form>
                    <button type="submit" form="sidebar-logout-form" class="sidebar-nav-link group flex w-full items-start gap-4 rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-transparent px-4 py-4 hover:bg-[#FFE5D9]/75 transition-all duration-200">
                        <span class="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#1E1E1E] bg-white/85 shadow-[2px_2px_0px_0px_#1E1E1E]" data-admin-nav-icon>
                            <x-admin.icon name="logout" class="h-6 w-6 text-[#1E1E1E]" />
                        </span>
                        <span class="sidebar-label min-w-0 flex-1 text-left">
                            <span class="block text-[15px] font-black leading-tight">Logout</span>
                            <span class="sidebar-branch mt-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#1E1E1E]/45">End admin session</span>
                        </span>
                        <span class="sidebar-tooltip">Logout</span>
                    </button>
                </nav>
            </aside>

            <div id="admin-frame" data-admin-frame class="flex min-w-0 flex-1 flex-col overflow-hidden">
                @if (session('success'))
                    <script data-session-toast>
                        setTimeout(() => {
                            if (typeof window.showToast === 'function') {
                                window.showToast("{{ session('success') }}", 'mint');
                            }
                        }, 50);
                    </script>
                @endif
                @if (session('error'))
                    <script data-session-toast>
                        setTimeout(() => {
                            if (typeof window.showToast === 'function') {
                                window.showToast("{{ session('error') }}", 'peach');
                            }
                        }, 50);
                    </script>
                @endif
                <header class="admin-topbar admin-no-print relative z-20 flex items-center justify-between gap-4 bg-[#FFF8E7] px-6 pb-6 pt-4 lg:px-10">
                    <div class="pointer-events-none absolute inset-x-0 -bottom-[22px] h-[22px] z-20">
                        <svg width="100%" height="22" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="overflow: visible;">
                            <defs>
                                <pattern id="adminTopbarWave" x="0" y="0" width="60" height="22" patternUnits="userSpaceOnUse">
                                    <path d="M0,0 C15,16 45,16 60,0" fill="#FFF8E7" stroke="#1E1E1E" stroke-width="4" />
                                </pattern>
                            </defs>
                            <rect x="0" y="0" width="100%" height="22" fill="url(#adminTopbarWave)" />
                        </svg>
                    </div>
                    <div class="flex items-center gap-4">
                        <button type="button" data-mobile-sidebar class="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#1E1E1E] bg-white shadow-[3px_3px_0px_0px_#1E1E1E] lg:hidden">
                            <x-admin.icon name="menu" class="h-6 w-6" />
                        </button>
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Bolo Academy control room</p>
                            <h2 class="text-2xl font-black leading-tight tracking-tight lg:text-3xl">{{ $pageTitle ?? 'Admin Portal' }}</h2>
                        </div>
                    </div>

                    <div class="flex flex-1 items-center justify-end gap-4">
                        <form method="GET" action="{{ url()->current() }}" class="hidden w-full max-w-xl lg:block">
                            @foreach(request()->except('global_search') as $queryKey => $queryValue)
                                @if(is_scalar($queryValue))
                                    <input type="hidden" name="{{ $queryKey }}" value="{{ $queryValue }}">
                                @endif
                            @endforeach
                            <label class="flex items-center gap-3 rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 shadow-[3px_3px_0px_0px_#1E1E1E]">
                                <x-admin.icon name="search" class="h-5 w-5 shrink-0" />
                                <input type="text" name="global_search" value="{{ $globalSearchTerm }}" placeholder="Search across students, teachers, classes, curriculums..." class="w-full border-0 bg-transparent p-0 font-bold text-sm placeholder:text-[#1E1E1E]/35 focus:ring-0">
                            </label>
                        </form>

                        <button type="button" data-toast="Live sync refreshed" class="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#1E1E1E] bg-white shadow-[3px_3px_0px_0px_#1E1E1E] transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">
                            <x-admin.icon name="bell" class="h-5 w-5" />
                        </button>

                        <div class="flex items-center gap-3 rounded-[1.5rem] border-[3px] border-[#1E1E1E] bg-white px-4 py-2 shadow-[3px_3px_0px_0px_#1E1E1E]">
                            <div class="text-right">
                                <p class="text-sm font-black leading-tight">{{ $adminUser->name }}</p>
                                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">{{ ucfirst($adminUser->role) }}</p>
                            </div>
                            <div class="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] text-sm font-black shadow-[2px_2px_0px_0px_#1E1E1E]">
                                {{ strtoupper(substr($adminUser->name, 0, 2)) }}
                            </div>
                        </div>
                    </div>
                </header>

                <main class="min-w-0 flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
                    @if($globalSearchTerm !== '')
                        <section class="admin-surface admin-fade-up admin-no-print mb-8 overflow-hidden">
                            <div class="border-b-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-6 py-4">
                                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/55">Global LMS search</p>
                                <div class="mt-2 flex items-center justify-between gap-4">
                                    <h3 class="text-2xl font-black">Results for "{{ $globalSearchTerm }}"</h3>
                                    <x-admin.badge :label="$globalSearchResults->count() . ' matches'" tone="mint" />
                                </div>
                            </div>
                            <div class="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                                @forelse($globalSearchResults as $result)
                                    <a href="{{ $result['route'] }}" class="admin-hover rounded-[1.75rem] border-[3px] border-[#1E1E1E] bg-white p-5 shadow-[3px_3px_0px_0px_#1E1E1E]">
                                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">{{ $result['type'] }}</p>
                                        <h4 class="mt-2 text-lg font-black">{{ $result['label'] }}</h4>
                                        <p class="mt-2 text-sm font-bold text-[#1E1E1E]/60">{{ $result['meta'] }}</p>
                                    </a>
                                @empty
                                    <div class="rounded-[1.75rem] border-[3px] border-dashed border-[#1E1E1E] bg-white p-6 md:col-span-2 xl:col-span-3">
                                        <p class="text-sm font-bold text-[#1E1E1E]/65">No matches yet. Try a student email, teacher name, class title, or curriculum keyword.</p>
                                    </div>
                                @endforelse
                            </div>
                        </section>
                    @endif

                    <section class="admin-fade-up">
                        <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div class="max-w-3xl">
                                <x-admin.badge label="Premium admin workspace" tone="purple" />
                                <p class="mt-4 text-lg font-bold leading-relaxed text-[#1E1E1E]/70">{{ $pageDescription ?? '' }}</p>
                            </div>
                            <div class="admin-no-print flex flex-wrap gap-3">
                                @yield('page-actions')
                            </div>
                        </div>

                        @yield('content')
                    </section>
                </main>
            </div>
        </div>

        <div id="admin-toast-stack" class="pointer-events-none fixed bottom-8 right-8 z-[120] flex max-w-sm flex-col gap-4"></div>

        <div id="admin-confirm" class="fixed inset-0 z-[110] hidden items-center justify-center bg-[#1E1E1E]/40 p-4 backdrop-blur-sm">
            <div class="w-full max-w-md rounded-[2.5rem] border-[3px] border-[#1E1E1E] bg-white p-7 shadow-[8px_8px_0px_0px_#1E1E1E]">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#1E1E1E]/45">Confirmation</p>
                        <h3 class="mt-2 text-2xl font-black">Please confirm</h3>
                    </div>
                    <button type="button" data-confirm-close class="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#1E1E1E] bg-white">
                        <x-admin.icon name="close" class="h-5 w-5" />
                    </button>
                </div>
                <p id="admin-confirm-message" class="mt-4 text-base font-bold leading-relaxed text-[#1E1E1E]/70">Continue with this action?</p>
                <div class="mt-7 flex gap-3">
                    <button type="button" data-confirm-close class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Cancel</button>
                    <button type="button" id="admin-confirm-submit" class="flex-1 rounded-full border-[3px] border-[#1E1E1E] bg-[#D1F2EB] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0px_0px_#1E1E1E]">Confirm</button>
                </div>
            </div>
        </div>

        <script>
            (() => {
                const shell = document.getElementById('admin-shell');
                const storageKey = 'bolo-admin-sidebar-collapsed';
                const toastStack = document.getElementById('admin-toast-stack');
                const confirmBox = document.getElementById('admin-confirm');
                const confirmMessage = document.getElementById('admin-confirm-message');
                const confirmSubmit = document.getElementById('admin-confirm-submit');
                let frame = document.getElementById('admin-frame');
                let pendingAction = null;
                let isNavigating = false;
                const loader = document.getElementById('admin-top-loader');
                let loaderTimer = null;

                const startLoader = () => {
                    if (!loader) return;
                    clearInterval(loaderTimer);
                    loader.style.transition = 'width 0.4s ease, opacity 0.2s ease';
                    loader.style.opacity = '1';
                    loader.style.width = '20%';

                    let progress = 20;
                    loaderTimer = setInterval(() => {
                        if (progress < 85) {
                            progress += Math.random() * 5 + 1;
                            loader.style.width = `${Math.min(85, progress)}%`;
                        }
                    }, 200);
                };

                const finishLoader = () => {
                    if (!loader) return;
                    clearInterval(loaderTimer);
                    loader.style.transition = 'width 0.2s ease, opacity 0.2s ease';
                    loader.style.width = '100%';
                    setTimeout(() => {
                        loader.style.opacity = '0';
                        setTimeout(() => {
                            loader.style.width = '0%';
                        }, 200);
                    }, 150);
                };

                const applySidebarState = (collapsed) => {
                    shell.classList.toggle('admin-sidebar-collapsed', collapsed);
                    document.querySelector('.sidebar-collapse-open')?.classList.toggle('hidden', collapsed);
                    document.querySelector('.sidebar-collapse-closed')?.classList.toggle('hidden', !collapsed);
                };

                const closeMobileSidebar = () => {
                    shell.classList.remove('admin-mobile-open');
                };

                const updateSidebarActive = (url) => {
                    let pathname = '';
                    try {
                        pathname = new URL(url, window.location.origin).pathname;
                    } catch {
                        pathname = window.location.pathname;
                    }

                    document.querySelectorAll('[data-admin-nav]').forEach((link) => {
                        const linkPath = new URL(link.href, window.location.origin).pathname;
                        const isActive = pathname === linkPath;
                        const icon = link.querySelector('[data-admin-nav-icon]');

                        link.classList.toggle('bg-white', isActive);
                        link.classList.toggle('shadow-[3px_3px_0px_0px_#1E1E1E]', isActive);
                        link.classList.toggle('bg-transparent', !isActive);
                        link.classList.toggle('hover:bg-white/70', !isActive);

                        if (icon) {
                            icon.classList.toggle('bg-[#D1F2EB]', isActive);
                            icon.classList.toggle('bg-white/80', !isActive);
                        }
                    });
                };

                const showToast = (message, tone = 'mint') => {
                    const tones = {
                        mint: 'bg-[#D1F2EB]',
                        peach: 'bg-[#FFE5D9]',
                        purple: 'bg-[#E9D5FF]',
                        lemon: 'bg-[#FEF08A]',
                    };
                    const toast = document.createElement('div');
                    toast.className = `pointer-events-auto rounded-[1.5rem] border-[3px] border-[#1E1E1E] ${tones[tone] || tones.mint} px-5 py-4 font-black shadow-[4px_4px_0px_0px_#1E1E1E]`;
                    toast.textContent = message;
                    toastStack.appendChild(toast);
                    setTimeout(() => toast.remove(), 3200);
                };

                const isAdminNavigationLink = (anchor) => {
                    if (!anchor) return false;
                    if (anchor.target && anchor.target !== '_self') return false;
                    if (anchor.hasAttribute('download')) return false;
                    if (anchor.dataset.noSpa !== undefined) return false;

                    const href = anchor.getAttribute('href');
                    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

                    try {
                        const url = new URL(anchor.href, window.location.origin);
                        return url.origin === window.location.origin && url.pathname.startsWith('/admin');
                    } catch {
                        return false;
                    }
                };

                const wireStaticControls = () => {
                    applySidebarState(localStorage.getItem(storageKey) === 'true');

                    document.querySelector('[data-sidebar-toggle]')?.addEventListener('click', () => {
                        const collapsed = !shell.classList.contains('admin-sidebar-collapsed');
                        applySidebarState(collapsed);
                        localStorage.setItem(storageKey, collapsed);
                    });
                };

                const runExport = (button) => {
                    const table = document.getElementById(button.dataset.exportTarget);
                    if (!table) return;

                    if (button.dataset.exportType === 'csv') {
                        const rows = [...table.querySelectorAll('tr')].map((row) =>
                            [...row.querySelectorAll('th, td')].map((cell) => `"${cell.innerText.replace(/"/g, '""')}"`).join(',')
                        ).join('\n');
                        const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `${button.dataset.exportTarget}.csv`;
                        link.click();
                        showToast('CSV export started');
                    }

                    if (button.dataset.exportType === 'pdf') {
                        window.print();
                    }
                };

                const replaceFrame = async (html, url, pushState = true) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const nextFrame = doc.getElementById('admin-frame');

                    if (!nextFrame) {
                        window.location.href = url;
                        return;
                    }

                    document.title = doc.title || document.title;

                    if (frame) {
                        frame.classList.add('admin-frame-leave');
                        await new Promise((resolve) => setTimeout(resolve, 160));
                        frame.replaceWith(nextFrame);
                    }

                    const nextModals = doc.getElementById('admin-modals');
                    if (nextModals) {
                        document.getElementById('admin-modals')?.replaceWith(nextModals);
                    }

                    frame = document.getElementById('admin-frame');
                    if (frame) {
                        const scripts = frame.querySelectorAll('script');
                        scripts.forEach((oldScript) => {
                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach((attr) => {
                                newScript.setAttribute(attr.name, attr.value);
                            });
                            newScript.textContent = oldScript.textContent;
                            oldScript.parentNode.replaceChild(newScript, oldScript);
                        });
                    }
                    frame?.classList.add('admin-frame-enter');
                    setTimeout(() => frame?.classList.remove('admin-frame-enter'), 320);

                    if (pushState) {
                        window.history.pushState({ url }, '', url);
                    }

                    updateSidebarActive(url);
                    closeMobileSidebar();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };

                const visitAdminPage = async (url, pushState = true) => {
                    if (isNavigating) return;
                    isNavigating = true;
                    startLoader();

                    try {
                        const response = await fetch(url, {
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-Bolo-Admin-Partial': 'true',
                            },
                            credentials: 'same-origin',
                        });

                        if (!response.ok) {
                            window.location.href = url;
                            return;
                        }

                        await replaceFrame(await response.text(), url, pushState);
                    } catch {
                        window.location.href = url;
                    } finally {
                        isNavigating = false;
                        finishLoader();
                    }
                };

                window.visitAdminPage = visitAdminPage;
                window.showToast = showToast;
                wireStaticControls();
                updateSidebarActive(window.location.href);

                document.addEventListener('click', (event) => {
                    const mobileSidebarButton = event.target.closest('[data-mobile-sidebar]');
                    if (mobileSidebarButton) {
                        shell.classList.toggle('admin-mobile-open');
                    }

                    const anchor = event.target.closest('a');
                    if (isAdminNavigationLink(anchor) && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                        event.preventDefault();
                        visitAdminPage(anchor.href);
                        return;
                    }

                    const toastButton = event.target.closest('[data-toast]');
                    if (toastButton) {
                        showToast(toastButton.dataset.toast, toastButton.dataset.tone || 'mint');
                    }

                    const dialogTrigger = event.target.closest('[data-dialog-open]');
                    if (dialogTrigger) {
                        const dialog = document.getElementById(dialogTrigger.dataset.dialogOpen);
                        dialog?.showModal();
                    }

                    const dialogClose = event.target.closest('[data-dialog-close]');
                    if (dialogClose) {
                        dialogClose.closest('dialog')?.close();
                    }

                    const confirmTrigger = event.target.closest('[data-confirm]');
                    if (confirmTrigger) {
                        event.preventDefault();
                        pendingAction = () => {
                            const href = confirmTrigger.getAttribute('href');
                            const toast = confirmTrigger.dataset.toast;
                            const formId = confirmTrigger.getAttribute('form');
                            const closestForm = confirmTrigger.closest('form');
                            const targetForm = formId ? document.getElementById(formId) : (confirmTrigger.type === 'submit' || confirmTrigger.tagName === 'BUTTON' ? closestForm : null);

                            if (href && href !== '#') {
                                if (href.startsWith('/admin') || href.startsWith(window.location.origin + '/admin')) {
                                    visitAdminPage(href);
                                } else {
                                    window.location.href = href;
                                }
                            } else if (targetForm) {
                                targetForm.submit();
                            } else if (toast) {
                                showToast(toast, confirmTrigger.dataset.tone || 'mint');
                            }
                        };
                        confirmMessage.textContent = confirmTrigger.dataset.confirm;
                        confirmBox.classList.remove('hidden');
                        confirmBox.classList.add('flex');
                    }

                    if (event.target === confirmBox) {
                        confirmBox.classList.add('hidden');
                        confirmBox.classList.remove('flex');
                    }

                    const exportButton = event.target.closest('[data-export-target]');
                    if (exportButton) {
                        runExport(exportButton);
                    }
                });

                document.addEventListener('submit', (event) => {
                    const form = event.target;
                    if (!(form instanceof HTMLFormElement)) return;
                    if ((form.method || 'get').toLowerCase() !== 'get') return;
                    if (form.dataset.noSpa !== undefined) return;

                    try {
                        const url = new URL(form.getAttribute('action') || window.location.href, window.location.origin);
                        if (!url.pathname.startsWith('/admin')) return;

                        event.preventDefault();
                        const formData = new FormData(form);
                        const query = new URLSearchParams();
                        for (const [key, value] of formData.entries()) {
                            query.append(key, String(value));
                        }
                        url.search = query.toString();
                        visitAdminPage(url.toString());
                    } catch {
                        // Fall back to native submit if parsing fails.
                    }
                });

                document.querySelectorAll('[data-confirm-close]').forEach((button) => {
                    button.addEventListener('click', () => {
                        confirmBox.classList.add('hidden');
                        confirmBox.classList.remove('flex');
                        pendingAction = null;
                    });
                });

                confirmSubmit?.addEventListener('click', () => {
                    confirmBox.classList.add('hidden');
                    confirmBox.classList.remove('flex');
                    if (pendingAction) {
                        pendingAction();
                        pendingAction = null;
                    }
                });

                window.addEventListener('popstate', () => {
                    if (window.location.pathname.startsWith('/admin')) {
                        visitAdminPage(window.location.href, false);
                    }
                });
            })();
        </script>
        <div id="admin-modals" class="relative z-[90]">
            @stack('modals')
        </div>

        @stack('scripts')
    </body>
</html>
