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

const SVGGirlAtDesk = () => (
    <svg className="w-[180px] h-[180px]" viewBox="0 0 160 160" fill="none">
        {/* Desk */}
        <line x1="75" y1="122" x2="142" y2="122" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" />
        <line x1="85" y1="122" x2="85" y2="155" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="125" y1="122" x2="125" y2="155" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Pencil Holder */}
        <rect x="108" y="109" width="10" height="13" rx="2" fill="#D68A57" stroke="#1E1E1E" strokeWidth="2" />
        <path d="M110 109l-2-6M113 109l1-8M116 109l3-6" stroke="#1E1E1E" strokeWidth="2.0" strokeLinecap="round" />
        {/* Chair */}
        <circle cx="35" cy="120" r="14" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        <line x1="35" y1="134" x2="35" y2="152" stroke="#1E1E1E" strokeWidth="2.5" />
        <path d="M22 152h26" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Girl Legs */}
        <path d="M42 120v25h8" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M48 120v25h8" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sneakers */}
        <rect x="48" y="142" width="12" height="6" rx="2.5" fill="#cbdcc4" stroke="#1E1E1E" strokeWidth="2" />
        <rect x="54" y="142" width="12" height="6" rx="2.5" fill="#cbdcc4" stroke="#1E1E1E" strokeWidth="2" />
        {/* Girl Body & Shirt */}
        <path d="M30 95c0-10 6-15 15-15s15 5 15 15v20H30V95z" fill="#cbdcc4" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Arm writing */}
        <path d="M48 95c5 5 18 5 24 15H90" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Head */}
        <circle cx="45" cy="70" r="12" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Red Hair */}
        <path d="M33 72c0-12 10-16 16-16s16 4 16 16c0 5-2 8-5 8s-3-6-5-6-3 4-6 4c-5 0-6-6-10-6s-6 6-6 6z" fill="#D68A57" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Face Details */}
        <circle cx="48" cy="70" r="1.5" fill="#1E1E1E" />
        <path d="M52 74c0 1-1 2-2 2" stroke="#1E1E1E" strokeWidth="1.5" />
    </svg>
);

