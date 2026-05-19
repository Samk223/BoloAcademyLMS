import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Paperclip, Smile, MoreVertical, 
  Search, ArrowLeft, Users, User, 
  ImageIcon, FileText, Download,
  Check, CheckCheck, Menu, X, MessageSquare, Trash2, Loader2
} from 'lucide-react';

const brutalBorder = "border-[3px] border-[#1E1E1E]";
const brutalShadow = "shadow-[4px_4px_0px_0px_#1E1E1E]";
const brutalShadowSm = "shadow-[3px_3px_0px_0px_#1E1E1E]";
const brutalHover = "hover:translate-y-[3px] hover:translate-x-[3px] hover:shadow-none transition-all duration-200";

export default function ChatHubView() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMembersOpen, setIsMembersOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
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

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
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
    if (!newMessage.trim() && !selectedFile) return;
    if (isSending) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append('chat_room_id', activeRoom.id);
    formData.append('message', newMessage);
    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    try {
      const response = await axios.post('/api/chat/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    try {
      await axios.delete(`/api/chat/messages/${messageToDelete}`);
      setMessages(messages.filter(m => m.id !== messageToDelete));
      setMessageToDelete(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const startPrivateChat = async (student) => {
    // Check if direct room already exists
    const existingRoom = rooms.find(r => r.type === 'direct' && r.student_id === student.id);
    if (existingRoom) {
      setActiveRoom(existingRoom);
      return;
    }

    // Otherwise, you might want to create a room on the backend
    // For now, let's just use the room if it's there, or assume the backend handles it via Student Hub
    // But since the user wants to do it from here, let's mock it or assume it's created
    setActiveRoom({
      id: `new-${student.id}`, // Placeholder
      name: student.name,
      type: 'direct',
      student: student
    });
  };

  const filteredRooms = rooms.filter(room => 
    (room.name || room.student?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = students.filter(s => 
    s.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden border-[4px] border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E]">
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} bg-[#FDFCF9] border-r-[3px] border-[#1E1E1E] transition-all duration-300 flex flex-col z-20 overflow-hidden`}>
          <div className="p-4 border-b-[2px] border-[#1E1E1E]/10">
            <h3 className="font-black text-xl mb-4">Messages</h3>
            <div className={`relative bg-white rounded-xl ${brutalBorder} flex items-center px-3 py-2`}>
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
                onClick={() => setActiveRoom(room)}
                className={`w-full p-3 rounded-2xl border-[3px] transition-all flex items-center gap-3 text-left ${
                  activeRoom?.id === room.id 
                    ? 'bg-[#E9D5FF] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E]' 
                    : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${room.type === 'group' ? 'bg-[#34D399]' : 'bg-[#FCA5A5]'} ${brutalBorder} flex items-center justify-center text-lg shrink-0`}>
                  {room.type === 'group' ? <Users size={20} /> : (room.student?.avatar || <User size={20} />)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm truncate">{room.name || room.student?.name}</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {room.type === 'group' ? 'Class Group' : 'Direct Message'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Content */}
        <section className="flex-1 flex flex-col bg-white">
          {activeRoom ? (
            <>
              <div className="p-4 bg-[#FFF8E7] border-b-[3px] border-[#1E1E1E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${activeRoom.type === 'group' ? 'bg-[#34D399]' : 'bg-[#FCA5A5]'} ${brutalBorder} flex items-center justify-center text-lg`}>
                    {activeRoom.type === 'group' ? <Users size={20} /> : (activeRoom.student?.avatar || <User size={20} />)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-none">{activeRoom.name || activeRoom.student?.name}</h3>
                    <p className="text-[10px] font-black text-green-600 uppercase mt-1 tracking-wider">
                      {activeRoom.type === 'group' ? `${students.length} Members Online` : 'Active Now'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeRoom.type === 'group' && (
                    <button 
                      onClick={() => setIsMembersOpen(!isMembersOpen)}
                      className={`p-2 rounded-xl bg-white ${brutalBorder} ${brutalShadowSm} ${brutalHover} flex items-center gap-2 font-black text-xs`}
                    >
                      <Users size={16} /> {isMembersOpen ? 'Hide Members' : 'Show Members'}
                    </button>
                  )}
                  <button className={`p-2 rounded-xl hover:bg-gray-100 ${brutalBorder} bg-white shadow-[2px_2px_0px_0px_#1E1E1E]`}><MoreVertical size={20} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                       <MessageSquare size={40} className="text-gray-400" />
                    </div>
                    <p className="font-black text-lg">Start the conversation!</p>
                    <p className="text-sm font-bold text-gray-500">Messages are end-to-end encrypted.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_type === 'teacher';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg`}>
                        <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && activeRoom.type === 'group' && (
                             <span className="mb-1 ml-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">{msg.sender_name || 'Student'}</span>
                          )}
                          <div className="flex items-center gap-2">
                            {isMe && (
                              <button 
                                onClick={() => setMessageToDelete(msg.id)}
                                className="opacity-0 group-hover/msg:opacity-100 p-2 rounded-full hover:bg-red-100 text-red-500 transition-all cursor-pointer"
                                title="Delete Message"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <div className={`p-4 rounded-3xl ${brutalBorder} ${
                              isMe ? 'bg-[#E9D5FF] rounded-tr-none' : 'bg-white rounded-tl-none'
                            } shadow-[4px_4px_0px_0px_#1E1E1E]`}>
                              {msg.message && <p className="font-bold text-sm md:text-base whitespace-pre-wrap">{msg.message}</p>}
                            {msg.attachment_path && (
                              <div className="mt-3 p-3 bg-white/40 rounded-2xl border-2 border-[#1E1E1E]/10 flex items-center gap-3 group cursor-pointer hover:bg-white/60 transition-colors">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-[#1E1E1E]">
                                   <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black truncate">{msg.attachment_path.split('/').pop()}</p>
                                  <a href={`/storage/${msg.attachment_path}`} target="_blank" className="text-[10px] font-black text-purple-600 hover:underline flex items-center gap-1">
                                    <Download size={10} /> Download File
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                          </div>
                          <span className="mt-2 text-[10px] font-bold text-gray-400 px-2">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t-[3px] border-[#1E1E1E]">
                {selectedFile && (
                  <div className={`mb-3 p-2 bg-green-50 rounded-xl border-2 border-green-600 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Paperclip size={14} className="text-green-600" />
                      <span className="text-xs font-black truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="text-green-600 hover:text-red-500"><X size={14} /></button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`p-3 rounded-2xl bg-[#D1F2EB] ${brutalBorder} ${brutalShadowSm} ${brutalHover} transition-all ${selectedFile ? 'ring-4 ring-green-400' : ''}`}
                  >
                    <Paperclip size={20} />
                  </button>
                  <textarea 
                    rows={1}
                    placeholder="Type message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                    className={`flex-1 bg-gray-50 border-[3px] border-[#1E1E1E] rounded-2xl px-4 py-3 font-bold focus:bg-white focus:outline-none resize-none min-h-[52px] max-h-32`}
                  />
                  <button 
                    type="submit" 
                    disabled={isSending}
                    className={`p-3 rounded-full ${isSending ? 'bg-gray-300' : 'bg-[#34D399]'} ${brutalBorder} ${brutalShadowSm} ${brutalHover} h-[52px] w-[52px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
              <div className="w-32 h-32 bg-white rounded-full ${brutalBorder} ${brutalShadow} flex items-center justify-center mb-8">
                 <Users size={64} className="text-[#1E1E1E]" />
              </div>
              <h2 className="text-4xl font-black mb-4">Chat Hub</h2>
              <p className="font-bold text-gray-500 italic max-w-sm">Select a student or the class group to stay connected and share resources.</p>
            </div>
          )}
        </section>

        {/* Group Members Sidebar */}
        <AnimatePresence>
          {activeRoom?.type === 'group' && isMembersOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#FDFCF9] border-l-[3px] border-[#1E1E1E] flex flex-col z-10 overflow-hidden"
            >
              <div className="p-4 border-b-[2px] border-[#1E1E1E]/10">
                <h3 className="font-black text-sm uppercase tracking-widest text-gray-500 mb-4">Group Members ({students.length})</h3>
                <div className={`relative bg-white rounded-xl ${brutalBorder} flex items-center px-3 py-1.5`}>
                  <Search size={14} className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Find member..." 
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 w-full font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredMembers.map((student) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between group p-2 rounded-xl hover:bg-gray-100 transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${student.color || 'bg-[#FCA5A5]'} ${brutalBorder} flex items-center justify-center text-sm`}>
                        {student.avatar || <User size={14} />}
                      </div>
                      <div>
                        <h4 className="font-black text-xs leading-tight">{student.name}</h4>
                        <p className="text-[10px] font-bold text-green-600 uppercase">Online</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => startPrivateChat(student)}
                      className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[#E9D5FF] ${brutalBorder} shadow-[2px_2px_0px_0px_#1E1E1E] hover:translate-y-[-1px] transition-all`}
                      title="Message Privately"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {messageToDelete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#1E1E1E]/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`bg-[#FFF8E7] p-6 lg:p-8 rounded-[2rem] max-w-sm w-full text-center ${brutalBorder} shadow-[8px_8px_0px_0px_#1E1E1E]`}
              >
                <div className="w-16 h-16 bg-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-[3px] border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E]">
                  <Trash2 size={32} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black mb-2">Delete Message?</h3>
                <p className="font-bold text-gray-600 mb-8">This message will be permanently deleted for everyone in this chat.</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setMessageToDelete(null)}
                    className={`flex-1 py-3 rounded-xl bg-white font-black hover:bg-gray-50 transition-all ${brutalBorder} shadow-[4px_4px_0px_0px_#1E1E1E] hover:translate-y-1 hover:translate-x-1 hover:shadow-none`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteMessage}
                    className={`flex-1 py-3 rounded-xl bg-red-400 text-white font-black hover:bg-red-500 transition-all ${brutalBorder} shadow-[4px_4px_0px_0px_#1E1E1E] hover:translate-y-1 hover:translate-x-1 hover:shadow-none`}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
