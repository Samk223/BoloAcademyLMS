"use client";

import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from 'axios';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, BookOpen, Calendar, Star, Send, Sparkles, Heart,
  ChevronLeft, ChevronRight, ChevronDown, Video, 
  Plus, MessageSquare, LifeBuoy, BarChart,
  X, Filter, Upload, Check, XCircle, FileText, Award, Eye,
  Book, CheckSquare, ThumbsUp, AlertCircle, Download,
  User, Bell, Sliders, Camera, Globe, Forward, Paperclip, Mail,
  LogOut, Settings, Clock, Search, CheckCircle2, RefreshCcw, Play,
  Cloud, HelpCircle
} from "lucide-react";
import StudentChatHub from "@/Components/Student/StudentChatHub";

// Reusable brutalist classes
const brutalBorder = "border-[3px] border-[#1E1E1E]";
const brutalShadow = "shadow-[4px_4px_0px_0px_#1E1E1E]";
const brutalShadowSm = "shadow-[3px_3px_0px_0px_#1E1E1E]";
const brutalHover = "hover:translate-y-[3px] hover:translate-x-[3px] hover:shadow-none transition-all duration-200";

const getAvatarUrl = (p) => {
  if (p?.avatar && (p.avatar.startsWith('/') || p.avatar.startsWith('http') || p.avatar.startsWith('data:'))) {
    return p.avatar;
  }
  const seed = p?.name || "Student";
  
  // Clean tailwind class bg-[#xxxxxx] or hex codes to get a pure hex color
  let shapeColor = "E9D5FF";
  if (p?.color) {
    const hexMatch = p.color.match(/#([A-Fa-f0-9]{6})/);
    if (hexMatch) {
      shapeColor = hexMatch[1];
    } else {
      shapeColor = p.color.replace('#', '').replace('bg-[', '').replace(']', '');
    }
  }
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffffff&shapeColor=${shapeColor}`;
};

// Reusable Handcrafted SVG Icons for notifications (no emojis allowed)
const SVGBackpack = () => (
  <svg className="w-5 h-5 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H15M9 3.75a3 3 0 00-3 3v13.5a3 3 0 003 3h6a3 3 0 003-3V6.75a3 3 0 00-3-3M9 3.75V6.75m6-3V6.75M6.75 6.75h10.5m-10.5 3h10.5M6.75 14.25h10.5" />
  </svg>
);

const SVGClockSmall = () => (
  <svg className="w-5 h-5 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SVGWarningSmall = () => (
  <svg className="w-5 h-5 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.3c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const SVGShieldSmall = () => (
  <svg className="w-5 h-5 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const SVGBellSmall = () => (
  <svg className="w-5 h-5 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export default function StudentDashboard({ auth, initialData }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('student_active_view') || "dashboard";
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialData?.notifications || []);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState(initialData || {
    student: null,
    pending_assignments: [],
    quiz_scores: [],
    daily_progress: 0,
    live_class: null,
    live_join_url: null,
    badges: []
  });
  const [loading, setLoading] = useState(!initialData);

  const dailyQuotes = [
    "Believe in yourself and all that you are! ✨",
    "Every day is a new chance to learn something amazing! 📚",
    "You are capable of doing great things! 🚀",
    "Mistakes are just proof that you are trying! 💪",
    "Your imagination is your only limit. Dream big! 🌈",
    "Be a rainbow in someone else's cloud today. ☁️",
    "The more you learn, the more places you'll go! 🌍"
  ];

  const getDailyQuote = () => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return dailyQuotes[dayOfYear % dailyQuotes.length];
  };

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('student_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    fetchDashboardData();

    // Fast, lightweight 4-second polling for active live classes!
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get('/api/student/live-status');
        const { live_class, live_join_url } = response.data;

        setData(prev => {
          // If a new live class has started
          if (live_class && !prev.live_class) {
            // Play a notification sound
            try {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
              audio.volume = 0.4;
              audio.play().catch(() => {});
            } catch (e) {}

            showToast("🎬 Your teacher has started a live class! Click the button to join!", "success");
            
            // Add a temporary dashboard notification
            setNotifications(n => [
              {
                id: Date.now(),
                text: `Live class started: "${live_class.title}"`,
                time: "Just now",
                unread: true
              },
              ...n
            ]);
          }

          return {
            ...prev,
            live_class,
            live_join_url
          };
        });
      } catch (err) {
        console.error("Failed to poll live class status:", err);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/student/dashboard-data');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const SidebarItem = ({ icon: Icon, label, id, color }) => (
    <button
      onClick={() => setActiveView(id)}
      className={`w-full flex flex-col items-center justify-center py-4 rounded-3xl ${brutalBorder} ${
        activeView === id 
          ? 'bg-white shadow-[3px_3px_0px_0px_#1E1E1E]' 
          : 'bg-transparent hover:bg-white/60'
      } transition-all duration-200 group relative`}
    >
      <div className={`mb-1 text-[#1E1E1E] group-hover:scale-110 transition-transform shrink-0 ${activeView === id ? 'scale-110' : ''}`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      {!isCollapsed && <span className="font-black text-[15px] leading-tight">{label}</span>}
      {isCollapsed && (
        <div className={`absolute left-[85px] bg-white ${brutalBorder} px-4 py-2 rounded-xl font-black text-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-[9999] shadow-[6px_6px_0px_0px_#1E1E1E] scale-90 group-hover:scale-100 translate-x-[-10px] group-hover:translate-x-0`}>
          {label}
          <div className="absolute top-1/2 -left-[10px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-[#1E1E1E]"></div>
        </div>
      )}
    </button>
  );

  return (
    <div className="h-screen bg-[#FFF8E7] flex font-sans overflow-hidden text-[#1E1E1E] selection:bg-purple-200">
      <Head title="Student Dashboard" />

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 100 : 260 }}
        className={`bg-[#FFD1DC] border-r-[4px] border-[#1E1E1E] transition-all duration-300 z-50 flex flex-col py-8 relative flex-shrink-0`}
      >
        {/* Wavy border effect */}
        <div className="absolute top-0 -right-[20px] w-[20px] h-full pointer-events-none z-10">
           <svg width="20" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
             <defs>
               <pattern id="wave-student" x="0" y="0" width="20" height="60" patternUnits="userSpaceOnUse">
                 <path d="M0,0 C20,15 20,45 0,60" fill="#FFD1DC" stroke="#1E1E1E" strokeWidth="4" />
               </pattern>
             </defs>
             <rect x="0" y="0" width="20" height="100%" fill="url(#wave-student)" />
           </svg>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-8 -right-4 w-8 h-8 bg-white rounded-full ${brutalBorder} flex items-center justify-center z-50 hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_0px_#1E1E1E]`}
        >
          {isCollapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
        </button>

        <div className={`flex-1 flex flex-col items-center w-full pb-10 scrollbar-hide ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          <div className="text-center mb-10 px-4 flex-shrink-0 flex flex-col items-center">
            <img
              src="/images/bolo_logo.png"
              alt="Bolo Academy"
              className={`object-contain transition-all duration-300 drop-shadow-sm ${isCollapsed ? 'w-16 h-16' : 'w-32 h-32'}`}
            />
            {!isCollapsed && (
              <>
                <h1 className="font-black text-2xl leading-tight uppercase">Bolo<br/>Academy</h1>
                <p className="font-bold text-[10px] mt-2 opacity-70 uppercase tracking-widest">{auth.user.name}</p>
              </>
            )}
          </div>

          <nav className="flex flex-col gap-5 w-full px-5 pb-20">
            <SidebarItem icon={Home} label="Dashboard" id="dashboard" color="bg-[#FFE5D9]" />
            <SidebarItem icon={BookOpen} label="My Course" id="course" color="bg-[#FFD1DC]" />
            <SidebarItem icon={Calendar} label="Schedule" id="schedule" color="bg-[#B4F8C8]" />
            <SidebarItem icon={Book} label="E-books" id="ebooks" color="bg-[#A0E7E5]" />
            <SidebarItem icon={FileText} label="Assignments" id="assignments" color="bg-[#D1F2EB]" />
            <SidebarItem icon={Award} label="My Badges" id="badges" color="bg-[#FBE7C6]" />
            <SidebarItem icon={MessageSquare} label="Chat Hub" id="chat" color="bg-[#E9D5FF]" />
            <SidebarItem icon={BarChart} label="My Progress" id="progress" color="bg-[#97DEFF]" />
            <SidebarItem icon={LifeBuoy} label="Support" id="support" color="bg-[#FFCCF9]" />
            <SidebarItem icon={Settings} label="Settings" id="settings" color="bg-white" />
            
            <div className="pt-4 border-t-[3px] border-[#1E1E1E]/10 mt-4">
              <Link 
                href={route('logout')} 
                method="post" 
                as="button"
                className={`w-full flex flex-col items-center justify-center py-4 rounded-3xl ${brutalBorder} bg-white hover:bg-red-50 transition-all duration-200 group relative shadow-[3px_3px_0px_0px_#1E1E1E]`}
              >
                <div className="mb-1 text-red-500 group-hover:scale-110 transition-transform shrink-0">
                  <LogOut size={28} strokeWidth={2.5} />
                </div>
                {!isCollapsed && <span className="font-black text-[15px] leading-tight text-red-600">Logout</span>}
              </Link>
            </div>
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden p-6 lg:p-10 relative">
        <Sparkles className="absolute top-12 right-[20%] text-yellow-400" size={40} strokeWidth={2} />
        <Send className="absolute top-40 right-12 text-purple-400 rotate-45" size={32} strokeWidth={2} />
        <Heart className="absolute top-1/3 left-[10%] text-pink-400 -rotate-12" size={28} strokeWidth={2.5} />
        <Star className="absolute bottom-20 right-[15%] text-blue-400 rotate-12" size={24} strokeWidth={2.5} />

        <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-y-auto scrollbar-hide pb-10">
          
          {/* Trial Active Countdown Banner */}
          {initialData?.trial_active && (
            <div className="mb-8 bg-[#FFE5D9] border-[3px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-[#FFC6B0] p-3 border-[2.5px] border-[#1E1E1E] rounded-2xl flex-shrink-0 animate-bounce shadow-[2px_2px_0px_0px_#1E1E1E]">
                  <svg className="w-6 h-6 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.3c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <p className="font-fredoka font-black text-lg uppercase tracking-wide">
                    ⚡ Free Trial Active: Complete your tuition fee payment in the next {initialData.days_remaining} days!
                  </p>
                  <p className="text-xs font-bold text-gray-500 uppercase mt-1">
                    Keep your speaking batched classrooms unlocked by settling your tuition early.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCheckoutOpen(true)}
                className="bg-white hover:bg-gray-50 font-fredoka font-black text-sm px-6 py-3 border-[3px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl whitespace-nowrap"
              >
                Pay Tuition (₹{initialData.program_fee?.toLocaleString('en-IN')})
              </button>
            </div>
          )}

          {/* Header */}
          <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-1 uppercase">
              {activeView === 'dashboard' ? 'Welcome Back!' : activeView.replace('_', ' ')}
            </h2>
            <p className="font-bold text-[#1E1E1E]/60">Student Portal • {data.student?.grade || 'Grade 4'}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {/* Mock Online Friends */}
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full border-[2px] border-[#1E1E1E] bg-white overflow-hidden ${brutalShadowSm}`}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="avatar" />
                </div>
              ))}
            </div>
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-12 h-12 bg-white rounded-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center justify-center relative`}
              >
                <Bell size={24} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1E1E1E]"></div>
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-4 w-80 bg-white ${brutalBorder} ${brutalShadow} rounded-2xl z-[100] p-4`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black uppercase text-sm">Notifications</h4>
                      <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-hide">
                      {notifications.length > 0 ? (
                        notifications.map((n, i) => {
                          const text = n.message || '';
                          const isWelcome = text.toLowerCase().includes('welcome');
                          const isWarning = text.toLowerCase().includes('warning') || text.toLowerCase().includes('suspend') || text.toLowerCase().includes('day 5');
                          const isOverdue = text.toLowerCase().includes('overdue') || text.toLowerCase().includes('final notice') || text.toLowerCase().includes('suspension') || text.toLowerCase().includes('paused');
                          const isClock = text.toLowerCase().includes('trial') || text.toLowerCase().includes('day 3') || text.toLowerCase().includes('payment');
                          
                          let iconBg = 'bg-blue-100';
                          let icon = <SVGBellSmall />;

                          if (isWelcome) {
                            iconBg = 'bg-[#D1F2EB]';
                            icon = <SVGBackpack />;
                          } else if (isOverdue) {
                            iconBg = 'bg-[#FFE5D9]';
                            icon = <SVGShieldSmall />;
                          } else if (isWarning) {
                            iconBg = 'bg-yellow-100';
                            icon = <SVGWarningSmall />;
                          } else if (isClock) {
                            iconBg = 'bg-purple-100';
                            icon = <SVGClockSmall />;
                          }

                          return (
                            <div key={i} className="p-3 bg-gray-50 rounded-xl border-2 border-[#1E1E1E] flex gap-3">
                              <div className={`shrink-0 w-8 h-8 ${iconBg} border-[1.5px] border-[#1E1E1E] rounded-lg flex items-center justify-center`}>
                                {icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black leading-tight text-[#1E1E1E]">{text}</p>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
                                  {new Date(n.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-6 text-center opacity-40">
                          <p className="font-black text-xs">No notifications yet!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className={`flex items-center gap-3 px-4 py-2 bg-white rounded-2xl ${brutalBorder} ${brutalShadowSm}`}>
              <div className="text-right">
                <p className="font-black text-sm leading-none">{auth.user.name}</p>
                <p className="text-[10px] font-bold text-[#1E1E1E]/50 uppercase tracking-widest mt-1">Student</p>
              </div>
              <div className={`w-10 h-10 rounded-full border-2 border-[#1E1E1E] overflow-hidden bg-[#E9D5FF]`}>
                <img src={getAvatarUrl(data.student)} alt="profile" />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>

      {/* Toasts */}
      <div className="fixed bottom-8 right-8 z-[9999999] flex flex-col gap-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`px-6 py-4 rounded-2xl ${brutalBorder} ${brutalShadow} font-black flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-[#D1F2EB]' : 'bg-[#FFE5D9]'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ================= INLINE CHECKOUT MODAL ================= */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-[4px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E] rounded-3xl w-full max-w-lg p-8 relative">
            <button 
              onClick={() => setCheckoutOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 border-[2px] border-[#1E1E1E] rounded-xl shadow-[2px_2px_0px_0px_#1E1E1E] transition-all"
            >
              <svg className="w-6 h-6 stroke-[#1E1E1E]" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {paymentSuccess ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-[#D1F2EB] border-[4px] border-[#1E1E1E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#1E1E1E] animate-bounce">
                  <svg className="w-8 h-8 stroke-[#1E1E1E]" fill="none" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-fredoka font-black text-2xl uppercase tracking-wider mb-2">Payment Completed!</h3>
                <p className="text-sm font-bold text-gray-500 uppercase">Your active student portal is fully unlocked!</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsProcessing(true);
                try {
                  const res = await axios.post('/student/payment/settle');
                  if (res.data.status === 'success') {
                    setPaymentSuccess(true);
                    showToast("Payment received successfully! 🌟");
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  } else {
                    alert('Mock payment processing failed.');
                    setIsProcessing(false);
                  }
                } catch (err) {
                  alert('A connection error occurred. Settle payment successfully.');
                  setIsProcessing(false);
                }
              }} className="space-y-6">
                <div>
                  <span className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1">Tuition settlement</span>
                  <h3 className="font-fredoka font-black text-2xl uppercase tracking-wider mb-1">Settle Program Fee</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase">Secure Mock Credit Card Gateway</p>
                </div>

                <div className="bg-[#FFF8E7] border-[3px] border-[#1E1E1E] rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-black text-gray-500 uppercase tracking-widest">Plan Total</span>
                    <span className="font-fredoka font-black text-xl">{data.student?.package_name || 'Basic Boost Plan'}</span>
                  </div>
                  <span className="font-fredoka font-black text-2xl">₹{initialData.program_fee?.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-black uppercase tracking-widest mb-1.5">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="Somya Kashyap" 
                      className="border-[3px] border-[#1E1E1E] rounded-xl px-4 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none shadow-[2px_2px_0px_0px_#1E1E1E]"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-black uppercase tracking-widest mb-1.5">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444" 
                      className="border-[3px] border-[#1E1E1E] rounded-xl px-4 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none shadow-[2px_2px_0px_0px_#1E1E1E]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-black uppercase tracking-widest mb-1.5">Expiry MM/YY</label>
                      <input 
                        type="text" 
                        placeholder="12/28" 
                        className="border-[3px] border-[#1E1E1E] rounded-xl px-4 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none shadow-[2px_2px_0px_0px_#1E1E1E] text-center"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-black uppercase tracking-widest mb-1.5">CVC Code</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        className="border-[3px] border-[#1E1E1E] rounded-xl px-4 py-2.5 font-sans font-bold placeholder-gray-400 focus:outline-none shadow-[2px_2px_0px_0px_#1E1E1E] text-center tracking-widest"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-[#D1F2EB] hover:bg-[#bbf0e5] disabled:bg-gray-200 font-fredoka font-black text-sm px-6 py-3.5 border-[3px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-2xl flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing Tuition payment...' : 'Pay tuition & Reactivate profile'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen bg-[#FFF8E7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 border-[4px] border-[#1E1E1E] border-t-purple-500 rounded-full animate-spin shadow-[4px_4px_0px_0px_#1E1E1E]`}></div>
          <p className="font-black text-xl animate-pulse uppercase tracking-widest">Loading Magic...</p>
        </div>
      </div>
    );
  }

  function renderView() {
    switch (activeView) {
      case "dashboard": return <DashboardView data={data} setActiveView={setActiveView} getDailyQuote={getDailyQuote} />;
      case "course": return <CourseView data={data} showToast={showToast} />;
      case "schedule": return <ScheduleView showToast={showToast} />;
      case "ebooks": return <EbooksView />;
      case "assignments": return <AssignmentsView showToast={showToast} />;
      case "badges": return <BadgesView data={data} />;
      case "chat": return <StudentChatHub auth={auth} />;
      case "progress": return <ProgressView data={data} />;
      case "support": return <SupportView showToast={showToast} />;
      case "settings": return <SettingsView auth={auth} data={data} showToast={showToast} />;
      default: return <DashboardView data={data} setActiveView={setActiveView} />;
    }
  }
}

function DashboardView({ data, setActiveView, getDailyQuote }) {
  return (
    <div className="space-y-8">
      {/* Learning Hero Section */}
      <div className={`p-10 rounded-[3rem] bg-white ${brutalBorder} ${brutalShadow} relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-10`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-3xl -z-0 opacity-50 translate-x-20 -translate-y-20"></div>
        
        <div className="relative z-10 space-y-6">
          <div className={`inline-block px-4 py-1 rounded-full bg-[#D1F2EB] ${brutalBorder} font-black text-xs uppercase tracking-widest`}>
            ✨ Learning is a Superpower
          </div>
          <h2 className="text-5xl font-black leading-tight tracking-tight">
            {data.live_class ? (
              <>Your teacher is <span className="text-green-600 animate-pulse">Live Now!</span></>
            ) : (
              <>Ready to <span className="text-purple-600">Level Up</span> your skills today?</>
            )}
          </h2>
          <p className="text-xl font-bold text-gray-500">
            {data.live_class 
              ? `Join the live class on "${data.live_class.title}" and don't miss out on the fun!`
              : "Check your pending tasks and earn cool badges by completing your daily lessons."
            }
          </p>
          <div className="flex gap-4">
            {data.live_join_url && (
               <a 
                href={data.live_join_url}
                className={`px-8 py-4 bg-[#A0E7E5] ${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black uppercase text-lg flex items-center gap-2`}
               >
                 <Play size={24} fill="currentColor" /> Join the Class
               </a>
            )}
            <button 
              onClick={() => setActiveView('assignments')}
              className={`px-8 py-4 bg-[#FFD1DC] ${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black uppercase text-lg`}
            >
              {data.live_class ? 'View Tasks' : 'Start Learning'}
            </button>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <div className={`w-64 h-64 rounded-full bg-[#FFF8E7] ${brutalBorder} relative shadow-[12px_12px_0px_0px_#1E1E1E] flex items-center justify-center`}>
             {/* Center Student Avatar */}
             <div className="w-40 h-40 rounded-full border-[4px] border-[#1E1E1E] bg-[#FEF08A] overflow-hidden shadow-lg">
                <img src={getAvatarUrl(data.student)} className="w-full h-full object-cover" alt="Hero" />
             </div>

             {/* Floating Elements Loop */}
             <AnimatePresence>
               <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [-2, 2, -2]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -top-4 -right-4 px-4 py-2 bg-[#E9D5FF] ${brutalBorder} rounded-xl font-black text-sm shadow-[4px_4px_0px_0px_#1E1E1E] flex items-center gap-2`}
               >
                 <BookOpen size={16} /> Assignments
               </motion.div>

               <motion.div 
                animate={{ 
                  y: [0, 15, 0],
                  x: [0, -10, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className={`absolute -bottom-4 -left-4 px-4 py-2 bg-[#B4F8C8] ${brutalBorder} rounded-xl font-black text-sm shadow-[4px_4px_0px_0px_#1E1E1E] flex items-center gap-2`}
               >
                 <CheckCircle2 size={16} className="text-green-600" /> Done!
               </motion.div>

               <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [5, -5, 5]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-1/2 -left-12 px-4 py-2 bg-[#FEF08A] ${brutalBorder} rounded-xl font-black text-sm shadow-[4px_4px_0px_0px_#1E1E1E] flex items-center gap-2 -translate-y-1/2`}
               >
                 <Award size={16} className="text-orange-500" /> Quizzes
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Teacher Message Banner */}
      <div className={`p-6 rounded-[2.5rem] bg-[#E9D5FF] ${brutalBorder} ${brutalShadow} flex flex-col md:flex-row items-center gap-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
          <MessageSquare size={120} />
        </div>
        <div className={`w-20 h-20 rounded-full bg-white ${brutalBorder} overflow-hidden shrink-0 shadow-[4px_4px_0px_0px_#1E1E1E]`}>
          <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=Teacher&shapeColor=E9D5FF" className="w-full h-full object-cover" alt="Teacher" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black mb-1">Daily Motivation</h3>
          <p className="font-bold text-lg leading-snug">"{getDailyQuote()}"</p>
        </div>
      </div>

      {/* Always-Visible Live Class Portal Card */}
      <div className={`p-8 rounded-[2.5rem] transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
        data.live_class ? 'bg-[#D1F2EB] animate-[pulse_3s_infinite]' : 'bg-[#FFF8E7]'
      } ${brutalBorder} ${brutalShadow}`}>
        {/* Background icon decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 pointer-events-none">
          <Video size={160} />
        </div>

        <div className="flex items-center gap-5 flex-1 flex-col md:flex-row text-center md:text-left">
          <div className={`w-16 h-16 rounded-2xl ${
            data.live_class ? 'bg-green-400 text-white animate-bounce' : 'bg-gray-200 text-gray-500'
          } ${brutalBorder} flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1E1E1E]`}>
            <Video size={28} strokeWidth={3} />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 flex-wrap">
              <span className={`px-3 py-1 rounded-full ${brutalBorder} text-xs font-black uppercase tracking-wider ${
                data.live_class ? 'bg-green-300 text-green-800 animate-pulse' : 'bg-gray-100 text-gray-500'
              }`}>
                {data.live_class ? '🔴 Live Now' : '💤 Offline'}
              </span>
              <span className="text-xs font-black text-gray-600">Live Class Hub</span>
            </div>
            
            <h4 className="text-2xl font-black uppercase tracking-tight leading-tight">
              {data.live_class ? 'Online Live Class is Active!' : 'Live Class waiting room'}
            </h4>
            <p className="font-bold text-gray-500 text-sm mt-1 max-w-2xl">
              {data.live_class 
                ? `Topic: "${data.live_class.title}". Click the button below to join your teacher immediately and participate in interactive quizzes, chats, and learning!`
                : 'No active live class right now. Keep this page open — the moment your teacher starts the stream, a join button and active meeting details will appear here instantly!'
              }
            </p>
            {data.live_class && (
              <div className="mt-3 flex items-center gap-2 font-bold text-xs bg-white/60 px-3 py-1.5 rounded-xl border-2 border-dashed border-[#1E1E1E] inline-flex">
                <span className="text-gray-600">Shareable Room link:</span>
                <span className="font-black underline text-green-700 select-all truncate max-w-[200px]">
                  {data.live_join_url}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          {data.live_class ? (
            <a 
              href={data.live_join_url}
              className={`w-full md:w-auto px-8 py-4 bg-green-400 hover:bg-green-300 ${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black uppercase text-base flex items-center justify-center gap-2`}
            >
              <Play size={20} fill="currentColor" /> Join the Class
            </a>
          ) : (
            <div className={`w-full md:w-auto px-6 py-4 bg-gray-100 rounded-2xl ${brutalBorder} font-black text-xs text-gray-500 flex items-center justify-center gap-2.5`}>
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-ping"></div>
              Waiting for Teacher...
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-[2rem] bg-[#FFD1DC] ${brutalBorder} ${brutalShadow} relative overflow-hidden group`}>
          <p className="font-black text-xs uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Learning Streak</p>
          <div className="flex items-center gap-3">
             <h3 className="text-4xl font-black">{data.student?.streak || 0} Days</h3>
             <motion.div 
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
             >
               <Sparkles size={32} fill="currentColor" />
             </motion.div>
          </div>
        </div>
        <div className={`p-6 rounded-[2rem] bg-[#FEF08A] ${brutalBorder} ${brutalShadow} relative overflow-hidden group`}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <p className="font-black text-xs uppercase tracking-widest text-[#1E1E1E]/60 mb-2">My Attendance</p>
          <h3 className="text-5xl font-black">{data.student?.attendance || 0}%</h3>
          <div className="mt-4 flex items-center gap-2 font-bold text-xs">
            <span className="px-2 py-1 bg-white rounded-lg border-2 border-[#1E1E1E]">
              {data.student?.attendance >= 90 ? 'Great job! 🌟' : 'Keep it up! 💪'}
            </span>
          </div>
        </div>
        <div className={`p-6 rounded-[2rem] bg-[#D1F2EB] ${brutalBorder} ${brutalShadow} relative overflow-hidden group`}>
          <p className="font-black text-sm uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Daily Progress</p>
          <h3 className="text-5xl font-black">{data.daily_progress || 0}%</h3>
          <div className="mt-4 w-full h-3 bg-white/50 rounded-full border-2 border-[#1E1E1E] overflow-hidden">
             <div className="h-full bg-white transition-all duration-1000" style={{ width: `${data.daily_progress || 0}%` }}></div>
          </div>
        </div>
        <div className={`p-6 rounded-[2rem] bg-[#BFDBFE] ${brutalBorder} ${brutalShadow} relative overflow-hidden group`}>
          <p className="font-black text-sm uppercase tracking-widest text-[#1E1E1E]/60 mb-2">Pending Tasks</p>
          <h3 className="text-5xl font-black">{data.pending_assignments?.length || 0}</h3>
          <div className="mt-4 flex items-center gap-2 font-bold text-xs">
            <span className="px-2 py-1 bg-white rounded-lg border-2 border-[#1E1E1E]">
              {data.pending_assignments?.length > 0 ? 'Next due: Today' : 'All done! 🎉'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Classes */}
        <div className={`p-8 rounded-[2.5rem] bg-white ${brutalBorder} ${brutalShadow} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black uppercase">Today's Classes</h3>
              <button 
                onClick={() => setActiveView('schedule')}
                className="text-sm font-black underline hover:text-[#1E1E1E]/80"
              >
                Calendar
              </button>
            </div>
            <div className="space-y-4">
              {data.today_classes?.length > 0 ? (
                data.today_classes.map((c, i) => {
                  const classTime = c.scheduled_at ? new Date(c.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
                  return (
                    <div key={i} className={`p-4 rounded-2xl border-[3px] border-[#1E1E1E] flex items-center justify-between group hover:bg-[#FDFCF9] transition-all bg-[#F9F9FB]`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${c.status === 'live' ? 'bg-[#D1F2EB] animate-pulse' : 'bg-[#E9D5FF]'} border-2 border-[#1E1E1E] flex items-center justify-center text-xl`}>
                          📚
                        </div>
                        <div>
                          <p className="font-black text-sm leading-tight truncate max-w-[120px]">{c.title}</p>
                          <p className="text-[10px] font-bold text-[#1E1E1E]/50 uppercase mt-0.5">{classTime}</p>
                        </div>
                      </div>
                      {c.status === 'live' ? (
                        <a 
                          href={data.live_join_url || `/student/live/${c.meeting_link}`}
                          className={`px-3 py-1.5 bg-[#A0E7E5] rounded-xl border-2 border-[#1E1E1E] font-black text-xs ${brutalShadowSm} ${brutalHover}`}
                        >
                          Join
                        </a>
                      ) : c.status === 'completed' ? (
                        <span className="text-[10px] font-black text-green-600">Done ✅</span>
                      ) : (
                        <span className="text-[10px] font-black text-gray-400">Scheduled</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center opacity-40">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="font-black text-sm uppercase">No classes today!</p>
                  <p className="text-[9px] font-bold mt-1">Enjoy your free day!</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
            <p className="text-[9px] font-black uppercase text-gray-400 text-center">
              Classes match your grade
            </p>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className={`p-8 rounded-[2.5rem] bg-white ${brutalBorder} ${brutalShadow}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black uppercase">Pending Work</h3>
            <button 
              onClick={() => setActiveView('assignments')}
              className="text-sm font-black underline hover:text-purple-600"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {data.pending_assignments?.length > 0 ? (
              data.pending_assignments.map((assignment, i) => (
                <div key={i} className={`p-4 rounded-2xl border-[3px] border-[#1E1E1E] flex items-center justify-between group hover:bg-[#FDFCF9] transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFD93D] rounded-xl border-2 border-[#1E1E1E] flex items-center justify-center">
                       <FileText size={24} />
                    </div>
                    <div>
                      <p className="font-black text-sm truncate max-w-[100px]">{assignment.title}</p>
                      <p className="text-[10px] font-bold text-[#1E1E1E]/50">PENDING</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveView('assignments')}
                    className={`px-4 py-2 bg-[#E9D5FF] rounded-xl border-2 border-[#1E1E1E] font-black text-xs ${brutalShadowSm} ${brutalHover}`}
                  >
                    Start Now
                  </button>
                </div>
              ))
            ) : (
              <div className="py-10 text-center opacity-40">
                <CheckCircle2 size={48} className="mx-auto mb-4" />
                <p className="font-black">All caught up! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* My Badges */}
        <div className={`p-8 rounded-[2.5rem] bg-white ${brutalBorder} ${brutalShadow}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black uppercase">Unlocked Badges</h3>
            <button 
              onClick={() => setActiveView('badges')}
              className="text-sm font-black underline hover:text-yellow-600"
            >
              Showcase
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {data.badges?.length > 0 ? (
              data.badges.map((badge, i) => (
                <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
                  <div className={`w-16 h-16 bg-[#FBE7C6] rounded-full border-[3px] border-[#1E1E1E] ${brutalShadowSm} flex items-center justify-center text-2xl group-hover:rotate-12 transition-all`}>
                    {badge.icon}
                  </div>
                  <p className="mt-2 font-black text-[9px] uppercase leading-tight">{badge.name}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-10 text-center opacity-40">
                <Star size={48} className="mx-auto mb-4" />
                <p className="font-black text-sm uppercase">No Badges Yet</p>
                <p className="text-[10px] font-bold mt-1">Attend classes & score 90+ on quizzes!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleView({ showToast }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/student/classes');
      setClasses(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setLoading(false);
    }
  };

  const handleJoinClass = async (classId) => {
    setJoiningId(classId);
    try {
      const response = await axios.get(`/api/student/classes/${classId}/join`);
      showToast("Joining class room... 🚀");
      window.location.href = response.data.url;
    } catch (error) {
      showToast("Could not join class. Make sure it's active!", "error");
    } finally {
      setJoiningId(null);
    }
  };

  // Calendar setup
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build grid cells
  const cells = [];
  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      currentMonth: false
    });
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      date: new Date(year, month, i),
      currentMonth: true
    });
  }
  // Leading days from next month
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      date: new Date(year, month + 1, i),
      currentMonth: false
    });
  }

  const getClassesForDate = (date) => {
    return classes.filter(c => {
      if (!c.scheduled_at) return false;
      const d = new Date(c.scheduled_at);
      return d.getDate() === date.getDate() &&
             d.getMonth() === date.getMonth() &&
             d.getFullYear() === date.getFullYear();
    });
  };

  const selectedClasses = getClassesForDate(selectedDate);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Card */}
        <div className={`lg:col-span-2 bg-white p-6 rounded-[2.5rem] ${brutalBorder} ${brutalShadow} flex flex-col min-h-[500px]`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <Calendar className="text-purple-600" size={28} /> {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={prevMonth}
                className={`p-2 bg-white rounded-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextMonth}
                className={`p-2 bg-white rounded-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="font-black text-sm text-gray-400 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <RefreshCcw className="animate-spin text-purple-600 mb-4" size={48} />
              <p className="font-black">Scheduling Magic...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2 flex-1">
              {cells.map((cell, idx) => {
                const isSelected = selectedDate.getDate() === cell.date.getDate() &&
                                   selectedDate.getMonth() === cell.date.getMonth() &&
                                   selectedDate.getFullYear() === cell.date.getFullYear();
                const isToday = new Date().getDate() === cell.date.getDate() &&
                                new Date().getMonth() === cell.date.getMonth() &&
                                new Date().getFullYear() === cell.date.getFullYear();
                const dayClasses = getClassesForDate(cell.date);
                const hasClasses = dayClasses.length > 0;
                const hasLive = dayClasses.some(c => c.status === 'live');

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`aspect-square p-2 rounded-2xl flex flex-col justify-between items-center transition-all ${brutalBorder} ${
                      isSelected 
                        ? 'bg-[#FFD1DC] shadow-[3px_3px_0px_0px_#1E1E1E]' 
                        : isToday
                        ? 'bg-[#FEF08A] shadow-[3px_3px_0px_0px_#1E1E1E]'
                        : cell.currentMonth
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-gray-100/50 text-gray-400'
                    } relative group`}
                  >
                    <span className="font-black text-sm sm:text-base leading-none">
                      {cell.date.getDate()}
                    </span>

                    {/* Class indicator dot */}
                    {hasClasses && (
                      <div className="flex gap-1.5 justify-center items-center mt-1.5">
                        {hasLive ? (
                          <span className="w-4.5 h-4.5 bg-green-500 rounded-full animate-pulse border-[2px] border-[#1E1E1E] shadow-[1px_1px_0px_0px_#1E1E1E]"></span>
                        ) : (
                          <span className={`w-4 h-4 rounded-full border-[2px] border-[#1E1E1E] shadow-[1.5px_1.5px_0px_0px_#1E1E1E] ${
                            dayClasses[0].status === 'completed' ? 'bg-gray-400' : 'bg-purple-400'
                          }`}></span>
                        )}
                        {dayClasses.length > 1 && (
                          <span className="text-[10px] font-black text-gray-700 bg-white border border-[#1E1E1E] px-1 rounded-md">+{dayClasses.length - 1}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Details Card */}
        <div className={`bg-white p-8 rounded-[2.5rem] ${brutalBorder} ${brutalShadow} flex flex-col justify-between min-h-[500px]`}>
          <div>
            <div className="mb-6">
              <span className={`px-4 py-1.5 rounded-full bg-[#FFE5D9] ${brutalBorder} font-black text-[11px] uppercase tracking-wider`}>
                Selected Date
              </span>
              <h4 className="text-2xl font-black uppercase mt-3 tracking-tight">
                {formatDateLabel(selectedDate)}
              </h4>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[340px] pr-2 scrollbar-thin">
              {selectedClasses.length > 0 ? (
                selectedClasses.map((c, i) => (
                  <div key={i} className={`p-5 rounded-2xl border-[3px] border-[#1E1E1E] bg-[#FDFCF9] shadow-[4px_4px_0px_0px_#1E1E1E] relative overflow-hidden`}>
                    {c.status === 'live' && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-green-500 text-white font-black text-[9px] uppercase flex items-center justify-center rotate-45 translate-x-6 -translate-y-6">
                        Live
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border-2 border-[#1E1E1E] ${
                        c.status === 'live' ? 'bg-[#D1F2EB]' : c.status === 'completed' ? 'bg-gray-100' : 'bg-[#E9D5FF]'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {formatTime(c.scheduled_at)}
                      </span>
                    </div>

                    <h5 className="font-black text-lg uppercase leading-snug mb-1">{c.title}</h5>
                    <p className="text-xs font-bold text-gray-500 mb-4">{c.description || "Interactive learning session."}</p>

                    {c.status === 'live' ? (
                      <button
                        onClick={() => handleJoinClass(c.id)}
                        disabled={joiningId === c.id}
                        className={`w-full py-3 bg-[#A0E7E5] rounded-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black uppercase text-xs flex items-center justify-center gap-2`}
                      >
                        <Play size={16} fill="currentColor" /> {joiningId === c.id ? "Joining..." : "Join the Class"}
                      </button>
                    ) : c.status === 'completed' ? (
                      <div className="text-center py-2 text-xs font-black text-green-600 bg-green-50 rounded-xl border border-green-200">
                        Class Completed ✅
                      </div>
                    ) : (
                      <div className="text-center py-2 text-xs font-black text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                        Starts {formatTime(c.scheduled_at)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center opacity-40 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                  <span className="text-5xl block mb-3">🎉</span>
                  <p className="font-black text-sm uppercase">No classes today</p>
                  <p className="text-[10px] font-bold mt-1">Enjoy your free time!</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 text-center">
            <p className="text-[10px] font-black uppercase text-gray-400">
              Need help? Contact your teacher
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EbooksView() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      const response = await axios.get('/api/student/ebooks');
      setEbooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch ebooks:", error);
      setLoading(false);
    }
  };

  const subjects = ["All", "Science", "Maths", "English", "General"];

  const filteredEbooks = ebooks.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = activeSubject === "All" || 
                           (book.subject && book.subject.toLowerCase() === activeSubject.toLowerCase()) ||
                           (!book.subject && activeSubject === "General");
    return matchesSearch && matchesSubject;
  });

  const coverColors = [
    'bg-[#FFD1DC]', // Pastel Pink
    'bg-[#D1F2EB]', // Pastel Mint
    'bg-[#E9D5FF]', // Pastel Purple
    'bg-[#FEF08A]', // Pastel Yellow
    'bg-[#BFDBFE]'  // Pastel Blue
  ];

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-[2rem] bg-white ${brutalBorder} ${brutalShadow} flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {subjects.map((subject, idx) => {
            const getIcon = () => {
              if (subject === "All") return <BookOpen size={14} className="text-purple-600" />;
              if (subject === "Science") return <Sparkles size={14} className="text-yellow-500" />;
              if (subject === "Maths") return <BarChart size={14} className="text-blue-500" />;
              if (subject === "English") return <MessageSquare size={14} className="text-green-500" />;
              return <Globe size={14} className="text-red-500" />;
            };
            return (
              <button
                key={idx}
                onClick={() => setActiveSubject(subject)}
                className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-1.5 ${
                  activeSubject === subject 
                    ? 'bg-[#E9D5FF] border-[3px] border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]' 
                    : 'bg-white border-2 border-gray-200 hover:border-[#1E1E1E] text-gray-500 hover:text-[#1E1E1E]'
                }`}
              >
                {getIcon()}
                <span>{subject}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search in library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-3 pl-10 pr-4 rounded-xl bg-[#F9F9FB] border-2 border-[#1E1E1E] font-bold text-sm focus:outline-none focus:bg-white`}
          />
          <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <RefreshCcw size={48} className="animate-spin mx-auto mb-4 text-purple-600" />
            <p className="font-black">Unlocking Library Chest...</p>
          </div>
        ) : filteredEbooks.length > 0 ? (
          filteredEbooks.map((book, i) => {
            const coverColor = coverColors[i % coverColors.length];
            return (
              <div 
                key={i} 
                className={`bg-white rounded-[2.5rem] border-[3px] border-[#1E1E1E] shadow-[6px_6px_0px_0px_#1E1E1E] overflow-hidden group hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[10px_10px_0px_0px_#1E1E1E] transition-all duration-300`}
              >
                <div className={`h-52 ${coverColor} border-b-[3px] border-[#1E1E1E] flex items-center justify-center p-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-repeat-x opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                  <div className="absolute top-4 right-4 text-white/50 text-xl font-bold select-none animate-bounce">
                    ✨
                  </div>

                  <div className={`w-28 h-36 bg-white rounded-2xl border-[3px] border-[#1E1E1E] shadow-[5px_5px_0px_0px_#1E1E1E] flex flex-col items-center justify-between p-3 group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 relative`}>
                    <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-purple-500 rounded-full border-r border-[#1E1E1E]/20" />
                    <div className="w-full flex justify-end">
                      <span className="text-[8px] font-black text-gray-300 uppercase">Vol. I</span>
                    </div>
                    <BookOpen size={40} className="text-purple-600 my-auto" />
                    <div className="w-full space-y-1">
                      <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto" />
                      <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest text-[#1E1E1E] bg-[#D1F2EB] px-2 py-0.5 rounded-md border-2 border-[#1E1E1E]`}>
                      {book.grade || 'General'}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#1E1E1E]/50">
                      {book.subject || 'Material'}
                    </span>
                  </div>
                  
                  <h4 className="font-black text-xl mb-1 truncate group-hover:text-purple-600 transition-colors">{book.title}</h4>
                  <p className="text-xs font-bold text-gray-500 mb-6">Uploaded by your teacher</p>
                  
                  <div className="flex gap-3">
                    <a 
                      href={`/storage/${book.file_path}`}
                      target="_blank" 
                      rel="noreferrer"
                      className={`flex-1 py-3 rounded-xl bg-[#FEF08A] ${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black text-xs uppercase flex items-center justify-center gap-2`}
                    >
                      <Eye size={14} /> Read Now
                    </a>
                    <a 
                      href={`/storage/${book.file_path}`} 
                      download
                      className={`p-3 rounded-xl bg-white ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center justify-center`}
                    >
                      <Download size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-[3px] border-[#1E1E1E] border-dashed flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 bg-[#FFE5D9] rounded-full border-2 border-[#1E1E1E] flex items-center justify-center mb-4 relative shadow-[3px_3px_0px_0px_#1E1E1E]">
              <BookOpen size={36} className="text-pink-500 animate-pulse" />
              <span className="absolute -top-1 -right-1 text-xs"><Heart size={14} fill="#F472B6" className="text-pink-400" /></span>
            </div>
            <p className="font-black text-lg uppercase tracking-tight">No matching books found</p>
            <p className="text-xs font-bold text-gray-400 mt-1">Try tweaking your search or ask your teacher!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentsView({ showToast }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/student/assignments');
      setAssignments(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      setLoading(false);
    }
  };

  const handleSubmitTask = async (id) => {
    if (!submissionText.trim()) {
      showToast("Please write something before turning it in!", "warning");
      return;
    }
    setSubmittingId(id);
    try {
      await axios.post(`/api/student/assignments/${id}/submit`, {
        submission_text: submissionText
      });
      showToast("Awesome! Work submitted successfully!");
      setSubmissionText("");
      setExpandedId(null);
      fetchAssignments();
    } catch (error) {
      showToast("Failed to submit assignment.", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (activeFilter === "pending") return assignment.status !== "completed";
    if (activeFilter === "completed") return assignment.status === "completed";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className={`p-4 rounded-[2rem] bg-white ${brutalBorder} ${brutalShadow} flex gap-3 justify-center md:justify-start`}>
        {[
          { key: "all", label: "All Tasks", icon: <CheckSquare size={14} className="text-purple-600" /> },
          { key: "pending", label: "Pending", icon: <Clock size={14} className="text-yellow-600" /> },
          { key: "completed", label: "Completed", icon: <CheckCircle2 size={14} className="text-green-600" /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveFilter(tab.key);
              setExpandedId(null);
            }}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-1.5 ${
              activeFilter === tab.key
                ? 'bg-[#FFD1DC] border-[3px] border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]'
                : 'bg-white border-2 border-gray-200 hover:border-[#1E1E1E] text-gray-500 hover:text-[#1E1E1E]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCcw size={48} className="animate-spin mx-auto mb-4 text-purple-600" />
            <p className="font-black">Unfolding Homework Scroll...</p>
          </div>
        ) : filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment, i) => {
            const isExpanded = expandedId === assignment.id;
            const isDone = assignment.status === "completed";

            return (
              <div 
                key={i} 
                className={`bg-white rounded-[2.5rem] border-[3px] border-[#1E1E1E] shadow-[6px_6px_0px_0px_#1E1E1E] overflow-hidden transition-all duration-300`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                  className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:bg-[#FDFCF9] transition-all"
                >
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className={`w-14 h-14 rounded-2xl ${isDone ? 'bg-[#D1F2EB]' : 'bg-[#FFE5D9]'} border-2 border-[#1E1E1E] flex items-center justify-center shadow-[3px_3px_0px_0px_#1E1E1E] shrink-0`}>
                      {isDone ? <CheckCircle2 size={24} className="text-green-600" strokeWidth={2.5} /> : <FileText size={24} className="text-orange-500" strokeWidth={2.5} />}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-xl uppercase truncate max-w-[200px] sm:max-w-[400px]">{assignment.title}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border-2 border-[#1E1E1E] uppercase ${
                          isDone ? 'bg-[#D1F2EB]' : 'bg-[#FEF08A]'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-400">Click to expand details & write answer</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <span className="text-xs font-black text-gray-400 uppercase mr-2">
                      {isDone ? "Handed In" : "Pending Action"}
                    </span>
                    <div className={`w-8 h-8 rounded-full border-2 border-[#1E1E1E] flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-[#E9D5FF]' : 'bg-white'}`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details / Submission Form */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="border-t-[3px] border-[#1E1E1E] bg-[#FAFAFC] p-8 space-y-6"
                    >
                      {/* Task Description */}
                      <div className="space-y-2">
                        <h5 className="font-black uppercase text-xs text-gray-400 tracking-wider">Assignment Prompt:</h5>
                        <div className={`p-5 rounded-2xl bg-white border-2 border-[#1E1E1E] font-bold text-sm text-[#1E1E1E] leading-relaxed`}>
                          {assignment.task}
                        </div>
                      </div>

                      {/* Download Materials (If exists) */}
                      {assignment.file_path && (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#E9D5FF]/20 border-2 border-dashed border-[#E9D5FF] gap-4">
                          <div className="flex items-center gap-3">
                            <Paperclip size={20} className="text-purple-500" />
                            <div>
                              <p className="font-black text-xs uppercase">Attached material</p>
                              <p className="text-[10px] text-gray-400 font-bold">Download to review resources</p>
                            </div>
                          </div>
                          <a 
                            href={`/storage/${assignment.file_path}`} 
                            download 
                            className={`px-4 py-2 bg-white rounded-lg border-2 border-[#1E1E1E] font-black text-xs ${brutalShadowSm} ${brutalHover} flex items-center gap-1.5`}
                          >
                            <Download size={14} /> Download
                          </a>
                        </div>
                      )}

                      {/* Submission Area */}
                      <div className="space-y-3">
                        <h5 className="font-black uppercase text-xs text-gray-400 tracking-wider">Your Work:</h5>
                        
                        {isDone ? (
                          /* Render Completed Submission as Lined Notebook Sheet */
                          <div className={`p-6 rounded-2xl border-2 border-[#1E1E1E] bg-[#FFFDD0] shadow-[4px_4px_0px_0px_#1E1E1E] relative overflow-hidden`}>
                            {/* Cute margin line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-red-400/40" />
                            <div className="pl-6 space-y-2">
                              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Handed In Answer:</p>
                              <p className="font-bold text-sm text-gray-700 italic leading-relaxed">
                                "{assignment.submission_text || "Task completed successfully."}"
                              </p>
                              {assignment.submitted_at && (
                                <p className="text-[9px] font-black text-gray-400 uppercase mt-4">
                                  Submitted: {new Date(assignment.submitted_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Render Input Form for Pending Homework */
                          <div className="space-y-4">
                            <div className="relative">
                              <textarea
                                rows={4}
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                placeholder="Type your answer, paragraph, or homework response here..."
                                className={`w-full p-6 pl-10 rounded-2xl bg-white border-2 border-[#1E1E1E] font-bold text-sm focus:outline-none focus:ring-0 focus:border-purple-600 resize-none shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)]`}
                              />
                              {/* Lined paper decoration margins */}
                              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-red-400/30" />
                            </div>

                            <button
                              onClick={() => handleSubmitTask(assignment.id)}
                              disabled={submittingId === assignment.id}
                              className={`w-full py-4 bg-[#A0E7E5] rounded-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black uppercase text-xs flex items-center justify-center gap-2`}
                            >
                              <Send size={14} /> {submittingId === assignment.id ? "Turning in..." : "Hand In Homework"}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-[3px] border-[#1E1E1E] border-dashed flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 bg-[#D1F2EB] rounded-full border-2 border-[#1E1E1E] flex items-center justify-center mb-4 relative shadow-[3px_3px_0px_0px_#1E1E1E]">
              <Award size={36} className="text-green-600 animate-bounce" />
              <span className="absolute -top-1 -right-1 text-xs"><Sparkles size={14} className="text-yellow-500 animate-spin" /></span>
            </div>
            <p className="font-black text-lg uppercase tracking-tight">All Tasks Completed!</p>
            <p className="text-xs font-bold text-gray-400 mt-1">Hooray! No pending homework waiting for you!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgesView({ data }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const badgeCatalog = [
    { 
      id: 'attendance_master', 
      name: 'Attendance Master', 
      icon: <Sparkles className="text-yellow-500" size={36} />, 
      color: 'bg-[#FEF08A]', 
      hint: 'Attend 95% or more of live video classes!',
      perks: 'Profile shine, custom star medal icon next to your name'
    },
    { 
      id: 'quiz_wiz', 
      name: 'Quiz Wiz', 
      icon: <BookOpen className="text-purple-600" size={36} />, 
      color: 'bg-[#E9D5FF]', 
      hint: 'Score 90% or higher on any vocabulary quiz!',
      perks: 'Spellcaster title, unlock secret library books'
    },
    { 
      id: 'fast_learner', 
      name: 'Fast Learner', 
      icon: <Clock className="text-blue-500" size={36} />, 
      color: 'bg-[#BFDBFE]', 
      hint: 'Turn in all assigned homework within 24 hours!',
      perks: 'Speedrunner title, rocket hover animation on dashboard'
    },
    { 
      id: 'help_hero', 
      name: 'Help Hero', 
      icon: <LifeBuoy className="text-pink-500" size={36} />, 
      color: 'bg-[#FFD1DC]', 
      hint: 'Ask for help through a Support Ticket!',
      perks: 'Helper badge, priority class waiting list access'
    },
    { 
      id: 'creative_mind', 
      name: 'Creative Mind', 
      icon: <Award className="text-green-500" size={36} />, 
      color: 'bg-[#D1F2EB]', 
      hint: 'Share custom drawing assignments with your teacher!',
      perks: 'Artist crown avatar border, select custom theme backgrounds'
    },
  ];

  const earnedCount = badgeCatalog.filter(b => data.badges?.some(eb => eb.id === b.id)).length;
  const progressPercent = Math.round((earnedCount / badgeCatalog.length) * 100);

  let rankName = "Level 1 Explorer";
  let rankColor = "text-purple-600";
  if (earnedCount >= 4) {
    rankName = "Level 4 Grandmaster";
    rankColor = "text-yellow-600";
  } else if (earnedCount >= 3) {
    rankName = "Level 3 Scholar";
    rankColor = "text-green-600";
  } else if (earnedCount >= 2) {
    rankName = "Level 2 Adventurer";
    rankColor = "text-pink-600";
  }

  return (
    <div className="space-y-8">
      {/* Neo-Brutalist Achievement Statistics Header */}
      <div className={`p-8 bg-[#FFF8E7] rounded-[2.5rem] ${brutalBorder} ${brutalShadow} relative overflow-hidden flex flex-col md:flex-row items-center gap-8`}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1E1E1E 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Animated Badge Mascot Icon */}
        <div className="w-24 h-24 rounded-full border-[3px] border-[#1E1E1E] bg-white flex items-center justify-center text-4xl shrink-0 shadow-[4px_4px_0px_0px_#1E1E1E] animate-bounce relative">
          <Award size={48} className="text-yellow-500" strokeWidth={2.5} />
          <span className="absolute -top-1 -right-1 text-xs"><Sparkles size={16} className="text-yellow-500 animate-spin" /></span>
        </div>

        <div className="flex-1 w-full relative z-10 space-y-4">
          <div>
            <span className="inline-block px-3 py-1 bg-yellow-100 border-2 border-[#1E1E1E] rounded-full font-black text-xs uppercase tracking-wider mb-2 transform -rotate-1">
              Achievements
            </span>
            <h3 className="text-3xl font-black uppercase tracking-tight">Your Collectible Badges</h3>
            <p className="text-sm font-bold text-gray-500 mt-1">Unlock rare badges by attending classes, acing vocabulary quizzes, and learning fast!</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg">
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]">
              <span className="block text-[10px] font-black text-gray-400 uppercase">Badges Unlocked</span>
              <span className="text-xl font-black text-purple-600">{earnedCount} / {badgeCatalog.length}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]">
              <span className="block text-[10px] font-black text-gray-400 uppercase">Explorer Rank</span>
              <span className={`text-xs font-black ${rankColor} uppercase`}>{rankName}</span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-white p-3 rounded-2xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E] flex flex-col justify-center">
              <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase mb-1">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 border border-[#1E1E1E] overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full border-r border-[#1E1E1E] transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {badgeCatalog.map(badge => {
          const earned = data.badges?.some(b => b.id === badge.id);
          return (
            <div 
              key={badge.id} 
              onClick={() => setSelectedBadge(badge)}
              className={`flex flex-col items-center justify-between p-6 rounded-[2.5rem] ${brutalBorder} transition-all duration-300 cursor-pointer relative group ${
                earned 
                  ? `${badge.color} shadow-[6px_6px_0px_0px_#1E1E1E] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_#1E1E1E]` 
                  : 'bg-white/40 backdrop-blur-sm grayscale opacity-60 shadow-[3px_3px_0px_0px_#1E1E1E] hover:opacity-90 hover:grayscale-0'
              }`}
            >
              {/* Floating Status Ring */}
              {earned && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-green-400 border-2 border-[#1E1E1E] rounded-full animate-pulse" />
              )}

              {/* Icon Sphere */}
              <div className={`w-20 h-20 rounded-full border-[3px] border-[#1E1E1E] flex items-center justify-center mb-4 bg-white ${brutalShadowSm} group-hover:rotate-12 group-hover:scale-105 transition-all duration-300 relative`}>
                {badge.icon}
                {!earned && (
                  <span className="absolute -bottom-1 -right-1 text-[10px] bg-white border border-[#1E1E1E] rounded-full w-6 h-6 flex items-center justify-center shadow-[1px_1px_0px_0px_#1E1E1E] font-black uppercase text-gray-500">Off</span>
                )}
              </div>

              {/* Info */}
              <div className="text-center w-full">
                <h4 className="font-black text-xs uppercase tracking-tight leading-tight truncate">{badge.name}</h4>
                <p className="mt-2 text-[9px] font-black uppercase text-[#1E1E1E]/40 tracking-wider">
                  {earned ? 'Unlocked' : 'Locked'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal Overlay / Drawer */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-[#1E1E1E]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`bg-white p-8 rounded-[3rem] ${brutalBorder} ${brutalShadow} max-w-md w-full relative`}>
            <button 
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 bg-gray-50 border-2 border-[#1E1E1E] rounded-full hover:bg-gray-100"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-full border-[4px] border-[#1E1E1E] bg-[#FAFAFC] flex items-center justify-center mx-auto shadow-[6px_6px_0px_0px_#1E1E1E] animate-bounce">
                {selectedBadge.icon}
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase">{selectedBadge.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full border-2 border-[#1E1E1E] text-[10px] font-black uppercase mt-2 ${
                  data.badges?.some(b => b.id === selectedBadge.id) ? 'bg-[#D1F2EB]' : 'bg-[#FFE5D9]'
                }`}>
                  {data.badges?.some(b => b.id === selectedBadge.id) ? 'Earned & Active' : 'Locked'}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border-2 border-[#1E1E1E] text-left space-y-3">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">How to Earn:</p>
                  <p className="text-xs font-bold text-[#1E1E1E]">{selectedBadge.hint}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Unlock Rewards:</p>
                  <p className="text-xs font-bold text-purple-600">{selectedBadge.perks}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className={`w-full py-3 bg-[#BFDBFE] rounded-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black text-xs uppercase`}
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressView({ data }) {
  const [stats, setStats] = useState({ attendance: 0, progress: 0, feedbacks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/student/progress');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="lg:col-span-2 space-y-8">
          <div className={`p-8 rounded-[2.5rem] bg-white ${brutalBorder} ${brutalShadow}`}>
             <h3 className="text-2xl font-black uppercase mb-8">Performance Curve</h3>
             <div className="h-64 flex items-end justify-between gap-4">
                {/* Mock Chart */}
                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3">
                     <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className={`w-full rounded-t-xl ${brutalBorder} border-b-0 ${
                        h > 80 ? 'bg-[#D1F2EB]' : (h > 50 ? 'bg-[#FEF08A]' : 'bg-[#FFE5D9]')
                      }`}
                     ></motion.div>
                     <span className="font-black text-[10px] uppercase">Mon</span>
                  </div>
                ))}
             </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] bg-white ${brutalBorder} ${brutalShadow}`}>
             <h3 className="text-2xl font-black uppercase mb-6">Teacher Feedback</h3>
             <div className="space-y-4">
                {stats.feedbacks?.length > 0 ? (
                  stats.feedbacks.map((f, i) => (
                    <div key={i} className={`p-4 rounded-2xl border-[3px] border-[#1E1E1E] bg-[#FFF8E7] flex items-start gap-4`}>
                       <div className="w-10 h-10 rounded-full bg-white border-2 border-[#1E1E1E] flex items-center justify-center text-xl shrink-0">
                          {f.type === 'positive' ? '👍' : '📝'}
                       </div>
                       <div>
                          <p className="font-bold text-sm">"{f.content}"</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase mt-2">Received: {new Date(f.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="py-10 text-center font-bold text-gray-400 ">No feedback received yet. Keep working hard!</p>
                )}
             </div>
          </div>
       </div>

       <div className="space-y-8">
          <div className={`p-8 rounded-[2.5rem] bg-[#FFE5D9] ${brutalBorder} ${brutalShadow}`}>
             <h3 className="text-xl font-black uppercase mb-4 text-center">Monthly Attendance</h3>
             <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full border-[6px] border-[#1E1E1E] bg-white flex items-center justify-center text-3xl font-black relative overflow-hidden shadow-[inset_0px_4px_0px_rgba(0,0,0,0.1)]">
                   {stats.attendance}%
                   <div className="absolute bottom-0 left-0 w-full bg-[#FFE5D9]/20" style={{ height: `${stats.attendance}%` }}></div>
                </div>
             </div>
             <p className="text-center font-bold text-sm leading-tight">You've attended {Math.round(stats.attendance / 10)} out of 10 classes this month!</p>
          </div>
       </div>
    </div>
  );
}

function SupportView({ showToast }) {
  const [formData, setFormData] = useState({ title: '', description: '', teacher_id: '' });
  const [teachers, setTeachers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('/api/student/teachers');
        setTeachers(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, teacher_id: response.data[0].id }));
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  const faqs = [
    {
      q: "Where can I find my homework?",
      a: "Click on the 'Assignments' tab on the sidebar! You'll see all your pending assignments. Tap one to open your answer sheet and write your response."
    },
    {
      q: "How do I join a Live Class?",
      a: "When your teacher starts a live class, a flashing green 'Join Live Class' button appears on your Home dashboard! Click it to enter the waiting room immediately."
    },
    {
      q: "How can I unlock new Badges?",
      a: "Check out the 'Badges' page to see all hints! You can unlock them by keeping your attendance high, doing your homework quickly, or getting high quiz scores."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/api/student/tickets', formData);
      showToast("Support ticket sent successfully!");
      setFormData(prev => ({ ...prev, title: '', description: '' }));
    } catch (error) {
      showToast("Failed to send ticket. Try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Mascot & FAQs */}
      <div className="space-y-6">
        {/* Mascot Greeting */}
        <div className={`p-6 rounded-[2.5rem] bg-[#D1F2EB] ${brutalBorder} ${brutalShadow} relative overflow-hidden flex items-center gap-4`}>
          <Cloud className="absolute -bottom-6 -right-6 text-black opacity-5 pointer-events-none" size={120} />
          <div className="w-16 h-16 rounded-full border-2 border-[#1E1E1E] bg-white flex items-center justify-center text-purple-500 shrink-0 animate-bounce shadow-[3px_3px_0px_0px_#1E1E1E]">
            <Cloud size={32} fill="currentColor" className="opacity-85" />
          </div>
          <div>
            <div className="relative bg-white p-3 rounded-2xl border-2 border-[#1E1E1E] text-xs font-black uppercase text-gray-700 leading-tight flex items-center gap-2">
              <span>Hi buddy! Got stuck or need a hand? Ask away and I'll send it straight to your teacher!</span>
              <Sparkles className="text-yellow-500 shrink-0" size={16} />
              {/* Little speech bubble pointer */}
              <div className="absolute top-1/2 -left-2 w-3 h-3 bg-white border-l-2 border-b-2 border-[#1E1E1E] rotate-45 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* FAQ Accordions */}
        <div className={`p-6 rounded-[2.5rem] bg-white ${brutalBorder} ${brutalShadow} space-y-4`}>
          <h4 className="font-black text-lg uppercase tracking-tight mb-4 flex items-center gap-2 text-purple-600">
            <HelpCircle className="text-purple-600" size={24} /> <span>Quick Questions</span>
          </h4>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-2 border-[#1E1E1E] rounded-2xl overflow-hidden bg-[#FAFAFC]">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left font-black text-xs uppercase hover:bg-[#F0EDF6] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-600' : 'text-gray-400'}`} size={16} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 bg-white border-t-2 border-[#1E1E1E] text-xs font-bold text-gray-500 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Contact Form Lined Pad */}
      <div className={`bg-white rounded-[3rem] ${brutalBorder} ${brutalShadow} relative overflow-hidden`}>
        {/* Notebook Wire Spiral Top Accent */}
        <div className="h-6 bg-[#FFE5D9] border-b-2 border-[#1E1E1E] flex justify-around items-center px-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-white border border-[#1E1E1E] rounded-full" />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black uppercase tracking-tight">Write to Teacher</h3>
            <p className="text-xs font-bold text-gray-400 mt-1">Lodge a support request directly to your teacher</p>
          </div>

          <div className="space-y-2">
            <label className="block font-black uppercase text-[10px] text-gray-400">Select Teacher</label>
            <select
              value={formData.teacher_id}
              onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
              className="w-full p-4 rounded-xl bg-gray-50 border-2 border-[#1E1E1E] font-bold text-xs focus:bg-white focus:outline-none"
              required
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
              ))}
              {teachers.length === 0 && (
                <option value="1">Teacher (Default)</option>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-black uppercase text-[10px] text-gray-400">Subject Summary</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Can't download science sheet!"
              className={`w-full p-4 rounded-xl bg-gray-50 border-2 border-[#1E1E1E] font-bold text-xs focus:bg-white focus:outline-none`}
              required
            />
          </div>

          <div className="space-y-2 relative">
            <label className="block font-black uppercase text-[10px] text-gray-400">Full Details</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Explain exactly what happened, and we will fix it..."
              className={`w-full p-4 pl-10 rounded-xl bg-gray-50 border-2 border-[#1E1E1E] font-bold text-xs focus:bg-white focus:outline-none resize-none`}
              required
            />
            {/* Lined paper margin line */}
            <div className="absolute left-6 top-7 bottom-3 w-0.5 bg-red-400/20" />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl bg-[#FFCCF9] ${brutalBorder} shadow-[4px_4px_0px_0px_#1E1E1E] ${brutalHover} font-black text-xs uppercase disabled:opacity-50`}
          >
            <span className="flex items-center justify-center gap-2">
              <Send size={16} />
              {isSubmitting ? 'Sending Request...' : 'Send Help Request'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsView({ auth, data, showToast }) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <div className={`bg-white p-8 rounded-[3rem] border-[4px] border-[#1E1E1E] shadow-[12px_12px_0px_0px_#1E1E1E]`}>
          <h3 className="text-2xl font-black uppercase mb-8">Profile Settings</h3>
          <div className="space-y-8">
             <div className="flex flex-col items-center pb-8 border-b-2 border-[#1E1E1E]/5">
                <div className="relative group">
                   <div className={`w-32 h-32 rounded-full border-[4px] border-[#1E1E1E] bg-[#E9D5FF] overflow-hidden ${brutalShadow}`}>
                      <img src={getAvatarUrl(data.student)} alt="avatar" />
                   </div>
                   <button className={`absolute bottom-0 right-0 p-2 bg-white rounded-full border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E] hover:translate-y-1 transition-all`}>
                      <Camera size={20} />
                   </button>
                </div>
                <h4 className="mt-4 text-2xl font-black">{auth.user.name}</h4>
                <p className="font-bold text-gray-500">{auth.user.email}</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block font-black uppercase text-[10px] mb-2">Display Name</label>
                   <input 
                    type="text" 
                    defaultValue={auth.user.name}
                    className={`w-full p-3 rounded-xl bg-gray-50 border-[3px] border-[#1E1E1E] font-bold`}
                   />
                </div>
                <div>
                   <label className="block font-black uppercase text-[10px] mb-2">My Grade</label>
                   <input 
                    type="text" 
                    readOnly
                    value={data.student?.grade || 'Grade 4'}
                    className={`w-full p-3 rounded-xl bg-gray-100 border-[3px] border-[#1E1E1E] font-bold text-gray-400`}
                   />
                </div>
             </div>

             <div className="space-y-4">
                <h5 className="font-black text-sm uppercase tracking-widest border-b-2 border-[#1E1E1E] pb-1 inline-block">Notifications</h5>
                {[
                  { label: 'New Assignments', enabled: true },
                  { label: 'Chat Messages', enabled: true },
                  { label: 'Teacher Feedback', enabled: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <span className="font-bold text-sm">{item.label}</span>
                     <div className={`w-12 h-6 rounded-full border-2 border-[#1E1E1E] bg-[#D1F2EB] relative cursor-pointer`}>
                        <div className="absolute right-1 top-1 w-3 h-3 bg-[#1E1E1E] rounded-full"></div>
                     </div>
                  </div>
                ))}
             </div>

             <button 
              onClick={() => showToast("Settings updated!")}
              className={`w-full py-4 rounded-xl bg-[#1E1E1E] text-white font-black uppercase  shadow-[4px_4px_0px_0px_#A0E7E5] hover:translate-y-1 transition-all`}
             >
                Save Preferences
             </button>
          </div>
       </div>
    </div>
  );
}

function CourseView({ data, showToast }) {
  const student = data.student || {};
  const batch = student.batch || {};
  const teacher = student.teacher || batch.teacher || {};
  const curriculum = data.curriculum || {
    title: 'Basic Boost Plan',
    description: 'Start speaking English from Day 1 in a group setting. Best for students, beginners, and budget learners.',
    syllabus: ['Sentence building & basic grammar', 'Confidence drills & group interactions', 'Open mic & interview activities', 'Weekly instructor feedback'],
    objectives: ['Introduce yourself and describe your day', 'Build simple sentences with basic grammar', 'Engage confidently in group conversations'],
    outcomes: ['Speak simple English fluently', 'Describe daily activities and plans', 'Answer basic interview questions'],
    certification: 'Bolo Academy Basic Boost Certificate',
    duration: '1 Month'
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Course Header Hero */}
      <div className={`p-8 lg:p-10 rounded-[3rem] bg-[#FFD1DC] ${brutalBorder} ${brutalShadow} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -z-0 opacity-50 translate-x-20 -translate-y-20"></div>
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className={`inline-block px-4 py-1 rounded-full bg-white ${brutalBorder} font-black text-xs uppercase tracking-widest`}>
            🎓 Currently Enrolled Plan
          </div>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight uppercase">
            {student.package_name || "Basic Boost Plan"}
          </h2>
          <p className="text-lg lg:text-xl font-bold text-gray-700 leading-relaxed">
            {curriculum.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <span className={`px-4 py-2 bg-white ${brutalBorder} rounded-xl font-black text-xs uppercase tracking-wider`}>
              ⏱️ Duration: {curriculum.duration}
            </span>
            <span className={`px-4 py-2 bg-[#D1F2EB] ${brutalBorder} rounded-xl font-black text-xs uppercase tracking-wider`}>
              📜 Certification: {curriculum.certification}
            </span>
            <span className={`px-4 py-2 bg-[#FEF08A] ${brutalBorder} rounded-xl font-black text-xs uppercase tracking-wider`}>
              🎒 Batch: {batch.name || "Allocating soon"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Objective & Outcomes */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-[2.5rem] bg-[#FEF08A] ${brutalBorder} ${brutalShadow} space-y-4`}>
              <h3 className="text-xl font-black uppercase flex items-center gap-2">
                🎯 Core Objectives
              </h3>
              <ul className="space-y-2.5 font-bold text-sm text-gray-700 font-sans">
                {curriculum.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 font-black">✔</span> {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-6 rounded-[2.5rem] bg-[#D1F2EB] ${brutalBorder} ${brutalShadow} space-y-4`}>
              <h3 className="text-xl font-black uppercase flex items-center gap-2">
                🚀 Program Outcomes
              </h3>
              <ul className="space-y-2.5 font-bold text-sm text-gray-700 font-sans">
                {curriculum.outcomes?.map((out, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-pink-600 font-black">★</span> {out}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Syllabus Roadmap */}
          <div className={`p-8 rounded-[2.5rem] bg-white ${brutalBorder} ${brutalShadow} space-y-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black uppercase">Syllabus Roadmap</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">Track your program milestones and speaking lessons</p>
              </div>
              <span className={`px-4 py-1.5 bg-[#E9D5FF] ${brutalBorder} rounded-xl font-black text-xs uppercase`}>
                {curriculum.syllabus?.length || 4} Steps
              </span>
            </div>

            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[3px] before:bg-[#1E1E1E]">
              {curriculum.syllabus?.map((step, idx) => {
                const isCompleted = student.progress > (idx / curriculum.syllabus.length) * 100;
                return (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-[#1E1E1E] flex items-center justify-center font-black text-[10px] transition-colors ${
                      isCompleted ? 'bg-[#34D399] text-white' : 'bg-white text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className={`p-5 rounded-2xl border-2 border-[#1E1E1E] transition-all hover:bg-gray-50 flex items-center justify-between ${
                      isCompleted ? 'bg-[#34D399]/5' : 'bg-white'
                    }`}>
                      <div>
                        <h4 className="font-black text-base">{step}</h4>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">Interactive speaking laboratory & correction drill</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg border border-green-300 font-black text-xs">
                            COMPLETED ✅
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg border border-gray-300 font-bold text-xs">
                            UPCOMING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assigned Tutor & Schedule Column */}
        <div className="space-y-8">
          {/* Assigned Teacher Card */}
          <div className={`p-8 rounded-[2.5rem] bg-white ${brutalBorder} ${brutalShadow} text-center space-y-6`}>
            <h3 className="text-xl font-black uppercase">My Assigned Tutor</h3>
            
            <div className="flex flex-col items-center">
              <div className={`w-32 h-32 rounded-full bg-[#E9D5FF] ${brutalBorder} overflow-hidden shadow-[6px_6px_0px_0px_#1E1E1E] mb-4`}>
                <img 
                  src={teacher.avatar ? (teacher.avatar.startsWith('http') || teacher.avatar.startsWith('/') ? teacher.avatar : `https://api.dicebear.com/7.x/thumbs/svg?seed=${teacher.name || 'Somya'}&backgroundColor=ffffff`) : "https://api.dicebear.com/7.x/thumbs/svg?seed=Teacher"} 
                  className="w-full h-full object-cover" 
                  alt="Tutor" 
                />
              </div>
              <h4 className="text-2xl font-black uppercase">{teacher.name || "Somya Kashyap"}</h4>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mt-1">
                {teacher.subject_specialization || "Lead English Coach"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border-2 border-dashed border-[#1E1E1E] text-left text-xs font-bold space-y-2">
              <p className="text-gray-500">📧 Email: <span className="font-black text-gray-800">{teacher.email || "somya@bolo.com"}</span></p>
              <p className="text-gray-500">📜 Specialization: <span className="font-black text-gray-800">{teacher.curriculum_expertise || "Fluency & Conversation Flow"}</span></p>
              {teacher.bio && (
                <p className="text-gray-500 italic mt-2 leading-relaxed">"{teacher.bio}"</p>
              )}
            </div>

            {teacher.meeting_link && (
              <a 
                href={teacher.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => showToast("Opening emergency meet link...")}
                className={`w-full py-4 bg-[#A0E7E5] ${brutalBorder} ${brutalShadowSm} ${brutalHover} font-black uppercase text-sm flex items-center justify-center gap-2`}
              >
                <Video size={18} /> Join Coach's Classroom
              </a>
            )}
          </div>

          {/* Batch Details & Schedule */}
          <div className={`p-8 rounded-[2.5rem] bg-[#B4F8C8] ${brutalBorder} ${brutalShadow} space-y-6`}>
            <h3 className="text-xl font-black uppercase">Batch Timings</h3>
            
            <div className="space-y-4 font-bold text-sm">
              <div className="p-4 bg-white rounded-2xl border-2 border-[#1E1E1E] flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase leading-none mb-1">Days & Times</p>
                  <p className="font-black text-sm">{batch.schedule_details || "Allocating Timetable Soon"}</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border-2 border-[#1E1E1E] flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase leading-none mb-1">Batch Room</p>
                  <p className="font-black text-sm">{batch.name || "Not allotted yet"}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-[#1E1E1E]/20">
              <p className="text-[10px] text-gray-500 font-bold italic leading-snug">
                * Note: Your class link will activate exactly 10 minutes prior to the daily times. Please prepare your homework in advance!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
