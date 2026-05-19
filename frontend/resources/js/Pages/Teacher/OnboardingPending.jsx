import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Reusable Handcrafted SVG Icons (strictly avoiding standard emojis)
const SVGShieldCheck = () => (
    <svg className="w-6 h-6 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
);

const SVGClock = () => (
    <svg className="w-6 h-6 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SVGLock = () => (
    <svg className="w-6 h-6 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const SVGArrowLeft = () => (
    <svg className="w-5 h-5 stroke-[#1E1E1E] mr-2 inline" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export default function OnboardingPending({ status = 'pending' }) {
    const isRejected = status === 'rejected';

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-[#FFF8E7] text-[#1E1E1E] font-sans flex flex-col items-center justify-center p-6 selection:bg-[#E9D5FF]">
            <Head title={isRejected ? "Application Rejected" : "Application Pending Approval"} />

            <div className="w-full max-w-2xl bg-white border-[4px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E] rounded-3xl p-8 relative overflow-hidden">
                
                {/* Decorative Pastel Background Shapes */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E9D5FF] rounded-full border-[3px] border-[#1E1E1E] -z-0"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#D1F2EB] rounded-full border-[3px] border-[#1E1E1E] -z-0"></div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-[4px] border-[#1E1E1E] pb-6 mb-8">
                        <div>
                            <span className="font-fredoka font-black text-3xl uppercase tracking-wider text-[#1E1E1E]">Bolo Academy</span>
                            <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Mentor Circle onboarding</span>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="bg-[#FFE5D9] hover:bg-[#ffd6c4] font-fredoka font-bold text-sm px-4 py-2 border-[3px] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl"
                        >
                            Log Out
                        </button>
                    </div>

                    {/* Intro */}
                    <div className="mb-8">
                        {isRejected ? (
                            <div className="inline-block bg-[#FEE2E2] text-[#DC2626] font-fredoka font-black text-sm px-3 py-1.5 border-[3px] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] rounded-lg mb-4">
                                STATUS: APPLICATION REJECTED
                            </div>
                        ) : (
                            <div className="inline-block bg-[#FFE5D9] text-[#EA580C] font-fredoka font-black text-sm px-3 py-1.5 border-[3px] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] rounded-lg mb-4">
                                STATUS: APPLICATION UNDER REVIEW
                            </div>
                        )}
                        <h1 className="font-fredoka font-black text-4xl leading-tight mb-3">
                            {isRejected ? (
                                <>Application <span className="underline decoration-[#FCA5A5] decoration-[6px]">Status Update</span></>
                            ) : (
                                <>Welcome to the <span className="underline decoration-[#E9D5FF] decoration-[6px]">Bolo Mentor Group!</span></>
                            )}
                        </h1>
                        <p className="text-[#1E1E1E] font-medium leading-relaxed">
                            {isRejected ? (
                                "Thank you for submitting your application to join Bolo Academy. After reviewing your profile and resume, we regret to inform you that our current requirements do not match your CV and profile. Therefore, we are unable to approve your application and your portal access has been restricted."
                            ) : (
                                "Thank you for submitting your application to join Bolo Academy. Our administrative panel is currently reviewing your resume, subject expertise, and qualifications. Active credentials and classroom links will be assigned shortly."
                            )}
                        </p>
                    </div>

                    {/* Step Tracker */}
                    <div className="space-y-6 mb-8">
                        <h3 className="font-fredoka font-black text-xl uppercase tracking-wider">Evaluation Tracker</h3>
                        
                        {/* Step 1 */}
                        <div className="flex items-start bg-[#F8FAF9] border-[3px] border-[#1E1E1E] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1E1E1E]">
                            <div className="bg-[#D1F2EB] p-2 border-[2px] border-[#1E1E1E] rounded-xl mr-4 flex-shrink-0">
                                <SVGShieldCheck />
                            </div>
                            <div>
                                <h4 className="font-fredoka font-black text-lg">Step 1: Credentials & Specialization Submitted</h4>
                                <p className="text-sm font-medium text-gray-600 mt-0.5">Resume path registered and package specialization records created.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        {isRejected ? (
                            <div className="flex items-start bg-[#FEF2F2] border-[3px] border-[#1E1E1E] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1E1E1E]">
                                <div className="bg-[#FCA5A5] p-2 border-[2px] border-[#1E1E1E] rounded-xl mr-4 flex-shrink-0">
                                    <svg className="w-6 h-6 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-fredoka font-black text-lg">Step 2: Profile Audit - Rejected</h4>
                                    <p className="text-sm font-medium text-gray-600 mt-0.5">Your qualifications or credentials did not match our current teaching requirements.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start bg-[#FFFEE7] border-[3px] border-[#1E1E1E] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1E1E1E]">
                                <div className="bg-[#FEF08A] p-2 border-[2px] border-[#1E1E1E] rounded-xl mr-4 flex-shrink-0 animate-pulse">
                                    <SVGClock />
                                </div>
                                <div>
                                    <h4 className="font-fredoka font-black text-lg">Step 2: Admin Profile Audit</h4>
                                    <p className="text-sm font-medium text-gray-600 mt-0.5">We are verifying your classroom accent settings, experience credentials, and Google Meet URL links.</p>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        <div className="flex items-start bg-gray-50 border-[3px] border-[#1E1E1E] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1E1E1E] opacity-60">
                            <div className="bg-[#E9D5FF] p-2 border-[2px] border-[#1E1E1E] rounded-xl mr-4 flex-shrink-0">
                                <SVGLock />
                            </div>
                            <div>
                                <h4 className="font-fredoka font-black text-lg">
                                    {isRejected ? "Step 3: Portal Locked" : "Step 3: Batch Assignment & Portal Unlock"}
                                </h4>
                                <p className="text-sm font-medium text-gray-600 mt-0.5">
                                    {isRejected 
                                        ? "As your application has been rejected, access to the Bolo Academy teaching workspace is disabled." 
                                        : "Once approved, you will be assigned to a Spoken English batch. Your active class timelines and students registry will instantly unlock!"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Support Panel */}
                    <div className="bg-[#D1F2EB] border-[3px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-fredoka font-black text-xl uppercase mb-1">Need assistance or have questions?</h4>
                            <p className="text-sm font-medium">Reach out directly to our administration support desk for expedited onboarding.</p>
                        </div>
                        <a 
                            href="mailto:info.boloacademy@gmail.com" 
                            className="bg-white hover:bg-gray-50 font-fredoka font-black text-center text-sm px-5 py-3 border-[3px] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl flex-shrink-0"
                        >
                            Email Admin
                        </a>
                    </div>

                </div>
            </div>
            
            <p className="text-sm font-bold text-gray-500 mt-6 tracking-wide uppercase">
                Bolo Academy: Because everyone deserves to speak with confidence.
            </p>
        </div>
    );
}
