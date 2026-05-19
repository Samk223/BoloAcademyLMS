"use client";

import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { createPortal } from 'react-dom';
import pptxgen from "pptxgenjs";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, Users, BookOpen, Palette, Settings, Search, 
  Lightbulb, Presentation, Calendar, Star, Send, Heart, Sparkles,
  ChevronLeft, ChevronRight, ChevronDown, PenTool, Video, CheckCircle2,
  Plus, CalendarX, RefreshCcw, Play, Clock, MessageCircle, StickyNote,
  MessageSquare, PhoneCall, Megaphone, LifeBuoy, UserCheck, BarChart,
  X, Filter, Upload, Check, XCircle, FileText, Award, Eye,
  Wand2, Book, MonitorPlay, CheckSquare, ThumbsUp, ThumbsDown, AlertCircle, Download,
  User, Bell, Link as LinkIcon, Smile, Sliders, Camera, Globe, Forward, Paperclip, Mail,
  LogOut
} from "lucide-react";
import ChatHubView from "@/Components/Teacher/ChatHubView";

// Reusable brutalist classes
const brutalBorder = "border-[3px] border-[#1E1E1E]";
const brutalShadow = "shadow-[4px_4px_0px_0px_#1E1E1E]";
const brutalShadowSm = "shadow-[3px_3px_0px_0px_#1E1E1E]";
const brutalHover = "hover:translate-y-[3px] hover:translate-x-[3px] hover:shadow-none transition-all duration-200";

