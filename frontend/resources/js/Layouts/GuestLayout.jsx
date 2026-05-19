import React from 'react';
import { Link } from '@inertiajs/react';

// Handcrafted SVG icons for cute Kawaii Neo-Brutalism look
const SVGChatBubble = () => (
    <svg className="w-6 h-6 stroke-[#3D4F35]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.03z" />
    </svg>
);

const SVGMedal = () => (
    <svg className="w-10 h-10 stroke-[#3D4F35] fill-[#FFE5D9]" viewBox="0 0 24 24" strokeWidth="2">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
);

const SVGSocial = ({ platform }) => {
    switch (platform) {
        case 'facebook':
            return (
                <svg className="w-5 h-5 fill-[#3D4F35]" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
            );
        case 'instagram':
            return (
                <svg className="w-5 h-5 stroke-[#3D4F35] fill-none" viewBox="0 0 24 24" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
            );
        case 'twitter':
            return (
                <svg className="w-5 h-5 fill-[#3D4F35]" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
            );
        case 'youtube':
            return (
                <svg className="w-5 h-5 fill-[#3D4F35]" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.556a3.002 3.003 0 00-2.11 2.107C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.107C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.556a3.003 3.003 0 002.11-2.107C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            );
        default:
            return null;
    }
};

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#FAF8EF] text-[#3D4F35] font-sans antialiased overflow-x-hidden selection:bg-[#E9D5FF]">
            {/* Header section */}
            <div className="w-full bg-white border-b-[3px] border-[#3D4F35] z-30">
                <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative bg-white">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/images/bolo_logo.png" alt="Bolo Academy Logo" className="h-16 w-auto object-contain drop-shadow-sm" />
                        <div>
                            <span className="font-fredoka font-black text-xl uppercase tracking-wider block text-[#3D4F35] leading-none">Bolo Academy</span>
                            <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Active Spoken English</span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link 
                            href={route('login')} 
                            className="font-fredoka font-black text-xs uppercase tracking-widest text-[#3D4F35] hover:text-[#A24926] transition-colors"
                        >
                            Log In
                        </Link>
                        <Link 
                            href={route('register')}
                            className="bg-[#F2D8C9] hover:bg-[#ebd0be] font-fredoka font-black px-5 py-2.5 border-[3px] border-[#3D4F35] shadow-[3px_3px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl text-[10px] uppercase tracking-widest text-[#3D4F35]"
                        >
                            Sign Up
                        </Link>
                    </nav>
                </header>

                {/* Scalloped divider separating Header and Content */}
                <div className="absolute w-full h-[15px] pointer-events-none z-20">
                    <svg width="100%" height="15" xmlns="http://www.w3.org/2000/svg" className="block">
                        <defs>
                            <pattern id="nav-wave" x="0" y="0" width="30" height="15" patternUnits="userSpaceOnUse">
                                <path d="M0,0 C7.5,11 22.5,11 30,0" fill="#FFFFFF" stroke="#3D4F35" strokeWidth="3" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="15" fill="url(#nav-wave)" />
                    </svg>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow pt-12 pb-16 flex flex-col items-center relative z-10 w-full">
                {children}
            </main>

            {/* Footer section */}
            <div className="w-full mt-auto relative z-30">
                {/* Wavy scalloped divider separating Content and Footer */}
                <div className="w-full h-[15px] pointer-events-none relative z-20 -mb-[1px]">
                    <svg width="100%" height="15" xmlns="http://www.w3.org/2000/svg" className="block transform rotate-180">
                        <defs>
                            <pattern id="footer-wave" x="0" y="0" width="30" height="15" patternUnits="userSpaceOnUse">
                                <path d="M0,0 C7.5,11 22.5,11 30,0" fill="#829A84" stroke="#3D4F35" strokeWidth="3" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="15" fill="url(#footer-wave)" />
                    </svg>
                </div>

                <footer className="bg-[#829A84] text-[#FAF8EF] pt-12 pb-8 px-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 border-b-[2px] border-[#3D4F35]/30 pb-8 mb-8">
                        {/* Column 1: Info */}
                        <div className="md:col-span-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <img src="/images/bolo_logo.png" alt="Bolo Academy Logo" className="h-16 w-auto object-contain drop-shadow-sm" />
                                <span className="font-fredoka font-black text-xl uppercase tracking-wider block text-[#FAF8EF] leading-none">Bolo Academy</span>
                            </div>
                            <p className="text-xs text-[#FAF8EF]/95 leading-relaxed max-w-sm font-medium">
                                Join the very best language speaking classes for early age children. Practice speaking confidence with teachers daily.
                            </p>
                        </div>

                        {/* Column 2: Badge */}
                        <div className="md:col-span-2 flex flex-col justify-center items-start md:items-center space-y-2">
                            <span className="text-[10px] font-bold text-[#FAF8EF]/70 uppercase tracking-widest">Company</span>
                            <div className="flex items-center gap-2">
                                <SVGMedal />
                                <div className="leading-tight">
                                    <span className="block text-xs font-black uppercase text-[#FAF8EF]">Confidence</span>
                                    <span className="block text-[10px] font-bold text-[#FAF8EF]/80">Building Model</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Links */}
                        <div className="md:col-span-3 space-y-2">
                            <span className="text-[10px] font-bold text-[#FAF8EF]/70 uppercase tracking-widest block mb-2">Links</span>
                            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                <Link href="/" className="hover:underline">Cozy Circles</Link>
                                <Link href="/" className="hover:underline">Speaking Trial</Link>
                                <Link href="/" className="hover:underline">Resource Locker</Link>
                                <Link href="/" className="hover:underline">Join Mentor</Link>
                            </div>
                        </div>

                        {/* Column 4: About Social */}
                        <div className="md:col-span-2 space-y-3">
                            <span className="text-[10px] font-bold text-[#FAF8EF]/70 uppercase tracking-widest block">About</span>
                            <div className="flex items-center gap-2">
                                <a href="#" className="w-8 h-8 rounded-full bg-[#FAF8EF] border-[2px] border-[#3D4F35] flex items-center justify-center shadow-[1px_1px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                                    <SVGSocial platform="facebook" />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-[#FAF8EF] border-[2px] border-[#3D4F35] flex items-center justify-center shadow-[1px_1px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                                    <SVGSocial platform="instagram" />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-[#FAF8EF] border-[2px] border-[#3D4F35] flex items-center justify-center shadow-[1px_1px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                                    <SVGSocial platform="twitter" />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-[#FAF8EF] border-[2px] border-[#3D4F35] flex items-center justify-center shadow-[1px_1px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                                    <SVGSocial platform="youtube" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] font-black tracking-widest text-[#FAF8EF]/80 gap-4">
                        <span>© 2026 BOLO ACADEMY LMS. SUITE FOR SPOKEN ENGLISH LEADERSHIP.</span>
                        <span>NO COOKIE POLICY COMPLIANT</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
