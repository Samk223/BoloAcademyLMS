import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock, Calendar, Play, CheckCircle2, XCircle, FileText, StickyNote, MessageCircle, Wand2, ChevronLeft, ChevronRight, Plus, RefreshCcw } from 'lucide-react';
import { brutalBorder, brutalShadow, brutalShadowSm, brutalHover } from '../../utils/theme';

export function SquigglyTitle({ title, color, icon }) {
  return (
    <div className="inline-block mb-8 relative">
      <h3 className="text-3xl font-black relative z-10">{title}</h3>
      <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 100 12" preserveAspectRatio="none">
        <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </svg>
      {icon}
    </div>
  );
}

export function CreationCard({ title, desc, btnText, icon, color }) {
  return (
    <div className={`${color} rounded-[2.5rem] p-8 ${brutalBorder} ${brutalShadow} flex flex-col h-full`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{icon}</div>
        <h4 className="font-black text-2xl leading-tight">{title}</h4>
      </div>
      <p className="font-bold text-gray-800 mb-8 flex-1 text-lg">{desc}</p>
      <button className={`w-full py-3 rounded-full bg-white/60 font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>
        {btnText}
      </button>
    </div>
  );
}

export function LiveClassCard({ time, title, grade, color }) {
  return (
    <div className={`${color} rounded-[2rem] p-5 ${brutalBorder} ${brutalShadowSm} flex items-center gap-5`}>
      <div className={`bg-white rounded-2xl p-3 flex flex-col items-center justify-center min-w-[90px] ${brutalBorder} shadow-sm`}>
        <Calendar size={24} strokeWidth={3} className="mb-1" />
        <span className="font-black text-sm text-center leading-tight">{time.split(' ')[0]}<br/>{time.split(' ')[1]}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-black text-xl mb-1">{title}</h4>
        <p className="font-bold text-gray-700 text-base">{grade}</p>
      </div>
      <button className={`px-6 py-3 rounded-full bg-white/60 font-black text-base ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>
        Join Now
      </button>
    </div>
  );
}

export function ProgressRow({ name, avatar, progress, score, stars, color }) {
  return (
    <tr className="border-b-[3px] border-[#1E1E1E] last:border-0">
      <td className="py-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-[#FFE5D9] flex items-center justify-center text-2xl ${brutalBorder}`}>
            {avatar}
          </div>
          <span className="font-black text-lg">{name}</span>
        </div>
      </td>
      <td className="py-5 pr-6">
        <div className={`h-5 w-full bg-gray-100 rounded-full ${brutalBorder} overflow-hidden`}>
          <div className={`h-full ${color} border-r-[3px] border-[#1E1E1E]`} style={{ width: `${progress}%` }}></div>
        </div>
      </td>
      <td className="py-5 font-black text-xl">{score}</td>
      <td className="py-5">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={20} strokeWidth={2.5} className={i < stars ? "fill-yellow-400 text-yellow-500" : "text-gray-300"} />
          ))}
        </div>
      </td>
    </tr>
  );
}

export function StatWidget({ title, count, icon, color }) {
  return (
    <div className={`bg-white rounded-[2rem] p-6 ${brutalBorder} ${brutalShadowSm} flex items-center gap-5 w-full`}>
      <div className={`w-16 h-16 rounded-2xl ${color} ${brutalBorder} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <h4 className="text-3xl font-black leading-none mb-1">{count}</h4>
        <p className="font-bold text-gray-600">{title}</p>
      </div>
    </div>
  );
}

export function FeedbackNote({ text, student, rating, color, rotate }) {
  return (
    <div className={`${color} rounded-3xl p-6 ${brutalBorder} ${brutalShadow} ${rotate} hover:rotate-0 transition-transform duration-300 flex flex-col h-full`}>
      <MessageCircle size={32} strokeWidth={2} className="mb-4 opacity-50" />
      <p className="font-bold text-xl leading-snug mb-6 flex-1">"{text}"</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-[#1E1E1E]/20">
        <span className="font-black text-lg">{student}</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} strokeWidth={3} className={i < rating ? "fill-[#1E1E1E] text-[#1E1E1E]" : "text-transparent stroke-[#1E1E1E]"} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AIToolCard({ title, desc, icon, color, buttonText, actionIcon: ActionIcon = Wand2 }) {
  return (
    <div className={`bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadow} flex flex-col justify-between group cursor-pointer hover:bg-gray-50 transition-colors`}>
      <div>
        <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h4 className="text-xl font-black leading-tight mb-2">{title}</h4>
        <p className="font-bold text-gray-500 text-sm">{desc}</p>
      </div>
      <button className={`mt-6 w-full py-3 rounded-xl bg-white font-black flex items-center justify-center gap-2 ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] group-hover:bg-[#1E1E1E] group-hover:text-white transition-colors`}>
        <ActionIcon size={18} strokeWidth={3} /> {buttonText || "Generate"}
      </button>
    </div>
  );
}