const getAvatarUrl = (p) => {
  if (p?.avatar && (p.avatar.startsWith('/') || p.avatar.startsWith('http') || p.avatar.startsWith('data:'))) {
    return p.avatar;
  }
  const seed = p?.name || "Teacher";
  const genderSeed = p?.gender === 'Male' ? '-man' : (p?.gender === 'Female' ? '-woman' : '');
  
  // Extract hex color without the hash, default to the default accent color if not found
  let shapeColor = "E9D5FF"; 
  if (p?.accent_color) {
    shapeColor = p.accent_color.replace('#', '');
  }
  
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}${genderSeed}&backgroundColor=ffffff&shapeColor=${shapeColor}`;
};

export default function TeacherDashboard({ auth, initialData }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('teacher_active_view') || "dashboard";
  });

  const getSpontaneousLiveHref = () => {
    const randomId = "BOLO-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    return `/teacher/live?room=${randomId}`;
  };
  const [creations, setCreations] = useState(initialData?.creations || []);
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    localStorage.setItem('teacher_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    if (!initialData) {
      fetchCreations();
    }
  }, [initialData]);

  useEffect(() => {
    const handleViewChange = (e) => {
      setActiveView(e.detail);
    };
    window.addEventListener('change-view', handleViewChange);
    return () => window.removeEventListener('change-view', handleViewChange);
  }, []);

  const [toasts, setToasts] = useState([]);
  const [profile, setProfile] = useState({
    name: (auth.user.name && auth.user.name !== "Somya Kashyap") ? auth.user.name : `Teacher_${auth.user.id}`,
    email: auth.user.email || "",
    bio: (auth.user.bio && !auth.user.bio.includes("Loves teaching grammar")) ? auth.user.bio : "",
    avatar: auth.user.avatar || "",
    ai_tone: auth.user.ai_tone || "Playful",
    ai_level: auth.user.ai_level || "Intermediate (B1-B2)",
    meeting_link: auth.user.meeting_link || `https://meet.google.com/bolo-${auth.user.id}-${Math.random().toString(36).substring(7)}`,
    accent_color: auth.user.accent_color || "#E9D5FF",
    gender: auth.user.gender || "", // No default gender bias
    notifications_config: auth.user.notifications_config || {
      student_messages: true,
      assignment_submissions: true,
      admin_updates: true,
      daily_schedule: false
    }
  });



  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const saveSettings = async (formData) => {
    try {
      const response = await axios.post('/api/teacher/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, ...response.data }));
      showToast("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings", error);
      showToast("Failed to save settings", "error");
    }
  };

  const fetchCreations = async () => {
    try {
      const response = await axios.get('/api/creations');
      setCreations(response.data);
    } catch (error) {
      console.error("Failed to fetch creations:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await axios.delete(`/api/creations/${deletingId}`);
      fetchCreations(); // Refresh list without full reload if possible
      setDeletingId(null);
    } catch (error) {
      console.error("Failed to delete creation", error);
    }
  };

  const downloadPPTX = () => {
    if (!selectedCreation) return;
    let slidesData = [];
    try {
      const cleaned = selectedCreation.content.replace(/```json/gi, '').replace(/```/g, '').trim();
      slidesData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse presentation JSON", e);
      alert("This presentation was created in an older format and cannot be exported as PPTX.");
      return;
    }

    const pres = new pptxgen();
    pres.author = "Bolo Academy";
    pres.company = "Bolo Academy";
    pres.subject = selectedCreation.title;
    pres.title = selectedCreation.title;

    pres.layout = 'LAYOUT_16x9';

    // Define Title Master
    pres.defineSlideMaster({
      title: "BOLO_TITLE_MASTER",
      background: { color: "FFF8E7" },
      objects: [
        { rect: { x: "5%", y: "5%", w: "90%", h: "90%", fill: { color: "FFFFFF" }, line: { color: "1E1E1E", width: 4 } } },
        { rect: { x: "6%", y: "6%", w: "90%", h: "90%", fill: { color: "1E1E1E" } } }, 
        { rect: { x: "5%", y: "5%", w: "90%", h: "90%", fill: { color: "FFFFFF" }, line: { color: "1E1E1E", width: 4 } } }, 
        { text: { text: "✨", options: { x: "82%", y: "8%", w: "10%", h: "10%", fontSize: 40 } } },
      ],
    });

    // Define Content Master
    pres.defineSlideMaster({
      title: "BOLO_CONTENT_MASTER",
      background: { color: "FFF8E7" },
      objects: [
        { rect: { x: 0, y: 0, w: "100%", h: "20%", fill: { color: "E9D5FF" }, line: { color: "1E1E1E", width: 3 } } },
        { rect: { x: 0, y: "88%", w: "100%", h: "12%", fill: { color: "1E1E1E" } } },
        { text: { text: "Bolo Academy", options: { x: "4%", y: "89%", w: "30%", h: "10%", color: "FFFFFF", fontSize: 14, bold: true, fontFace: "Arial", valign: "middle" } } },
      ],
    });

    slidesData.forEach((slide, index) => {
      if (slide.type === "title") {
        const slideObj = pres.addSlide({ masterName: "BOLO_TITLE_MASTER" });
        slideObj.addText(slide.title, { x: "10%", y: "25%", w: "80%", h: "35%", fontSize: 36, bold: true, color: "1E1E1E", align: "center", fontFace: "Arial", valign: "bottom" });
        if (slide.subtitle) {
          slideObj.addText(slide.subtitle, { x: "10%", y: "60%", w: "80%", h: "20%", fontSize: 20, color: "6B7280", align: "center", fontFace: "Arial", valign: "top" });
        }
        if (slide.speakerNotes) {
          slideObj.addNotes(slide.speakerNotes);
        }
      } else {
        const slideObj = pres.addSlide({ masterName: "BOLO_CONTENT_MASTER" });
        slideObj.addText(`Slide ${index + 1}`, { x: "66%", y: "89%", w: "30%", h: "10%", color: "FFFFFF", fontSize: 14, bold: true, align: "right", fontFace: "Arial", valign: "middle" });
        
        slideObj.addText(slide.title, { x: "4%", y: "2%", w: "92%", h: "16%", fontSize: 24, bold: true, color: "1E1E1E", fontFace: "Arial", align: "left", valign: "middle", autoFit: true });
        
        slideObj.addShape(pres.ShapeType.rect, { x: "6%", y: "27%", w: "88%", h: "56%", fill: { color: "1E1E1E" } });
        slideObj.addShape(pres.ShapeType.rect, { x: "5%", y: "25%", w: "88%", h: "56%", fill: { color: "FFFFFF" }, line: { color: "1E1E1E", width: 3 } });
        
        if (slide.content) {
          const contentArray = Array.isArray(slide.content) ? slide.content : [slide.content];
          slideObj.addText(
            contentArray.map(c => ({ text: c, options: { bullet: { type: 'number' } } })),
            { x: "7%", y: "27%", w: "84%", h: "52%", fontSize: 14, color: "1E1E1E", valign: "top", fontFace: "Arial", lineSpacing: 18, autoFit: true }
          );
        }
        if (slide.speakerNotes) {
          slideObj.addNotes(slide.speakerNotes);
        }
      }
    });

    pres.writeFile({ fileName: `${selectedCreation.title.replace(/[^a-z0-9]/gi, '_')}.pptx` });
  };

  const downloadPDF = () => {
    if (!selectedCreation) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = selectedCreation.content;
    const title = selectedCreation.title;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.10/dist/typography.min.css">
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
            @page { size: A4 portrait; margin: 0; }
            body { 
              font-family: 'Outfit', sans-serif; 
              padding: 0; 
              margin: 0; 
              color: #1E1E1E;
              background: white;
            }
            .paper {
              width: 210mm;
              min-height: 297mm;
              padding: 25mm;
              margin: 0 auto;
              background: white;
              box-sizing: border-box;
            }
            .header-cute {
              border-bottom: 4px solid #1E1E1E;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              align-items: center;
              gap: 20px;
            }
            .logo-circle {
              width: 60px;
              height: 60px;
              background: #E9D5FF;
              border: 3px solid #1E1E1E;
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 30px;
            }
            h1 { font-size: 32pt; font-weight: 900; margin: 0; line-height: 1.1; color: #1E1E1E; }
            .content { font-size: 11.5pt; line-height: 1.7; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 3px solid #F3F4F6; font-size: 10pt; color: #9CA3AF; font-weight: 700; }
            
            /* Markdown Styles */
            .prose h1, .prose h2, .prose h3 { font-weight: 900; color: #1E1E1E; margin-top: 1.5em; }
            .prose p { margin-bottom: 1em; }
            .prose strong { color: #1E1E1E; font-weight: 800; }
            
            @media print {
              body { background: none; }
              .paper { margin: 0; border: none; width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="paper">
            <div class="header-cute">
              <div class="logo-circle">🦉</div>
              <div>
                <h1>${title}</h1>
                <p style="margin: 5px 0 0 0; font-weight: 700; color: #6B7280; font-size: 11pt;">Bolo Academy Assignment Hub</p>
              </div>
            </div>
            <div id="content" class="content prose prose-lg max-w-none">
              <!-- Content will be injected here -->
            </div>
            <div class="footer">
              <div style="display: flex; justify-content: space-between;">
                <span>© ${new Date().getFullYear()} Bolo Academy</span>
                <span>Generated on ${new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <script>
            document.getElementById('content').innerHTML = marked.parse(\`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
            setTimeout(() => {
              window.print();
            }, 800);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadQuizPDF = (showAnswers) => {
    if (!selectedCreation) return;
    
    let quizData = null;
    try {
      const cleaned = selectedCreation.content.replace(/```json/gi, '').replace(/```/g, '').trim();
      quizData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse quiz JSON", e);
      alert("There was an issue parsing the quiz data.");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = quizData.title || "Quiz";
    
    let questionsHtml = quizData.questions?.map((q, idx) => `
      <div class="question-card">
        <div class="question-header">
          <div class="q-number">${idx + 1}</div>
          <h3>${q.question}</h3>
        </div>
        ${q.options && q.options.length > 0 ? `
          <div class="options-grid">
            ${q.options.map(opt => `<div class="option-item">${opt}</div>`).join('')}
          </div>
        ` : ''}
        ${showAnswers ? `
          <div class="answer-key"><strong>Answer:</strong> ${q.answer || 'N/A'}</div>
        ` : ''}
      </div>
    `).join('') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
            @page { size: A4 portrait; margin: 0; }
            body { 
              font-family: 'Outfit', sans-serif; 
              padding: 0; 
              margin: 0; 
              color: #1E1E1E;
              background: white;
            }
            .paper {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin: 0 auto;
              background: white;
              box-sizing: border-box;
            }
            .header-cute {
              border-bottom: 4px solid #1E1E1E;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              align-items: center;
              gap: 20px;
            }
            .logo-circle {
              width: 60px;
              height: 60px;
              background: #E9D5FF;
              border: 3px solid #1E1E1E;
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 30px;
            }
            h1 { font-size: 32pt; font-weight: 900; margin: 0; line-height: 1.1; color: #1E1E1E; }
            .instructions { font-size: 12pt; font-weight: 700; color: #4B5563; margin-bottom: 30px; padding: 15px; background: #F9FAFB; border: 2px solid #1E1E1E; border-radius: 10px; }
            .question-card { margin-bottom: 25px; padding: 20px; border: 3px solid #1E1E1E; border-radius: 15px; background: white; box-shadow: 4px 4px 0px 0px #1E1E1E; page-break-inside: avoid; }
            .question-header { display: flex; gap: 15px; align-items: flex-start; margin-bottom: 15px; }
            .q-number { width: 35px; height: 35px; flex-shrink: 0; background: #D1F2EB; border: 2px solid #1E1E1E; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14pt; }
            h3 { font-size: 14pt; font-weight: 800; margin: 4px 0 0 0; line-height: 1.4; }
            .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-left: 50px; }
            .option-item { padding: 10px 15px; background: #F9FAFB; border: 2px solid #1E1E1E; border-radius: 10px; font-weight: 700; font-size: 11pt; }
            .answer-key { margin-top: 15px; margin-left: 50px; padding: 10px 15px; background: #FEF3C7; border: 2px dashed #1E1E1E; border-radius: 10px; font-weight: 800; font-size: 12pt; color: #92400E; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 3px solid #F3F4F6; font-size: 10pt; color: #9CA3AF; font-weight: 700; text-align: center; }
            
            @media print {
              body { background: none; }
              .paper { margin: 0; border: none; width: 100%; }
              .question-card { box-shadow: none; border-width: 2px; }
            }
          </style>
        </head>
        <body>
          <div class="paper">
            <div class="header-cute">
              <div class="logo-circle">📝</div>
              <div>
                <h1>${title}</h1>
                <p style="margin: 5px 0 0 0; font-weight: 700; color: #6B7280; font-size: 11pt;">Bolo Academy ${showAnswers ? '(Teacher Copy)' : '(Student Copy)'}</p>
              </div>
            </div>
            
            ${quizData.instructions ? `<div class="instructions">${quizData.instructions}</div>` : ''}
            
            <div class="questions-container">
              ${questionsHtml}
            </div>
            
            <div class="footer">
              <div style="display: flex; justify-content: space-between;">
                <span>© ${new Date().getFullYear()} Bolo Academy</span>
                <span>Generated on ${new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 800);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const userName = auth?.user?.name || "Sarah";

  return (
    <>
      <div className="flex h-screen bg-[#FFF8E7] font-sans overflow-hidden text-[#1E1E1E] selection:bg-purple-200">
        <Head title="Teacher Dashboard" />
        
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isCollapsed ? 100 : 240 }}
          style={{ backgroundColor: profile.accent_color }}
          className={`${brutalBorder} border-y-0 border-l-0 flex flex-col py-8 relative z-30 flex-shrink-0 transition-all duration-300`}
        >
          {/* Wavy border effect - moved outside scrollable container */}
          <div className="absolute top-0 -right-[20px] w-[20px] h-full pointer-events-none z-10">
             <svg width="20" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
               <defs>
                 <pattern id="wave" x="0" y="0" width="20" height="60" patternUnits="userSpaceOnUse">
                   <path d="M0,0 C20,15 20,45 0,60" fill={profile.accent_color} stroke="#1E1E1E" strokeWidth="4" />
                 </pattern>
               </defs>
               <rect x="0" y="0" width="20" height="100%" fill="url(#wave)" />
             </svg>
          </div>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-8 -right-4 w-8 h-8 bg-white rounded-full ${brutalBorder} flex items-center justify-center z-50 hover:bg-gray-100 cursor-pointer`}
          >
            {isCollapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
          </button>

          {/* Internal container - conditional overflow to allow scrolling when expanded, but prevent tooltip clipping when collapsed */}
          <div className={`flex-1 flex flex-col items-center w-full pb-10 scrollbar-hide ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
            <div className="text-center mb-10 px-4 flex-shrink-0 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full bg-white mb-4 ${brutalBorder} ${brutalShadowSm} overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
                <img src={getAvatarUrl(profile)} className="w-full h-full object-cover" alt="Profile" />
              </div>
              <h1 className={`font-black leading-tight transition-all duration-300 ${isCollapsed ? 'text-xl' : 'text-3xl'}`}>
                Bolo<br/>Academy
              </h1>
              {!isCollapsed && <p className="font-bold text-xs mt-2 opacity-70 uppercase tracking-widest">{profile.name}</p>}
            </div>

            <div className="flex flex-col gap-5 w-full px-5 pb-20">
              <SidebarItem icon={<Home size={28} strokeWidth={2.5} />} label="Dashboard" active={activeView === "dashboard"} collapsed={isCollapsed} onClick={() => setActiveView("dashboard")} />
              <SidebarItem icon={<BookOpen size={28} strokeWidth={2.5} />} label="Classes" active={activeView === "classes"} collapsed={isCollapsed} onClick={() => setActiveView("classes")} />
              <SidebarItem icon={<Users size={28} strokeWidth={2.5} />} label="Students" active={activeView === "students"} collapsed={isCollapsed} onClick={() => setActiveView("students")} />
              <SidebarItem icon={<MessageCircle size={28} strokeWidth={2.5} />} label="Chat Hub" active={activeView === "chat"} collapsed={isCollapsed} onClick={() => setActiveView("chat")} />
              <SidebarItem icon={<Palette size={28} strokeWidth={2.5} />} label="Creations" active={activeView === "creations"} collapsed={isCollapsed} onClick={() => setActiveView("creations")} />
              <SidebarItem icon={<Settings size={28} strokeWidth={2.5} />} label="Settings" active={activeView === "settings"} collapsed={isCollapsed} onClick={() => setActiveView("settings")} />
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden p-6 lg:p-10 relative">
          <Sparkles className="absolute top-12 right-[20%] text-yellow-400" size={40} strokeWidth={2} />
          <Send className="absolute top-40 right-12 text-purple-400 rotate-45" size={32} strokeWidth={2} />
          <Heart className="absolute top-1/3 left-[10%] text-pink-400 -rotate-12" size={28} strokeWidth={2.5} />
          <Star className="absolute bottom-20 right-[15%] text-blue-400 rotate-12" size={24} strokeWidth={2.5} />

          <div className="flex-1 flex flex-col min-h-0 relative z-10">
            {activeView === "dashboard" && <div className="flex-1 overflow-y-auto scrollbar-hide pb-10"><DashboardView userName={profile.name} avatar={getAvatarUrl(profile)} showToast={showToast} initialData={initialData} setActiveView={setActiveView} /></div>}
            {activeView === "classes" && <div className="flex-1 overflow-y-auto scrollbar-hide pb-10"><ClassesView userName={profile.name} showToast={showToast} initialData={initialData} /></div>}
            {activeView === "students" && <div className="flex-1 overflow-y-auto scrollbar-hide pb-10"><StudentsView userName={profile.name} showToast={showToast} initialData={initialData} /></div>}
            {activeView === "chat" && <div className="flex-1 flex flex-col"><ChatHubView showToast={showToast} /></div>}
            {activeView === "creations" && <div className="flex-1 overflow-y-auto scrollbar-hide pb-10"><CreationsView userName={profile.name} creations={creations} onPreview={setSelectedCreation} onDeleteInitiate={setDeletingId} showToast={showToast} getSpontaneousLiveHref={getSpontaneousLiveHref} /></div>}
            {activeView === "settings" && <div className="flex-1 overflow-y-auto scrollbar-hide pb-10"><SettingsView profile={profile} setProfile={setProfile} onSave={saveSettings} showToast={showToast} /></div>}
          </div>
        </main>
      </div>

      {/* Global Preview Modal */}
      <AnimatePresence>
        {selectedCreation && (
          <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999999] flex items-center justify-center p-4 lg:p-12 bg-[#E9D5FF]/60 backdrop-blur-md">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-3xl h-[80vh] bg-white rounded-[3rem] border-[4px] border-[#1E1E1E] shadow-[16px_16px_0px_0px_#1E1E1E] flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b-[4px] border-[#1E1E1E] flex items-center justify-between bg-[#FFF8E7]">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1E1E1E] flex items-center justify-center shadow-[4px_4px_0px_0px_#1E1E1E]">
                    {selectedCreation.type === 'assignment' ? <FileText className="text-purple-600" size={28} /> : selectedCreation.type === 'quiz' ? <CheckSquare className="text-yellow-600" size={28} /> : <MonitorPlay className="text-blue-600" size={28} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black truncate max-w-md text-[#1E1E1E]">{selectedCreation.title}</h3>
                    <p className="text-base font-bold text-gray-500 flex items-center gap-2 mt-1">
                       <Calendar size={16} /> {new Date(selectedCreation.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCreation(null)} 
                  className={`w-16 h-16 bg-white rounded-full ${brutalBorder} ${brutalShadowSm} flex items-center justify-center ${brutalHover} transition-transform active:scale-95`}
                >
                  <X size={32} strokeWidth={3} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-white custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                  {selectedCreation.type === 'presentation' ? (
                    (() => {
                      try {
                        const cleaned = selectedCreation.content.replace(/```json/gi, '').replace(/```/g, '').trim();
                        const slides = JSON.parse(cleaned);
                        return (
                          <div className="flex flex-col gap-8">
                            {slides.map((slide, idx) => (
                              <div key={idx} className={`w-full aspect-[16/9] bg-[#FFF8E7] rounded-2xl ${brutalBorder} ${brutalShadowSm} overflow-hidden relative flex flex-col`}>
                                {slide.type === 'title' ? (
                                  <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center relative bg-white m-4 md:m-6 border-[3px] border-[#1E1E1E] shadow-[6px_6px_0px_0px_#1E1E1E]">
                                    <span className="absolute top-4 right-6 text-3xl">✨</span>
                                    <h2 className="text-3xl md:text-4xl font-black mb-4 text-[#1E1E1E] text-center line-clamp-3">{slide.title}</h2>
                                    <p className="text-lg md:text-xl font-bold text-gray-500 text-center line-clamp-2">{slide.subtitle}</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="h-4 md:h-6 bg-[#E9D5FF] w-full border-b-[3px] border-[#1E1E1E]"></div>
                                    <div className="flex-1 p-6 md:p-8 flex flex-col min-h-0 h-full">
                                      <h2 className="text-2xl md:text-3xl font-black mb-4 text-[#1E1E1E] line-clamp-2 shrink-0">{slide.title}</h2>
                                      <div className="flex-1 w-full bg-white border-[3px] border-[#1E1E1E] shadow-[6px_6px_0px_0px_#1E1E1E] p-4 md:p-6 overflow-hidden flex flex-col min-h-[100px]">
                                        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 h-full">
                                          {Array.isArray(slide.content) ? (
                                            <ul className="list-decimal pl-6 space-y-2">
                                              {slide.content.map((c, i) => (
                                                <li key={i} className="text-base md:text-lg font-bold text-[#1E1E1E]">{c}</li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <p className="text-base md:text-lg font-bold text-[#1E1E1E] whitespace-pre-wrap">{slide.content}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="h-10 bg-[#1E1E1E] w-full flex items-center justify-between px-6 shrink-0">
                                      <span className="text-white font-bold text-sm uppercase tracking-wider">Bolo Academy</span>
                                      <span className="text-white font-bold text-sm">Slide {idx + 1}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      } catch(e) {
                        return (
                          <div className="prose prose-lg prose-slate max-w-none">
                            <ReactMarkdown>{selectedCreation.content}</ReactMarkdown>
                          </div>
                        );
                      }
                    })()
                  ) : selectedCreation.type === 'quiz' || selectedCreation.type === 'quizzes' ? (
                    (() => {
                      try {
                        const cleaned = selectedCreation.content.replace(/```json/gi, '').replace(/```/g, '').trim();
                        const quizData = JSON.parse(cleaned);
                        return (
                          <div className="flex flex-col gap-6 w-full">
                            <div className={`bg-[#E9D5FF] p-8 rounded-2xl ${brutalBorder} ${brutalShadow} mb-4`}>
                              <h2 className="text-4xl font-black mb-4 text-[#1E1E1E]">{quizData.title}</h2>
                              {quizData.instructions && (
                                <div className="bg-white p-4 rounded-xl border-2 border-[#1E1E1E] font-bold text-gray-700">
                                  {quizData.instructions}
                                </div>
                              )}
                            </div>
                            
                            {quizData.questions?.map((q, idx) => (
                              <div key={idx} className={`bg-white rounded-2xl p-6 ${brutalBorder} shadow-[6px_6px_0px_0px_#1E1E1E]`}>
                                <div className="flex items-start gap-4 mb-6">
                                  <div className="w-10 h-10 shrink-0 bg-[#D1F2EB] border-[3px] border-[#1E1E1E] rounded-full flex items-center justify-center font-black text-lg text-[#1E1E1E]">
                                    {idx + 1}
                                  </div>
                                  <h3 className="text-xl font-bold mt-1 leading-snug text-[#1E1E1E]">{q.question}</h3>
                                </div>
                                
                                {q.options && q.options.length > 0 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
                                    {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className={`p-4 bg-gray-50 border-2 border-[#1E1E1E] rounded-xl font-bold text-[#1E1E1E] hover:bg-purple-50 transition-colors`}>
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      } catch(e) {
                        return (
                          <div className="prose prose-lg prose-slate max-w-none">
                            <ReactMarkdown>{selectedCreation.content}</ReactMarkdown>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <div className="prose prose-lg prose-slate max-w-none">
                      <ReactMarkdown>{selectedCreation.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 border-t-[4px] border-[#1E1E1E] flex gap-4 md:gap-8 bg-gray-50">
                {selectedCreation.type === 'quiz' || selectedCreation.type === 'quizzes' ? (
                  <>
                    <button onClick={() => downloadQuizPDF(false)} className={`flex-1 py-4 md:py-6 bg-white rounded-2xl font-black md:text-xl flex items-center justify-center gap-2 md:gap-4 ${brutalBorder} ${brutalShadow} ${brutalHover} transition-all`}>
                      <Download size={24} strokeWidth={3} /> Student PDF
                    </button>
                    <button onClick={() => downloadQuizPDF(true)} className={`flex-1 py-4 md:py-6 bg-[#E9D5FF] rounded-2xl font-black md:text-xl flex items-center justify-center gap-2 md:gap-4 ${brutalBorder} ${brutalShadow} ${brutalHover} transition-all`}>
                      <Download size={24} strokeWidth={3} /> Teacher Key
                    </button>
                  </>
                ) : (
                  <button onClick={selectedCreation.type === 'presentation' ? downloadPPTX : downloadPDF} className={`flex-1 py-6 bg-[#D1F2EB] rounded-2xl font-black text-xl flex items-center justify-center gap-4 ${brutalBorder} ${brutalShadow} ${brutalHover} transition-all`}>
                    <Download size={28} strokeWidth={3} /> Download {selectedCreation.type === 'presentation' ? 'PPTX' : 'PDF'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999999] flex items-center justify-center p-4 bg-[#E9D5FF]/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] border-[4px] border-[#1E1E1E] shadow-[12px_12px_0px_0px_#1E1E1E] p-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 border-[3px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E]">
                <AlertCircle size={40} className="text-red-600" strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black mb-4">Delete Creation?</h3>
              <p className="text-lg font-bold text-gray-500 mb-10 leading-relaxed">
                Are you sure you want to delete this assignment? You won't be able to undo this action later!
              </p>
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setDeletingId(null)}
                  className={`flex-1 py-4 bg-white rounded-2xl font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                >
                  No, Keep it
                </button>
                <button 
                  onClick={handleDelete}
                  className={`flex-1 py-4 bg-[#FCA5A5] rounded-2xl font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover} text-[#1E1E1E]`}
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Container */}
      <div className="fixed bottom-8 right-8 z-[9999999] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.8 }}
              className={`px-6 py-4 rounded-2xl ${brutalBorder} ${brutalShadow} flex items-center gap-3 font-black text-lg pointer-events-auto ${
                toast.type === 'error' ? 'bg-[#FCA5A5]' : 'bg-[#D1F2EB]'
              }`}
            >
              {toast.type === 'error' ? <XCircle size={24} strokeWidth={3} /> : <CheckCircle2 size={24} strokeWidth={3} />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

// --- VIEWS ---

function DashboardView({ userName, avatar, showToast, initialData, setActiveView }) {
  const [activeToolIndex, setActiveToolIndex] = useState(0);
  const [stats, setStats] = useState(initialData?.stats || { teacher_attendance: 0, avg_student_attendance: 0 });
  const [classes, setClasses] = useState(initialData?.classes || []);
  const [students, setStudents] = useState(initialData?.students || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialData?.notifications || []);
  const [batches, setBatches] = useState(initialData?.batches || []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/teacher/dashboard-data');
      const { stats, classes, students, notifications, batches } = response.data;
      setStats(stats);
      setClasses(classes);
      setStudents(students);
      setNotifications(notifications);
      setBatches(batches || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const tools = [
    { icon: <PenTool size={24} />, name: "Assignments", color: "bg-[#E9D5FF]" },
    { icon: <Lightbulb size={24} />, name: "Quizzes", color: "bg-[#D1F2EB]" },
    { icon: <Presentation size={24} />, name: "Presentations", color: "bg-[#FFE5D9]" },
  ];

  useEffect(() => {
    if (!initialData) {
      fetchDashboardData();
    }
    const interval = setInterval(() => {
      setActiveToolIndex((prev) => (prev + 1) % tools.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [initialData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <RefreshCcw className="animate-spin text-purple-600 mb-4" size={48} strokeWidth={3} />
        <p className="text-xl font-black text-gray-400">Loading Dashboard...</p>
      </div>
    );
  }

  const todayClasses = classes.filter(c => {
    const d = new Date(c.scheduled_at);
    return d.toDateString() === new Date().toDateString();
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 relative z-10">
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className={`w-24 h-24 bg-white rounded-full ${brutalBorder} ${brutalShadow} flex items-center justify-center text-5xl overflow-hidden shrink-0`}>
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}&backgroundColor=FFE5D9`} alt="Avatar" className="w-full h-full object-cover" />
            )}
          </div>
          <div><h2 className="text-4xl lg:text-5xl font-black text-[#1E1E1E] mb-1">Welcome</h2><p className="text-xl lg:text-2xl font-bold text-[#1E1E1E]">Welcome Back, {userName}!</p></div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className={`relative w-full lg:w-80 bg-white rounded-full ${brutalBorder} ${brutalShadowSm} flex items-center px-5 py-3 focus-within:shadow-[4px_4px_0px_0px_#1E1E1E] transition-shadow`}>
            <Search size={24} strokeWidth={3} className="text-gray-400 mr-3" /><input type="text" placeholder="Find students/topics" className="bg-transparent border-none outline-none focus:ring-0 w-full font-bold text-lg placeholder:text-gray-400" />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-14 h-14 bg-white rounded-full flex items-center justify-center ${brutalBorder} ${brutalShadowSm} ${brutalHover} relative transition-all`}
            >
              <Bell size={28} strokeWidth={3} />
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1E1E1E]"></div>
            </button>
            
            {createPortal(
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{ position: 'fixed', top: '90px', right: '40px' }}
                    className={`w-96 bg-white rounded-3xl ${brutalBorder} shadow-[8px_8px_0px_0px_#1E1E1E] p-6 z-[9999999] max-h-[500px] overflow-y-auto overflow-x-hidden border-2`}
                  >
                    <div className="flex items-center justify-between mb-6 px-1">
                      <h4 className="font-black text-2xl text-[#1E1E1E]">Notifications</h4>
                      <span className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border-2 border-purple-200 uppercase tracking-wider">
                        {notifications.filter(n => !n.is_read).length} New
                      </span>
                    </div>
                    <div className="space-y-4">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => { markRead(n.id); setShowNotifications(false); }}
                          className={`p-4 rounded-2xl border-2 transition-all flex gap-4 cursor-pointer relative z-[10] ${n.is_read ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#1E1E1E]'}`}
                        >
                          <div className={`w-14 h-14 rounded-2xl border-2 border-[#1E1E1E] flex items-center justify-center shrink-0 ${
                            n.type === 'admin' ? 'bg-[#D1F2EB]' : n.type === 'student' ? 'bg-[#E9D5FF]' : 'bg-[#FEF08A]'
                          }`}>
                            {n.type === 'admin' ? <Book size={24} strokeWidth={3} /> : n.type === 'student' ? <MessageCircle size={24} strokeWidth={3} /> : <Settings size={24} strokeWidth={3} />}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-black text-base mb-1 text-[#1E1E1E]">{n.title}</h5>
                            <p className="font-bold text-sm text-gray-500 leading-snug mb-2">{n.message}</p>
                            <div className="flex items-center gap-2">
                               <Clock size={12} className="text-gray-400" />
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                             <Check size={32} className="text-gray-300" />
                          </div>
                          <p className="font-black text-gray-400">All caught up! ☕</p>
                        </div>
                      )}
                    </div>
                    <button className="w-full mt-8 py-4 bg-[#1E1E1E] text-white rounded-2xl font-black text-base hover:translate-y-1 transition-all active:scale-95 shadow-[4px_4px_0px_0px_#A78BFA]">Clear All</button>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </div>
        </div>
      </header>

      <section className={`bg-white rounded-[2.5rem] p-8 ${brutalBorder} ${brutalShadow} relative overflow-hidden flex flex-col md:flex-row items-center gap-8`}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1E1E1E 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        <div className="flex-1 relative z-10">
          <div className="inline-block px-4 py-1.5 bg-yellow-100 border-2 border-[#1E1E1E] rounded-full font-bold text-sm mb-4 transform -rotate-2">✨ New Superpowers</div>
          <h3 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">Teaching made <span className="text-purple-600">magical</span> with AI.</h3>
          <p className="text-lg font-bold text-gray-600 mb-6 max-w-md">Watch how easily you can generate materials, grade assignments, and track progress.</p>
          <button onClick={() => setActiveView && setActiveView('creations')} className={`px-6 py-3 rounded-full bg-[#E9D5FF] font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>Try it now</button>
        </div>
        <div className="w-full md:w-80 h-64 bg-[#FFF8E7] rounded-3xl border-[3px] border-[#1E1E1E] relative flex items-center justify-center overflow-hidden">
          <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute z-20">
            <div className={`w-20 h-20 bg-white rounded-full ${brutalBorder} flex items-center justify-center overflow-hidden shadow-lg`}><img src={avatar} alt="Teacher" className="w-full h-full object-cover" /></div>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeToolIndex} 
              initial={{ opacity: 0, scale: 0.8, x: 50, rotate: 10 }} 
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 40, 
                rotate: [5, 12, 5], 
                y: [0, -8, 0] 
              }} 
              exit={{ opacity: 0, scale: 0.8, x: 50, rotate: 15 }} 
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                default: { duration: 0.5 } 
              }} 
              className={`absolute top-8 right-8 ${tools[activeToolIndex].color} px-4 py-2 rounded-2xl ${brutalBorder} flex items-center gap-2 z-10`}
            >
              {tools[activeToolIndex].icon}<span className="font-black text-sm">{tools[activeToolIndex].name}</span>
            </motion.div>
          </AnimatePresence>
          <motion.div animate={{ x: [-5, 5, -5], rotate: [-8, 8, -8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className={`absolute bottom-8 left-8 bg-white px-4 py-2 rounded-2xl ${brutalBorder} flex items-center gap-2 z-10`}>
            <CheckCircle2 size={20} className="text-green-500" strokeWidth={3} /><span className="font-black text-sm">Done!</span>
          </motion.div>
        </div>
      </section>

      {/* Assigned Batch Details */}
      {batches.length > 0 && (
        <section className="space-y-6">
          <SquigglyTitle title="Your Assigned Batch & Study Plan" color="#E9D5FF" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {batches.map((batch, idx) => {
              const details = batch.curriculum_details;
              const bgColors = ["bg-[#E9D5FF]", "bg-[#D1F2EB]", "bg-[#FFE5D9]", "bg-[#FEF08A]"];
              const color = bgColors[idx % bgColors.length];
              return (
                <div key={batch.id || idx} className={`col-span-1 lg:col-span-3 bg-white rounded-[2.5rem] p-8 ${brutalBorder} ${brutalShadow} relative overflow-hidden flex flex-col lg:flex-row gap-8`}>
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 bg-[#1E1E1E] text-white rounded-full font-black text-sm uppercase tracking-wider">
                        Active Batch
                      </span>
                      <span className={`px-4 py-1.5 rounded-full font-bold text-sm ${color} border-2 border-[#1E1E1E]`}>
                        {batch.curriculum_name}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-3xl lg:text-4xl font-black text-[#1E1E1E] mb-2">{batch.name}</h3>
                      <p className="text-lg font-bold text-gray-600 leading-relaxed max-w-2xl">{details.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border-2 border-[#1E1E1E]/10">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Schedule Timings</span>
                        <span className="text-base font-black text-[#1E1E1E]">{batch.schedule_details}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border-2 border-[#1E1E1E]/10">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Duration</span>
                        <span className="text-base font-black text-[#1E1E1E]">{details.duration}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border-2 border-[#1E1E1E]/10">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Certification Track</span>
                        <span className="text-base font-black text-[#1E1E1E]">{details.certification}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`w-full lg:w-96 p-6 rounded-3xl border-3 border-[#1E1E1E] bg-[#FDFCF9] ${brutalBorder} flex flex-col justify-between`}>
                    <div>
                      <h4 className="font-black text-xl mb-4 pb-2 border-b-2 border-[#1E1E1E]/10 flex items-center gap-2">
                        <span>📋</span> Syllabus Curriculum
                      </h4>
                      <ul className="space-y-3">
                        {details.syllabus.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 font-bold text-sm text-[#1E1E1E]">
                            <span className="text-purple-600 font-black mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t-2 border-[#1E1E1E]/10">
                      <h4 className="font-black text-sm text-gray-500 uppercase tracking-wider mb-2">Learning Objectives</h4>
                      <div className="flex flex-wrap gap-2">
                        {details.objectives.slice(0, 2).map((obj, i) => (
                          <span key={i} className="text-xs font-bold bg-[#FFE5D9] border-2 border-[#1E1E1E] px-2.5 py-1 rounded-lg">
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <SquigglyTitle title="AI Creation Hub" color="#FBBF24" icon={<Sparkles className="absolute -top-5 -right-10 text-yellow-500" size={28} strokeWidth={2.5} />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CreationCard title="Generate Assignment" desc="Create engaging assignments effortlessly with AI." btnText="Create Now" icon="🦉" color="bg-[#E9D5FF]" href="/teacher/create/assignment" />
          <CreationCard title="Generate Quiz" desc="Quick quizzes to assess knowledge." btnText="Start Quiz" icon={<Lightbulb size={40} strokeWidth={2.5} className="text-yellow-600" />} color="bg-[#D1F2EB]" href="/teacher/create/quiz" />
          <CreationCard title="Generate Presentation" desc="Visual slides made in minutes." btnText="Generate Slides" icon={<Presentation size={40} strokeWidth={2.5} className="text-purple-600" />} color="bg-[#FFE5D9]" href="/teacher/create/presentation" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <SquigglyTitle title="Live Classes" color="#FBBF24" icon={<Heart className="absolute -top-3 -right-10 text-pink-400 rotate-12" size={28} strokeWidth={2.5} />} />
          <div className="space-y-6">
            {todayClasses.length > 0 ? todayClasses.map((c, i) => (
              <LiveClassCard 
                key={i} 
                time={new Date(c.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                title={c.title} 
                grade={c.grade} 
                color={i % 2 === 0 ? "bg-[#D1F2EB]" : "bg-[#FFE5D9]"} 
                href={`/teacher/live?room=${c.meeting_link}`}
              />
            )) : (
              <div className={`p-8 bg-gray-50 rounded-3xl border-[3px] border-dashed border-[#1E1E1E] text-center font-bold text-gray-500`}>
                No classes scheduled for today.
              </div>
            )}
          </div>
        </section>
        <section>
          <SquigglyTitle title="Student Progress" color="#FCA5A5" />
          <div className={`bg-white rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} overflow-x-auto`}>
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead><tr className="border-b-[3px] border-[#1E1E1E]"><th className="pb-4 font-black text-lg">Class</th><th className="pb-4 font-black text-lg">Progress</th><th className="pb-4 font-black text-lg">Score</th><th className="pb-4 font-black text-lg">Activity</th></tr></thead>
              <tbody>
                {students.slice(0, 5).map((s, i) => (
                  <ProgressRow 
                    key={i} 
                    name={s.name} 
                    avatar={s.avatar} 
                    progress={s.progress} 
                    score={s.quiz_score || 85} 
                    stars={Math.ceil((s.progress || 0) / 20)} 
                    color={s.color} 
                  />
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="4" className="py-8 text-center font-bold text-gray-400">No student data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function ClassesView({ userName, showToast, initialData }) {
  const [classes, setClasses] = useState(initialData?.classes || []);
  const [feedbacks, setFeedbacks] = useState(initialData?.feedbacks || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', scheduled_at: '', duration: 60, grade: 'Grade 4', status: 'scheduled'
  });

  useEffect(() => {
    if (!initialData) {
      const loadClassesData = async () => {
        try {
          const response = await axios.get('/api/teacher/dashboard-data');
          const { classes, feedbacks } = response.data;
          setClasses(classes);
          setFeedbacks(feedbacks || []);
        } catch (error) {
          console.error("Failed to load classes view data:", error);
        }
      };
      loadClassesData();
    }
  }, [initialData]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('/api/feedback');
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    }
  };

  const handleOpenModal = (classObj = null, initialDate = null) => {
    if (classObj) {
      setEditingId(classObj.id);
      
      // format date for datetime-local input
      const dateObj = new Date(classObj.scheduled_at);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

      setFormData({
        title: classObj.title || '',
        description: classObj.description || '',
        scheduled_at: localDateTime,
        duration: classObj.duration || 60,
        grade: classObj.grade || 'Grade 4',
        status: classObj.status || 'scheduled'
      });
    } else {
      setEditingId(null);
      let defaultDate = '';
      if (initialDate) {
        // user clicked a date on calendar
        const d = new Date(initialDate);
        d.setHours(10, 0, 0, 0); // default to 10:00 AM
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        defaultDate = `${year}-${month}-${day}T10:00`;
      }
      setFormData({ title: '', description: '', scheduled_at: defaultDate, duration: 60, grade: 'Grade 4', status: 'scheduled' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert local datetime string back to UTC ISO string for the backend
      const payload = {
        ...formData,
        scheduled_at: new Date(formData.scheduled_at).toISOString()
      };

      if (editingId) {
        await axios.put(`/api/classes/${editingId}`, payload);
      } else {
        await axios.post('/api/classes', payload);
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (error) {
      console.error("Failed to save class:", error);
    }
  };

  const [classToDelete, setClassToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setClassToDelete(id);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    try {
      await axios.delete(`/api/classes/${classToDelete}`);
      setClassToDelete(null);
      fetchClasses();
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  };

  const upcomingCount = classes.filter(c => c.status === 'scheduled').length;
  const missedCount = classes.filter(c => c.status === 'missed').length;
  const rescheduledCount = classes.filter(c => c.status === 'rescheduled').length;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 relative z-10">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div><h2 className="text-4xl lg:text-5xl font-black text-[#1E1E1E] mb-2">My Classes</h2><p className="text-xl font-bold text-gray-600">Manage your schedule, go live, and view feedback.</p></div>
        <button onClick={() => handleOpenModal()} className={`px-6 py-4 rounded-full bg-[#D1F2EB] font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center gap-3`}><div className={`bg-white rounded-full p-1 ${brutalBorder}`}><Plus size={20} strokeWidth={4} /></div>Create New Class</button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatWidget title="Upcoming Classes" count={upcomingCount || 0} icon={<Video size={28} />} color="bg-[#E9D5FF]" />
        <StatWidget title="Classes Missed" count={missedCount || 0} icon={<CalendarX size={28} />} color="bg-[#FCA5A5]" />
        <StatWidget title="Rescheduled" count={rescheduledCount || 0} icon={<RefreshCcw size={28} />} color="bg-[#FDE68A]" />
      </div>
      <section><SquigglyTitle title="Weekly Planner" color="#A78BFA" icon={<Calendar className="absolute -top-4 -right-10 text-purple-400 rotate-12" size={28} strokeWidth={2.5} />} /><WeeklyCalendar classes={classes} onAdd={(date) => handleOpenModal(null, date)} onEdit={handleOpenModal} onDelete={handleDeleteClick} /></section>
      <section>
        <SquigglyTitle title="Today's Schedule" color="#60A5FA" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.filter(c => new Date(c.scheduled_at).toDateString() === new Date().toDateString()).map((c, i) => {
            const timeString = new Date(c.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            const scheduleColors = ["bg-[#D1F2EB]", "bg-[#FFE5D9]", "bg-[#E9D5FF]", "bg-[#FEF08A]", "bg-[#BFDBFE]", "bg-[#FBCFE8]"];
            let color = scheduleColors[(c.id || i) % scheduleColors.length];
            
            if (c.status === 'missed') color = "bg-[#FCA5A5]";
            if (c.status === 'rescheduled') color = "bg-[#FDE68A]";
            
            const uiStatus = c.status === 'scheduled' ? 'upcoming' : c.status;
            
            return (
              <ClassActionCard 
                key={i} 
                status={uiStatus} 
                title={c.title} 
                time={timeString} 
                students={c.student_ids ? c.student_ids.length : 0} 
                color={color} 
                href={['upcoming', 'live'].includes(uiStatus) ? `/teacher/live?room=${c.meeting_link}` : null}
              />
            );
          })}
          {classes.filter(c => new Date(c.scheduled_at).toDateString() === new Date().toDateString()).length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center p-8 bg-gray-50 rounded-3xl border-[3px] border-dashed border-[#1E1E1E] font-bold text-gray-500">
              No classes scheduled for today. Take a break! ☕
            </div>
          )}
        </div>
      </section>
      <section>
        <SquigglyTitle title="Student Love & Feedback" color="#F472B6" icon={<Heart className="absolute -top-4 -right-8 text-pink-400" size={28} strokeWidth={2.5} />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {feedbacks.length > 0 ? feedbacks.map((fb, i) => {
            const fbColors = ["bg-[#FEF08A]", "bg-[#BFDBFE]", "bg-[#FBCFE8]", "bg-[#D1F2EB]", "bg-[#E9D5FF]", "bg-[#FFE5D9]"];
            const color = fbColors[i % fbColors.length];
            const rotations = ["-rotate-2", "rotate-3", "-rotate-1", "rotate-2", "-rotate-3", "rotate-1"];
            const rotate = rotations[i % rotations.length];
            return <FeedbackNote key={fb.id || i} text={fb.comment} student={fb.student_name} rating={fb.rating} color={color} rotate={rotate} />;
          }) : (
            <div className="col-span-3 text-center p-8 bg-gray-50 rounded-3xl border-[3px] border-dashed border-[#1E1E1E] font-bold text-gray-500">
              No feedback yet. Keep up the great teaching! 🌟
            </div>
          )}
        </div>
      </section>

      {/* Class Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999999] flex items-center justify-center p-4 bg-[#1E1E1E]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] border-[4px] border-[#1E1E1E] shadow-[12px_12px_0px_0px_#1E1E1E] p-8 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black text-[#1E1E1E]">{editingId ? 'Edit Class' : 'Schedule Class'}</h3>
                <button onClick={() => setIsModalOpen(false)} className={`w-10 h-10 bg-gray-100 rounded-full ${brutalBorder} flex items-center justify-center ${brutalHover}`}><X size={20} strokeWidth={3} /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Class Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Grammar 101" className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all`} />
                </div>
                <div>
                  <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description..." rows={3} className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all resize-none`}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Date & Time</label>
                    <input type="datetime-local" required value={formData.scheduled_at} onChange={e => setFormData({...formData, scheduled_at: e.target.value})} className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all`} />
                  </div>
                  <div>
                    <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Duration (mins)</label>
                    <input type="number" min="15" step="15" required value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Grade / Batch</label>
                    <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all`}>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                    </select>
                  </div>
                  {editingId && (
                    <div>
                      <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all`}>
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="missed">Missed</option>
                      </select>
                    </div>
                  )}
                </div>
                <button type="submit" className={`w-full mt-4 py-4 bg-[#E9D5FF] rounded-2xl font-black text-xl flex items-center justify-center gap-3 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}><Check size={24} strokeWidth={3} /> {editingId ? 'Save Changes' : 'Schedule Class'}</button>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {classToDelete && (
          <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999999] flex items-center justify-center p-4 bg-[#1E1E1E]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] border-[4px] border-[#1E1E1E] shadow-[12px_12px_0px_0px_#1E1E1E] p-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 border-[3px] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E]">
                <AlertCircle size={40} className="text-red-600" strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black mb-4">Delete Class?</h3>
              <p className="text-lg font-bold text-gray-500 mb-10 leading-relaxed">
                Are you sure you want to delete this class? You won't be able to undo this action later!
              </p>
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setClassToDelete(null)}
                  className={`flex-1 py-4 bg-white rounded-2xl font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                >
                  No, Keep it
                </button>
                <button 
                  onClick={confirmDelete}
                  className={`flex-1 py-4 bg-[#FCA5A5] rounded-2xl font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover} text-[#1E1E1E]`}
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function StudentsView({ userName, showToast, initialData }) {
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState(initialData?.students || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState(initialData?.assignments || []);
  const [quizScores, setQuizScores] = useState(initialData?.quiz_scores || []);
  const [stats, setStats] = useState(initialData?.stats || { teacher_attendance: 0, avg_student_attendance: 0 });
  
  // Support Ticket State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title: '', description: '' });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Upload Assignment State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', task: '', grade: 'Grade 4', file: null, link: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialData);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/students/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/students/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const fetchQuizScores = async () => {
    try {
      const response = await axios.get('/api/students/quiz-scores');
      setQuizScores(response.data);
    } catch (error) {
      console.error("Failed to fetch quiz scores:", error);
    }
  };

  useEffect(() => {
    if (!initialData) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get('/api/teacher/dashboard-data');
          const { stats, students, assignments, quiz_scores } = response.data;
          setStats(stats);
          setStudents(students);
          setAssignments(assignments);
          setQuizScores(quiz_scores);
        } catch (error) {
          console.error("Failed to load students view data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [initialData]);

  const handleAssignmentAction = async (id, status) => {
    try {
      await axios.post(`/api/students/assignments/${id}/status`, { status });
      fetchAssignments(); // Refresh list
    } catch (error) {
      console.error("Failed to update assignment status:", error);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingTicket(true);
    try {
      await axios.post('/api/tickets', ticketForm);
      setIsTicketModalOpen(false);
      setTicketForm({ title: '', description: '' });
      showToast("Support ticket submitted successfully!", "success");
    } catch (error) {
      console.error("Failed to submit ticket:", error);
      showToast("Failed to submit ticket. Please try again.", "error");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleUploadAssignment = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('task', uploadForm.task);
    formData.append('grade', uploadForm.grade);
    if (uploadForm.file) formData.append('file', uploadForm.file);
    if (uploadForm.link) formData.append('link', uploadForm.link);

    try {
      await axios.post('/api/students/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsUploadModalOpen(false);
      setUploadForm({ title: '', task: '', grade: 'Grade 4', file: null, link: '' });
      fetchAssignments();
      showToast("Assignments uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload assignment:", error);
      showToast("Failed to upload assignment.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const batches = ["All", "Grade 4", "Grade 5"];
  
  const filteredStudents = students.filter(s => {
    const matchesBatch = selectedBatch === "All" || s.grade === selectedBatch;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const avgAttendance = students.length > 0 
    ? Math.round(students.reduce((acc, curr) => acc + curr.attendance, 0) / students.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <RefreshCcw className="animate-spin text-purple-600 mb-4" size={48} strokeWidth={3} />
        <p className="text-xl font-black text-gray-400">Loading Student Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 relative z-10">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1E1E1E] mb-2">Student Hub</h2>
          <p className="text-xl font-bold text-gray-600">Track progress, manage attendance, and communicate.</p>
        </div>
        <div className={`relative w-full md:w-72 bg-white rounded-full ${brutalBorder} ${brutalShadowSm} flex items-center px-5 py-3 focus-within:shadow-[4px_4px_0px_0px_#1E1E1E] transition-shadow`}><Search size={20} strokeWidth={3} className="text-gray-400 mr-3" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search students..." className="bg-transparent border-none outline-none focus:ring-0 w-full font-bold text-base placeholder:text-gray-400" /></div>
      </header>

      <section>
        <SquigglyTitle title="Overview & Comms" color="#34D399" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget title="My Attendance" count={`${stats.teacher_attendance}%`} icon={<UserCheck size={28} />} color="bg-[#D1F2EB]" />
          <StatWidget title="Avg. Student Att." count={`${stats.avg_student_attendance}%`} icon={<Users size={28} />} color="bg-[#FFE5D9]" />
          <ActionWidget 
            title="Group Chat" 
            desc="Broadcast to all" 
            icon={<Megaphone size={28} />} 
            color="bg-[#E9D5FF]" 
            onClick={() => setActiveView('chat')}
          />
          <ActionWidget 
            title="Support Desk" 
            desc="Report an issue" 
            icon={<LifeBuoy size={28} />} 
            color="bg-[#FCA5A5]" 
            onClick={() => setIsTicketModalOpen(true)}
          />
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <SquigglyTitle title="Student Roster" color="#A78BFA" icon={<Users className="absolute -top-4 -right-8 text-purple-400" size={28} strokeWidth={2.5} />} />
          <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto">
            <Filter size={20} strokeWidth={3} className="text-gray-400 shrink-0" />
            {batches.map(b => (
              <button key={b} onClick={() => setSelectedBatch(b)} className={`px-5 py-2 rounded-full font-black text-sm whitespace-nowrap ${brutalBorder} ${selectedBatch === b ? 'bg-[#E9D5FF] shadow-[2px_2px_0px_0px_#1E1E1E]' : 'bg-white hover:bg-gray-50'}`}>{b}</button>
            ))}
          </div>
        </div>
        <div className={`bg-white rounded-[2.5rem] p-4 lg:p-6 ${brutalBorder} ${brutalShadow}`}>
          <div className="flex flex-col gap-2">{filteredStudents.map((s, i) => (<StudentListRow key={i} student={s} onClick={() => setSelectedStudent(s)} />))}</div>
        </div>
      </section>

      <section>
        <SquigglyTitle title="Assignments & Quizzes" color="#FBBF24" icon={<FileText className="absolute -top-4 -right-8 text-yellow-500" size={28} strokeWidth={2.5} />} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          <div className={`bg-[#FFF8E7] rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadowSm} flex flex-col`}>
            <div className="flex justify-between items-center mb-6"><h4 className="text-2xl font-black">Pending Review</h4><button onClick={() => setIsUploadModalOpen(true)} className={`px-4 py-2 bg-[#D1F2EB] rounded-full font-black text-sm flex items-center gap-2 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}><Upload size={16} strokeWidth={3} /> Upload New</button></div>
            <div className="flex flex-col gap-4">
              {assignments.filter(a => a.status === 'pending').length === 0 ? (
                <p className="text-center font-bold text-gray-500 py-4 italic">No pending assignments</p>
              ) : (
                assignments.filter(a => a.status === 'pending').slice(0, 5).map((a, i) => (
                  <AssignmentReviewRow 
                    key={i} 
                    student={a.student?.name} 
                    task={a.title} 
                    date={new Date(a.submitted_at).toLocaleDateString()} 
                    color={a.student?.color || "bg-gray-100"} 
                    onAccept={() => handleAssignmentAction(a.id, 'accepted')}
                    onReject={() => handleAssignmentAction(a.id, 'rejected')}
                  />
                ))
              )}
            </div>
          </div>
          <div className={`bg-[#FFF8E7] rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadowSm} flex flex-col`}>
            <div className="flex justify-between items-center mb-6"><h4 className="text-2xl font-black">Recent Quiz Scores</h4><div className={`p-2 bg-[#FEF08A] rounded-full ${brutalBorder}`}><Award size={20} strokeWidth={3} /></div></div>
            <div className="flex flex-col gap-4">
              {quizScores.length === 0 ? (
                <p className="text-center font-bold text-gray-500 py-4 italic">No quiz scores recorded</p>
              ) : (
                quizScores.slice(0, 5).map((s, i) => (
                  <QuizScoreRow 
                    key={i} 
                    student={s.student?.name} 
                    quiz={s.quiz_name} 
                    score={s.score} 
                    color={s.student?.color || "bg-gray-100"} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>{selectedStudent && <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}</AnimatePresence>,
        document.body
      )}

      {/* Upload Assignment Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999999] flex items-center justify-center p-4 bg-[#1E1E1E]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] border-[4px] border-[#1E1E1E] shadow-[12px_12px_0px_0px_#1E1E1E] p-8 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black text-[#1E1E1E]">Upload Assignment</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className={`w-10 h-10 bg-gray-100 rounded-full ${brutalBorder} flex items-center justify-center ${brutalHover}`}><X size={20} strokeWidth={3} /></button>
              </div>
              
              <form onSubmit={handleUploadAssignment} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Assignment Title</label>
                  <input type="text" required value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} placeholder="e.g. Weekly Grammar Worksheet" className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all`} />
                </div>
                <div>
                  <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Task Description</label>
                  <textarea required value={uploadForm.task} onChange={e => setUploadForm({...uploadForm, task: e.target.value})} placeholder="Describe the task for students..." rows={4} className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all resize-none`}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Target Grade</label>
                  <select value={uploadForm.grade} onChange={e => setUploadForm({...uploadForm, grade: e.target.value})} className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all`}>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Upload Resources (Doc, PPT, PDF)</label>
                    <div className={`relative w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold flex items-center gap-2 cursor-pointer hover:bg-white transition-all`}>
                       <Paperclip size={18} />
                       <span className="text-xs truncate">{uploadForm.file ? uploadForm.file.name : "Choose file..."}</span>
                       <input type="file" onChange={e => setUploadForm({...uploadForm, file: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Resource Link (Optional)</label>
                    <input type="url" value={uploadForm.link} onChange={e => setUploadForm({...uploadForm, link: e.target.value})} placeholder="https://..." className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all`} />
                  </div>
                </div>
                <button type="submit" disabled={isUploading} className={`mt-4 py-4 bg-[#34D399] rounded-2xl font-black text-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center justify-center gap-3 disabled:opacity-50`}>
                  {isUploading ? <RefreshCcw className="animate-spin" size={24} /> : <Upload size={24} strokeWidth={3} />}
                  {isUploading ? 'Uploading...' : 'Blast to Students!'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Support Ticket Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999999] flex items-center justify-center p-4 bg-[#1E1E1E]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] border-[4px] border-[#1E1E1E] shadow-[12px_12px_0px_0px_#1E1E1E] p-8 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black text-[#1E1E1E]">Support Desk</h3>
                <button onClick={() => setIsTicketModalOpen(false)} className={`w-10 h-10 bg-gray-100 rounded-full ${brutalBorder} flex items-center justify-center ${brutalHover}`}><X size={20} strokeWidth={3} /></button>
              </div>
              
              <p className="font-bold text-gray-600 mb-6 italic">Report complaints or issues regarding students directly to the admin.</p>

              <form onSubmit={handleTicketSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Issue Title</label>
                  <input 
                    type="text" 
                    required 
                    value={ticketForm.title} 
                    onChange={e => setTicketForm({...ticketForm, title: e.target.value})} 
                    placeholder="e.g. Behavioral issue in Grade 4" 
                    className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-200 transition-all`} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-black mb-2 text-[#1E1E1E]">Detailed Description</label>
                  <textarea 
                    required
                    value={ticketForm.description} 
                    onChange={e => setTicketForm({...ticketForm, description: e.target.value})} 
                    placeholder="Describe the issue in detail..." 
                    rows={5} 
                    className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-200 transition-all resize-none`}
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmittingTicket}
                  className={`w-full mt-4 py-4 bg-[#FCA5A5] rounded-2xl font-black text-xl flex items-center justify-center gap-3 ${brutalBorder} ${brutalShadowSm} ${brutalHover} disabled:opacity-50`}
                >
                  {isSubmittingTicket ? "Submitting..." : <><LifeBuoy size={24} strokeWidth={3} /> Submit Ticket</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function CreationsView({ userName, creations = [], onPreview, onDeleteInitiate, showToast, getSpontaneousLiveHref }) {
  const [activeTab, setActiveTab] = useState("assignment");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const handleSendAdminFeedback = async () => {
    if (!adminFeedback.trim()) return;
    setIsSendingFeedback(true);
    try {
      await axios.post('/api/tickets', {
        title: "AI Tool Feedback",
        description: adminFeedback
      });
      showToast("Feedback sent to admin! Thank you.");
      setAdminFeedback("");
    } catch (error) {
      console.error("Failed to send feedback:", error);
      showToast("Failed to send feedback. Please try again.", "error");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleRateAI = async (rating) => {
    try {
      await axios.post('/api/tickets', {
        title: "AI Quality Rating",
        description: `Teacher rated AI generation as: ${rating}`
      });
      showToast(`Thank you for your ${rating} feedback! Recorded for admin review.`);
    } catch (error) {
      showToast("Rating saved locally, sync failed.", "error");
    }
  };

  const filteredCreations = creations.filter(c => c.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 relative z-10">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1E1E1E] mb-2 flex items-center gap-3"><Wand2 className="text-purple-500" size={40} strokeWidth={3} /> AI Creation Hub</h2>
          <p className="text-xl font-bold text-gray-600">Generate, review, and manage your teaching materials.</p>
        </div>
      </header>

      <section>
        <SquigglyTitle title="Creation Stats" color="#34D399" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget title="Total Creations" count={creations.length} icon={<Wand2 size={28} />} color="bg-[#D1F2EB]" />
          <StatWidget title="Accepted by Admin" count={creations.filter(c => c.status === 'accepted').length} icon={<CheckCircle2 size={28} />} color="bg-[#E9D5FF]" />
          <StatWidget title="Rejected by Admin" count={creations.filter(c => c.status === 'rejected').length} icon={<XCircle size={28} />} color="bg-[#FCA5A5]" />
          <StatWidget title="Avg AI Rating" count="4.8/5" icon={<Star size={28} />} color="bg-[#FEF08A]" />
        </div>
      </section>

      <section>
        <SquigglyTitle title="AI Magic Tools" color="#A78BFA" icon={<Sparkles className="absolute -top-4 -right-8 text-yellow-400" size={28} strokeWidth={2.5} />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          <AIToolCard title="Assignment Creation" desc="Generate worksheets & tasks" icon={<FileText size={32} />} color="bg-[#D1F2EB]" buttonText="Create" href="/teacher/create/assignment" />
          <AIToolCard title="Quizzes Creation" desc="Auto-generate MCQs & tests" icon={<CheckSquare size={32} />} color="bg-[#FFE5D9]" buttonText="Generate Quiz" href="/teacher/create/quiz" />
          <AIToolCard title="Presentation Creation" desc="Generate slides for classes" icon={<MonitorPlay size={32} />} color="bg-[#E9D5FF]" buttonText="Design Slides" href="/teacher/create/presentation" />
          <AIToolCard title="Online Class Creation" desc="Start a live class session" icon={<Video size={32} />} color="bg-[#FEF08A]" buttonText="Go Live" href={getSpontaneousLiveHref()} />
          <AIToolCard title="E-Books Selection" desc="Weekly admin reading list" icon={<Book size={32} />} color="bg-[#BFDBFE]" buttonText="Browse & Download" actionIcon={Download} />
          <AIToolCard title="Student Progress Report" desc="AI summary of performance" icon={<BarChart size={32} />} color="bg-[#FBCFE8]" buttonText="Analyze" />
        </div>
      </section>

      {/* Stored Creations Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <SquigglyTitle title={`Stored ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s`} color="#FF8EB2" />
          <div className={`bg-white rounded-2xl p-1.5 ${brutalBorder} ${brutalShadowSm} flex gap-1`}>
            {['assignment', 'quiz', 'presentation'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl font-black text-sm capitalize transition-all ${activeTab === tab ? 'bg-[#1E1E1E] text-white' : 'bg-transparent text-gray-500 hover:text-[#1E1E1E]'}`}
              >
                {tab}s
              </button>
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-[2.5rem] p-8 ${brutalBorder} ${brutalShadow} min-h-[300px] flex flex-col items-center justify-center`}>
          {filteredCreations.length > 0 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreations.map((creation) => (
                <div key={creation.id} className={`bg-[#FFF8E7] rounded-[2rem] p-6 ${brutalBorder} ${brutalShadowSm} hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_#1E1E1E] transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center ${brutalBorder}">
                        {creation.type === 'assignment' ? <FileText size={20} /> : creation.type === 'quiz' ? <CheckSquare size={20} /> : <MonitorPlay size={20} />}
                      </div>
                      <div className={`px-3 py-1 rounded-full bg-green-100 text-green-700 border-2 border-green-700 text-[10px] font-black uppercase tracking-widest`}>{creation.status}</div>
                    </div>
                    <button 
                      onClick={() => onPreview(creation)}
                      className={`w-10 h-10 bg-white rounded-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center justify-center text-purple-600 transition-colors active:bg-purple-50`}
                      title="Preview Creation"
                    >
                      <Eye size={18} strokeWidth={3} />
                    </button>
                  </div>
                  <h4 className="text-xl font-black mb-1 truncate">{creation.title}</h4>
                  <p className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                    <Calendar size={14} /> {new Date(creation.created_at).toLocaleDateString()}
                    <span className="text-gray-300">|</span>
                    <Clock size={14} /> {new Date(creation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex gap-2">
                    <button className={`flex-1 py-2.5 bg-white rounded-xl font-black text-xs ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center justify-center gap-2`} title="Forward to Students">
                      <Forward size={14} strokeWidth={3} /> Student
                    </button>
                    <button className={`flex-1 py-2.5 bg-white rounded-xl font-black text-xs ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center justify-center gap-2`} title="Forward to Admin">
                      <Users size={14} strokeWidth={3} /> Admin
                    </button>
                    <button 
                      onClick={() => onDeleteInitiate(creation.id)}
                      className={`w-10 h-10 bg-red-100 rounded-xl ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center justify-center text-red-600`} 
                      title="Delete Creation"
                    >
                      <XCircle size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center opacity-40">
              <Sparkles size={64} strokeWidth={1.5} className="mx-auto mb-4 text-gray-300" />
              <h4 className="text-2xl font-black text-gray-400">No {activeTab}s yet. Start creating!</h4>
            </div>
          )}
        </div>
      </section>

      <section>
        <SquigglyTitle title="Admin Review Status" color="#FBBF24" />
        <div className={`bg-white rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} flex flex-col gap-4 min-h-[100px]`}>
          {creations.length > 0 ? creations.slice(0, 5).map((c, i) => (
            <ReviewStatusRow 
              key={i} 
              title={c.title} 
              type={c.type.charAt(0).toUpperCase() + c.type.slice(1)} 
              status={c.status.charAt(0).toUpperCase() + c.status.slice(1)} 
              date={new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
            />
          )) : (
            <p className="text-center font-bold text-gray-400 py-8 italic">No creations pending review</p>
          )}
        </div>
      </section>

      <section>
        <SquigglyTitle title="Feedback & Usage" color="#FCA5A5" icon={<MessageSquare className="absolute -top-4 -right-8 text-pink-400" size={28} strokeWidth={2.5} />} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          <div className={`bg-[#FFE5D9] rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadowSm} flex flex-col justify-between`}>
            <div><h4 className="text-2xl font-black mb-2">Rate Creation AI</h4><p className="font-bold text-gray-700 mb-6">How satisfied are you with the recent AI generations?</p></div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleRateAI('Great')}
                className={`flex-1 py-4 bg-white rounded-2xl flex flex-col items-center gap-2 ${brutalBorder} ${brutalHover} shadow-[2px_2px_0px_0px_#1E1E1E]`}
              >
                <ThumbsUp size={32} strokeWidth={2.5} className="text-green-500" /><span className="font-black">Great</span>
              </button>
              <button 
                onClick={() => handleRateAI('Needs Work')}
                className={`flex-1 py-4 bg-white rounded-2xl flex flex-col items-center gap-2 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
              >
                <ThumbsDown size={32} strokeWidth={2.5} className="text-red-500" /><span className="font-black">Needs Work</span>
              </button>
            </div>
          </div>
          <div className={`bg-[#D1F2EB] rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadowSm} flex flex-col`}>
            <h4 className="text-2xl font-black mb-2">Feedback to Admin</h4><p className="font-bold text-gray-700 mb-4">Report issues or suggest improvements for the AI tools.</p>
            <textarea 
              value={adminFeedback}
              onChange={(e) => setAdminFeedback(e.target.value)}
              className={`w-full h-32 p-4 rounded-2xl bg-white resize-none outline-none focus:ring-0 font-bold placeholder:text-gray-400 ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] mb-4`} 
              placeholder="Type your feedback here..."
            ></textarea>
            <button 
              onClick={handleSendAdminFeedback}
              disabled={isSendingFeedback}
              className={`w-full py-3 bg-[#1E1E1E] text-white rounded-xl font-black flex items-center justify-center gap-2 ${brutalHover} disabled:opacity-50`}
            >
              {isSendingFeedback ? "Sending..." : <><Send size={18} strokeWidth={3} /> Send Feedback</>}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingsView({ profile, setProfile, onSave, showToast }) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = React.useRef(null);
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const getAvatarPreviewUrl = () => {
    if (avatarPreview && (avatarPreview.startsWith('/') || avatarPreview.startsWith('http') || avatarPreview.startsWith('data:'))) {
      return avatarPreview;
    }
    return getAvatarUrl(localProfile);
  };

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local profile when the parent profile is updated (e.g., after saving)
  useEffect(() => {
    setLocalProfile(profile);
    setAvatarFile(null);
  }, [profile]);

  useEffect(() => {
    // Only compare fields we actually edit to avoid false positives from backend timestamps
    const getComparable = (p) => ({
      name: p.name,
      bio: p.bio,
      ai_tone: p.ai_tone,
      ai_level: p.ai_level,
      accent_color: p.accent_color,
      gender: p.gender,
      meeting_link: p.meeting_link,
      notifications_config: typeof p.notifications_config === 'string' ? JSON.parse(p.notifications_config) : p.notifications_config,
    });
    
    const isDirty = JSON.stringify(getComparable(localProfile)) !== JSON.stringify(getComparable(profile)) || avatarFile !== null;
    setHasUnsavedChanges(isDirty);
  }, [localProfile, avatarFile, profile]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append('name', localProfile.name);
    formData.append('bio', localProfile.bio);
    formData.append('ai_tone', localProfile.ai_tone);
    formData.append('ai_level', localProfile.ai_level);
    formData.append('meeting_link', localProfile.meeting_link);
    formData.append('accent_color', localProfile.accent_color);
    formData.append('gender', localProfile.gender);
    formData.append('notifications_config', JSON.stringify(localProfile.notifications_config));
    if (avatarFile) formData.append('avatar', avatarFile);
    
    onSave(formData);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 relative z-10">
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl"
          >
            <div className={`bg-[#FEF08A] p-4 rounded-2xl ${brutalBorder} shadow-[8px_8px_0px_0px_#1E1E1E] flex items-center justify-between gap-6`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center animate-bounce border-2 border-[#1E1E1E]">
                   <AlertCircle size={20} className="text-red-500" />
                </div>
                <p className="font-black text-lg">You have unsaved changes!</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setLocalProfile(profile); setAvatarPreview(profile.avatar); setAvatarFile(null); }}
                  className="px-4 py-2 bg-white rounded-xl font-bold border-2 border-[#1E1E1E] hover:bg-gray-50 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-[#1E1E1E] text-white rounded-xl font-black shadow-[4px_4px_0px_0px_#A78BFA] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Save Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1E1E1E] mb-2 flex items-center gap-3">
            <Settings className="text-gray-700" size={40} strokeWidth={3} /> Settings
          </h2>
          <p className="text-xl font-bold text-gray-600">Customize your teaching experience and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          className={`px-8 py-4 bg-[#1E1E1E] text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 ${brutalHover} shadow-[6px_6px_0px_0px_#A78BFA] transition-all`}
        >
          <CheckCircle2 size={24} strokeWidth={3} /> Save Changes
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className={`bg-[#FFE5D9] rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} flex flex-col gap-6`}>
          <h3 className="text-2xl font-black flex items-center gap-3"><Smile size={28} strokeWidth={3} /> Profile & Avatar</h3>
          <div className="flex items-center gap-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-28 h-28 rounded-full bg-white flex items-center justify-center text-5xl ${brutalBorder} shadow-[4px_4px_0px_0px_#1E1E1E] relative cursor-pointer hover:scale-105 transition-all overflow-hidden group`}
            >
              <img src={getAvatarPreviewUrl()} className="w-full h-full object-cover" alt="Avatar" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={24} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="font-black text-sm text-gray-700 mb-1 block uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" 
                  value={localProfile.name} 
                  onChange={e => setLocalProfile({...localProfile, name: e.target.value})}
                  className={`w-full p-4 rounded-xl bg-white font-bold outline-none focus:ring-4 focus:ring-purple-200 ${brutalBorder} shadow-[3px_3px_0px_0px_#1E1E1E] transition-all`} 
                />
              </div>
              <div>
                <label className="font-black text-sm text-gray-700 mb-1 block uppercase tracking-wider">Gender Preference</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setLocalProfile({...localProfile, gender: 'Male'})}
                    className={`flex-1 py-3 rounded-xl font-black text-sm ${brutalBorder} transition-all ${localProfile.gender === 'Male' ? 'bg-white shadow-[3px_3px_0px_0px_#1E1E1E] scale-[1.02]' : 'bg-gray-50 opacity-60 hover:opacity-100'}`}
                  >
                    Male
                  </button>
                  <button 
                    onClick={() => setLocalProfile({...localProfile, gender: 'Female'})}
                    className={`flex-1 py-3 rounded-xl font-black text-sm ${brutalBorder} transition-all ${localProfile.gender === 'Female' ? 'bg-white shadow-[3px_3px_0px_0px_#1E1E1E] scale-[1.02]' : 'bg-gray-50 opacity-60 hover:opacity-100'}`}
                  >
                    Female
                  </button>
                </div>
              </div>
              <div>
                <label className="font-black text-sm text-gray-700 mb-1 block uppercase tracking-wider">Email Address</label>
                <div className={`w-full p-4 rounded-xl bg-gray-50/50 font-bold text-gray-500 border-[3px] border-dashed border-gray-300 flex items-center gap-2`}>
                  <Mail size={18} /> {localProfile.email}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="font-black text-sm text-gray-700 mb-1 block uppercase tracking-wider">Your Teacher Bio</label>
            <textarea 
              value={localProfile.bio || ''} 
              onChange={e => setLocalProfile({...localProfile, bio: e.target.value})}
              className={`w-full p-4 rounded-xl bg-white font-bold outline-none focus:ring-4 focus:ring-purple-200 resize-none h-32 ${brutalBorder} shadow-[3px_3px_0px_0px_#1E1E1E] transition-all`}
              placeholder="e.g. Expert in English Literature with 10 years of experience."
            ></textarea>
          </div>
        </div>

        {/* AI Preferences */}
        <div className={`bg-[#E9D5FF] rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} flex flex-col gap-6`}>
          <h3 className="text-2xl font-black flex items-center gap-3"><Wand2 size={28} strokeWidth={3} /> AI Preferences</h3>
          <div className="space-y-6">
            <BrutalSelect 
              label="AI Teaching Tone"
              value={localProfile.ai_tone}
              onChange={(val) => setLocalProfile({...localProfile, ai_tone: val})}
              options={["Playful", "Formal", "Moderate", "Strict", "Socratic (Question-based)"]}
            />
            <BrutalSelect 
              label="Target Student Level"
              value={localProfile.ai_level}
              onChange={(val) => setLocalProfile({...localProfile, ai_level: val})}
              options={["Beginner (A1-A2)", "Intermediate (B1-B2)", "Advanced (C1-C2)"]}
            />
            <div className="pt-2 border-t-2 border-dashed border-[#1E1E1E]/20">
              <h4 className="font-black text-lg mb-4 flex items-center gap-2 text-purple-800"><Bell size={20} /> Smart Notifications</h4>
              <div className="space-y-1">
                <BrutalToggle 
                  label="Student Message Alerts" 
                  isOn={localProfile.notifications_config.student_messages} 
                  onToggle={() => toggleNotification('student_messages')}
                  color="bg-[#34D399]" 
                />
                <BrutalToggle 
                  label="Assignment Submissions" 
                  isOn={localProfile.notifications_config.assignment_submissions} 
                  onToggle={() => toggleNotification('assignment_submissions')}
                  color="bg-[#34D399]" 
                />
                <BrutalToggle 
                  label="Admin Updates & News" 
                  isOn={localProfile.notifications_config.admin_updates} 
                  onToggle={() => toggleNotification('admin_updates')}
                  color="bg-[#34D399]" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Meeting Link */}
        <div className={`bg-[#D1F2EB] rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} flex flex-col gap-6 lg:col-span-1`}>
          <h3 className="text-2xl font-black flex items-center gap-3"><Video size={28} strokeWidth={3} /> Video Class Meet Link</h3>
          <p className="font-bold text-teal-800">This link is shared with Admin and Students for your scheduled live classes.</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <LinkIcon size={20} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              value={localProfile.meeting_link}
              onChange={e => setLocalProfile({...localProfile, meeting_link: e.target.value})}
              className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white font-bold outline-none focus:ring-4 focus:ring-teal-200 ${brutalBorder} shadow-[3px_3px_0px_0px_#1E1E1E]`} 
            />
          </div>
          <p className="text-sm font-bold text-teal-700 bg-white/40 p-3 rounded-xl border-2 border-dashed border-teal-400">
            Tip: Use a persistent Google Meet or Zoom link so you don't have to change it often!
          </p>
        </div>

        {/* Theme Section */}
        <div className={`bg-white rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} flex flex-col gap-6`}>
          <h3 className="text-2xl font-black flex items-center gap-3"><Sliders size={28} strokeWidth={3} /> Theme & Sidebar</h3>
          <div>
            <label className="font-black text-sm text-gray-700 mb-4 block uppercase tracking-wider">Dashboard Accent Vibe</label>
            <div className="flex flex-wrap gap-4">
              {[
                { name: 'Lavender', color: '#E9D5FF' },
                { name: 'Mint', color: '#D1F2EB' },
                { name: 'Salmon', color: '#FFE5D9' },
                { name: 'Yellow', color: '#FEF08A' },
                { name: 'Sky', color: '#BFDBFE' },
                { name: 'Rose', color: '#FBCFE8' }
              ].map((theme) => (
                <button 
                  key={theme.name}
                  onClick={() => setLocalProfile({...localProfile, accent_color: theme.color})}
                  title={theme.name}
                  className={`w-14 h-14 rounded-full border-[3px] border-[#1E1E1E] transition-all transform hover:scale-110 ${
                    localProfile.accent_color === theme.color ? 'ring-4 ring-[#1E1E1E] ring-offset-2 shadow-inner' : 'shadow-[3px_3px_0px_0px_#1E1E1E]'
                  }`}
                  style={{ backgroundColor: theme.color }}
                />
              ))}
            </div>
          </div>
          <div className="pt-4 border-t-2 border-dashed border-gray-100">
             <BrutalToggle 
               label="Experimental Dark Mode (Soon)" 
               isOn={false} 
               onToggle={() => showToast("Dark Mode is coming in the next update! 🌙", "success")} 
               color="bg-gray-800"
             />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`bg-[#FCA5A5] rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} flex flex-col gap-6 lg:mt-8`}>
        <h3 className="text-2xl font-black flex items-center gap-3"><AlertCircle size={28} strokeWidth={3} /> Danger Zone</h3>
        <p className="font-bold text-red-900 italic">Sign out of your account or manage session settings.</p>
        <Link 
          href={route('logout')} 
          method="post" 
          as="button"
          className={`w-full py-4 rounded-xl bg-white text-red-600 font-black text-xl flex items-center justify-center gap-3 ${brutalBorder} shadow-[4px_4px_0px_0px_#1E1E1E] ${brutalHover} transition-all active:scale-95`}
        >
          <LogOut size={24} strokeWidth={3} /> Log Out Account
        </Link>
      </div>
    </div>
  );
}

// --- SHARED COMPONENTS ---

function SidebarItem({ icon, label, active, collapsed, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex flex-col items-center justify-center py-4 rounded-3xl ${brutalBorder} ${active ? 'bg-white shadow-[3px_3px_0px_0px_#1E1E1E]' : 'bg-transparent hover:bg-white/60'} transition-all duration-200 group relative`}
    >
      <div className="mb-1 text-[#1E1E1E] group-hover:scale-110 transition-transform shrink-0">{icon}</div>
      {!collapsed && <span className="font-black text-[15px] leading-tight">{label}</span>}
      {collapsed && (
        <div className={`absolute left-[85px] bg-white ${brutalBorder} px-4 py-2 rounded-xl font-black text-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-[9999] shadow-[6px_6px_0px_0px_#1E1E1E] scale-90 group-hover:scale-100 translate-x-[-10px] group-hover:translate-x-0`}>
          {label}
          {/* Small arrow */}
          <div className="absolute top-1/2 -left-[10px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-[#1E1E1E]"></div>
        </div>
      )}
    </button>
  );
}

function SquigglyTitle({ title, color, icon }) {
  return (
    <div className="inline-block mb-8 relative">
      <h3 className="text-3xl font-black relative z-10">{title}</h3>
      <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" /></svg>
      {icon}
    </div>
  );
}

function CreationCard({ title, desc, btnText, icon, color, href }) {
  const content = (
    <>
      <div className="flex items-center gap-4 mb-4"><div className="text-5xl">{icon}</div><h4 className="font-black text-2xl leading-tight">{title}</h4></div>
      <p className="font-bold text-gray-800 mb-8 flex-1 text-lg">{desc}</p>
      <div className={`w-full py-3 rounded-full bg-white/60 font-black text-lg ${brutalBorder} ${brutalShadowSm} text-center`}>{btnText}</div>
    </>
  );

  if (href) {
    return <Link href={href} className={`${color} rounded-[2.5rem] p-8 ${brutalBorder} ${brutalShadow} flex flex-col h-full ${brutalHover}`}>{content}</Link>;
  }

  return (
    <div className={`${color} rounded-[2.5rem] p-8 ${brutalBorder} ${brutalShadow} flex flex-col h-full`}>
      {content}
    </div>
  );
}

function LiveClassCard({ time, title, grade, color, href }) {
  return (
    <div className={`${color} rounded-[2rem] p-5 ${brutalBorder} ${brutalShadowSm} flex items-center gap-5`}>
      <div className={`bg-white rounded-2xl p-3 flex flex-col items-center justify-center min-w-[90px] ${brutalBorder} shadow-sm`}><Calendar size={24} strokeWidth={3} className="mb-1" /><span className="font-black text-sm text-center leading-tight">{time.split(' ')[0]}<br/>{time.split(' ')[1]}</span></div>
      <div className="flex-1"><h4 className="font-black text-xl mb-1">{title}</h4><p className="font-bold text-gray-700 text-base">{grade}</p></div>
      {href ? (
        <Link href={href}>
          <button className={`px-6 py-3 rounded-full bg-white/60 font-black text-base ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>Start the Live</button>
        </Link>
      ) : (
        <button className={`px-6 py-3 rounded-full bg-white/60 font-black text-base ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>Start the Live</button>
      )}
    </div>
  );
}

function ProgressRow({ name, avatar, progress, score, stars, color }) {
  return (
    <tr className="border-b-[3px] border-[#1E1E1E] last:border-0">
      <td className="py-5"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full bg-[#FFE5D9] flex items-center justify-center text-2xl ${brutalBorder}`}>{avatar}</div><span className="font-black text-lg">{name}</span></div></td>
      <td className="py-5 pr-6"><div className={`h-5 w-full bg-gray-100 rounded-full ${brutalBorder} overflow-hidden`}><div className={`h-full ${color} border-r-[3px] border-[#1E1E1E]`} style={{ width: `${progress}%` }}></div></div></td>
      <td className="py-5 font-black text-xl">{score}</td>
      <td className="py-5"><div className="flex gap-1">{[...Array(5)].map((_, i) => (<Star key={i} size={20} strokeWidth={2.5} className={i < stars ? "fill-yellow-400 text-yellow-500" : "text-gray-300"} />))}</div></td>
    </tr>
  );
}

function StatWidget({ title, count, icon, color }) {
  return (
    <div className={`bg-white rounded-[2rem] p-6 ${brutalBorder} ${brutalShadowSm} flex items-center gap-5 w-full`}>
      <div className={`w-16 h-16 rounded-2xl ${color} ${brutalBorder} flex items-center justify-center shrink-0`}>{icon}</div>
      <div><h4 className="text-3xl font-black leading-none mb-1">{count}</h4><p className="font-bold text-gray-600">{title}</p></div>
    </div>
  );
}

function ClassActionCard({ status, title, time, students, color, href, onClick }) {
  const statusConfig = { live: { badge: "Live Now", badgeColor: "bg-green-300", btnText: "Start the Live", btnColor: "bg-green-400", icon: <Play size={18} strokeWidth={3} /> }, upcoming: { badge: "Upcoming", badgeColor: "bg-white", btnText: "Start the Live", btnColor: "bg-white", icon: <Play size={18} strokeWidth={3} /> }, missed: { badge: "Missed", badgeColor: "bg-red-200", btnText: "Reschedule", btnColor: "bg-white", icon: <CalendarX size={18} strokeWidth={3} /> }, rescheduled: { badge: "Rescheduled", badgeColor: "bg-yellow-200", btnText: "View Details", btnColor: "bg-white", icon: <RefreshCcw size={18} strokeWidth={3} /> } };
  const config = statusConfig[status] || statusConfig.upcoming;
  
  const ButtonContent = () => (
    <button onClick={onClick} className={`px-6 py-4 rounded-full ${config.btnColor} font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center gap-2 whitespace-nowrap`}>{config.icon} {config.btnText}</button>
  );

  return (
    <div className={`${color} rounded-[2rem] p-6 ${brutalBorder} ${brutalShadowSm} flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
      <div><div className={`inline-block px-3 py-1 rounded-full ${config.badgeColor} ${brutalBorder} text-xs font-black uppercase tracking-wider mb-3`}>{config.badge}</div><h4 className="font-black text-2xl mb-2">{title}</h4><div className="flex items-center gap-4 text-gray-800 font-bold"><span className="flex items-center gap-1.5"><Clock size={18} strokeWidth={2.5} /> {time}</span><span className="flex items-center gap-1.5"><Users size={18} strokeWidth={2.5} /> {students} Students</span></div></div>
      {href ? <Link href={href}><ButtonContent /></Link> : <ButtonContent />}
    </div>
  );
}

function FeedbackNote({ text, student, rating, color, rotate }) {
  return (
    <div className={`${color} rounded-3xl p-6 ${brutalBorder} ${brutalShadow} ${rotate} hover:rotate-0 transition-transform duration-300 flex flex-col h-full`}>
      <MessageCircle size={32} strokeWidth={2} className="mb-4 opacity-50" /><p className="font-bold text-xl leading-snug mb-6 flex-1">"{text}"</p><div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-[#1E1E1E]/20"><span className="font-black text-lg">{student}</span><div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} size={16} strokeWidth={3} className={i < rating ? "fill-[#1E1E1E] text-[#1E1E1E]" : "text-transparent stroke-[#1E1E1E]"} />))}</div></div>
    </div>
  );
}

function StudentListRow({ student, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-3 lg:p-4 rounded-2xl border-[3px] border-transparent hover:border-[#1E1E1E] hover:bg-gray-50 transition-all cursor-pointer group`}>
      <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full ${student.color} flex items-center justify-center text-2xl ${brutalBorder}`}>{student.avatar}</div><div><h5 className="font-black text-lg leading-tight">{student.name}</h5><p className="font-bold text-gray-500 text-sm">{student.grade}</p></div></div>
      <div className="hidden md:flex items-center gap-8"><div className="text-center"><div className="text-xs font-bold text-gray-500 uppercase">Attendance</div><div className="font-black text-lg">{student.attendance}%</div></div><div className="text-center"><div className="text-xs font-bold text-gray-500 uppercase">Progress</div><div className="font-black text-lg">{student.progress}%</div></div></div>
      <button className={`px-4 py-2 rounded-full bg-white font-black text-sm ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] group-hover:bg-[#E9D5FF] transition-colors`}>View Profile</button>
    </div>
  );
}

function StudentModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1E1E]/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg"><button onClick={onClose} className={`absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 ${brutalBorder} ${brutalShadowSm} hover:bg-red-100 transition-colors`}><X size={20} strokeWidth={3} /></button><StudentProfileCard {...student} onClose={onClose} /></motion.div>
    </div>
  );
}

function StudentProfileCard({ id, name, grade, attendance, progress, classesTaken, avatar, color, parent_name, parent_phone, onClose }) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, feedback, parent
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSending(true);
    try {
      await axios.post(`/api/students/${id}/feedback`, { content: feedback, type: 'performance' });
      alert("Feedback sent to student!");
      setFeedback("");
      setActiveTab('profile');
    } catch (error) {
      console.error("Failed to send feedback:", error);
      alert("Failed to send feedback.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadow} flex flex-col gap-6`}>
      {activeTab === 'profile' && (
        <div className="flex items-start gap-5">
          <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-4xl ${brutalBorder} shrink-0`}>{avatar}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start"><div><h4 className="font-black text-2xl">{name}</h4><p className="font-bold text-gray-500">{grade}</p></div><div className={`px-3 py-1 bg-gray-100 rounded-full ${brutalBorder} text-sm font-black`}>{classesTaken} Classes</div></div>
            <div className="mt-4 space-y-3">
              <div><div className="flex justify-between text-sm font-black mb-1"><span>Attendance</span><span>{attendance}%</span></div><div className={`h-3 w-full bg-gray-100 rounded-full ${brutalBorder} overflow-hidden`}><div className={`h-full bg-[#FDE68A] border-r-[3px] border-[#1E1E1E]`} style={{ width: `${attendance}%` }}></div></div></div>
              <div><div className="flex justify-between text-sm font-black mb-1"><span>Overall Progress</span><span>{progress}%</span></div><div className={`h-3 w-full bg-gray-100 rounded-full ${brutalBorder} overflow-hidden`}><div className={`h-full bg-[#A78BFA] border-r-[3px] border-[#1E1E1E]`} style={{ width: `${progress}%` }}></div></div></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="flex flex-col gap-4">
          <h4 className="font-black text-2xl flex items-center gap-2"><BarChart size={24} /> Performance Feedback</h4>
          <p className="text-sm font-bold text-gray-500 italic">Send constructive feedback to {name} based on their performance.</p>
          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Type your feedback here..."
            className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-2xl px-4 py-3 font-bold focus:bg-white focus:outline-none resize-none`}
            rows={4}
          />
          <div className="flex gap-3">
            <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 bg-gray-100 rounded-xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>Cancel</button>
            <button 
              onClick={handleSendFeedback} 
              disabled={isSending}
              className={`flex-[2] py-3 bg-[#D1F2EB] rounded-xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {isSending ? <RefreshCcw className="animate-spin" size={18} /> : <Send size={18} strokeWidth={3} />}
              Send to Student
            </button>
          </div>
        </div>
      )}

      {activeTab === 'parent' && (
        <div className="flex flex-col gap-4">
          <h4 className="font-black text-2xl flex items-center gap-2"><PhoneCall size={24} /> Parent Details</h4>
          <div className={`p-6 bg-[#FFE5D9] rounded-3xl ${brutalBorder} ${brutalShadowSm}`}>
            <div className="space-y-4">
              <div><p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Parent Name</p><p className="font-black text-xl">{parent_name || 'Not Provided'}</p></div>
              <div><p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Contact Number</p><p className="font-black text-xl">{parent_phone || 'Not Provided'}</p></div>
            </div>
          </div>
          <button onClick={() => setActiveTab('profile')} className={`w-full py-3 bg-white rounded-xl font-black ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>Back to Profile</button>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-3 gap-3 pt-4 border-t-[3px] border-dashed border-gray-200">
          <button onClick={() => setActiveTab('feedback')} className={`py-2 rounded-xl bg-[#D1F2EB] font-black text-sm ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex flex-col items-center justify-center gap-1`}><BarChart size={18} strokeWidth={3} /> Feedback</button>
          <button 
            onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('change-view', { detail: 'chat' })); }}
            className={`py-2 rounded-xl bg-[#E9D5FF] font-black text-sm ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex flex-col items-center justify-center gap-1`}
          >
            <MessageSquare size={18} strokeWidth={3} /> Student
          </button>
          <button onClick={() => setActiveTab('parent')} className={`py-2 rounded-xl bg-[#FFE5D9] font-black text-sm ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex flex-col items-center justify-center gap-1`}><PhoneCall size={18} strokeWidth={3} /> Parent</button>
        </div>
      )}
    </div>
  );
}

function ReviewStatusRow({ title, type, status, date }) {
  const statusColors = { "Accepted": "bg-green-100 text-green-700 border-green-700", "Rejected": "bg-red-100 text-red-700 border-red-700", "Pending": "bg-yellow-100 text-yellow-700 border-yellow-700" };
  const statusIcons = { "Accepted": <CheckCircle2 size={16} strokeWidth={3} />, "Rejected": <XCircle size={16} strokeWidth={3} />, "Pending": <Clock size={16} strokeWidth={3} /> };
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl border-[3px] border-transparent hover:border-[#1E1E1E] transition-colors gap-4`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E]`}><FileText size={20} strokeWidth={2.5} /></div>
        <div><h5 className="font-black text-lg leading-tight">{title}</h5><p className="font-bold text-gray-500 text-sm">{type} • {date}</p></div>
      </div>
      <div className={`px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 border-[3px] ${statusColors[status]} shadow-[2px_2px_0px_0px_currentColor]`}>{statusIcons[status]} {status}</div>
    </div>
  );
}

function AIToolCard({ title, desc, icon, color, buttonText, actionIcon: ActionIcon = Wand2, href }) {
  const content = (
    <div className={`bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadow} flex flex-col justify-between h-full group cursor-pointer hover:bg-gray-50 transition-colors`}>
      <div><div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] group-hover:scale-110 transition-transform`}>{icon}</div><h4 className="text-xl font-black leading-tight mb-2">{title}</h4><p className="font-bold text-gray-500 text-sm">{desc}</p></div>
      <div className={`mt-6 w-full py-3 rounded-xl bg-white font-black flex items-center justify-center gap-2 ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] group-hover:bg-[#1E1E1E] group-hover:text-white transition-colors`}><ActionIcon size={18} strokeWidth={3} /> {buttonText || "Generate"}</div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}

function BrutalToggle({ label, isOn, onToggle, color = "bg-[#34D399]" }) {
  return (
    <div className="flex items-center justify-between py-3 border-b-2 border-dashed border-gray-300 last:border-0">
      <span className="font-bold text-gray-700">{label}</span>
      <button onClick={onToggle} className={`w-14 h-8 rounded-full ${brutalBorder} relative transition-colors duration-300 ${isOn ? color : 'bg-gray-200'}`}><div className={`absolute top-[2px] w-5 h-5 rounded-full bg-white ${brutalBorder} transition-all duration-300 ${isOn ? 'left-7' : 'left-1'}`}></div></button>
    </div>
  );
}

function WeeklyCalendar({ classes = [], onAdd, onEdit, onDelete }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekDays = (date) => {
    const days = [];
    const current = new Date(date);
    const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay();
    current.setDate(current.getDate() - dayOfWeek + 1); // Start with Monday

    for (let i = 0; i < 7; i++) {
      days.push({
        name: current.toLocaleDateString('en-US', { weekday: 'short' }),
        date: current.getDate().toString(),
        fullDate: new Date(current),
        isToday: current.toDateString() === new Date().toDateString()
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days = getWeekDays(currentDate);

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToday = () => setCurrentDate(new Date());

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={`bg-white rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} overflow-x-auto`}>
      <div className="flex justify-between items-center mb-8 min-w-[800px]">
        <h4 className="text-2xl font-black flex items-center gap-3"><div className={`p-2 bg-[#E9D5FF] rounded-xl ${brutalBorder}`}><Calendar size={24} strokeWidth={3} /></div>{monthYear}</h4>
        <div className="flex gap-3"><button onClick={prevWeek} className={`p-2 rounded-full bg-gray-100 ${brutalBorder} ${brutalHover}`}><ChevronLeft size={20} strokeWidth={3} /></button><button onClick={goToday} className={`px-5 py-2 rounded-full bg-white ${brutalBorder} ${brutalHover} font-black`}>Today</button><button onClick={nextWeek} className={`p-2 rounded-full bg-gray-100 ${brutalBorder} ${brutalHover}`}><ChevronRight size={20} strokeWidth={3} /></button></div>
      </div>
      <div className="grid grid-cols-7 gap-4 min-w-[800px]">
        {days.map((day, idx) => {
          // Find classes for this day
          const dayClasses = classes.filter(c => {
            const classDate = new Date(c.scheduled_at);
            return classDate.toDateString() === day.fullDate.toDateString();
          });

          return (
            <div key={idx} className="flex flex-col gap-3">
              <div className={`text-center pb-3 border-b-[3px] border-[#1E1E1E] ${day.isToday ? 'text-purple-600' : ''}`}><div className="font-bold text-gray-500 uppercase text-sm tracking-wider">{day.name}</div><div className={`text-3xl font-black mt-2 ${day.isToday ? `bg-[#E9D5FF] text-[#1E1E1E] w-14 h-14 mx-auto rounded-full flex items-center justify-center ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E]` : ''}`}>{day.date}</div></div>
              <div className="flex flex-col gap-3 pt-2 min-h-[150px]">
                {dayClasses.map((ev, i) => {
                  const evDate = new Date(ev.scheduled_at);
                  const timeString = evDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  
                  const calendarColors = ["bg-[#D1F2EB]", "bg-[#FFE5D9]", "bg-[#E9D5FF]", "bg-[#FEF08A]", "bg-[#BFDBFE]", "bg-[#FBCFE8]"];
                  const bgColor = calendarColors[(ev.id || i) % calendarColors.length];

                  return (
                    <div key={i} className={`${bgColor} p-3 rounded-2xl ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#1E1E1E] transition-all cursor-pointer relative group`}>
                      <div className="font-black text-sm leading-tight mb-1 pr-4">{ev.title}</div>
                      <div className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-2"><Clock size={12} strokeWidth={3}/> {timeString}</div>
                      <div className="absolute inset-0 bg-[#1E1E1E]/90 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                        <button onClick={() => onEdit && onEdit(ev)} className="text-white hover:text-yellow-300 transition-colors" title="Edit/Reschedule"><PenTool size={18} strokeWidth={2.5} /></button>
                        <button onClick={() => onDelete && onDelete(ev.id)} className="text-white hover:text-red-400 transition-colors" title="Cancel"><CalendarX size={18} strokeWidth={2.5} /></button>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => onAdd && onAdd(day.fullDate)} className="h-12 rounded-2xl border-[3px] border-dashed border-gray-300 hover:border-[#1E1E1E] hover:bg-white flex items-center justify-center text-gray-400 hover:text-[#1E1E1E] transition-colors group"><Plus size={24} strokeWidth={3} className="group-hover:scale-125 transition-transform" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionWidget({ title, desc, icon, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`${color} rounded-[2rem] p-6 ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex flex-col justify-center items-start gap-3 text-left w-full`}
    >
      <div className={`bg-white rounded-xl p-2 ${brutalBorder}`}>{icon}</div>
      <div>
        <h4 className="text-xl font-black leading-tight">{title}</h4>
        <p className="font-bold text-gray-700 text-sm">{desc}</p>
      </div>
    </button>
  );
}

function AssignmentReviewRow({ student, task, date, color, onAccept, onReject }) {
  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-2xl ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E]`}>
      <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center ${brutalBorder}`}><FileText size={18} strokeWidth={2.5} /></div><div><h5 className="font-black text-base leading-tight">{student}</h5><p className="font-bold text-gray-600 text-xs">{task} • {date}</p></div></div>
      <div className="flex gap-2"><button onClick={onAccept} className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-2 border-[#1E1E1E] hover:bg-green-200 transition-colors" title="Accept"><Check size={16} strokeWidth={3} /></button><button onClick={onReject} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center border-2 border-[#1E1E1E] hover:bg-red-200 transition-colors" title="Reject"><XCircle size={16} strokeWidth={3} /></button></div>
    </div>
  );
}

function QuizScoreRow({ student, quiz, score, color }) {
  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-2xl ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E]`}>
      <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center font-black text-lg ${brutalBorder}`}>{student.charAt(0)}</div><div><h5 className="font-black text-base leading-tight">{student}</h5><p className="font-bold text-gray-600 text-xs">{quiz}</p></div></div>
      <div className={`px-3 py-1 rounded-full ${score >= 90 ? 'bg-green-200' : 'bg-yellow-200'} ${brutalBorder} font-black text-sm`}>{score}%</div>
    </div>
  );
}

function BrutalSelect({ value, onChange, options, label, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && <label className="font-black text-sm text-gray-700 mb-2 block uppercase tracking-wider">{label}</label>}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-xl bg-white font-black outline-none flex items-center justify-between transition-all ${brutalBorder} ${isOpen ? 'shadow-[0px_0px_0px_0px_#1E1E1E] translate-y-1' : 'shadow-[3px_3px_0px_0px_#1E1E1E] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#1E1E1E]'}`}
      >
        {value}
        <ChevronDown size={20} strokeWidth={3} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full left-0 w-full mt-2 bg-white rounded-xl z-[9999] overflow-hidden ${brutalBorder} shadow-[6px_6px_0px_0px_#1E1E1E]`}
          >
            {options.map((opt, idx) => (
              <div 
                key={idx}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`p-4 font-black cursor-pointer transition-colors border-b-[3px] border-[#1E1E1E] last:border-b-0 ${value === opt ? 'bg-[#E9D5FF] text-[#1E1E1E]' : 'hover:bg-gray-100'}`}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
