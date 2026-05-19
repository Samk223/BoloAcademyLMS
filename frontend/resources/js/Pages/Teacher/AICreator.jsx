"use client";

import React, { useState, useEffect, useRef } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from 'react-markdown';
import pptxgen from "pptxgenjs";
import axios from 'axios';
import { 
  ArrowLeft, Send, Upload, FileText, Download, Eye, 
  Sparkles, Bot, User, Loader2, Wand2, RefreshCcw, 
  Settings2, HelpCircle, CheckCircle2, X, MessageSquare
} from "lucide-react";

const brutalBorder = "border-[3px] border-[#1E1E1E]";
const brutalShadow = "shadow-[4px_4px_0px_0px_#1E1E1E]";
const brutalShadowSm = "shadow-[3px_3px_0px_0px_#1E1E1E]";
const brutalHover = "hover:translate-y-[3px] hover:translate-x-[3px] hover:shadow-none transition-all duration-200";

export default function AICreator({ type }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [context, setContext] = useState("");
  const [fileName, setFileName] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [tone, setTone] = useState("Moderate");
  const [toast, setToast] = useState(null);
  
  const scrollRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setContext(e.target.result);
        setMessages(prev => [...prev, { 
          role: 'system', 
          content: `Document "${file.name}" uploaded! I've analyzed it and I'm ready to help you create your ${type}.` 
        }]);
      };
      reader.readAsText(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !context) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await axios.post(route('teacher.generate'), {
        type: type,
        prompt: input || `Generate a ${type} based on the uploaded document.`,
        context: context,
        history: messages.filter(m => m.role !== 'system'),
        metadata: { tone }
      });

      const aiResponse = { role: 'assistant', content: response.data.content };
      setMessages(prev => [...prev, aiResponse]);
      
      // We extract the document content for the preview. 
      // If the AI included conversational text, we still show the whole thing 
      // but my new backend prompt tells it to only output the document.
      setGeneratedContent(response.data.content);
    } catch (error) {
      console.error("Generation failed:", error);
      const errorMessage = error.response?.data?.error || "I'm sorry, I hit a snag while generating that. Could you try again?";
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCreation = async () => {
    try {
      await axios.post(route('teacher.save'), {
        type: type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${new Date().toLocaleDateString()}`,
        content: generatedContent,
        metadata: { tone, fileName }
      });
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} saved to your library!`);
    } catch (error) {
      showToast("Failed to save creation.", "error");
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const downloadQuizPDF = (showAnswers) => {
    if (!generatedContent) return;
    
    let quizData = null;
    try {
      const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();
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
              Generated by Bolo AI • Bolo Academy
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadPPTX = () => {
    let slidesData = [];
    try {
      const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      slidesData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse presentation JSON", e);
      alert("There was an issue parsing the presentation data.");
      return;
    }

    const pres = new pptxgen();
    pres.author = "Bolo Academy";
    pres.company = "Bolo Academy";
    pres.subject = "New Presentation";
    pres.title = "New Presentation";

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

    pres.writeFile({ fileName: `presentation_${new Date().getTime()}.pptx` });
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] font-sans text-[#1E1E1E] p-4 lg:p-8 selection:bg-purple-200">
      <Head title={`AI ${type.charAt(0).toUpperCase() + type.slice(1)} Creator`} />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className={`px-8 py-4 rounded-2xl ${brutalBorder} ${brutalShadow} font-black text-lg flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-400' : 'bg-[#D1F2EB]'}`}>
              {toast.type === 'error' ? <Settings2 className="animate-spin" /> : <CheckCircle2 className="text-green-800" />}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <Link href={route('dashboard')} className={`w-12 h-12 bg-white rounded-full ${brutalBorder} ${brutalShadowSm} flex items-center justify-center ${brutalHover}`}>
              <ArrowLeft size={24} strokeWidth={3} />
            </Link>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-2 capitalize">
                <Sparkles className="text-yellow-500" size={28} /> AI {type} Creator
              </h1>
              <p className="font-bold text-gray-500">Transform documents into magical learning materials.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowPreview(true)} disabled={!generatedContent} className={`px-6 py-3 bg-[#D1F2EB] rounded-xl font-black flex items-center gap-2 ${brutalBorder} ${brutalShadowSm} ${brutalHover} disabled:opacity-50`}>
              <Eye size={20} strokeWidth={3} /> Preview
            </button>
            <button onClick={saveCreation} disabled={!generatedContent} className={`px-6 py-3 bg-[#E9D5FF] rounded-xl font-black flex items-center gap-2 ${brutalBorder} ${brutalShadowSm} ${brutalHover} disabled:opacity-50`}>
              <CheckCircle2 size={20} strokeWidth={3} /> Save to Library
            </button>
          </div>
        </header>

        <div className="flex-1 flex gap-8 min-h-0">
          {/* Left Panel: Chat & Context */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 min-h-0">
            {/* Context/Upload Section */}
            <div className={`bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadowSm} shrink-0`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black flex items-center gap-2"><FileText size={20} /> Document Context</h3>
                <div className="flex items-center gap-3">
                  <select value={tone} onChange={(e) => setTone(e.target.value)} className={`bg-gray-50 p-2 rounded-xl border-2 border-[#1E1E1E] font-bold text-sm outline-none`}>
                    <option>Easy</option>
                    <option>Moderate</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              
              {!fileName ? (
                <label className={`w-full h-32 border-3 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1E1E1E] hover:bg-gray-50 transition-all group`}>
                  <Upload className="text-gray-400 group-hover:text-[#1E1E1E] mb-2" size={32} />
                  <span className="font-black text-gray-400 group-hover:text-[#1E1E1E]">Upload document to start (.txt, .pdf, .doc)</span>
                  <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                </label>
              ) : (
                <div className={`w-full p-4 bg-[#D1F2EB] rounded-2xl ${brutalBorder} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <FileText className="text-[#1E1E1E]" />
                    <span className="font-black truncate max-w-[200px]">{fileName}</span>
                  </div>
                  <button onClick={() => { setFileName(""); setContext(""); }} className="hover:text-red-500 transition-colors">
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>

            {/* Chat History */}
            <div className={`flex-1 bg-white rounded-[2.5rem] p-6 ${brutalBorder} ${brutalShadowSm} flex flex-col min-h-0`}>
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Bot size={64} strokeWidth={1} className="mb-4" />
                    <h4 className="text-xl font-black">Ready to create magic?</h4>
                    <p className="font-bold max-w-xs mx-auto">Upload a document and tell me what kind of {type} you need.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl ${brutalBorder} ${msg.role === 'user' ? 'bg-[#E9D5FF] rounded-tr-none' : msg.role === 'system' ? 'bg-yellow-100 text-sm' : 'bg-[#FFF8E7] rounded-tl-none shadow-[2px_2px_0px_0px_#1E1E1E]'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? <User size={16} strokeWidth={3} /> : <Bot size={16} strokeWidth={3} />}
                        <span className="font-black text-xs uppercase tracking-wider">{msg.role === 'user' ? 'You' : 'Bolo AI'}</span>
                      </div>
                      <div className="font-bold prose prose-sm max-w-none">
                        {msg.role === 'assistant' ? (
                          type === 'presentation' || type === 'quiz' || type === 'quizzes' ? (
                            <div className="flex flex-col gap-2 py-2">
                              <span className="text-lg font-black text-purple-700">✨ Your {type} is ready!</span>
                              <span className="text-sm text-gray-700">Check the preview panel on the right or click "Preview" to see your {type}.</span>
                            </div>
                          ) : (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          )
                        ) : msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className={`p-4 rounded-3xl ${brutalBorder} bg-[#FFF8E7] rounded-tl-none flex items-center gap-3`}>
                      <Loader2 className="animate-spin text-purple-600" size={20} strokeWidth={3} />
                      <span className="font-black italic">Generating magic...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="mt-6 relative">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Describe your ${type}... (e.g. "Create 10 hard MCQs about this topic")`}
                  className={`w-full p-4 pr-16 rounded-2xl bg-gray-50 font-bold outline-none resize-none h-20 ${brutalBorder} focus:shadow-[4px_4px_0px_0px_#1E1E1E] transition-shadow`}
                />
                <button onClick={handleSend} disabled={isGenerating || (!input.trim() && !context)} className={`absolute right-3 top-3 w-14 h-14 bg-[#1E1E1E] text-white rounded-xl flex items-center justify-center hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:hover:bg-[#1E1E1E]`}>
                  <Send size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Preview Area */}
          <div className="hidden lg:flex w-1/2 flex-col gap-6 min-h-0">
            <div className={`flex-1 bg-white rounded-[2.5rem] p-10 ${brutalBorder} ${brutalShadow} flex flex-col min-h-0 overflow-hidden relative`}>
              <div className="absolute top-0 right-0 p-6 z-10 flex gap-2">
                {type === 'quiz' || type === 'quizzes' ? (
                  <>
                    <button onClick={() => downloadQuizPDF(false)} disabled={!generatedContent} className={`px-4 py-2 bg-white rounded-xl ${brutalBorder} ${brutalShadowSm} font-bold ${brutalHover} disabled:opacity-50 flex items-center gap-2`}>
                      <Download size={18} /> Student PDF
                    </button>
                    <button onClick={() => downloadQuizPDF(true)} disabled={!generatedContent} className={`px-4 py-2 bg-[#E9D5FF] rounded-xl ${brutalBorder} ${brutalShadowSm} font-bold ${brutalHover} disabled:opacity-50 flex items-center gap-2`}>
                      <Download size={18} /> Teacher Key
                    </button>
                  </>
                ) : (
                  <button onClick={type === 'presentation' ? downloadPPTX : downloadPDF} disabled={!generatedContent} className={`w-12 h-12 bg-white rounded-xl ${brutalBorder} ${brutalShadowSm} flex items-center justify-center ${brutalHover} disabled:opacity-50`}>
                    <Download size={24} strokeWidth={3} />
                  </button>
                )}
              </div>
              
              <div className="h-full overflow-y-auto pr-4 custom-scrollbar bg-white p-8 rounded-xl border-2 border-gray-100 shadow-inner">
                {generatedContent ? (
                  type === 'quiz' || type === 'quizzes' ? (
                    (() => {
                      try {
                        const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();
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
                        return <div className="prose prose-lg max-w-none"><ReactMarkdown>{generatedContent}</ReactMarkdown></div>;
                      }
                    })()
                  ) : type === 'presentation' ? (
                    (() => {
                      try {
                        const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();
                        const slides = JSON.parse(cleaned);
                        return (
                          <div className="flex flex-col gap-6">
                            {slides.map((slide, idx) => (
                              <div key={idx} className={`w-full aspect-[16/9] bg-[#FFF8E7] rounded-xl ${brutalBorder} overflow-hidden relative flex flex-col shadow-[4px_4px_0px_0px_#1E1E1E]`}>
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
                        return <div className="prose prose-lg max-w-none"><ReactMarkdown>{generatedContent}</ReactMarkdown></div>;
                      }
                    })()
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown>{generatedContent}</ReactMarkdown>
                    </div>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <Eye size={80} strokeWidth={1} className="mb-6" />
                    <h3 className="text-2xl font-black">Live Document Preview</h3>
                    <p className="font-bold max-w-xs mx-auto">Your {type} will appear here as the AI generates it.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal (Now active for all screens) */}
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#1E1E1E]/80 backdrop-blur-md p-4 lg:p-20 flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-4xl h-full bg-white rounded-[3rem] ${brutalBorder} ${brutalShadow} flex flex-col overflow-hidden">
              <div className="p-8 border-b-[3px] border-[#1E1E1E] flex items-center justify-between bg-[#FFF8E7]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white ${brutalBorder} flex items-center justify-center">
                    <Eye className="text-purple-600" size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black capitalize">{type} Preview</h3>
                    <p className="text-sm font-bold text-gray-500">Review your magical content before saving.</p>
                  </div>
                </div>
                <button onClick={() => setShowPreview(false)} className={`w-14 h-14 bg-white rounded-full ${brutalBorder} ${brutalShadowSm} flex items-center justify-center ${brutalHover}`}>
                  <X size={28} strokeWidth={3} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-white custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                  {type === 'presentation' ? (
                    (() => {
                      try {
                        const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();
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
                        return <div className="prose prose-lg max-w-none"><ReactMarkdown>{generatedContent}</ReactMarkdown></div>;
                      }
                    })()
                  ) : type === 'quiz' || type === 'quizzes' ? (
                    (() => {
                      try {
                        const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();
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
                        return <div className="prose prose-lg max-w-none"><ReactMarkdown>{generatedContent}</ReactMarkdown></div>;
                      }
                    })()
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown>{generatedContent}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 border-t-[3px] border-[#1E1E1E] flex flex-wrap gap-4 md:gap-6 bg-gray-50">
                {type === 'quiz' || type === 'quizzes' ? (
                  <>
                    <button onClick={() => downloadQuizPDF(false)} className={`flex-1 min-w-[140px] py-4 bg-white rounded-2xl font-black text-sm md:text-xl flex items-center justify-center gap-2 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>
                      <Download size={20} strokeWidth={3} /> Student PDF
                    </button>
                    <button onClick={() => downloadQuizPDF(true)} className={`flex-1 min-w-[140px] py-4 bg-[#E9D5FF] rounded-2xl font-black text-sm md:text-xl flex items-center justify-center gap-2 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>
                      <Download size={20} strokeWidth={3} /> Teacher Key
                    </button>
                    <button onClick={() => { saveCreation(); setShowPreview(false); }} className={`flex-1 min-w-[140px] py-4 bg-[#FFF8E7] rounded-2xl font-black text-sm md:text-xl flex items-center justify-center gap-2 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>
                      <CheckCircle2 size={20} strokeWidth={3} /> Save
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={type === 'presentation' ? downloadPPTX : downloadPDF} className={`flex-1 py-5 bg-[#D1F2EB] rounded-2xl font-black text-xl flex items-center justify-center gap-3 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>
                      <Download size={24} strokeWidth={3} /> Download {type === 'presentation' ? 'PPTX' : 'PDF'}
                    </button>
                    <button onClick={() => { saveCreation(); setShowPreview(false); }} className={`flex-1 py-5 bg-[#E9D5FF] rounded-2xl font-black text-xl flex items-center justify-center gap-3 ${brutalBorder} ${brutalShadowSm} ${brutalHover}`}>
                      <CheckCircle2 size={24} strokeWidth={3} /> Confirm & Save
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .prose, .prose * { visibility: visible; }
          .prose { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E1E1E; border-radius: 10px; }
      `}} />
    </div>
  );
}
