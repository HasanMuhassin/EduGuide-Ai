import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Plus, MessageSquare, Search, Settings, User,
  LogOut, Sparkles, Clock, Sun, Moon, ChevronRight, X, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatSidebar = ({ currentChatId, setCurrentChatId, closeSidebar, onOpenSettings, isDark }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingChats(true);
    fetch(`http://localhost:5000/api/history?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        // Group messages into sessions by date
        const sessions = {};
        data.forEach(item => {
          const dateKey = item.timestamp?._seconds
            ? new Date(item.timestamp._seconds * 1000).toDateString()
            : new Date().toDateString();
          if (!sessions[dateKey]) {
            sessions[dateKey] = { id: dateKey, title: item.message?.slice(0, 40) || 'Chat session', date: dateKey };
          }
        });
        setChats(Object.values(sessions).slice(0, 20));
      })
      .catch(() => setChats([]))
      .finally(() => setLoadingChats(false));
  }, [user]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    navigate('/chat');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const bg = isDark ? 'bg-[#171717]' : 'bg-[#f0f0f0]';
  const borderColor = isDark ? 'border-white/10' : 'border-black/10';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textMain = isDark ? 'text-gray-100' : 'text-gray-800';
  const hoverBg = isDark ? 'hover:bg-white/8' : 'hover:bg-black/8';
  const activeBg = isDark ? 'bg-white/15' : 'bg-black/10';
  const inputBg = isDark ? 'bg-[#2a2a2a] border-white/10 placeholder-gray-500 text-gray-200' : 'bg-white border-black/10 placeholder-gray-400 text-gray-700';

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`w-[260px] h-full ${bg} flex flex-col border-r ${borderColor} transition-colors duration-300`}>
      {/* Logo + New Chat */}
      <div className={`p-3 flex items-center justify-between border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className={`font-bold text-sm ${textMain}`}>EduGuide AI</span>
        </div>
        <button
          onClick={closeSidebar}
          className={`p-1.5 rounded-lg ${hoverBg} ${textMuted} transition-colors`}
          title="Close sidebar"
        >
          <PanelLeftClose size={17} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border ${borderColor} ${textMain} ${hoverBg} transition-all font-medium text-sm group`}
        >
          <Plus size={16} className="text-violet-500 group-hover:rotate-90 transition-transform duration-200" />
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full rounded-lg py-2 pl-8 pr-3 text-xs border focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all ${inputBg}`}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar space-y-0.5">
        <p className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-2 ${textMuted}`}>Recent Chats</p>
        {loadingChats ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filteredChats.length > 0 ? filteredChats.map(chat => (
          <button
            key={chat.id}
            onClick={() => { setCurrentChatId(chat.id); navigate('/chat'); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all text-sm group ${
              currentChatId === chat.id ? activeBg + ' ' + textMain : textMuted + ' ' + hoverBg
            }`}
          >
            <MessageSquare size={14} className="flex-shrink-0 opacity-60" />
            <span className="truncate flex-1 text-xs">{chat.title}</span>
          </button>
        )) : (
          <p className={`text-xs text-center py-4 ${textMuted}`}>No chats yet</p>
        )}
      </div>

      {/* Bottom Actions */}
      <div className={`border-t ${borderColor} p-2 space-y-0.5`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg ${hoverBg} transition-colors text-sm ${textMuted}`}
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? <Moon size={15} className="text-violet-400" /> : <Sun size={15} className="text-amber-500" />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center ${theme === 'dark' ? 'bg-violet-600' : 'bg-gray-300'}`}
            style={{ width: 32, height: 18 }}>
            <div className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-3.5' : 'translate-x-0.5'}`}
              style={{ width: 14, height: 14, transform: theme === 'dark' ? 'translateX(16px)' : 'translateX(2px)' }} />
          </div>
        </button>

        <button
          onClick={() => navigate('/history')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${hoverBg} text-sm ${textMuted} transition-colors ${location.pathname === '/history' ? activeBg + ' ' + textMain : ''}`}
        >
          <Clock size={15} />
          <span>Chat History</span>
        </button>

        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${hoverBg} text-sm ${textMuted} transition-colors`}
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>

        {/* User profile strip */}
        <button
          onClick={() => navigate('/profile')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${hoverBg} transition-colors mt-1 ${location.pathname === '/profile' ? activeBg : ''}`}
        >
          {user?.profilePic ? (
            <img src={user.profilePic} alt="avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          )}
          <div className="flex-1 text-left overflow-hidden">
            <p className={`text-xs font-semibold truncate ${textMain}`}>{user?.name || 'Student'}</p>
            <p className={`text-[10px] truncate ${textMuted}`}>{user?.email}</p>
          </div>
          <ChevronRight size={13} className={textMuted} />
        </button>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-sm text-red-400 transition-colors`}
        >
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
