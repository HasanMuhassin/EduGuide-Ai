import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Check, MessageSquare, Lightbulb, RefreshCw, Sparkles, Clock } from 'lucide-react';

const TrainingCard = ({ item, response, onChange, onSubmit }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
    {/* Card Header */}
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <MessageSquare size={15} className="text-orange-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Student Asked</p>
        <p className="text-sm font-semibold text-gray-800">{item.user_input}</p>
      </div>
    </div>

    {/* AI Fallback */}
    <div className="p-4 border-b border-gray-50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles size={14} className="text-violet-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1">AI Fallback Response</p>
          <p className="text-sm text-gray-500 italic leading-relaxed">{item.response || 'No AI response stored.'}</p>
        </div>
      </div>
    </div>

    {/* Admin Response */}
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb size={13} className="text-emerald-600" />
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Your Official Answer</p>
      </div>
      <textarea
        rows={3}
        placeholder="Type the correct, official answer to teach the chatbot..."
        value={response || ''}
        onChange={e => onChange(item.id, e.target.value)}
        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none placeholder-gray-300 transition-all"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock size={11} />
          {item.created_at ? new Date(item.created_at?.seconds ? item.created_at.seconds * 1000 : item.created_at).toLocaleDateString() : 'Unknown date'}
        </div>
        <button
          onClick={() => onSubmit(item.id)}
          disabled={!response?.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-200"
        >
          <Check size={14} /> Mark as Learned
        </button>
      </div>
    </div>
  </div>
);

const Training = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});

  const fetchPending = () => {
    setLoading(true);
    api.getPendingTraining()
      .then(r => setPending(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleResponseChange = (id, val) =>
    setResponses(p => ({ ...p, [id]: val }));

  const handleSubmit = async (id) => {
    const answer = responses[id];
    if (!answer?.trim()) return;
    try {
      await api.respondToTraining(id, answer);
      setPending(p => p.filter(item => item.id !== id));
      setResponses(p => { const n = { ...p }; delete n[id]; return n; });
    } catch {
      alert('Failed to save response. Try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Train Chatbot</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Review questions the AI couldn't answer. Teach it the correct responses.
          </p>
        </div>
        <button onClick={fetchPending} className="flex items-center gap-2 text-sm px-4 py-2 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 font-medium transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat banner */}
      <div className={`rounded-2xl p-5 flex items-center gap-4 ${pending.length > 0 ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'} text-white shadow-lg`}>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          {pending.length > 0 ? <MessageSquare size={24} /> : <Check size={24} />}
        </div>
        <div>
          <p className="font-bold text-lg">
            {pending.length > 0 ? `${pending.length} Questions Need Your Attention` : 'All caught up! 🎉'}
          </p>
          <p className="text-white/80 text-sm">
            {pending.length > 0
              ? 'Provide official answers to improve AI accuracy'
              : 'The chatbot has no pending training questions'}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pending.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Check size={48} className="mx-auto mb-3 text-emerald-400 opacity-60" />
          <p className="font-medium">No pending questions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {pending.map(item => (
            <TrainingCard
              key={item.id}
              item={item}
              response={responses[item.id]}
              onChange={handleResponseChange}
              onSubmit={handleSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Training;
