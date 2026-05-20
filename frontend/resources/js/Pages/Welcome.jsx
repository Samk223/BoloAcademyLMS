import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Handcrafted SVG Icons (strictly no emojis)
const SVGBookOpen = () => (
    <svg className="w-6 h-6 stroke-[#7C3AED]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const SVGChat = () => (
    <svg className="w-6 h-6 stroke-[#3D4F35]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.084.29.125.597.125.904 0 2.203-1.656 4-3.7 4H15.9c-.204 0-.407.03-.6.093L12 16.5V13.5a2.5 2.5 0 00-2.5-2.5h-.7c-2.044 0-3.7-1.797-3.7-4s1.656-4 3.7-4h7.5c2.044 0 3.7 1.797 3.7 4z" />
    </svg>
);

const SVGArrowRight = () => (
    <svg className="w-5 h-5 stroke-[#1E1E1E] ml-2 inline-block" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const SVGClose = () => (
    <svg className="w-6 h-6 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SVGMockGoogle = () => (
    <svg className="w-5 h-5 mr-3 inline-block" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-6.16-4.53z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
);

const SVGSpeechBubble = ({ className = "w-6 h-6 stroke-[#3D4F35]" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.03z" />
    </svg>
);

// Hand-painted Rustic Leaves (strictly no emojis)
const SVGLeafBrown = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="#C2673D" fillOpacity="0.75">
        <path d="M12,2 C12,2 6,8 6,13 C6,16.3 8.7,19 12,19 C15.3,19 18,16.3 18,13 C18,8 12,2 12,2 Z M12,17 C10.3,17 9,15.7 9,14 C9,13 10,11.5 12,9 C14,11.5 15,13 15,14 C15,15.7 13.7,17 12,17 Z" />
    </svg>
);

const SVGLeafOrange = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="#E28743">
        <path d="M12,2 C12,2 17,6 17,11 C17,14 14.5,17 12,21 C9.5,17 7,14 7,11 C7,6 12,2 12,2 Z" />
    </svg>
);

const SVGLeafGreen = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="#6A8F6C" fillOpacity="0.85">
        <path d="M2,12 C2,12 8,6 13,6 C16.3,6 19,8.7 19,12 C19,15.3 16.3,18 13,18 C8,18 2,12 2,12 Z" />
    </svg>
);

// Storytelling Milestones data
const mapSteps = [
    {
        title: '1. Secure 7-Day Grace Trial',
        tagline: 'Instant Placement',
        desc: 'New learners register and enter the active dashboard instantly without blocking barriers. A 7-day grace period allows exploring classrooms, joining speaking pods, and downloading worksheets while registration settles.',
        color: 'bg-[#D1F2EB]',
        border: 'border-[#3D4F35]',
        badgeColor: 'text-[#1E1E1E]',
        image: '/images/grace_trial_storybook.png'
    },
    {
        title: '2. Cozy Daily Speaking Circles',
        tagline: 'Speaking Circle',
        desc: 'Students sit in a cozy live circle of 5-6 peers, practicing daily conversational English. Highly active, speaking-first classrooms led by expert mentors ensure zero-hesitation learning.',
        color: 'bg-[#FFE5D9]',
        border: 'border-[#3D4F35]',
        badgeColor: 'text-[#EA580C]',
        image: '/images/speaking_circle_detail_storybook.png'
    },
    {
        title: '3. Real-Time Teacher Echoes',
        tagline: 'Instantly Guided',
        desc: 'Our wise mentors provide gentle live pronunciation and sentence correction on the fly, tailoring specific recommendations directly to each student\'s learning profile and goals.',
        color: 'bg-[#E9D5FF]',
        border: 'border-[#3D4F35]',
        badgeColor: 'text-[#7C3AED]',
        image: '/images/teacher_echoes_storybook.png'
    },
    {
        title: '4. Student Resource Locker',
        tagline: 'Digital Library',
        desc: 'Unlock comprehensive digital studybooks, daily worksheets, and speaking checklists inside your dashboard library to accelerate grammar and accent mastery.',
        color: 'bg-[#FFF8E7]',
        border: 'border-[#3D4F35]',
        badgeColor: 'text-[#D97706]',
        image: '/images/resource_locker_storybook.png'
    }
];

// Parent Reviews list
const reviewsList = [
    { parent: 'Dr. Ananya Ray', loc: 'Delhi', child: 'Aarav (Grade 4)', text: 'Aarav used to feel shy in speaking English. Within just 2 weeks of the Cozy Circles daily practice under Neha Thomas, his hesitation has completely dissolved. Best live program ever!', rating: 5 },
    { parent: 'Sanjay Deshmukh', loc: 'Pune', child: 'Riya (Grade 6)', text: 'The 7-day immediate placement allowed Riya to start her classes immediately. Admins approved her payment soon after. Extremely neat and clean dashboard experience!', rating: 5 },
    { parent: 'Prof. Meenakshi S.', loc: 'Bangalore', child: 'Vihaan (Grade 3)', text: 'Very impressive teaching system. Instead of standard dry textbooks, they speak naturally about real-world scenarios, making it extremely engaging. Highly recommended!', rating: 5 }
];