export function ReviewStatusRow({ title, type, status, date }) {
  const statusColors = {
    "Accepted": "bg-green-100 text-green-700 border-green-700",
    "Rejected": "bg-red-100 text-red-700 border-red-700",
    "Pending": "bg-yellow-100 text-yellow-700 border-yellow-700",
  };
  
  const statusIcons = {
    "Accepted": <CheckCircle2 size={16} strokeWidth={3} />,
    "Rejected": <XCircle size={16} strokeWidth={3} />,
    "Pending": <Clock size={16} strokeWidth={3} />,
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl border-[3px] border-transparent hover:border-[#1E1E1E] transition-colors gap-4`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E]`}>
          <FileText size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h5 className="font-black text-lg leading-tight">{title}</h5>
          <p className="font-bold text-gray-500 text-sm">{type} • {date}</p>
        </div>
      </div>
      <div className={`px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 border-[3px] ${statusColors[status]} shadow-[2px_2px_0px_0px_currentColor]`}>
        {statusIcons[status]} {status}
      </div>
    </div>
  );
}

export function AssignmentReviewRow({ student, task, date, color }) {
  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-2xl ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E]`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center ${brutalBorder}`}>
          <FileText size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h5 className="font-black text-base leading-tight">{student}</h5>
          <p className="font-bold text-gray-600 text-xs">{task} • {date}</p>
        </div>
      </div>
      <div className="flex gap-2 text-[#1E1E1E]">
        <button className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-2 border-[#1E1E1E] hover:bg-green-200 transition-colors" title="Accept">
          <CheckCircle2 size={16} strokeWidth={3} />
        </button>
        <button className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center border-2 border-[#1E1E1E] hover:bg-red-200 transition-colors" title="Reject">
          <XCircle size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

export function QuizScoreRow({ student, quiz, score, color }) {
  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-2xl ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E]`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center font-black text-lg ${brutalBorder}`}>
          {student.charAt(0)}
        </div>
        <div>
          <h5 className="font-black text-base leading-tight">{student}</h5>
          <p className="font-bold text-gray-600 text-xs">{quiz}</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full ${score >= 90 ? 'bg-green-200' : 'bg-yellow-200'} ${brutalBorder} font-black text-sm`}>
        {score}%
      </div>
    </div>
  );
}

export function ClassActionCard({ status, title, time, students, color }) {
  const statusConfig = {
    live: { badge: "Live Now", badgeColor: "bg-green-300", btnText: "Join Live", btnColor: "bg-green-400", icon: <Play size={18} strokeWidth={3} /> },
    upcoming: { badge: "Upcoming", badgeColor: "bg-white", btnText: "Prepare", btnColor: "bg-white", icon: <Clock size={18} strokeWidth={3} /> },
    missed: { badge: "Missed", badgeColor: "bg-red-200", btnText: "Reschedule", btnColor: "bg-white", icon: <CalendarX size={18} strokeWidth={3} /> },
    rescheduled: { badge: "Rescheduled", badgeColor: "bg-yellow-200", btnText: "View Details", btnColor: "bg-white", icon: <RefreshCcw size={18} strokeWidth={3} /> }
  };

  const config = statusConfig[status];

  return (
    <div className={`${color} rounded-[2rem] p-6 ${brutalBorder} ${brutalShadowSm} flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
      <div>
        <div className={`inline-block px-3 py-1 rounded-full ${config.badgeColor} ${brutalBorder} text-xs font-black uppercase tracking-wider mb-3`}>
          {config.badge}
        </div>
        <h4 className="font-black text-2xl mb-2">{title}</h4>
        <div className="flex items-center gap-4 text-gray-800 font-bold">
          <span className="flex items-center gap-1.5 text-sm"><Clock size={16} strokeWidth={2.5} /> {time}</span>
          <span className="flex items-center gap-1.5 text-sm"><Users size={16} strokeWidth={2.5} /> {students} Students</span>
        </div>
      </div>
      
      <button className={`px-6 py-4 rounded-full ${config.btnColor} font-black text-lg ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center gap-2 whitespace-nowrap`}>
        {config.icon} {config.btnText}
      </button>
    </div>
  );
}

