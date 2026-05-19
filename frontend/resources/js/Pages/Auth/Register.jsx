import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';

// Cute Google Icon SVG
const SVGGoogle = () => (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-6.16-4.53z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
);

// Premium background blobs with sound waves and handcrafted SVGs
const PageBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Sage green blob (top right) */}
        <svg className="absolute -top-32 -right-32 w-[600px] h-[600px] text-[#cbdcc4]/50 fill-current opacity-70" viewBox="0 0 200 200">
            <path d="M45,-60.8C58.1,-52.1,68.4,-37.9,74.5,-21.9C80.7,-5.9,82.8,11.8,77.5,27.2C72.2,42.7,59.6,55.8,44.7,64.2C29.8,72.6,12.7,76.3,-3.8,81.5C-20.3,86.7,-36.2,93.4,-49.2,88C-62.1,82.7,-72.1,65.3,-78.7,47.4C-85.3,29.5,-88.4,11.2,-87.3,-6.5C-86.2,-24.1,-80.9,-41,-69.9,-51.7C-58.8,-62.4,-42.1,-66.9,-26.6,-73.2C-11,-79.6,3.4,-87.8,18.4,-84.9C33.4,-82.1,32,-69.6,45,-60.8Z" transform="translate(100 100)" />
        </svg>
        {/* Blush pink blob (bottom left) */}
        <svg className="absolute -bottom-32 -left-32 w-[600px] h-[600px] text-[#fbc6be]/45 fill-current opacity-70" viewBox="0 0 200 200">
            <path d="M38.2,-56.3C49.9,-48.9,60.2,-39,66.8,-26.4C73.3,-13.7,76.1,1.8,73.5,15.9C71,29.9,63.1,42.5,52.2,51.8C41.4,61.1,27.6,67.1,13.2,71C-1.2,74.9,-16.2,76.7,-30.1,72.9C-44.1,69.1,-57,59.7,-65.7,47.4C-74.4,35.1,-78.9,19.9,-79.7,4.5C-80.4,-10.8,-77.4,-26.3,-69.6,-38.7C-61.9,-51.1,-49.4,-60.4,-36.2,-67C-23,-73.5,-9.1,-77.3,2.6,-81.4C14.3,-85.4,26.6,-63.8,38.2,-56.3Z" transform="translate(100 100)" />
        </svg>
        {/* Terracotta organic wave (bottom edge) */}
        <svg className="absolute -bottom-24 left-0 right-0 w-full text-[#b15e47]/30 fill-current" viewBox="0 0 1440 200" preserveAspectRatio="none">
            <path d="M0,128L120,117.3C240,107,480,85,720,90.7C960,96,1200,128,1320,144L1440,160L1440,200L1320,200C1200,200,960,200,720,200C480,200,240,200,120,200L0,200Z" />
        </svg>
    </div>
);

const SoundWaves = () => (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 hidden xl:flex justify-between px-12 pointer-events-none select-none">
        {/* Left Wave */}
        <div className="flex items-center gap-1.5 opacity-55">
            <div className="w-1.5 h-6 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-12 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-8 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-16 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-10 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-20 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-12 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-6 bg-[#b15e47] rounded-full"></div>
        </div>
        {/* Right Wave */}
        <div className="flex items-center gap-1.5 opacity-55">
            <div className="w-1.5 h-6 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-12 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-10 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-20 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-8 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-16 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-12 bg-[#b15e47] rounded-full"></div>
            <div className="w-1.5 h-6 bg-[#b15e47] rounded-full"></div>
        </div>
    </div>
);