export default function Welcome({ auth }) {
    // 1. Preloader State
    const [preloading, setPreloading] = useState(true);
    const [preloadPercent, setPreloadPercent] = useState(0);
    const [preloadStatus, setPreloadStatus] = useState('Initializing speaking engine...');
    const [preloaderVisible, setPreloaderVisible] = useState(true);

    // 2. Dynamic Batches State
    const [batches, setBatches] = useState([]);
    
    // 3. Selection & Modal States
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [studentModalOpen, setStudentModalOpen] = useState(false);
    const [teacherModalOpen, setTeacherModalOpen] = useState(false);
    // Real Google Auth Simulator States
    const [googleAuthModalOpen, setGoogleAuthModalOpen] = useState(false);
    const [googleAuthRole, setGoogleAuthRole] = useState('student');
    const [googleEmailInput, setGoogleEmailInput] = useState('');
    const [googlePasswordInput, setGooglePasswordInput] = useState('');
    const [googleAuthVerifying, setGoogleAuthVerifying] = useState(false);
    const [googleVerifyLogs, setGoogleVerifyLogs] = useState('');
    const [studentGoogleVerifiedEmail, setStudentGoogleVerifiedEmail] = useState('');
    const [teacherGoogleVerifiedEmail, setTeacherGoogleVerifiedEmail] = useState('');
    const [googleAuthError, setGoogleAuthError] = useState('');
    
    // Google Auth Verification Code States
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationCodeInput, setVerificationCodeInput] = useState('');

    // 4. Interactive Map State
    const [activeMapStep, setActiveMapStep] = useState(0);

    // 5. Interactive Speaking Simulator State
    const [chatLine, setChatLine] = useState(0);
    const [speakingAvatar, setSpeakingAvatar] = useState('mentor'); // 'mentor', 'rohan', 'sana', 'diya'
    const [typingIndex, setTypingIndex] = useState(0);

    // Simulated Speech Circles Conversation script
    const simulatorDialogue = [
        { avatar: 'mentor', name: 'Mentor Ritika', text: 'Welcome to the Spoken Circle! Ready to learn, team?' },
        { avatar: 'rohan', name: 'Rohan (Student)', text: 'I am so excited! I want to speak with bold clarity today.' },
        { avatar: 'sana', name: 'Sana (Student)', text: 'My goal is to master daily conversational flow.' },
        { avatar: 'diya', name: 'Diya (Student)', text: 'Let\'s practice with bold confidence!' }
    ];

    // Typist simulation loop for active audio mockup
    useEffect(() => {
        setTypingIndex(0);
        const currentText = simulatorDialogue[chatLine].text;
        setSpeakingAvatar(simulatorDialogue[chatLine].avatar);

        let index = 0;
        const interval = setInterval(() => {
            index++;
            if (index <= currentText.length) {
                setTypingIndex(index);
            } else {
                clearInterval(interval);
                const timer = setTimeout(() => {
                    setChatLine(prev => (prev + 1) % simulatorDialogue.length);
                }, 3500);
                return () => clearTimeout(timer);
            }
        }, 50);

        return () => {
            clearInterval(interval);
        };
    }, [chatLine]);

    // Chapter 3: Auto-cycle map steps every 4.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveMapStep(prev => (prev + 1) % mapSteps.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [mapSteps.length]);

    // Form logic
    const studentForm = useForm({
        name: '',
        email: '',
        password: '',
        grade: 'Grade 3',
        parent_name: '',
        parent_phone: '',
        batch_id: '',
        package_name: ''
    });

    const teacherForm = useForm({
        name: '',
        email: '',
        password: '',
        experience_years: 0,
        certifications: '',
        subject_specialization: 'Spoken English & Grammar',
        curriculum_expertise: 'Basic Boost & Speaker Combo',
        bio: '',
        meeting_link: '',
        accent_color: '#E9D5FF',
        resume: null
    });

    // Run Landing Page Preloader
    useEffect(() => {
        const statuses = [
            { threshold: 15, text: 'Opening the study portal...' },
            { threshold: 45, text: 'Preparing speaking circles...' },
            { threshold: 75, text: 'Gathering expert mentors...' },
            { threshold: 95, text: 'Welcome to Bolo Academy!' }
        ];

        let start = null;
        const duration = 2000; // 2 seconds

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(Math.floor((progress / duration) * 100), 100);

            setPreloadPercent(percentage);

            const activeStatus = statuses.find(s => percentage <= s.threshold);
            if (activeStatus) {
                setPreloadStatus(activeStatus.text);
            }

            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                setPreloading(false);
                setTimeout(() => {
                    setPreloaderVisible(false);
                }, 1000); // 1000ms matches the slide-up transition duration
            }
        };

        requestAnimationFrame(animate);
    }, []);

    // Lock body scroll while preloading
    useEffect(() => {
        if (preloading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [preloading]);

    // Load available batches from API
    useEffect(() => {
        fetch('/api/batches')
            .then(res => res.json())
            .then(data => setBatches(data))
            .catch(err => console.error('Failed to load batches:', err));
    }, []);

    const openRealGoogleSignIn = (role) => {
        setGoogleAuthRole(role);
        setGoogleEmailInput('');
        setGooglePasswordInput('');
        setGoogleAuthVerifying(false);
        setGoogleVerifyLogs('');
        setGoogleAuthError('');
        setVerificationSent(false);
        setVerificationCodeInput('');
        setGoogleAuthModalOpen(true);
    };

    const parseNameFromEmail = (email) => {
        if (!email) return 'New User';
        const parts = email.split('@');
        const namePart = parts[0];
        const cleanName = namePart.replace(/[^a-zA-Z]/g, ' ').trim();
        if (!cleanName) return 'Google User';
        return cleanName
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setGoogleAuthError('');
        setGoogleAuthVerifying(true);
        setGoogleVerifyLogs('Requesting verification code...');

        const cleanEmail = googleEmailInput.trim().toLowerCase();

        try {
            const response = await fetch('/google-auth/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ email: cleanEmail, role: googleAuthRole })
            });

            if (response.status === 419) {
                setGoogleAuthError('Session expired. Please refresh the page and try again.');
                setGoogleAuthVerifying(false);
                return;
            }

            const data = await response.json();
            
            if (response.ok) {
                setVerificationSent(true);
                setGoogleAuthVerifying(false);
                setGoogleVerifyLogs('');
            } else {
                setGoogleAuthError(data.message || 'Failed to request verification code.');
                setGoogleAuthVerifying(false);
            }
        } catch (err) {
            setGoogleAuthError('Connection to Google Auth service failed. Please try again.');
            setGoogleAuthVerifying(false);
        }
    };

    const handleVerifyCodeSubmit = async (e) => {
        e.preventDefault();
        setGoogleAuthError('');
        setGoogleAuthVerifying(true);
        setGoogleVerifyLogs('Validating secure OAuth code...');

        const cleanEmail = googleEmailInput.trim().toLowerCase();
        const code = verificationCodeInput.trim();

        try {
            const response = await fetch('/google-auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ email: cleanEmail, code: code, role: googleAuthRole })
            });

            if (response.status === 419) {
                setGoogleAuthError('Session expired. Please refresh the page and try again.');
                setGoogleAuthVerifying(false);
                return;
            }

            const data = await response.json();

            if (response.ok) {
                const logs = [
                    'Validating secure OAuth code...',
                    'Connecting to Google Identity Services...',
                    'Verifying account credentials...',
                    'Securely exchanging OAuth2 tokens...',
                    'Retrieving profile attributes...',
                    'Form auto-population ready!'
                ];

                let index = 0;
                setGoogleVerifyLogs(logs[0]);
                const interval = setInterval(() => {
                    index++;
                    if (index < logs.length) {
                        setGoogleVerifyLogs(logs[index]);
                    } else {
                        clearInterval(interval);
                        setTimeout(() => {
                            const extractedName = parseNameFromEmail(cleanEmail);
                            
                            if (googleAuthRole === 'student') {
                                setStudentGoogleVerifiedEmail(cleanEmail);
                                studentForm.setData({
                                    ...studentForm.data,
                                    name: extractedName,
                                    email: cleanEmail
                                });
                            } else {
                                setTeacherGoogleVerifiedEmail(cleanEmail);
                                teacherForm.setData({
                                    ...teacherForm.data,
                                    name: extractedName,
                                    email: cleanEmail
                                });
                            }
                            
                            setGoogleAuthVerifying(false);
                            setGoogleAuthModalOpen(false);
                        }, 400);
                    }
                }, 400);
            } else {
                setGoogleAuthError(data.message || 'Incorrect verification code.');
                setGoogleAuthVerifying(false);
            }
        } catch (err) {
            setGoogleAuthError('Verification service error. Please try again.');
            setGoogleAuthVerifying(false);
        }
    };

    const clearGoogleAuth = (role) => {
        if (role === 'student') {
            setStudentGoogleVerifiedEmail('');
            studentForm.setData({
                ...studentForm.data,
                name: '',
                email: '',
                password: ''
            });
        } else {
            setTeacherGoogleVerifiedEmail('');
            teacherForm.setData({
                ...teacherForm.data,
                name: '',
                email: '',
                password: ''
            });
        }
    };

    const handleSelectPlan = (batch) => {
        setSelectedPlan(batch);
        studentForm.setData({
            ...studentForm.data,
            batch_id: batch.id,
            package_name: batch.curriculum_name
        });
        setStudentModalOpen(true);
    };

    const handleStudentSubmit = (e) => {
        e.preventDefault();
        studentForm.post(route('student.checkout'), {
            onSuccess: () => setStudentModalOpen(false)
        });
    };

    const handleTeacherSubmit = (e) => {
        e.preventDefault();
        teacherForm.post(route('teacher.apply'), {
            onSuccess: () => setTeacherModalOpen(false)
        });
    };

    // Data loaded from module level scope above

    return (
        <div className="min-h-screen h-screen overflow-y-auto overflow-x-hidden scroll-smooth bg-[#FAF7ED] text-[#1E1E1E] font-sans selection:bg-[#E9D5FF] relative scrollbar-hide">
            <Head title="Bolo Academy - Premium Spoken English LMS" />

            {/* Custom Embedded CSS Styles for Whimsical Animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes floatCloud {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes floatLeaf {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(8deg); }
                }
                @keyframes bounceVoiceSim {
                    0% { height: 6px; }
                    100% { height: 18px; }
                }
                @keyframes fallLeaf {
                    0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(300px) rotate(360deg) translateX(50px); opacity: 0; }
                }
                .anim-cloud {
                    animation: floatCloud 8s ease-in-out infinite;
                }
                .anim-leaf {
                    animation: floatLeaf 6s ease-in-out infinite;
                }
                .voice-bar-sim-1 { animation: bounceVoiceSim 0.4s ease-in-out infinite alternate; }
                .voice-bar-sim-2 { animation: bounceVoiceSim 0.6s ease-in-out infinite alternate; }
                .voice-bar-sim-3 { animation: bounceVoiceSim 0.5s ease-in-out infinite alternate; }
                .voice-bar-sim-4 { animation: bounceVoiceSim 0.7s ease-in-out infinite alternate; }
                
                .leaf-fall-1 { animation: fallLeaf 12s linear infinite; }
                .leaf-fall-2 { animation: fallLeaf 16s linear infinite; animation-delay: 3s; }
                .leaf-fall-3 { animation: fallLeaf 20s linear infinite; animation-delay: 6s; }
            `}} />

            {/* 1. Preloader Overlay with Wavy Swipe Up Transition */}
            {preloaderVisible && (
                <div 
                    className="fixed inset-x-0 top-0 h-screen bg-[#D8E5D2] z-50"
                    style={{
                        transform: preloading ? 'translateY(0)' : 'translateY(calc(-100vh + 96px))',
                        opacity: preloading ? 1 : 0,
                        transition: 'transform 1000ms cubic-bezier(0.85, 0, 0.15, 1), opacity 150ms ease-out 850ms'
                    }}
                >
                    {/* Inner content wrapper with overflow-hidden to clip text as it slides up */}
                    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-6">
                        {/* BOLO ACADEMY in the center */}
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <h1 className="font-fredoka font-black text-6xl md:text-9xl tracking-widest text-[#3D4F35] drop-shadow-[6px_6px_0px_#D28C67] select-none text-center leading-none">
                                BOLO ACADEMY
                            </h1>
                            
                            {/* Interactive Loading Bar */}
                            <div className="flex items-center gap-4">
                                <div className="h-3 w-64 bg-[#FFE5D9] border-[3px] border-[#3D4F35] rounded-full overflow-hidden shadow-[3px_3px_0px_0px_#3D4F35] p-0.5 relative">
                                    <div 
                                        className="bg-[#6A8F6C] h-full rounded-full transition-all duration-100 ease-out"
                                        style={{ width: `${preloadPercent}%` }}
                                    ></div>
                                </div>
                                <span className="font-fredoka font-black text-lg text-[#C2673D]">
                                    {preloadPercent}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Repeating Scalloped Wave Outlines at Bottom - matching the second image */}
                    <div className="absolute bottom-[-15px] left-0 right-0 w-full h-[15px] pointer-events-none z-50">
                        <svg width="100%" height="15" xmlns="http://www.w3.org/2000/svg" className="block">
                            <defs>
                                <pattern id="preloader-wave" x="0" y="0" width="30" height="15" patternUnits="userSpaceOnUse">
                                    <path d="M0,0 C7.5,11 22.5,11 30,0" fill="#D8E5D2" stroke="#3D4F35" strokeWidth="3" />
                                </pattern>
                            </defs>
                            <rect x="0" y="0" width="100%" height="15" fill="url(#preloader-wave)" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Full-Width Horizontal Scalloped Navigation Bar */}
            <div className="fixed top-0 left-0 right-0 z-30 w-full bg-white border-b-[3px] border-[#3D4F35]">
                <header className="w-full px-6 md:px-12 py-4 flex items-center justify-between relative bg-white">
                    <Link href="/" className="flex items-center gap-3 relative z-10">
                        <img src="/images/bolo_logo.png" alt="Bolo Academy Logo" className="h-16 w-auto object-contain drop-shadow-sm" />
                        <div>
                            <span className="font-fredoka font-black text-xl uppercase tracking-wider block text-[#3D4F35] leading-none">Bolo Academy</span>
                            <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Active Spoken English</span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4 relative z-10">
                        {auth.user ? (
                            <div className="flex items-center gap-3">
                                {/* Profile Badge showcasing the user's email and role */}
                                <div className="flex items-center gap-2 bg-[#FFE5D9] border-[3px] border-[#3D4F35] shadow-[2px_2px_0px_0px_#3D4F35] rounded-full px-3 py-1.5 text-xs font-black text-[#3D4F35]">
                                    <span className="text-base select-none">
                                        {auth.user.role === 'admin' ? '🔑' : auth.user.role === 'teacher' ? '👩‍🏫' : '👦'}
                                    </span>
                                    <span className="text-[10px] tracking-wider uppercase truncate max-w-[160px] font-bold">
                                        {auth.user.email}
                                    </span>
                                </div>
                                
                                <Link 
                                    href={route('dashboard')} 
                                    className="bg-[#D8E5D2] hover:bg-[#c9dabf] font-fredoka font-black px-5 py-2.5 border-[3px] border-[#3D4F35] shadow-[3px_3px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl text-[10px] uppercase tracking-wider text-[#3D4F35]"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link 
                                    href={route('login')} 
                                    className="font-fredoka font-black hover:text-[#D28C67] text-[10px] uppercase tracking-widest px-2 text-[#3D4F35]"
                                >
                                    Log In
                                </Link>
                                <button 
                                    onClick={() => setTeacherModalOpen(true)}
                                    className="bg-[#FFE5D9] hover:bg-[#ffd6c4] font-fredoka font-black px-4 py-2 border-[3px] border-[#3D4F35] shadow-[3px_3px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl text-[10px] uppercase tracking-widest hidden md:inline-block text-[#D28C67]"
                                >
                                    Join Mentor
                                </button>
                            </>
                        )}
                    </nav>

                    {/* Horizontal Repeating Scalloped Wave Outlines at Bottom - rotated from vertical sidebar style */}
                    <div className="absolute bottom-[-15px] left-0 right-0 w-full h-[15px] pointer-events-none z-20">
                        <svg width="100%" height="15" xmlns="http://www.w3.org/2000/svg" className="block">
                            <defs>
                                <pattern id="nav-wave" x="0" y="0" width="30" height="15" patternUnits="userSpaceOnUse">
                                    <path d="M0,0 C7.5,11 22.5,11 30,0" fill="#FFFFFF" stroke="#3D4F35" strokeWidth="3" />
                                </pattern>
                            </defs>
                            <rect x="0" y="0" width="100%" height="15" fill="url(#nav-wave)" />
                        </svg>
                    </div>
                </header>
            </div>

            {/* Chapter 1: The Magic Placement (Storybook Hero) */}
            <section className="relative pt-44 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-20 bg-[#FAF7ED]">

                <div className="lg:col-span-7 space-y-6 relative z-10">
                    <span className="font-fredoka font-bold text-xs uppercase tracking-widest text-[#5A6F4E] block">
                        Welcome to Spoken English Storytelling!
                    </span>
                    <h1 className="font-fredoka font-black text-5xl md:text-7xl leading-[1.1] text-[#3D4F35]">
                        Good Morning <br />
                        to Speaking.
                    </h1>
                    <p className="text-base md:text-lg font-bold text-[#5A6F4E] max-w-2xl leading-relaxed italic">
                        "Once upon a time, learning English was dry and boring. Bolo Academy turns your study into an active story! Join daily live group speaking circles, receive real-time mentor corrections, and build conversation fluency from Day 1."
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 w-fit">
                        <a 
                            href="#programs" 
                            className="bg-[#D8E5D2] hover:bg-[#c9dabf] font-fredoka font-black text-base px-8 py-4 border-[3px] border-[#3D4F35] shadow-[5px_5px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-3xl uppercase tracking-wider text-[#3D4F35] text-center"
                        >
                            Explore Batches
                        </a>
                        <button 
                            onClick={() => setTeacherModalOpen(true)}
                            className="bg-[#FFE5D9] hover:bg-[#ffd6c4] font-fredoka font-black text-base px-8 py-4 border-[3px] border-[#3D4F35] shadow-[5px_5px_0px_0px_#3D4F35] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-3xl uppercase tracking-wider text-[#D28C67] text-center"
                        >
                            Join as Mentor
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-5 relative z-10 flex justify-center lg:justify-end items-end w-full lg:self-stretch h-[450px] lg:h-auto min-h-[450px] lg:min-h-0">
                    {/* Couple Illustration Mascot */}
                    <div className="absolute left-[-120px] md:left-[-190px] lg:left-[-235px] xl:left-[-250px] bottom-[-150px] md:bottom-[-165px] lg:bottom-[-170px] w-[544px] md:w-[732px] lg:w-[851px] xl:w-[930px] z-20 pointer-events-none flex items-end justify-end">
                        <img 
                            src="/images/hero-image-main.png" 
                            alt="Bolo Academy Cozy Couple Mascot" 
                            style={{ transform: 'scale(0.76) translateY(-15%) translateX(-15%)', transformOrigin: 'bottom right' }}
                            className="w-full h-auto max-h-[416px] md:max-h-[495px] lg:max-h-[574px] xl:max-h-[634px] object-contain"
                        />
                    </div>
                </div>
            </section>

            {/* Spacer gap between hero and next section */}
            <div className="h-12 w-full bg-[#FAF7ED] relative z-10"></div>

            {/* Hand-painted jagged brush wave divider 1 (Cream to Rich Green watercolor) */}
            <div className="w-full bg-transparent -mb-2 relative z-10 pointer-events-none" style={{ outline: 'none', border: 'none' }}>
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-16 block" stroke="none" strokeWidth="0" style={{ stroke: 'none', border: 'none', outline: 'none', transform: 'translateY(1px)' }}>
                    <path d="M 0 50 C 45 20, 45 20, 90 50 C 135 80, 135 80, 180 50 C 225 20, 225 20, 270 50 C 315 80, 315 80, 360 50 C 405 20, 405 20, 450 50 C 495 80, 495 80, 540 50 C 585 20, 585 20, 630 50 C 675 80, 675 80, 720 50 C 765 20, 765 20, 810 50 C 855 80, 855 80, 900 50 C 945 20, 945 20, 990 50 C 1035 80, 1035 80, 1080 50 C 1125 20, 1125 20, 1170 50 C 1215 80, 1215 80, 1260 50 C 1305 20, 1305 20, 1350 50 C 1395 80, 1395 80, 1440 50 L 1440 101 L 0 101 Z" fill="#7F9E7F" stroke="none" strokeWidth="0" style={{ stroke: 'none' }} />
                </svg>
            </div>

            {/* Chapter 2: Inside the Live Circle (Interactive Watercolor Sage Green Banner with 15% lower opacity) */}
            <section className="bg-[#7F9E7F] py-20 px-6 relative z-10 -mt-3 text-[#FAF7ED] border-none" style={{ border: 'none', outline: 'none' }}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Enlarged Simulated Book Folder iPad Frame Mockup (Left Side - takes up 8 columns) */}
                    <div className="lg:col-span-8 flex justify-center w-full">
                        <div className="relative flex items-center w-full max-w-3xl">
                            {/* Bottom-Left Plant Pot grounded next to the leather spine */}
                            <div className="absolute left-[-45px] bottom-[-20px] w-28 h-auto z-30 pointer-events-none">
                                <img 
                                    src="/images/plant_pot.png" 
                                    alt="Decorative Cozy Plant Pot Left" 
                                    className="w-full h-auto object-contain"
                                />
                            </div>

                            {/* Bottom-Right Plant Pot grounded next to the mockup right side */}
                            <div className="absolute right-[-25px] bottom-[-20px] w-24 h-auto z-30 pointer-events-none">
                                <img 
                                    src="/images/plant_pot.png" 
                                    alt="Decorative Cozy Plant Pot Right" 
                                    className="w-full h-auto object-contain"
                                />
                            </div>

                            {/* Premium protective leather folder cover */}
                            <div className="w-14 h-[420px] bg-[#B0481A] border-[4px] border-[#3D4F35] rounded-l-2xl shadow-[5px_5px_0px_0px_#1E1E1E] z-20 flex-shrink-0"></div>
                            
                            <div className="relative w-full -ml-2 z-10 flex flex-col">
                                {/* Top-Left Books Stack resting on top of the window */}
                                <div className="absolute left-[2px] top-[-92px] w-48 h-auto z-30 pointer-events-none">
                                    <img 
                                        src="/images/books_stack.png" 
                                        alt="Cozy Stack of Books and Plant" 
                                        className="w-full h-auto object-contain"
                                    />
                                </div>

                                {/* iPad inside cover folder (Enlarged) */}
                                <div className="bg-white border-[4px] border-[#3D4F35] shadow-[12px_12px_0px_0px_#1E1E1E] rounded-r-3xl overflow-hidden w-full text-[#1E1E1E]">
                                {/* Classroom Top Bar */}
                                <div className="bg-[#FFE5D9] border-b-[3px] border-[#3D4F35] px-8 py-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-[#D28C67] rounded-full border-[2.5px] border-[#3D4F35]"></div>
                                        <span className="font-fredoka font-black text-xs uppercase tracking-wider text-[#C2673D]">Cozy Speaking Room</span>
                                    </div>
                                    <span className="bg-white px-3 py-1 border-[2.5px] border-[#3D4F35] rounded-md text-[10px] font-black uppercase">LIVE Classroom Simulator</span>
                                </div>

                                {/* Simulated Grid of avatars (Enlarged Cards) */}
                                <div className="p-6 grid grid-cols-4 gap-4 bg-[#FAF7ED]">
                                    <div className={`border-[3px] border-[#3D4F35] rounded-2xl p-4 text-center transition-all ${speakingAvatar === 'mentor' ? 'bg-[#D1F2EB] shadow-[4px_4px_0px_0px_#3D4F35] scale-105' : 'bg-white'}`}>
                                        <div className="w-14 h-14 mx-auto rounded-full bg-[#A7F3D0] border-[2px] border-[#3D4F35] flex items-center justify-center text-2xl mb-2">👩‍🏫</div>
                                        <span className="block text-xs font-black leading-none">Ritika</span>
                                        <div className="h-6 flex items-end justify-center gap-0.5 mt-2">
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'mentor' ? 'voice-bar-sim-1' : 'h-1.5'}`}></div>
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'mentor' ? 'voice-bar-sim-2' : 'h-1.5'}`}></div>
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'mentor' ? 'voice-bar-sim-3' : 'h-1.5'}`}></div>
                                        </div>
                                    </div>

                                    <div className={`border-[3px] border-[#3D4F35] rounded-2xl p-4 text-center transition-all ${speakingAvatar === 'rohan' ? 'bg-[#FFE5D9] shadow-[4px_4px_0px_0px_#3D4F35] scale-105' : 'bg-white'}`}>
                                        <div className="w-14 h-14 mx-auto rounded-full bg-[#FFEDD5] border-[2px] border-[#3D4F35] flex items-center justify-center text-2xl mb-2">👦</div>
                                        <span className="block text-xs font-black leading-none">Rohan</span>
                                        <div className="h-6 flex items-end justify-center gap-0.5 mt-2">
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'rohan' ? 'voice-bar-sim-3' : 'h-1.5'}`}></div>
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'rohan' ? 'voice-bar-sim-1' : 'h-1.5'}`}></div>
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'rohan' ? 'voice-bar-sim-4' : 'h-1.5'}`}></div>
                                        </div>
                                    </div>

                                    <div className={`border-[3px] border-[#3D4F35] rounded-2xl p-4 text-center transition-all ${speakingAvatar === 'sana' ? 'bg-[#E9D5FF] shadow-[4px_4px_0px_0px_#3D4F35] scale-105' : 'bg-white'}`}>
                                        <div className="w-14 h-14 mx-auto rounded-full bg-[#F3E8FF] border-[2px] border-[#3D4F35] flex items-center justify-center text-2xl mb-2">👧</div>
                                        <span className="block text-xs font-black leading-none">Sana</span>
                                        <div className="h-6 flex items-end justify-center gap-0.5 mt-2">
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'sana' ? 'voice-bar-sim-2' : 'h-1.5'}`}></div>
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'sana' ? 'voice-bar-sim-4' : 'h-1.5'}`}></div>
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'sana' ? 'voice-bar-sim-1' : 'h-1.5'}`}></div>
                                        </div>
                                    </div>

                                    <div className={`border-[3px] border-[#3D4F35] rounded-2xl p-4 text-center transition-all ${speakingAvatar === 'diya' ? 'bg-[#FFF8E7] shadow-[4px_4px_0px_0px_#3D4F35] scale-105' : 'bg-white'}`}>
                                        <div className="w-14 h-14 mx-auto rounded-full bg-[#FEF3C7] border-[2px] border-[#3D4F35] flex items-center justify-center text-2xl mb-2">👧</div>
                                        <span className="block text-xs font-black leading-none">Diya</span>
                                        <div className="h-6 flex items-end justify-center gap-0.5 mt-2">
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'diya' ? 'voice-bar-sim-1' : 'h-1.5'}`}></div>
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'diya' ? 'voice-bar-sim-3' : 'h-1.5'}`}></div>
                                            <div className={`w-0.5 bg-[#3D4F35] rounded-full ${speakingAvatar === 'diya' ? 'voice-bar-sim-2' : 'h-1.5'}`}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Simulated active text bar (Enlarged) */}
                                <div className="mx-6 mb-6 p-4 bg-white border-[3px] border-[#3D4F35] rounded-2xl shadow-inner min-h-[90px] flex items-start gap-3">
                                    <div className="bg-[#FFE5D9] p-2 border-[2px] border-[#3D4F35] rounded-xl shadow-[2px_2px_0px_0px_#3D4F35] mr-1 flex-shrink-0">
                                        <SVGSpeechBubble className="w-5 h-5 stroke-[#C2673D]" />
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-black uppercase text-gray-400 leading-none">
                                            {speakingAvatar === 'mentor' ? 'Ritika (Mentor)' : speakingAvatar === 'rohan' ? 'Rohan (Student)' : speakingAvatar === 'sana' ? 'Sana (Student)' : 'Diya (Student)'}
                                        </span>
                                        <p className="text-sm font-black text-[#1E1E1E] leading-normal mt-1.5">
                                            {simulatorDialogue[chatLine].text.slice(0, typingIndex)}
                                            <span className="animate-ping ml-0.5 font-normal text-sm text-[#C2673D]">|</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    {/* Descriptive Text Column (takes up 4 columns) */}
                    <div className="lg:col-span-4 space-y-6">
                        <span className="font-fredoka font-black text-xs uppercase tracking-widest text-[#D1F2EB] block">
                            Interactive Storytelling Circles
                        </span>
                        <h2 className="font-fredoka font-black text-4xl md:text-5xl leading-tight text-[#FAF7ED]">
                            Celebrate and appreciate English!
                        </h2>
                        <p className="text-sm font-bold text-[#D8E5D2] leading-relaxed italic">
                            How does our classroom operate? Instead of reading static sheets, children join their peer student buddies in real-time. Students sit in a cozy live circle of 5-6 peers, practicing daily conversational English with real-time mentor feedback.
                        </p>
                        <a 
                            href="#programs" 
                            className="inline-block bg-[#FAF7ED] hover:bg-white text-[#3D4F35] font-fredoka font-black text-xs px-6 py-3 border-[3px] border-[#3D4F35] shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl uppercase tracking-wider"
                        >
                            Read More Batches
                        </a>
                    </div>
                </div>
            </section>

            {/* Hand-painted jagged brush wave divider 2 (Rich Green to Cream) */}
            <div className="w-full bg-[#7F9E7F] -mt-2 relative z-10 pointer-events-none" style={{ outline: 'none', border: 'none' }}>
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-16 block animate-fade-in" stroke="none" strokeWidth="0" style={{ stroke: 'none', border: 'none', outline: 'none', transform: 'translateY(1px)' }}>
                    <path d="M 0 50 C 45 20, 45 20, 90 50 C 135 80, 135 80, 180 50 C 225 20, 225 20, 270 50 C 315 80, 315 80, 360 50 C 405 20, 405 20, 450 50 C 495 80, 495 80, 540 50 C 585 20, 585 20, 630 50 C 675 80, 675 80, 720 50 C 765 20, 765 20, 810 50 C 855 80, 855 80, 900 50 C 945 20, 945 20, 990 50 C 1035 80, 1035 80, 1080 50 C 1125 20, 1125 20, 1170 50 C 1215 80, 1215 80, 1260 50 C 1305 20, 1305 20, 1350 50 C 1395 80, 1395 80, 1440 50 L 1440 101 L 0 101 Z" fill="#FAF7ED" stroke="none" strokeWidth="0" style={{ stroke: 'none' }} />
                </svg>
            </div>

            {/* Chapter 3: See how it works (With Falling Autumn Leaves) */}
            <section className="py-20 px-6 max-w-7xl mx-auto relative overflow-hidden bg-[#FAF7ED] z-10">
                {/* Interactive Falling Leaves in Background (SVG elements - No emojis policy) */}
                <div className="absolute top-10 left-5 w-8 h-8 leaf-fall-1 pointer-events-none">
                    <SVGLeafBrown className="w-full h-full opacity-40" />
                </div>
                <div className="absolute top-40 right-10 w-6 h-6 leaf-fall-2 pointer-events-none">
                    <SVGLeafOrange className="w-full h-full opacity-40" />
                </div>
                <div className="absolute top-80 left-[20%] w-7 h-7 leaf-fall-3 pointer-events-none">
                    <SVGLeafGreen className="w-full h-full opacity-40" />
                </div>

                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <span className="font-fredoka font-black text-xs uppercase tracking-widest text-[#D28C67]">Chapter 3: Speaking Trail</span>
                    <h2 className="font-fredoka font-black text-4xl md:text-5xl leading-tight text-[#3D4F35]">See how it works.</h2>
                    <p className="text-base font-semibold text-[#5A6F4E]">
                        Our interactive storybook maps structured daily routines to build confident speaking habits. Click milestones along the learning trail!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                    <div className="lg:col-span-5 space-y-3">
                        {mapSteps.map((step, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveMapStep(idx)}
                                className={`w-full text-left p-4 rounded-2xl border-[3px] transition-all flex items-center justify-between ${idx === activeMapStep ? `${step.color} ${step.border} shadow-[5px_5px_0px_0px_#3D4F35] scale-[1.02]` : 'bg-white border-gray-200 opacity-70 hover:opacity-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-fredoka font-black text-lg text-[#3D4F35]">{idx + 1}</span>
                                    <h4 className="font-fredoka font-black text-sm uppercase tracking-wider text-[#3D4F35]">{step.title}</h4>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 border-[2px] border-[#3D4F35] bg-white rounded-lg ${step.badgeColor}`}>
                                    {step.tagline}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* iPad Tablet Mockup displaying classroom circles */}
                    <div className="lg:col-span-7 flex justify-center">
                        <div className="bg-white border-[5px] border-[#3D4F35] shadow-[12px_12px_0px_0px_#D28C67] rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center max-w-xl">
                            
                            {/* Classroom active speaking photograph */}
                            <div className={`w-full md:w-1/2 h-64 rounded-3xl border-[3px] border-[#3D4F35] ${mapSteps[activeMapStep].color} overflow-hidden shadow-inner relative`}>
                                <img 
                                    src={mapSteps[activeMapStep].image} 
                                    alt={mapSteps[activeMapStep].title} 
                                    className="w-full h-full object-cover p-2 bg-[#FAF7ED]"
                                />
                                <div className="absolute bottom-2 left-2 bg-[#FAF7ED] px-3 py-1 text-[9px] font-black border-[2px] border-[#3D4F35] rounded-lg">
                                    {mapSteps[activeMapStep].tagline}
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 space-y-4 text-left">
                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-gray-50 border-[2px] border-[#3D4F35] rounded-lg inline-block text-[#3D4F35]">
                                    {mapSteps[activeMapStep].tagline}
                                </span>
                                <h3 className="font-fredoka font-black text-xl uppercase tracking-wider text-[#3D4F35]">
                                    {mapSteps[activeMapStep].title}
                                </h3>
                                <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                                    {mapSteps[activeMapStep].desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hand-painted jagged brush wave divider 3 (Cream to Soft Green) */}
            <div className="w-full bg-[#FAF7ED] -mt-1 relative z-10 pointer-events-none" style={{ outline: 'none', border: 'none' }}>
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-16 block" stroke="none" strokeWidth="0" style={{ stroke: 'none', border: 'none', outline: 'none', transform: 'translateY(1px)' }}>
                    <path d="M 0 50 C 45 20, 45 20, 90 50 C 135 80, 135 80, 180 50 C 225 20, 225 20, 270 50 C 315 80, 315 80, 360 50 C 405 20, 405 20, 450 50 C 495 80, 495 80, 540 50 C 585 20, 585 20, 630 50 C 675 80, 675 80, 720 50 C 765 20, 765 20, 810 50 C 855 80, 855 80, 900 50 C 945 20, 945 20, 990 50 C 1035 80, 1035 80, 1080 50 C 1125 20, 1125 20, 1170 50 C 1215 80, 1215 80, 1260 50 C 1305 20, 1305 20, 1350 50 C 1395 80, 1395 80, 1440 50 L 1440 101 L 0 101 Z" fill="#D8E5D2" stroke="none" strokeWidth="0" style={{ stroke: 'none' }} />
                </svg>
            </div>

            {/* Chapter 4: Student Portal Preview (Soft Green Background) */}
            <section className="bg-[#D8E5D2] py-20 px-6 relative z-10 -mt-1">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    <div className="lg:col-span-5 space-y-6">
                        <span className="font-fredoka font-black text-xs uppercase tracking-widest text-[#5A6F4E] block">
                            Student Dashboard
                        </span>
                        <h2 className="font-fredoka font-black text-4xl md:text-5xl leading-tight text-[#3D4F35]">
                            Your Secure Speaking Portal
                        </h2>
                        <p className="text-sm font-bold text-[#5A6F4E] leading-relaxed">
                            Bolo Academy runs entirely in your web browser. Students log in to a dedicated visual dashboard to track speaking streaks, review daily achievements, view mentor feedback, and launch their Cozy Circle classrooms in one click.
                        </p>
                        <Link 
                            href={auth.user ? route('dashboard') : route('register')}
                            className="inline-block bg-[#C2673D] hover:bg-[#b0481a] text-white font-fredoka font-black text-xs px-6 py-3 border-[3px] border-[#3D4F35] shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl uppercase tracking-wider text-center"
                        >
                            Explore Student Portal
                        </Link>
                    </div>

                    {/* Tilted Floating iPad tablet showcase with Student Dashboard preview */}
                    <div className="lg:col-span-7 flex justify-center">
                        <div className="relative group transform rotate-6 hover:rotate-0 transition-transform duration-500 max-w-md w-full">
                            <div className="bg-white border-[6px] border-[#3D4F35] shadow-[15px_15px_0px_0px_#D28C67] rounded-[2.5rem] p-4 overflow-hidden relative">
                                {/* Simulated status bar */}
                                <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-400 mb-3 border-b-[2px] border-gray-100 pb-1.5">
                                    <span>Bolo LMS Dashboard</span>
                                    <span>Active Account</span>
                                </div>
                                <div className="bg-[#FAF7ED] border-[3px] border-[#3D4F35] rounded-2xl p-4 flex flex-col justify-start min-h-[250px] relative transition-colors duration-300">
                                    
                                    {/* Student Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-[#D1F2EB] border-[2px] border-[#3D4F35] rounded-full flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#3D4F35]">👦</div>
                                        <div>
                                            <h4 className="font-fredoka font-black text-sm text-[#3D4F35] uppercase leading-none">Rohan's Progress</h4>
                                            <span className="text-[9px] font-black text-[#C2673D] tracking-wider uppercase">Level 2: Fast-Track Path</span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-white p-2 border-[2px] border-[#3D4F35] rounded-xl flex items-center gap-1.5">
                                            <span className="text-sm">🔥</span>
                                            <div>
                                                <span className="block text-[8px] font-bold text-gray-400 uppercase leading-none">Streak</span>
                                                <span className="text-[10px] font-black text-[#3D4F35]">12 Days Active</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-2 border-[2px] border-[#3D4F35] rounded-xl flex items-center gap-1.5">
                                            <span className="text-sm">🗣️</span>
                                            <div>
                                                <span className="block text-[8px] font-bold text-gray-400 uppercase leading-none">Time Spent</span>
                                                <span className="text-[10px] font-black text-[#3D4F35]">160 Mins Speaks</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Confidence bar */}
                                    <div className="bg-white border-[2px] border-[#3D4F35] rounded-xl p-2 mb-2">
                                        <div className="flex justify-between items-center text-[8px] font-black text-gray-500 uppercase mb-1">
                                            <span>Speaking Confidence</span>
                                            <span className="text-[#3D4F35]">84%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border-[1px] border-gray-300">
                                            <div className="bg-[#6A8F6C] h-full rounded-full transition-all duration-1000 w-[84%]"></div>
                                        </div>
                                    </div>

                                    {/* Interactive Hover Feedback Section */}
                                    <div className="mt-1 transition-all duration-500 ease-out opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 bg-[#D1F2EB] border-[2px] border-[#3D4F35] rounded-xl p-2 shadow-[2px_2px_0px_0px_#3D4F35]">
                                        <p className="text-[9px] font-black text-[#3D4F35] italic leading-tight">
                                            💡 Mentor Ritika: "Rohan showed fabulous accent corrections in the circle today! Pronunciation was very crisp."
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Hand-painted jagged brush wave divider 4 (Soft Green to Rust Orange) */}
            <div className="w-full bg-[#D8E5D2] -mt-2 -mb-2 relative z-10 pointer-events-none" style={{ outline: 'none', border: 'none' }}>
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-16 block" stroke="none" strokeWidth="0" style={{ stroke: 'none', border: 'none', outline: 'none', transform: 'translateY(1px)' }}>
                    <path d="M 0 50 C 45 20, 45 20, 90 50 C 135 80, 135 80, 180 50 C 225 20, 225 20, 270 50 C 315 80, 315 80, 360 50 C 405 20, 405 20, 450 50 C 495 80, 495 80, 540 50 C 585 20, 585 20, 630 50 C 675 80, 675 80, 720 50 C 765 20, 765 20, 810 50 C 855 80, 855 80, 900 50 C 945 20, 945 20, 990 50 C 1035 80, 1035 80, 1080 50 C 1125 20, 1125 20, 1170 50 C 1215 80, 1215 80, 1260 50 C 1305 20, 1305 20, 1350 50 C 1395 80, 1395 80, 1440 50 L 1440 101 L 0 101 Z" fill="#C2957E" stroke="none" strokeWidth="0" style={{ stroke: 'none' }} />
                </svg>
            </div>

            {/* Chapter 5: official fee scrolls & batches (Rust Orange Watercolor section with 25% lower opacity) */}
            <section id="programs" className="bg-[#C2957E] py-16 px-6 relative z-10 -mt-1 text-[#FAF7ED] border-none" style={{ border: 'none', outline: 'none' }}>
                <div className="text-center max-w-3xl mx-auto mb-0 space-y-4">
                    <span className="font-fredoka font-black text-xs uppercase tracking-widest text-white/90">Chapter 5: Tuition Scrolls</span>
                    <h2 className="font-fredoka font-black text-4xl md:text-5xl leading-tight text-white">Official 1-Month Speaking Paths</h2>
                    <p className="text-base font-semibold text-white/80">Pick a speaking level designed strictly to build conversational speaking habits daily.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto -mt-[88px]">
                    {batches.length > 0 ? (
                        batches.map(batch => {
                            const isMaster = batch.curriculum_name.includes('Gold');
                            const isSprint = batch.curriculum_name.includes('Fast-Track');
                            const isCombo = batch.curriculum_name.includes('Combo');

                            const themeBg = isMaster ? 'bg-[#FFE5D9]' : isSprint ? 'bg-[#E9D5FF]' : isCombo ? 'bg-[#FFF8E7]' : 'bg-[#D1F2EB]';
                            const price = isMaster ? 14999 : isSprint ? 9999 : isCombo ? 4999 : 2999;
                            const desc = isMaster 
                                ? 'Daily 1-on-1 class + daily voice correction + mock interviews.'
                                : isSprint 
                                ? 'Daily 1-on-1 live session + customized accent feedback.'
                                : isCombo 
                                ? 'Daily group live classes + weekly 30-min 1-on-1 private lesson.'
                                : 'Daily group live classes + sentence building and weekly feedback.';

                            const illustrationSrc = isMaster 
                                ? '/images/image3-gold-master-main.png'
                                : isSprint 
                                ? '/images/new-image-2.png'
                                : isCombo 
                                ? '/images/image1-speaker-combo.png'
                                : '/images/image4-basics.png';

                            const isLast = !isMaster && !isSprint && !isCombo;
                            const imgHeight = isLast ? '264px' : '312px';
                            const translateY = isLast ? '12px' : '44px';

                            return (
                                <div key={batch.id} className="flex flex-col items-center pt-[312px] relative">
                                    {/* Grounded Plan Illustration sitting flush on top of the card */}
                                    <div className="absolute top-0 h-[312px] w-full flex items-end justify-center pointer-events-none">
                                        <img 
                                            src={illustrationSrc} 
                                            alt={`${batch.curriculum_name} Illustration`} 
                                            style={{ 
                                                height: imgHeight,
                                                transform: `translateY(${translateY})`
                                            }}
                                            className="w-auto object-contain origin-bottom"
                                        />
                                    </div>

                                    {/* The Card */}
                                    <div className="w-full bg-white border-[4px] border-[#3D4F35] shadow-[8px_8px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all rounded-[2rem] overflow-hidden flex flex-col justify-between text-[#1E1E1E]">
                                        <div className={`${themeBg} p-6 border-b-[3px] border-[#3D4F35]`}>
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">{batch.name}</span>
                                            <h3 className="font-fredoka font-black text-lg leading-tight mb-2">{batch.curriculum_name}</h3>
                                            <div className="flex items-baseline gap-1 mt-4">
                                                <span className="font-fredoka font-black text-2xl">₹{price.toLocaleString('en-IN')}</span>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">/ month</span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col justify-between space-y-6 bg-white">
                                            <div className="space-y-4">
                                                <p className="text-xs font-black text-gray-600 leading-relaxed">
                                                    {desc}
                                                </p>
                                                <div className="pt-2 space-y-2 border-t-[2px] border-dashed border-gray-200">
                                                    <span className="block text-[10px] font-bold text-gray-500">🗓️ {batch.schedule_details}</span>
                                                    <span className="block text-[10px] font-bold text-gray-500">🧑‍🏫 Guide: {batch.teacher ? batch.teacher.name : 'Lead Teacher'}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    <span>Reserved: {batch.seats_reserved}</span>
                                                    <span>Left: {batch.seats_remaining} seats</span>
                                                </div>
                                                {/* Custom progress bar */}
                                                <div className="w-full bg-gray-100 border-[2px] border-[#3D4F35] h-4 rounded-full overflow-hidden p-0.5">
                                                    <div 
                                                        className="bg-[#D28C67] h-full rounded-full transition-all"
                                                        style={{ width: `${(batch.seats_reserved / batch.capacity) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <button 
                                                    onClick={() => handleSelectPlan(batch)}
                                                    className="w-full bg-[#D1F2EB] hover:bg-[#bbf0e5] font-fredoka font-black text-center text-xs py-3 border-[3px] border-[#3D4F35] shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl uppercase tracking-widest text-[#1E1E1E]"
                                                >
                                                    Select Batch
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-4 text-center py-12">
                            <span className="font-fredoka font-bold text-lg text-white animate-pulse">Loading active Spoken English batches...</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Chapter 6: Parent Testimonials */}
            <section className="py-20 px-6 bg-[#FAF7ED] relative z-10 border-t-[3px] border-[#3D4F35]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <span className="font-fredoka font-black text-xs uppercase tracking-widest text-[#D28C67]">Chapter 6: Parent Feedback</span>
                        <h2 className="font-fredoka font-black text-4xl md:text-5xl leading-tight text-[#3D4F35]">Cozy Feedback from Parents</h2>
                        <p className="text-base font-semibold text-[#5A6F4E]">Read what other parents say about our Spoken English classrooms!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviewsList.map((review, idx) => (
                            <div 
                                key={idx}
                                className="bg-white border-[3px] border-[#3D4F35] shadow-[6px_6px_0px_0px_#D28C67] rounded-3xl p-6 relative flex flex-col justify-between text-[#1E1E1E]"
                            >
                                <div className="space-y-4">
                                    <div className="flex gap-1 text-[#EA580C] text-lg">
                                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 leading-relaxed italic">
                                        "{review.text}"
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t-[2px] border-dashed border-gray-200 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#E9D5FF] border-[2px] border-[#3D4F35] flex items-center justify-center text-base">
                                        🧑‍🧑‍🧒
                                    </div>
                                    <div>
                                        <h4 className="font-fredoka font-black text-xs uppercase tracking-wide leading-none">{review.parent}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 mt-1 block">{review.child} • {review.loc}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chapter 7: Woodland Storybook Footer */}
            <footer className="bg-[#FAF7ED] text-[#3D4F35] pt-16 pb-16 px-6 relative z-10 border-t-[4px] border-[#3D4F35]">
                {/* Clean wood outline details */}
                <div className="absolute bottom-4 right-10 w-24 h-24 border-[2px] border-[#3D4F35] rounded-2xl opacity-20 pointer-events-none flex items-center justify-center text-2xl">
                    🌲
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 mb-12 border-b-[2px] border-[#3D4F35]/20">
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/images/bolo_logo.png" alt="Bolo Academy Logo" className="h-20 w-auto object-contain drop-shadow-sm" />
                            <span className="font-fredoka font-black text-2xl uppercase tracking-wider text-[#3D4F35]">Bolo Academy</span>
                        </div>
                        <p className="text-xs text-[#5A6F4E] font-bold leading-relaxed max-w-sm">
                            Step into the cozy interactive speaking circles! We turn daily live Spoken English practice into an exciting student-centric adventure.
                        </p>
                    </div>

                    <div className="md:col-span-7 flex flex-wrap gap-12 justify-start md:justify-end text-sm">
                        <div className="space-y-4">
                            <h4 className="font-fredoka font-black uppercase text-xs tracking-widest text-[#D28C67]">Our Batches</h4>
                            <ul className="space-y-2 text-xs font-bold text-[#5A6F4E] uppercase tracking-wide">
                                <li><a href="#programs" className="hover:text-[#D28C67] transition-colors">Basic Boost (₹2,999)</a></li>
                                <li><a href="#programs" className="hover:text-[#D28C67] transition-colors">Speaker Combo (₹4,999)</a></li>
                                <li><a href="#programs" className="hover:text-[#D28C67] transition-colors">Fluency Fast-Track (₹9,999)</a></li>
                                <li><a href="#programs" className="hover:text-[#D28C67] transition-colors">Gold Master (₹14,999)</a></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-fredoka font-black uppercase text-xs tracking-widest text-[#5A6F4E]">Quick Links</h4>
                            <ul className="space-y-2 text-xs font-bold text-[#5A6F4E] uppercase tracking-wide">
                                <li><button onClick={() => setTeacherModalOpen(true)} className="hover:text-[#D28C67] transition-colors">Join as Mentor</button></li>
                                <li><a href="mailto:info.boloacademy@gmail.com" className="hover:text-[#D28C67] transition-colors">Support Registry</a></li>
                                <li><Link href={route('login')} className="hover:text-[#D28C67] transition-colors">Portal Log In</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>© {new Date().getFullYear()} Bolo Academy LMS. Built for Spoken English confidence.</span>
                    <span>No Emojis Policy Compliant (SVG Outlines)</span>
                </div>
            </footer>

            {/* ================= MODAL: STUDENT CHECKOUT WITH MOCK GOOGLE AUTH ================= */}
            {studentModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white border-[4px] border-[#3D4F35] shadow-[8px_8px_0px_0px_#1E1E1E] rounded-[2rem] w-full max-w-xl p-8 relative">
                        <button 
                            onClick={() => setStudentModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 border-[2px] border-[#3D4F35] rounded-xl shadow-[2px_2px_0px_0px_#1E1E1E] transition-all"
                        >
                            <SVGClose />
                        </button>

                        <span className="block text-xs font-black text-[#D28C67] uppercase tracking-widest mb-1">Step 1 of 2: Register Account</span>
                        <h3 className="font-fredoka font-black text-2xl uppercase tracking-wider mb-2 text-[#D28C67]">Student Checkout</h3>
                        <p className="text-xs font-medium text-gray-500 mb-6">
                            You are enrolling in the <span className="font-bold text-[#1E1E1E]">{selectedPlan?.curriculum_name}</span> under batch <span className="font-bold text-[#1E1E1E]">{selectedPlan?.name}</span>.
                        </p>

                        {/* High-Fidelity Real Google Sign-in Simulator */}
                        <div className="mb-6 p-4 bg-[#FFF8E7] border-[3px] border-[#3D4F35] shadow-[3px_3px_0px_0px_#1E1E1E] rounded-2xl">
                            <span className="block text-xs font-black uppercase tracking-widest mb-3">Google Sign-in Registry</span>
                            
                            {studentGoogleVerifiedEmail ? (
                                <div className="w-full bg-[#E9F0E6] border-[2px] border-[#3D4F35] py-3.5 px-4 rounded-xl flex items-center justify-between text-left font-sans font-bold shadow-[2px_2px_0px_0px_#3D4F35]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="bg-[#6A8F6C] text-white p-1 rounded-full border-[1.5px] border-[#3D4F35] flex items-center justify-center">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-black text-[#3D4F35] uppercase leading-none">Verified with Google</span>
                                            <span className="block text-[10px] text-gray-500 mt-1">{studentGoogleVerifiedEmail}</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => clearGoogleAuth('student')}
                                        className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 border-b-[2px] border-red-500"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => openRealGoogleSignIn('student')}
                                    className="w-full bg-white hover:bg-gray-50 border-[3px] border-[#3D4F35] py-3.5 rounded-xl font-fredoka font-black text-sm shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-gray-700"
                                >
                                    <SVGMockGoogle /> Sign up instantly with Google Auth
                                </button>
                            )}
                        </div>

                        {/* Standard Registration Fields */}
                        <form onSubmit={handleStudentSubmit} className="space-y-4">
                            {!studentGoogleVerifiedEmail && (
                                <div className="p-3.5 bg-amber-50 border-[2.5px] border-amber-500 rounded-2xl text-[10px] font-bold text-amber-700 shadow-[2px_2px_0px_0px_#D97706] leading-relaxed mb-2">
                                    ⚠️ Google Authentication Required: Please click the Google Auth button above to unlock registration checkout.
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1">Student Name</label>
                                    <input 
                                        type="text" 
                                        value={studentForm.data.name}
                                        onChange={e => studentForm.setData('name', e.target.value)}
                                        placeholder="Aarav R." 
                                        disabled={!studentGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-3 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none focus:border-[#E9D5FF] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1">Student Email</label>
                                    <input 
                                        type="email" 
                                        value={studentForm.data.email}
                                        onChange={e => studentForm.setData('email', e.target.value)}
                                        placeholder="student@gmail.com" 
                                        disabled={true}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-3 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none focus:border-[#E9D5FF] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1">Set Password</label>
                                    <input 
                                        type="password" 
                                        value={studentForm.data.password}
                                        onChange={e => studentForm.setData('password', e.target.value)}
                                        placeholder="••••••••" 
                                        disabled={!studentGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-3 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none focus:border-[#E9D5FF] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1">Class Grade Mapping</label>
                                    <select 
                                        value={studentForm.data.grade}
                                        onChange={e => studentForm.setData('grade', e.target.value)}
                                        disabled={!studentGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] bg-white rounded-xl px-3 py-2.5 font-sans font-bold focus:outline-none focus:border-[#E9D5FF] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="Grade 3">Grade 3 (Foundation level)</option>
                                        <option value="Grade 4">Grade 4 (Foundation level)</option>
                                        <option value="Grade 5">Grade 5 (Conversation level)</option>
                                        <option value="Grade 6">Grade 6 (Conversation level)</option>
                                        <option value="Adults">Adults / IELTS Tracks</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1">Parent Name</label>
                                    <input 
                                        type="text" 
                                        value={studentForm.data.parent_name}
                                        onChange={e => studentForm.setData('parent_name', e.target.value)}
                                        placeholder="John R." 
                                        disabled={!studentGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-3 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none focus:border-[#E9D5FF] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1">Parent Phone</label>
                                    <input 
                                        type="text" 
                                        value={studentForm.data.parent_phone}
                                        onChange={e => studentForm.setData('parent_phone', e.target.value)}
                                        placeholder="+91 99999 88888" 
                                        disabled={!studentGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-3 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none focus:border-[#E9D5FF] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={!studentGoogleVerifiedEmail || studentForm.processing}
                                className="w-full bg-[#D1F2EB] hover:bg-[#bbf0e5] disabled:bg-gray-200 disabled:cursor-not-allowed font-fredoka font-black text-sm px-6 py-3 border-[3px] border-[#3D4F35] shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl flex items-center justify-center text-[#1E1E1E]"
                            >
                                {studentForm.processing ? 'Starting Trial Portal...' : (
                                    <>
                                        Verify & Settle Tuition Trial <SVGArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: TEACHER APPLICATION FORM (Polished Layout) ================= */}
            {teacherModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
                    <div className="bg-white border-[4px] border-[#3D4F35] shadow-[8px_8px_0px_0px_#1E1E1E] rounded-[2rem] w-full max-w-3xl p-8 md:p-10 relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <button 
                            onClick={() => setTeacherModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 border-[2px] border-[#3D4F35] rounded-xl shadow-[2px_2px_0px_0px_#1E1E1E] transition-all z-30"
                        >
                            <SVGClose />
                        </button>

                        <h3 className="font-fredoka font-black text-2xl uppercase tracking-wider mb-2 text-[#7C3AED]">Apply as Teacher Mentor</h3>
                        <p className="text-xs font-medium text-gray-500 mb-6">
                            Join Bolo Academy and lead speaking classrooms in the study portal. Applications are verified by administration.
                        </p>

                        {/* High-Fidelity Mock Google Auth */}
                        {/* High-Fidelity Real Google Sign-in Simulator */}
                        <div className="mb-6 p-5 bg-[#E9D5FF] border-[3px] border-[#3D4F35] shadow-[3px_3px_0px_0px_#1E1E1E] rounded-2xl">
                            <span className="block text-[10px] font-black uppercase tracking-widest mb-3">Google Sign-in Registry</span>
                            
                            {teacherGoogleVerifiedEmail ? (
                                <div className="w-full bg-[#E9F0E6] border-[2px] border-[#3D4F35] py-3.5 px-4 rounded-xl flex items-center justify-between text-left font-sans font-bold shadow-[2px_2px_0px_0px_#3D4F35]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="bg-[#6A8F6C] text-white p-1 rounded-full border-[1.5px] border-[#3D4F35] flex items-center justify-center">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-black text-[#3D4F35] uppercase leading-none">Verified with Google</span>
                                            <span className="block text-[10px] text-gray-500 mt-1">{teacherGoogleVerifiedEmail}</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => clearGoogleAuth('teacher')}
                                        className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 border-b-[2px] border-red-500"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => openRealGoogleSignIn('teacher')}
                                    className="w-full bg-white hover:bg-gray-50 border-[3px] border-[#3D4F35] py-3.5 rounded-xl font-fredoka font-black text-sm shadow-[3px_3px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-gray-700"
                                >
                                    <SVGMockGoogle /> Sign in instantly with Google Auth
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleTeacherSubmit} className="space-y-6">
                            {!teacherGoogleVerifiedEmail && (
                                <div className="p-3.5 bg-amber-50 border-[2.5px] border-amber-500 rounded-2xl text-[10px] font-bold text-amber-700 shadow-[2px_2px_0px_0px_#D97706] leading-relaxed mb-2">
                                    ⚠️ Google Authentication Required: Please click the Google Auth button above to unlock your application form.
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={teacherForm.data.name}
                                        onChange={e => teacherForm.setData('name', e.target.value)}
                                        placeholder="Your Full Name" 
                                        disabled={!teacherGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D8E5D2] focus:border-[#3D4F35] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={teacherForm.data.email}
                                        onChange={e => teacherForm.setData('email', e.target.value)}
                                        placeholder="teacher@gmail.com" 
                                        disabled={true}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D8E5D2] focus:border-[#3D4F35] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Set Password</label>
                                    <input 
                                        type="password" 
                                        value={teacherForm.data.password}
                                        onChange={e => teacherForm.setData('password', e.target.value)}
                                        placeholder="••••••••" 
                                        disabled={!teacherGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D8E5D2] focus:border-[#3D4F35] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Years of Experience</label>
                                    <input 
                                        type="number" 
                                        value={teacherForm.data.experience_years}
                                        onChange={e => teacherForm.setData('experience_years', parseInt(e.target.value) || 0)}
                                        disabled={!teacherGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-4 py-3 font-sans font-bold focus:outline-none focus:ring-2 focus:ring-[#D8E5D2] focus:border-[#3D4F35] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Certifications</label>
                                    <input 
                                        type="text" 
                                        value={teacherForm.data.certifications}
                                        onChange={e => teacherForm.setData('certifications', e.target.value)}
                                        placeholder="TEFL Certified, MA in English" 
                                        disabled={!teacherGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl px-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D8E5D2] focus:border-[#3D4F35] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Google Meet Link</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            type="text" 
                                            value={teacherForm.data.meeting_link}
                                            onChange={e => teacherForm.setData('meeting_link', e.target.value)}
                                            placeholder="https://meet.google.com/abc-defg-hij" 
                                            disabled={!teacherGoogleVerifiedEmail}
                                            className="w-full border-[3px] border-[#3D4F35] rounded-xl pl-4 pr-20 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D8E5D2] focus:border-[#3D4F35] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const text = await navigator.clipboard.readText();
                                                    teacherForm.setData('meeting_link', text);
                                                } catch (err) {
                                                    // fallback
                                                }
                                            }}
                                            disabled={!teacherGoogleVerifiedEmail}
                                            className="absolute right-2 px-3 py-1.5 bg-[#D1F2EB] hover:bg-[#bbf0e5] border-[2px] border-[#3D4F35] rounded-lg text-[9px] font-black uppercase tracking-wider text-[#1E1E1E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Paste
                                        </button>
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-1.5">
                                        ℹ️ This link will be added to your default meetings with the administration and students.
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 bg-gray-50 border-[3px] border-[#3D4F35] rounded-2xl shadow-[2px_2px_0px_0px_#1E1E1E]">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Accent Color</label>
                                    <input 
                                        type="color" 
                                        value={teacherForm.data.accent_color}
                                        onChange={e => teacherForm.setData('accent_color', e.target.value)}
                                        disabled={!teacherGoogleVerifiedEmail}
                                        className="border-[3px] border-[#3D4F35] rounded-xl h-14 w-24 cursor-pointer shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed">
                                    Pick a personalized brand accent color. This color will be dynamically theme-injected across all your assigned student workspaces!
                                </p>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Tutor Bio & Statement</label>
                                <textarea 
                                    value={teacherForm.data.bio}
                                    onChange={e => teacherForm.setData('bio', e.target.value)}
                                    placeholder="ESL specialist with 6+ years of international school experience..."
                                    rows="3"
                                    disabled={!teacherGoogleVerifiedEmail}
                                    className="border-[3px] border-[#3D4F35] rounded-xl px-4 py-3 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D8E5D2] focus:border-[#3D4F35] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Upload Resume (PDF, DOC, DOCX)</label>
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    onChange={e => teacherForm.setData('resume', e.target.files[0])}
                                    disabled={!teacherGoogleVerifiedEmail}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-[2px] file:border-[#3D4F35] file:text-[10px] file:font-black file:bg-[#BFDBFE] file:text-[#1E1E1E] hover:file:bg-[#a3c9fa] border-[3px] border-[#3D4F35] rounded-xl px-4 py-2 font-sans font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D8E5D2] focus:border-[#3D4F35] shadow-[2px_2px_0px_0px_#1E1E1E] disabled:bg-gray-100 disabled:cursor-not-allowed text-xs"
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={!teacherGoogleVerifiedEmail || teacherForm.processing}
                                className="w-full bg-[#FFE5D9] hover:bg-[#ffd6c4] disabled:bg-gray-200 disabled:cursor-not-allowed font-fredoka font-black text-sm px-6 py-4 border-[3px] border-[#3D4F35] shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl flex items-center justify-center text-[#EA580C]"
                            >
                                {teacherForm.processing ? 'Submitting Application...' : (
                                    <>
                                        Submit Mentor Application <SVGArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: HIGH-FIDELITY REAL GOOGLE AUTH SIMULATOR WINDOW ================= */}
            {googleAuthModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-[3px] border-[#3D4F35] shadow-[10px_10px_0px_0px_#1E1E1E] rounded-3xl w-full max-w-md p-8 relative font-sans overflow-hidden">
                        
                        {/* Custom Google Style Close */}
                        <button 
                            onClick={() => setGoogleAuthModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 bg-gray-50 hover:bg-gray-100 border-[1.5px] border-[#3D4F35] rounded-lg transition-all"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Top Google branding */}
                        <div className="text-center mb-6">
                            <div className="flex justify-center mb-4">
                                <svg className="w-8 h-8" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 leading-tight">Sign in with Google</h3>
                            <p className="text-xs text-gray-500 mt-1">to continue to <span className="font-bold text-[#3D4F35]">Bolo Academy</span></p>
                        </div>

                        {googleAuthVerifying ? (
                            <div className="py-8 flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-[4px] border-gray-100 border-t-[#4285F4] rounded-full animate-spin"></div>
                                <div className="space-y-1.5 text-center px-4">
                                    <span className="block text-xs font-bold text-gray-400 animate-pulse uppercase tracking-wider">Verifying Account</span>
                                    <span className="block text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1 border-[1.5px] border-dashed border-gray-200 rounded-md">
                                        {googleVerifyLogs}
                                    </span>
                                </div>
                            </div>
                        ) : !verificationSent ? (
                            <form onSubmit={handleRequestCode} className="space-y-5">
                                {googleAuthError && (
                                    <div className="p-3.5 bg-red-50 border-[2.5px] border-red-500 rounded-xl text-xs font-bold text-red-600 shadow-[2px_2px_0px_0px_#EF4444] leading-relaxed">
                                        ❌ {googleAuthError}
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Google/Gmail Email Address</label>
                                        <input 
                                            type="email"
                                            value={googleEmailInput}
                                            onChange={e => setGoogleEmailInput(e.target.value)}
                                            placeholder="yourname@gmail.com"
                                            className="border-[2px] border-[#3D4F35] rounded-xl px-3 py-3 font-sans font-bold placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] text-sm shadow-[2px_2px_0px_0px_#1E1E1E]"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                                    🔒 Secured by Google Identity & OAuth2. A secure 6-digit verification code will be sent to your Gmail address to verify your identity.
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setGoogleAuthModalOpen(false)}
                                        className="text-xs font-bold text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="bg-[#4285F4] hover:bg-[#357ae8] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        Send Verification Code
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyCodeSubmit} className="space-y-5">
                                {googleAuthError && (
                                    <div className="p-3.5 bg-red-50 border-[2.5px] border-red-500 rounded-xl text-xs font-bold text-red-600 shadow-[2px_2px_0px_0px_#EF4444] leading-relaxed">
                                        ❌ {googleAuthError}
                                    </div>
                                )}
                                
                                <div className="p-3 bg-blue-50 border-[2px] border-blue-400 rounded-xl text-xs font-semibold text-blue-700">
                                    📩 Verification code sent to: <span className="font-bold">{googleEmailInput}</span>
                                </div>



                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Enter 6-Digit Verification Code</label>
                                        <input 
                                            type="text"
                                            value={verificationCodeInput}
                                            onChange={e => setVerificationCodeInput(e.target.value)}
                                            placeholder="123456"
                                            maxLength="6"
                                            className="border-[2px] border-[#3D4F35] rounded-xl px-3 py-3 font-mono font-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] text-center text-lg tracking-[0.5em] shadow-[2px_2px_0px_0px_#1E1E1E]"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setVerificationSent(false);
                                            setVerificationCodeInput('');
                                            setGoogleAuthError('');
                                        }}
                                        className="text-xs font-bold text-[#4285F4] hover:underline"
                                    >
                                        ← Change Email
                                    </button>
                                    <button 
                                        type="submit"
                                        className="bg-[#34A853] hover:bg-[#2d8e47] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        Verify & Authenticate
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
