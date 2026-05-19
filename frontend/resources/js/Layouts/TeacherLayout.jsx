import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Home, BookOpen, Users, Palette, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { brutalBorder, brutalShadow } from '../utils/theme';
import { motion } from 'motion/react';
import { SidebarItem } from '../Components/Teacher/DashboardComponents';

export default function TeacherLayout({ children, user, activeView = 'dashboard', onViewChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: <Home size={28} strokeWidth={2.5} />, label: 'Dashboard', id: 'dashboard' },
    { icon: <BookOpen size={28} strokeWidth={2.5} />, label: 'Classes', id: 'classes' },
    { icon: <Users size={28} strokeWidth={2.5} />, label: 'Students', id: 'students' },
    { icon: <Palette size={28} strokeWidth={2.5} />, label: 'Creations', id: 'creations' },
    { icon: <Settings size={28} strokeWidth={2.5} />, label: 'Settings', id: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-[#FFF8E7] font-sans overflow-hidden text-[#1E1E1E] selection:bg-purple-200">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 100 : 260 }}
        className={`bg-[#E9D5FF] ${brutalBorder} border-y-0 border-l-0 flex flex-col items-center py-8 relative z-30 flex-shrink-0 transition-all duration-300`}
      >
        {/* Wavy border effect using SVG pattern */}
        <div className="absolute top-0 -right-[18px] w-[18px] h-full overflow-hidden pointer-events-none z-10">
           <svg width="18" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
             <defs>
               <pattern id="wave" x="0" y="0" width="18" height="60" patternUnits="userSpaceOnUse">
                 <path d="M0,0 C18,15 18,45 0,60" fill="#E9D5FF" stroke="#1E1E1E" strokeWidth="4" />
               </pattern>
             </defs>
             <rect x="0" y="0" width="18" height="100%" fill="url(#wave)" />
           </svg>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-8 -right-4 w-8 h-8 bg-white rounded-full ${brutalBorder} flex items-center justify-center z-50 hover:bg-gray-100 cursor-pointer`}
        >
          {isCollapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
        </button>

        <div className="text-center mb-10 px-4 flex flex-col items-center">
          <img
            src="/images/bolo_logo.png"
            alt="Bolo Academy"
            className={`object-contain transition-all duration-300 drop-shadow-sm ${isCollapsed ? 'w-16 h-16' : 'w-32 h-32'}`}
          />
          {!isCollapsed && (
            <h1 className="font-black text-2xl leading-tight">
              Bolo<br/>Academy
            </h1>
          )}
        </div>

        <div className="flex flex-col gap-5 w-full px-5">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => onViewChange ? onViewChange(item.id) : null} className="w-full">
              <SidebarItem 
                icon={item.icon} 
                label={item.label} 
                active={activeView === item.id} 
                collapsed={isCollapsed} 
              />
            </button>
          ))}
        </div>

        <div className="mt-auto px-5 w-full">
           <Link href={route('logout')} method="post" as="button" className="w-full">
              <SidebarItem 
                icon={<LogOut size={28} strokeWidth={2.5} />} 
                label="Logout" 
                collapsed={isCollapsed} 
              />
           </Link>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        {children}
      </main>
    </div>
  );
}
