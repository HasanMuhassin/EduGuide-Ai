import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, PanelLeft, Sparkles, GraduationCap, BookOpen, HelpCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = 'http://localhost:5000/api/chat';

const STARTERS = [
  { icon: <GraduationCap size={20} />, label: 'Course recommendations', prompt: 'Suggest IT courses available' },
  { icon: <BookOpen size={20} />, label: 'Explore programs', prompt: 'What diploma courses are available?' },
  { icon: <HelpCircle size={20} />, label: 'Fees & scholarships', prompt: 'What are the fees for software engineering?' },
  { icon: <RotateCcw size={20} />, label: 'Career guidance', prompt: 'What jobs can I get after completing a BSc IT?' },
];

const MainChat = ({ currentChatId, setCurrentChatId, onChatCreated, toggleSidebar, sidebarOpen, isDark }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const isNew = !currentChatId && messages.length === 0;

  // Load messages when switching to an existing chat
  useEffect(() => {
    setMessages([]);
    if (currentChatId) {
      axios.get(`${API}/sessions/${currentChatId}`)
        .then(r => {
          const msgs = (r.data.messages || []).map((m, i) => ({
            id: `${currentChatId}_${i}`,
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp?._seconds ? new Date(m.timestamp._seconds * 1000) : new Date()
          }));
          setMessages(msgs);
        })
        .catch(() => setMessages([]));
    }
  }, [currentChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'; }
  };

  const sendMessage = async (text) => {
    const trimmed = text?.trim() || input.trim();
    if (!trimmed || isTyping) return;

    // Create a session if this is the first message in a new chat
    let activeChatId = currentChatId;
    if (!activeChatId) {
      try {
        const r = await axios.post(`${API}/sessions`, { userId: user?.id });
        activeChatId = r.data.chatId;
        setCurrentChatId(activeChatId);
        onChatCreated?.(activeChatId);
      } catch {
        // If session creation fails, continue without chatId (stateless)
      }
    }

    const userMsg = { id: Date.now().toString(), sender: 'user', text: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);

    try {
      const res = await axios.post(API, {
        message: trimmed,
        userId: user?.id,
        chatId: activeChatId   // ← sends chatId for isolated context
      });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.data.reply,
        timestamp: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm unable to connect to the server right now. Please try again.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts instanceof Date ? ts : new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Theme classes
  const bg = isDark ? 'bg-[#212121]' : 'bg-[#f8f8f8]';
  const headerBg = isDark ? 'bg-[#212121]/80' : 'bg-[#f8f8f8]/80';
  const inputBg = isDark ? 'bg-[#2f2f2f] border-white/10' : 'bg-white border-gray-200 shadow-md';
  const textMain = isDark ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const userBubble = isDark ? 'bg-[#3f3f3f] text-gray-100' : 'bg-white text-gray-800 shadow-sm border border-gray-100';
  const botBubble = isDark ? 'bg-[#2a2a2a] text-gray-100' : 'bg-violet-50 text-gray-800 border border-violet-100';
  const starterCard = isDark ? 'bg-[#2f2f2f] hover:bg-[#3a3a3a] border-white/10' : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm';

  return (
    <div className={`flex-1 flex flex-col h-full ${bg} transition-colors duration-300`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-10 ${headerBg} backdrop-blur-sm border-b ${isDark ? 'border-white/10' : 'border-black/5'} px-4 py-3 flex items-center gap-3`}>
        {!sidebarOpen && (
          <button onClick={toggleSidebar} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'} transition-colors`}>
            <PanelLeft size={18} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className={`font-semibold text-sm ${textMain}`}>EduGuide AI</span>
        </div>
        <div className={`ml-auto text-xs px-2 py-1 rounded-full ${isDark ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-100 text-violet-700'} font-medium`}>
          Education Advisor
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isNew ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20">
              <Sparkles size={32} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${textMain}`}>Hello, {user?.name?.split(' ')[0] || 'Student'} 👋</h1>
            <p className={`text-sm mb-8 ${textMuted}`}>I'm your personal EduGuide AI. Ask me about courses, programs, fees, or career paths.</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.prompt)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all group ${starterCard}`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    {s.icon}
                  </div>
                  <span className={`text-sm font-medium ${textMain}`}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-4 pb-36">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <Sparkles size={14} className="text-white" />
                    </div>
                  )}
                  <div className="max-w-[75%]">
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' ? `${userBubble} rounded-tr-sm` : `${botBubble} rounded-tl-sm`
                    } ${msg.isError ? 'border-red-400/30 text-red-400' : ''}`}>
                      {msg.sender === 'bot' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0.5 prose-headings:my-1">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : msg.text}
                    </div>
                    <p className={`text-[10px] mt-1 ${textMuted} ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      {user?.profilePic
                        ? <img src={user.profilePic} alt="u" className="w-8 h-8 rounded-full object-cover" />
                        : <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${botBubble}`}>
                  <div className="flex gap-1 items-center h-4">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`absolute bottom-0 left-0 right-0 ${isDark ? 'bg-gradient-to-t from-[#212121] via-[#212121]/95 to-transparent' : 'bg-gradient-to-t from-[#f8f8f8] via-[#f8f8f8]/95 to-transparent'} pt-10 pb-5 px-4`}>
        <div className="max-w-3xl mx-auto">
          <div className={`flex items-end gap-2 rounded-2xl border p-3 transition-all ${inputBg} focus-within:ring-2 focus-within:ring-violet-500/30`}>
            <textarea ref={textareaRef} rows={1} value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder="Message EduGuide AI..."
              className={`flex-1 bg-transparent resize-none focus:outline-none text-sm leading-6 max-h-[180px] ${textMain}`}
              style={{ minHeight: '24px' }}
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button className={`p-2 rounded-xl ${textMuted} hover:text-violet-500 transition-colors`} title="Voice input"><Mic size={18} /></button>
              <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && !isTyping
                    ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20'
                    : isDark ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400'
                }`}>
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className={`text-center text-[10px] mt-2 ${textMuted}`}>
            EduGuide AI may make mistakes. Verify important academic information with your institution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainChat;
