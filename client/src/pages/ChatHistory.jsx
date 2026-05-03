import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Clock, Search, ChevronRight } from 'lucide-react';

const ChatHistory = ({ isDark }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:5000/api/history?userId=${user.id}`)
      .then(r => r.json())
      .then(data => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [user]);

  const cardBg = isDark ? 'bg-[#2a2a2a] border-white/10 hover:bg-[#333]' : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm';
  const textMain = isDark ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = isDark ? 'bg-[#333] border-white/10 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 shadow-sm';

  const filtered = history.filter(h =>
    h.message?.toLowerCase().includes(search.toLowerCase()) ||
    h.reply?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleString();
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className={`text-2xl font-bold ${textMain}`}>Chat History</h1>
        <p className={`text-sm mt-1 ${textMuted}`}>Browse all your past conversations with EduGuide AI</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all ${inputBg}`}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-16 ${textMuted}`}>
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No conversations found</p>
          <p className="text-xs mt-1">Start chatting to see your history here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className={`rounded-xl border p-4 transition-all cursor-pointer ${cardBg}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600/15 flex items-center justify-center">
                  <MessageSquare size={14} className="text-violet-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`text-sm font-semibold truncate ${textMain}`}>{item.message}</p>
                  <p className={`text-xs mt-1 line-clamp-2 ${textMuted}`}>{item.reply}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock size={11} className={textMuted} />
                    <span className={`text-[10px] ${textMuted}`}>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
                <ChevronRight size={15} className={textMuted} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
