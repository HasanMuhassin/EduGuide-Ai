import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  MessageSquare, Search, User, Clock, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

const ChatHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  const fetchHistory = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/history')
      .then(r => r.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleString();
  };

  const filtered = history.filter(h =>
    h.message?.toLowerCase().includes(search.toLowerCase()) ||
    h.reply?.toLowerCase().includes(search.toLowerCase()) ||
    h.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  // Detect suspicious/spam patterns
  const isSpam = (msg) => {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    const spamWords = ['spam', 'test test test', 'aaaa', 'asdf', 'buy now', 'click here', 'free money'];
    const isTooShort = msg.trim().length < 3;
    const isRepeat = /(.)\1{5,}/.test(msg);
    return isTooShort || isRepeat || spamWords.some(w => lower.includes(w));
  };

  const spamCount = history.filter(h => isSpam(h.message)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
          <p className="text-gray-500 text-sm mt-0.5">All real-time student conversations</p>
        </div>
        <button onClick={fetchHistory} className="flex items-center gap-2 text-sm px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 font-medium transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
            <MessageSquare size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Messages</p>
            <p className="text-xl font-bold text-gray-900">{history.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
            <User size={16} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Unique Users</p>
            <p className="text-xl font-bold text-gray-900">
              {new Set(history.map(h => h.user_id)).size}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
            <MessageSquare size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Spam Detected</p>
            <p className="text-xl font-bold text-red-500">{spamCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search messages, replies or users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
      </div>

      {/* Chat List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No messages found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const spam = isSpam(item.message);
            const open = expanded[item.id];
            return (
              <div key={item.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${spam ? 'border-red-200' : 'border-gray-100'}`}>
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.message}</p>
                      {spam && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-semibold flex-shrink-0">SPAM</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-400 truncate max-w-xs">
                        User: {item.user_id?.slice(0, 8)}...
                      </p>
                      <span className="text-gray-300">·</span>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {formatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                  {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                </button>
                {open && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User Message</p>
                      <p className="text-sm text-gray-800 bg-white rounded-lg p-3 border border-gray-100">{item.message}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Response</p>
                      <p className="text-sm text-gray-700 bg-indigo-50 rounded-lg p-3 border border-indigo-100">{item.reply}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
