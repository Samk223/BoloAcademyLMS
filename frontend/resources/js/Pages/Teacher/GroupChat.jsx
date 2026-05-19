import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Paperclip, Smile, MoreVertical, 
  Search, ArrowLeft, Users, User, 
  Image as ImageIcon, FileText, Download,
  Check, CheckCheck, Menu, X
} from 'lucide-react';
import { brutalBorder, brutalShadow, brutalShadowSm, brutalHover } from '../../utils/theme';

export default function GroupChat({ auth }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
      // Setup polling for new messages (simple implementation)
      const interval = setInterval(() => fetchMessages(activeRoom.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/chat/rooms');
      setRooms(response.data);
      if (response.data.length > 0 && !activeRoom) {
        setActiveRoom(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`/api/chat/rooms/${roomId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileInputRef.current?.files[0]) return;

    const formData = new FormData();
    formData.append('chat_room_id', activeRoom.id);
    formData.append('message', newMessage);
    if (fileInputRef.current?.files[0]) {
      formData.append('attachment', fileInputRef.current.files[0]);
    }

    try {
      const response = await axios.post('/api/chat/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const filteredRooms = rooms.filter(room => 
    (room.name || room.student?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E1E1E] font-sans overflow-hidden flex flex-col">
      <Head title="Chat Environment - Bolo Academy" />
      
      {/* Brutalist Header */}
      <header className={`bg-white border-b-[4px] border-[#1E1E1E] py-4 px-6 flex items-center justify-between z-50 sticky top-0`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${brutalBorder} bg-white`}
          >
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Chat Hub</h1>
            <p className="text-xs font-bold text-gray-500 uppercase">Communication & Support</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center px-4 py-2 bg-[#D1F2EB] rounded-full ${brutalBorder} font-black text-sm`}>
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Teacher Online
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-full md:w-80' : 'w-0'} bg-white border-r-[4px] border-[#1E1E1E] transition-all duration-300 flex flex-col z-40 absolute md:relative h-full`}>
          <div className="p-4 border-b-[3px] border-[#1E1E1E]">
            <div className={`relative bg-gray-50 rounded-xl ${brutalBorder} flex items-center px-3 py-2`}>
              <Search size={18} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 w-full font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoom(room);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full p-4 rounded-2xl border-[3px] transition-all flex items-center gap-4 text-left ${
                  activeRoom?.id === room.id 
                    ? 'bg-[#E9D5FF] border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E]' 
                    : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${room.type === 'group' ? 'bg-[#34D399]' : 'bg-[#FCA5A5]'} ${brutalBorder} flex items-center justify-center text-xl shrink-0`}>
                  {room.type === 'group' ? <Users size={24} /> : (room.student?.avatar || <User size={24} />)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm truncate">{room.name || room.student?.name}</h4>
                  <p className="text-xs font-bold text-gray-500 truncate">
                    {room.type === 'group' ? 'Group Chat' : `1-on-1 with ${room.student?.name}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-[#FDFCF9] relative overflow-hidden">
          {activeRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b-[3px] border-[#1E1E1E] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2"><Menu /></button>
                  <div className={`w-10 h-10 rounded-full ${activeRoom.type === 'group' ? 'bg-[#34D399]' : 'bg-[#FCA5A5]'} ${brutalBorder} flex items-center justify-center text-lg`}>
                    {activeRoom.type === 'group' ? <Users size={20} /> : (activeRoom.student?.avatar || <User size={20} />)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-none">{activeRoom.name || activeRoom.student?.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Active Now</span>
                    </div>
                  </div>
                </div>
                <button className={`p-2 rounded-xl hover:bg-gray-100 ${brutalBorder} bg-white`}><MoreVertical size={20} /></button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-[#1E1E1E]">
                      <Users size={32} />
                    </div>
                    <p className="font-black text-lg">No messages yet</p>
                    <p className="font-bold text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_type === 'teacher';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-3xl ${brutalBorder} ${
                            isMe ? 'bg-[#E9D5FF] rounded-tr-none' : 'bg-white rounded-tl-none'
                          } shadow-[4px_4px_0px_0px_#1E1E1E]`}>
                            {!isMe && (
                              <span className="block text-[10px] font-black text-purple-600 uppercase mb-1">
                                {msg.sender_type === 'admin' ? 'Admin' : 'Student'}
                              </span>
                            )}
                            
                            {msg.message && <p className="font-bold text-sm md:text-base whitespace-pre-wrap">{msg.message}</p>}
                            
                            {msg.attachment_path && (
                              <div className={`mt-3 p-3 bg-white/40 rounded-2xl border-2 border-[#1E1E1E]/10 flex items-center gap-3`}>
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black truncate">Shared Document</p>
                                  <a href={`/storage/${msg.attachment_path}`} target="_blank" className="text-[10px] font-bold text-blue-600 hover:underline">Download File</a>
                                </div>
                                <Download size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2 px-1">
                            <span className="text-[10px] font-bold text-gray-400">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCheck size={12} className="text-blue-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t-[4px] border-[#1E1E1E]">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-5xl mx-auto">
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={() => setNewMessage(prev => prev || " ")} 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-3 rounded-2xl bg-[#D1F2EB] ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                    >
                      <Paperclip size={20} strokeWidth={3} />
                    </button>
                    <button 
                      type="button" 
                      className={`hidden sm:flex p-3 rounded-2xl bg-[#FEF08A] ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}
                    >
                      <Smile size={20} strokeWidth={3} />
                    </button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <textarea 
                      rows={1}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      className={`w-full bg-gray-50 border-[3px] border-[#1E1E1E] rounded-[1.5rem] px-5 py-3 font-bold focus:bg-white focus:outline-none transition-all resize-none max-h-32`}
                    />
                  </div>

                  <button 
                    type="submit"
                    className={`p-4 rounded-full bg-[#34D399] ${brutalBorder} shadow-[4px_4px_0px_0px_#1E1E1E] ${brutalHover} active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`}
                  >
                    <Send size={24} strokeWidth={3} className="text-[#1E1E1E]" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className={`w-32 h-32 rounded-[2.5rem] bg-[#E9D5FF] ${brutalBorder} ${brutalShadow} flex items-center justify-center mb-8 rotate-3`}>
                <Users size={64} strokeWidth={2} />
              </div>
              <h2 className="text-4xl font-black mb-4">Select a conversation</h2>
              <p className="text-xl font-bold text-gray-500 max-w-md italic">Connect with your students or broadcast to the entire class group.</p>
            </div>
          )}
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E1E1E; border-radius: 10px; border: 2px solid #FDFCF9; }
        ::-webkit-scrollbar-thumb:hover { background: #4B5563; }
      `}} />
    </div>
  );
}