const SVGIndexBoyAtDesk = () => (
    <svg className="w-[180px] h-[180px]" viewBox="0 0 160 160" fill="none">
        {/* Table */}
        <line x1="25" y1="122" x2="90" y2="122" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" />
        <line x1="35" y1="122" x2="35" y2="155" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="75" y1="122" x2="75" y2="155" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Laptop */}
        <path d="M42 122l4-15h20l-4 15z" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        <line x1="46" y1="107" x2="66" y2="107" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Chair */}
        <circle cx="125" cy="120" r="14" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        <line x1="125" y1="134" x2="125" y2="152" stroke="#1E1E1E" strokeWidth="2.5" />
        <path d="M112 152h26" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Boy Legs */}
        <path d="M115 120v25h-8" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M107 120v25h-8" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Shoes */}
        <rect x="99" y="142" width="12" height="6" rx="2.5" fill="#A24926" stroke="#1E1E1E" strokeWidth="2" />
        <rect x="93" y="142" width="12" height="6" rx="2.5" fill="#A24926" stroke="#1E1E1E" strokeWidth="2" />
        {/* Boy Body & Shirt */}
        <path d="M110 95c0-10-6-15-15-15s-15 5-15 15v20h30V95z" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Arm typing */}
        <path d="M102 95c-5 5-18 5-24 15H60" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Head */}
        <circle cx="105" cy="70" r="12" fill="#FAF8EF" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Brown Hair */}
        <path d="M93 72c0-12 10-16 16-16s16 4 16 16c0 5-2 8-5 8s-3-6-5-6-3 4-6 4c-5 0-6-6-10-6s-6 6-6 6z" fill="#8A5A36" stroke="#1E1E1E" strokeWidth="2.5" />
        {/* Face Details */}
        <circle cx="102" cy="70" r="1.5" fill="#1E1E1E" />
        <path d="M98 74c0 1 1 2 2 2" stroke="#1E1E1E" strokeWidth="1.5" />
    </svg>
);

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    // Google Auth Modal States
    const [googleModalOpen, setGoogleModalOpen] = useState(false);
    const [googleEmail, setGoogleEmail] = useState('');
    const [googleCode, setGoogleCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState('');
    const [googleSuccess, setGoogleSuccess] = useState('');

    // Developer Quick Access panel state
    const [devPanelOpen, setDevPanelOpen] = useState(false);
    const [devUnlocked, setDevUnlocked] = useState(false);
    const [passInputOpen, setPassInputOpen] = useState(false);
    const [devPassword, setDevPassword] = useState('');
    const [passError, setPassError] = useState('');

    const handleDevClick = () => {
        if (devUnlocked) {
            setDevPanelOpen(!devPanelOpen);
        } else {
            setPassInputOpen(true);
        }
    };

    // Toast Notification State
    const [toastMessage, setToastMessage] = useState('');
    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Google Sign-in Verification Code Request
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
                setGoogleSuccess('Verification code sent to your Gmail! Please check your inbox or server logs.');
            } else {
                setGoogleError(resData.message || 'Failed to request verification code.');
            }
        } catch (err) {
            setGoogleError('Connection to Google Auth service failed.');
        } finally {
            setGoogleLoading(false);
        }
    };

    // Google Sign-in Verification Code Submit
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
                    setGoogleSuccess('Google Account verified, but no account exists yet! Let\'s sign you up.');
                    setTimeout(() => {
                        window.location.href = `/register?email=${encodeURIComponent(email)}&name=${encodeURIComponent(email.split('@')[0])}`;
                    }, 1500);
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
            <Head title="Log in" />

            {/* Custom high-fidelity background shapes & soundwaves */}
            <PageBackground />
            <SoundWaves />

            <div className="w-full flex flex-col items-center px-4 relative max-w-7xl z-10">
                {/* Main Card & Illustrations Container */}
                <div className="relative w-full max-w-[460px] mt-10 mb-6">
                    {/* Hand-drawn inline SVGs overlapping card corners */}
                    <div className="absolute bottom-[-15px] left-[-115px] z-20 hidden lg:block select-none pointer-events-none">
                        <SVGGirlAtDesk />
                    </div>

                    <div className="absolute bottom-[-15px] right-[-115px] z-20 hidden lg:block select-none pointer-events-none">
                        <SVGIndexBoyAtDesk />
                    </div>

                    {/* Login Card */}
                    <div className="w-full bg-[#DDF0E2] border-[3.5px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E] rounded-[2.5rem] p-8 md:p-10 font-sans text-[#1E1E1E] relative overflow-visible">
                        
                        <div className="text-center mb-8">
                            <h2 className="font-fredoka font-black text-[#1E1E1E] text-3xl tracking-wide uppercase leading-none">
                                WELCOME BACK
                            </h2>
                            <p className="text-xs font-bold text-gray-500 mt-3 leading-relaxed">
                                Log in to continue your personalized speaking journey.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 text-xs font-black uppercase text-green-600 bg-green-50 p-3 border-[2px] border-green-600 rounded-xl">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
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
                                        placeholder="yourname@email.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-2xl border-[3.5px] border-[#1E1E1E] bg-white text-sm font-bold text-gray-800 pl-14 pr-5 py-3.5 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#1E1E1E] placeholder-gray-400 transition-all"
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1 text-red-600" />
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-[11px] font-black uppercase tracking-wider text-gray-700 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-base bg-[#fbc6be] p-1.5 border-2 border-[#1E1E1E] rounded-md leading-none shadow-[1px_1px_0px_0px_#1E1E1E]">🔒</span>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-2xl border-[3.5px] border-[#1E1E1E] bg-white text-sm font-bold text-gray-800 pl-14 pr-12 py-3.5 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#1E1E1E] placeholder-gray-400 transition-all"
                                        autoComplete="current-password"
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
                                <InputError message={errors.password} className="mt-1 text-red-600" />
                            </div>

                            {/* Remember Me and Forgot Password */}
                            <div className="flex items-center justify-between text-xs font-bold mt-1 text-gray-700">
                                <label className="flex items-center select-none cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-[#1E1E1E] text-[#A24926] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                                    />
                                    <span className="ms-2">
                                        Remember Me
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-gray-600 hover:text-black underline decoration-dashed"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#fcd4c3] text-gray-800 font-fredoka font-black text-sm uppercase tracking-widest py-3.5 border-[3px] border-[#1E1E1E] rounded-2xl shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                            >
                                LOG IN
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-grow border-t-[2px] border-gray-200"></div>
                            <span className="font-fredoka font-black text-[10px] tracking-wider text-gray-400 px-3 uppercase">
                                or
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
                    <span className="text-[#3D4F35]/80">New here? </span>
                    <Link href={route('register')} className="text-[#3D4F35] font-black hover:underline">
                        Create Account
                    </Link>
                </div>

                {/* Developer Quick Access (Test Accounts) Drawer */}
                {!import.meta.env.PROD && (
                    <div className="mt-8 w-full max-w-md z-10">
                        <button
                            onClick={handleDevClick}
                            className="w-full py-2 bg-[#F2D8C9] border-[2px] border-[#3D4F35] rounded-xl font-fredoka font-black text-[10px] uppercase tracking-wider text-[#3D4F35] shadow-[2px_2px_0px_0px_#3D4F35] hover:shadow-none active:translate-y-0.5 transition-all text-center"
                        >
                            {!devUnlocked ? '🔒 Developer Quick Access (Locked)' : devPanelOpen ? '❌ Close Test Access Profiles' : '🔓 Developer Quick Access (Test Profiles)'}
                        </button>
                        
                        {devPanelOpen && (
                            <div className="mt-3 p-4 bg-[#FAF7ED] border-[3.5px] border-[#3D4F35] shadow-[4px_4px_0px_0px_#3D4F35] rounded-2xl animate-fade-in font-sans text-xs space-y-2">
                                <span className="block text-[10px] font-black uppercase text-gray-500 mb-2">⚡ Instant Access Credentials</span>
                                
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setData({ email: 'admin@bolo.com', password: 'password', remember: false });
                                    }}
                                    className="w-full bg-[#D1F2EB] hover:bg-[#c1e6de] text-left border-[2px] border-[#3D4F35] px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between transition-all active:translate-y-0.5"
                                >
                                    <span className="flex items-center gap-1.5">🔑 <span className="font-extrabold text-[#3D4F35]">Main Administrator</span></span>
                                    <span className="text-[10px] text-gray-500 font-mono">admin@bolo.com</span>
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setData({ email: 'teacher@bolo.com', password: 'password', remember: false });
                                    }}
                                    className="w-full bg-[#E9D5FF] hover:bg-[#dcbeff] text-left border-[2px] border-[#3D4F35] px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between transition-all active:translate-y-0.5"
                                >
                                    <span className="flex items-center gap-1.5">👩‍🏫 <span className="font-extrabold text-[#3D4F35]">Mentor Teacher</span></span>
                                    <span className="text-[10px] text-gray-500 font-mono">teacher@bolo.com</span>
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setData({ email: 'student@bolo.com', password: 'password', remember: false });
                                    }}
                                    className="w-full bg-[#FFE5D9] hover:bg-[#ffd5c2] text-left border-[2px] border-[#3D4F35] px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between transition-all active:translate-y-0.5"
                                >
                                    <span className="flex items-center gap-1.5">👦 <span className="font-extrabold text-[#3D4F35]">Study Student</span></span>
                                    <span className="text-[10px] text-gray-500 font-mono">student@bolo.com</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
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

            {/* Developer Key Lock Modal */}
            {passInputOpen && (
                <div className="fixed inset-0 bg-[#3D4F35]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-white border-[4px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E] rounded-3xl p-6 relative animate-fade-in text-[#1E1E1E]">
                        <button
                            onClick={() => {
                                setPassInputOpen(false);
                                setDevPassword('');
                                setPassError('');
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-fredoka font-black text-sm"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <div className="mx-auto w-12 h-12 bg-[#FAF7ED] border-[2.5px] border-[#1E1E1E] rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1E1E1E] mb-3 text-xl">
                                🔒
                            </div>
                            <h3 className="font-fredoka font-black text-lg uppercase tracking-wider">
                                Developer Lock
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                                Enter Developer Access Key
                            </p>
                        </div>

                        {passError && (
                            <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 border-[2px] border-red-600 p-2.5 rounded-xl">
                                ⚠️ {passError}
                            </div>
                        )}

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (devPassword === 'bolocreator2026') {
                                setDevUnlocked(true);
                                setPassInputOpen(false);
                                setDevPanelOpen(true);
                                setPassError('');
                                setDevPassword('');
                            } else {
                                setPassError('Incorrect Developer Key!');
                            }
                        }} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    placeholder="Enter Developer Key"
                                    value={devPassword}
                                    onChange={(e) => setDevPassword(e.target.value)}
                                    className="w-full rounded-full border-[3px] border-[#1E1E1E] bg-[#FAF7ED] text-sm font-bold text-center px-4 py-3 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#1E1E1E]"
                                    autoFocus
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#fcd4c3] text-gray-800 font-fredoka font-black text-xs uppercase tracking-widest py-3 border-[2px] border-[#1E1E1E] rounded-full shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                            >
                                UNLOCK PANEL
                            </button>
                        </form>
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