const SVGCrowd = () => (
    <svg className="w-[180px] h-[180px]" viewBox="0 0 160 160" fill="none">
        {/* Back row kids */}
        <circle cx="45" cy="85" r="10" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        <path d="M35 95c0-6 4-10 10-10s10 4 10 10v15H35V95z" fill="#cbdcc4" stroke="#1E1E1E" strokeWidth="2.5" />
        
        <circle cx="115" cy="85" r="10" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        <path d="M105 95c0-6 4-10 10-10s10 4 10 10v15h-20V95z" fill="#fbc6be" stroke="#1E1E1E" strokeWidth="2.5" />

        {/* Front row left kid */}
        <circle cx="25" cy="105" r="11" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        <path d="M12 116c0-7 6-12 13-12s13 5 13 12v20H12v-20z" fill="#fbc6be" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Hair left */}
        <path d="M14 102c0-8 6-10 11-10s11 2 11 10v2H14v-2z" fill="#D68A57" stroke="#1E1E1E" strokeWidth="2" />
        
        {/* Front row middle kid */}
        <circle cx="65" cy="100" r="12" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        <path d="M50 112c0-8 6-14 15-14s15 6 15 14v22H50v-22z" fill="#cbdcc4" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Hair middle */}
        <path d="M53 96c0-8 6-10 12-10s12 2 12 10v2H53v-2z" fill="#8A5A36" stroke="#1E1E1E" strokeWidth="2" />

        {/* Front row right kid */}
        <circle cx="105" cy="105" r="11" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        <path d="M92 116c0-7 6-12 13-12s13 5 13 12v20H92v-20z" fill="#DDF0E2" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Hair right */}
        <path d="M94 102c0-8 6-10 11-10s11 2 11 10v2H94v-2z" fill="#b15e47" stroke="#1E1E1E" strokeWidth="2" />
        
        {/* Little faces details */}
        <circle cx="23" cy="105" r="1" fill="#1E1E1E" />
        <circle cx="27" cy="105" r="1" fill="#1E1E1E" />
        <path d="M24 108c1 1 2 1 3 0" stroke="#1E1E1E" strokeWidth="1" />

        <circle cx="63" cy="100" r="1" fill="#1E1E1E" />
        <circle cx="67" cy="100" r="1" fill="#1E1E1E" />
        <path d="M64 103c1 1 2 1 3 0" stroke="#1E1E1E" strokeWidth="1" />

        <circle cx="103" cy="105" r="1" fill="#1E1E1E" />
        <circle cx="107" cy="105" r="1" fill="#1E1E1E" />
        <path d="M104 108c1 1 2 1 3 0" stroke="#1E1E1E" strokeWidth="1" />
    </svg>
);