export function SidebarItem({ icon, label, active, collapsed, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex flex-col items-center justify-center py-4 rounded-3xl ${brutalBorder} ${active ? 'bg-white shadow-[3px_3px_0px_0px_#1E1E1E]' : 'bg-transparent hover:bg-white/60'} transition-all duration-200 group relative`}
    >
      <div className="mb-1 text-[#1E1E1E] group-hover:scale-110 transition-transform shrink-0">{icon}</div>
      {!collapsed && <span className="font-black text-[14px] leading-tight text-center">{label}</span>}
      
      {collapsed && (
        <div className={`absolute left-20 bg-white ${brutalBorder} px-3 py-1.5 rounded-xl font-black text-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-[2px_2px_0px_0px_#1E1E1E]`}>
          {label}
        </div>
      )}
    </button>
  );
}

export function WeeklyCalendar() {
  const days = [
    { name: "Mon", date: "12", isToday: false },
    { name: "Tue", date: "13", isToday: true },
    { name: "Wed", date: "14", isToday: false },
    { name: "Thu", date: "15", isToday: false },
    { name: "Fri", date: "16", isToday: false },
    { name: "Sat", date: "17", isToday: false },
    { name: "Sun", date: "18", isToday: false },
  ];

  const mockEvents = {
    "12": [{ type: "class", title: "Grammar 101", time: "10:00 AM", color: "bg-[#D1F2EB]" }],
    "13": [
      { type: "class", title: "Phrasal Verbs", time: "10:00 AM", color: "bg-[#D1F2EB]" },
      { type: "note", title: "Prep slides", time: "", color: "bg-[#FEF08A]" }
    ],
    "14": [{ type: "class", title: "Business Eng", time: "2:00 PM", color: "bg-[#FFE5D9]" }],
    "15": [],
    "16": [
      { type: "class", title: "Speaking Mock", time: "11:00 AM", color: "bg-[#E9D5FF]" },
      { type: "note", title: "Grade essays", time: "", color: "bg-[#FEF08A]" }
    ],
    "17": [{ type: "note", title: "Plan next week", time: "", color: "bg-[#FEF08A]" }],
    "18": [],
  };

  return (
    <div className={`bg-white rounded-[2.5rem] p-6 lg:p-8 ${brutalBorder} ${brutalShadow} overflow-x-auto`}>
      <div className="flex justify-between items-center mb-8 min-w-[800px]">
        <h4 className="text-2xl font-black flex items-center gap-3">
          <div className={`p-2 bg-[#E9D5FF] rounded-xl ${brutalBorder}`}><Calendar size={24} strokeWidth={3} /></div>
          April 2026
        </h4>
        <div className="flex gap-3">
          <button className={`p-2 rounded-full bg-gray-100 ${brutalBorder} ${brutalHover}`}><ChevronLeft size={20} strokeWidth={3} /></button>
          <button className={`px-5 py-2 rounded-full bg-white ${brutalBorder} ${brutalHover} font-black`}>Today</button>
          <button className={`p-2 rounded-full bg-gray-100 ${brutalBorder} ${brutalHover}`}><ChevronRight size={20} strokeWidth={3} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 min-w-[800px]">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <div className={`text-center pb-3 border-b-[3px] border-[#1E1E1E] ${day.isToday ? 'text-purple-600' : ''}`}>
              <div className="font-bold text-gray-500 uppercase text-xs tracking-wider">{day.name}</div>
              <div className={`text-2xl font-black mt-2 ${day.isToday ? `bg-[#E9D5FF] text-[#1E1E1E] w-12 h-12 mx-auto rounded-full flex items-center justify-center ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E]` : ''}`}>
                {day.date}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 min-h-[150px]">
              {mockEvents[day.date]?.map((ev, i) => (
                <div key={i} className={`${ev.color} p-3 rounded-2xl ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#1E1E1E] transition-all cursor-pointer relative group`}>
                  {ev.type === 'note' && <StickyNote size={14} strokeWidth={2.5} className="absolute top-2 right-2 opacity-40" />}
                  <div className="font-black text-xs leading-tight mb-1 pr-4">{ev.title}</div>
                  {ev.time && <div className="text-[10px] font-bold text-gray-800 flex items-center gap-1 mt-2"><Clock size={10} strokeWidth={3}/> {ev.time}</div>}
                </div>
              ))}
              <button className="h-10 rounded-2xl border-[3px] border-dashed border-gray-300 hover:border-[#1E1E1E] hover:bg-white flex items-center justify-center text-gray-400 hover:text-[#1E1E1E] transition-colors group">
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentListRow({ student, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-3 lg:p-4 rounded-2xl border-[3px] border-transparent hover:border-[#1E1E1E] hover:bg-gray-50 transition-all cursor-pointer group`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${student.color} flex items-center justify-center text-2xl ${brutalBorder}`}>
          {student.avatar}
        </div>
        <div>
          <h5 className="font-black text-lg leading-tight">{student.name}</h5>
          <p className="font-bold text-gray-500 text-sm">{student.grade}</p>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <div className="text-center">
          <div className="text-xs font-bold text-gray-500 uppercase">Attendance</div>
          <div className="font-black text-lg">{student.attendance}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold text-gray-500 uppercase">Progress</div>
          <div className="font-black text-lg">{student.progress}%</div>
        </div>
      </div>

      <button className={`px-4 py-2 rounded-full bg-white font-black text-sm ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] group-hover:bg-[#E9D5FF] transition-colors`}>
        View Profile
      </button>
    </div>
  );
}

export function StudentProfileCard({ name, grade, attendance, progress, classesTaken, avatar, color }) {
  return (
    <div className={`bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadow} flex flex-col gap-6`}>
      <div className="flex items-start gap-5">
        <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-4xl ${brutalBorder} shrink-0`}>
          {avatar}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-black text-2xl">{name}</h4>
              <p className="font-bold text-gray-500">{grade}</p>
            </div>
            <div className={`px-3 py-1 bg-gray-100 rounded-full ${brutalBorder} text-sm font-black`}>
              {classesTaken} Classes
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm font-black mb-1">
                <span>Attendance</span>
                <span>{attendance}%</span>
              </div>
              <div className={`h-3 w-full bg-gray-100 rounded-full ${brutalBorder} overflow-hidden`}>
                <div className={`h-full bg-[#FDE68A] border-r-[3px] border-[#1E1E1E]`} style={{ width: `${attendance}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-black mb-1">
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <div className={`h-3 w-full bg-gray-100 rounded-full ${brutalBorder} overflow-hidden`}>
                <div className={`h-full bg-[#A78BFA] border-r-[3px] border-[#1E1E1E]`} style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrutalToggle({ label, defaultOn = false, color = "bg-[#34D399]" }) {
  const [isOn, setIsOn] = React.useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3 border-b-2 border-dashed border-gray-300 last:border-0">
      <span className="font-bold text-gray-700">{label}</span>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={`w-14 h-8 rounded-full ${brutalBorder} relative transition-colors duration-300 ${isOn ? color : 'bg-gray-200'}`}
      >
        <div className={`absolute top-[2px] w-5 h-5 rounded-full bg-white ${brutalBorder} transition-all duration-300 ${isOn ? 'left-7' : 'left-1'}`}></div>
      </button>
    </div>
  );
}