const SVGBoyWithMonitor = () => (
    <svg className="w-[180px] h-[180px]" viewBox="0 0 160 160" fill="none">
        {/* Desk */}
        <line x1="80" y1="122" x2="145" y2="122" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" />
        <line x1="90" y1="122" x2="90" y2="155" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="130" y1="122" x2="130" y2="155" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Monitor */}
        <rect x="98" y="85" width="30" height="23" rx="3" fill="#DDF0E2" stroke="#1E1E1E" strokeWidth="2.5" />
        <line x1="113" y1="108" x2="113" y2="122" stroke="#1E1E1E" strokeWidth="2.5" />
        <line x1="105" y1="122" x2="121" y2="122" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Monitor image (Teacher) */}
        <circle cx="113" cy="94" r="4" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="1.5" />
        <path d="M108 102c0-3 2-4 5-4s5 1 5 4" fill="#fbc6be" stroke="#1E1E1E" strokeWidth="1.5" />
        {/* Kid standing */}
        <circle cx="45" cy="100" r="10" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Hair */}
        <path d="M35 98c0-8 5-10 10-10s10 2 10 10v2H35v-2z" fill="#D68A57" stroke="#1E1E1E" strokeWidth="2" />
        {/* Kid body */}
        <path d="M32 110c0-6 6-10 13-10s13 4 13 10v20H32v-20z" fill="#cbdcc4" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Legs */}
        <line x1="40" y1="130" x2="40" y2="152" stroke="#1E1E1E" strokeWidth="2.5" />
        <line x1="50" y1="130" x2="50" y2="152" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Face details */}
        <circle cx="43" cy="100" r="1.5" fill="#1E1E1E" />
        <circle cx="47" cy="100" r="1.5" fill="#1E1E1E" />
        <path d="M44 103c1 1 2 1 3 0" stroke="#1E1E1E" strokeWidth="1" />
    </svg>
);

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Google Auth Modal States
    const [googleModalOpen, setGoogleModalOpen] = useState(false);
    const [googleEmail, setGoogleEmail] = useState('');
    const [googleCode, setGoogleCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState('');
    const [googleSuccess, setGoogleSuccess] = useState('');

    // Toast Notification State
    const [toastMessage, setToastMessage] = useState('');
    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

    // Pre-populate if query parameters are present
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        const nameParam = params.get('name');
        if (emailParam) {
            setData(prev => ({
                ...prev,
                email: emailParam,
                name: nameParam || prev.name
            }));
            setGoogleSuccess('Google identity details retrieved! Please complete registration below.');
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Google Sign-in Verification Code Request for Registration
    const handleGoogleEmailSubmit = async (e) => {
        e.preventDefault();
        setGoogleError('');
        setGoogleLoading(true);

        const email = googleEmail.trim().toLowerCase();
        if (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com')) {
            setGoogleError('Invalid Google Account. Google Sign-in is strictly restricted to valid Google/Gmail accounts (@gmail.com or @googlemail.com).');
            setGoogleLoading(false);
            return;
        }

        try {
            const response = await fetch('/google-auth/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ email })
            });

            const resData = await response.json();
            if (response.ok) {
                setCodeSent(true);
                setGoogleSuccess('Verification code sent to your Gmail!');
            } else {
                setGoogleError(resData.message || 'Failed to request verification code.');
            }
        } catch (err) {
            setGoogleError('Connection to Google Auth service failed.');
        } finally {
            setGoogleLoading(false);
        }
    };

    // Google Sign-in Verification Code Submit for Registration
    const handleGoogleCodeSubmit = async (e) => {
        e.preventDefault();
        setGoogleError('');
        setGoogleLoading(true);

        const email = googleEmail.trim().toLowerCase();
        const code = googleCode.trim();

        try {
            const response = await fetch('/google-auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ email, code })
            });

            const resData = await response.json();
            if (response.ok) {
                if (resData.is_logged_in) {
                    setGoogleSuccess('Google Account verified! Logging you in...');
                    setTimeout(() => {
                        window.location.href = route('dashboard');
                    }, 800);
                } else {
                    setGoogleSuccess('Google Account authenticated! Pre-populating form...');
                    setData(prev => ({
                        ...prev,
                        email: email,
                        name: email.split('@')[0]
                    }));
                    setTimeout(() => {
                        setGoogleModalOpen(false);
                    }, 1200);
                }
            } else {
                setGoogleError(resData.message || 'Incorrect verification code.');
            }
        } catch (err) {
            setGoogleError('Verification service error. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            {/* Custom high-fidelity background shapes & soundwaves */}
            <PageBackground />
            <SoundWaves />

            <div className="w-full flex flex-col items-center px-4 relative max-w-7xl z-10">
                {/* Main Card & Illustrations Container */}
                <div className="relative w-full max-w-[480px] mt-10 mb-6">
                    {/* Hand-drawn inline SVGs overlapping card corners */}
                    <div className="absolute bottom-[-15px] left-[-115px] z-20 hidden lg:block select-none pointer-events-none">
                        <SVGCrowd />
                    </div>

                    <div className="absolute bottom-[-15px] right-[-115px] z-20 hidden lg:block select-none pointer-events-none">
                        <SVGBoyWithMonitor />
                    </div>

                    {/* Signup Card */}
                    <div className="w-full bg-[#FAF8ED] border-[3.5px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E] rounded-[2.5rem] p-8 md:p-10 font-sans text-[#1E1E1E] relative overflow-visible">
                        
                        <div className="text-center mb-8">
                            <h2 className="font-fredoka font-black text-[#1E1E1E] text-3xl tracking-wide uppercase leading-none">
                                JOIN BOLO ACADEMY
                            </h2>
                            <p className="text-xs font-bold text-gray-500 mt-3 leading-relaxed">
                                Start your speaking path today.
                            </p>
                        </div>

                        {googleSuccess && (
                            <div className="mb-4 text-xs font-black uppercase text-green-600 bg-green-50 p-3 border-[2px] border-green-600 rounded-xl">
                                {googleSuccess}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Name field */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-[11px] font-black uppercase tracking-wider text-gray-700 block">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-base bg-[#fbc6be] p-1.5 border-2 border-[#1E1E1E] rounded-md leading-none shadow-[1px_1px_0px_0px_#1E1E1E]">👤</span>
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="Your full name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-2xl border-[3.5px] border-[#1E1E1E] bg-white text-sm font-bold text-gray-800 pl-14 pr-5 py-3.5 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#1E1E1E] placeholder-gray-400 transition-all"
                                        required
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            {/* Email field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-[11px] font-black uppercase tracking-wider text-gray-700 block">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-base bg-[#fbc6be] p-1.5 border-2 border-[#1E1E1E] rounded-md leading-none shadow-[1px_1px_0px_0px_#1E1E1E]">✉️</span>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="name@email.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-2xl border-[3.5px] border-[#1E1E1E] bg-white text-sm font-bold text-gray-800 pl-14 pr-5 py-3.5 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#1E1E1E] placeholder-gray-400 transition-all"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-[11px] font-black uppercase tracking-wider text-gray-700 block">
                                    Create Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-base bg-[#fbc6be] p-1.5 border-2 border-[#1E1E1E] rounded-md leading-none shadow-[1px_1px_0px_0px_#1E1E1E]">🔑</span>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-2xl border-[3.5px] border-[#1E1E1E] bg-white text-sm font-bold text-gray-800 pl-14 pr-12 py-3.5 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#1E1E1E] placeholder-gray-400 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 border border-[#1E1E1E] px-1 rounded shadow-[1px_1px_0px_0px_#1E1E1E] text-gray-700">HIDE</span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 border border-[#1E1E1E] px-1 rounded shadow-[1px_1px_0px_0px_#1E1E1E] text-gray-700">SHOW</span>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            {/* Confirm Password field */}
                            <div className="space-y-2">
                                <label htmlFor="password_confirmation" className="text-[11px] font-black uppercase tracking-wider text-gray-700 block">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-base bg-[#fbc6be] p-1.5 border-2 border-[#1E1E1E] rounded-md leading-none shadow-[1px_1px_0px_0px_#1E1E1E]">🔑</span>
                                    </div>
                                    <input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full rounded-2xl border-[3.5px] border-[#1E1E1E] bg-white text-sm font-bold text-gray-800 pl-14 pr-12 py-3.5 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#1E1E1E] placeholder-gray-400 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 border border-[#1E1E1E] px-1 rounded shadow-[1px_1px_0px_0px_#1E1E1E] text-gray-700">HIDE</span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 border border-[#1E1E1E] px-1 rounded shadow-[1px_1px_0px_0px_#1E1E1E] text-gray-700">SHOW</span>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-1" />
                            </div>

                            {/* Terms and conditions */}
                            <div className="flex items-start select-none cursor-pointer text-xs font-bold pt-1">
                                <input
                                    type="checkbox"
                                    required
                                    className="rounded border-[#1E1E1E] text-[#A24926] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer mt-0.5"
                                />
                                <span className="ms-2 text-gray-600 leading-tight">
                                    I agree to the terms and conditions of the <span className="underline cursor-pointer hover:text-black">Terms and Policy</span> and <span className="underline cursor-pointer hover:text-black">Terms Privacy Policy</span>.
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#fcd4c3] text-gray-800 font-fredoka font-black text-sm uppercase tracking-widest py-3.5 border-[3px] border-[#1E1E1E] rounded-2xl shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 mt-2"
                            >
                                CREATE ACCOUNT
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-grow border-t-[2px] border-gray-200"></div>
                            <span className="font-fredoka font-black text-[10px] tracking-wider text-gray-400 px-3 uppercase">
                                or social sign up
                            </span>
                            <div className="flex-grow border-t-[2px] border-gray-200"></div>
                        </div>

                        <div className="space-y-3">
                            {/* Google Auth Trigger Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    setGoogleEmail('');
                                    setGoogleCode('');
                                    setCodeSent(false);
                                    setGoogleError('');
                                    setGoogleSuccess('');
                                    setGoogleModalOpen(true);
                                }}
                                className="w-full bg-white hover:bg-gray-50 text-gray-800 border-[3px] border-[#1E1E1E] py-3.5 rounded-2xl font-fredoka font-black text-xs uppercase tracking-widest shadow-[3.5px_3.5px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <SVGGoogle />
                                <span>Log in with Google</span>
                            </button>

                            {/* Apple Sign In Button */}
                            <button
                                type="button"
                                onClick={() => triggerToast("Apple Sign-in is coming soon! ")}
                                className="w-full bg-[#1E1E1E] hover:bg-black text-white border-[3px] border-[#1E1E1E] py-3.5 rounded-2xl font-fredoka font-black text-xs uppercase tracking-widest shadow-[3.5px_3.5px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="text-base leading-none"></span>
                                <span>Log in with Apple</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer redirection link */}
                <div className="text-center font-bold text-sm my-4 z-10">
                    <span className="text-[#3D4F35]/80">Already registered? </span>
                    <Link href={route('login')} className="text-[#3D4F35] font-black hover:underline">
                        Log In
                    </Link>
                </div>
            </div>

            {/* Google Authentication Modal Popup */}
            {googleModalOpen && (
                <div className="fixed inset-0 bg-[#3D4F35]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white border-[4px] border-[#3D4F35] shadow-[8px_8px_0px_0px_#3D4F35] rounded-3xl p-6 relative animate-fade-in text-[#3D4F35]">
                        <button
                            onClick={() => setGoogleModalOpen(false)}
                            className="absolute top-4 right-4 text-[#3D4F35] hover:text-[#A24926] font-fredoka font-black text-sm"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <div className="mx-auto w-12 h-12 bg-[#D1F2EB] border-[2px] border-[#3D4F35] rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_#3D4F35] mb-3">
                                <SVGGoogle />
                            </div>
                            <h3 className="font-fredoka font-black text-xl uppercase tracking-wider">
                                Google Authentication
                            </h3>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase">
                                Secure Identity OAuth
                            </p>
                        </div>

                        {googleError && (
                            <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 border-[2px] border-red-600 p-3 rounded-xl">
                                ⚠️ {googleError}
                            </div>
                        )}

                        {googleSuccess && (
                            <div className="mb-4 text-xs font-bold text-green-600 bg-green-50 border-[2px] border-green-600 p-3 rounded-xl">
                                ✅ {googleSuccess}
                            </div>
                        )}

                        {!codeSent ? (
                            <form onSubmit={handleGoogleEmailSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider block mb-1">
                                        Google Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="yourname@gmail.com"
                                        value={googleEmail}
                                        onChange={(e) => setGoogleEmail(e.target.value)}
                                        className="w-full rounded-full border-[2px] border-[#3D4F35] bg-[#DDF0E2] text-sm font-bold text-[#3D4F35] px-5 py-3 focus:outline-none"
                                        required
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 mt-1 block">
                                        Google Sign-in is restricted to (@gmail.com / @googlemail.com)
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={googleLoading}
                                    className="w-full bg-[#A24926] text-white font-fredoka font-black text-xs uppercase tracking-widest py-3 border-[2px] border-[#3D4F35] rounded-full shadow-[3px_3px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                                >
                                    {googleLoading ? 'SENDING...' : 'SEND VERIFICATION CODE'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleGoogleCodeSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider block mb-1">
                                        Enter 6-Digit PIN
                                    </label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="123456"
                                        value={googleCode}
                                        onChange={(e) => setGoogleCode(e.target.value)}
                                        className="w-full rounded-full border-[2px] border-[#3D4F35] bg-[#DDF0E2] text-center text-lg font-black tracking-widest text-[#3D4F35] py-3 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCodeSent(false)}
                                        className="w-1/3 bg-white hover:bg-gray-50 border-[2px] border-[#3D4F35] py-3 rounded-full font-fredoka font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#3D4F35] hover:shadow-none transition-all"
                                    >
                                        BACK
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={googleLoading}
                                        className="w-2/3 bg-[#A24926] text-white font-fredoka font-black text-xs uppercase tracking-widest py-3 border-[2px] border-[#3D4F35] rounded-full shadow-[3px_3px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                                    >
                                        {googleLoading ? 'VERIFYING...' : 'VERIFY CODE'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            {/* Custom Neobrutalist Toast Notification */}
            {toastMessage && typeof window !== 'undefined' && createPortal(
                <div className="fixed top-6 right-6 z-[9999] bg-[#fcd4c3] border-[3.5px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] rounded-2xl px-6 py-4 flex items-center gap-3 font-fredoka font-black text-sm uppercase text-gray-800 transition-all animate-bounce">
                    <span className="text-xl"></span>
                    <span>{toastMessage}</span>
                </div>,
                document.body
            )}
        </GuestLayout>
    );
}
