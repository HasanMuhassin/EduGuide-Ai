import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { TrendingUp, Users, MessageSquare, BookOpen, BrainCircuit, RefreshCw } from 'lucide-react';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const ChartCard = ({ title, icon, children, span = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${span}`}>
    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-5">
      <span className="text-indigo-500">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.getAnalytics()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="text-red-500">Failed to load analytics.</div>;

  const { mostSearchedFields = [], popularCourses = [], totalUsers, totalCourses, totalConversations, unansweredQuestions } = data;

  // Synthetic weekly trend (based on real total for scale)
  const weeklyTrend = [
    { day: 'Mon', chats: Math.max(1, Math.floor(totalConversations * 0.10)) },
    { day: 'Tue', chats: Math.max(1, Math.floor(totalConversations * 0.15)) },
    { day: 'Wed', chats: Math.max(1, Math.floor(totalConversations * 0.18)) },
    { day: 'Thu', chats: Math.max(1, Math.floor(totalConversations * 0.20)) },
    { day: 'Fri', chats: Math.max(1, Math.floor(totalConversations * 0.17)) },
    { day: 'Sat', chats: Math.max(1, Math.floor(totalConversations * 0.12)) },
    { day: 'Sun', chats: Math.max(1, Math.floor(totalConversations * 0.08)) },
  ];

  const systemStats = [
    { name: 'Total Students', value: totalUsers, icon: <Users size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total Courses', value: totalCourses, icon: <BookOpen size={18} />, color: 'text-violet-600', bg: 'bg-violet-50' },
    { name: 'Total Chats', value: totalConversations, icon: <MessageSquare size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Need Training', value: unansweredQuestions, icon: <BrainCircuit size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform insights and AI performance</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 font-medium transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {systemStats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.name}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chat Trend - Area Chart */}
        <ChartCard title="Weekly Chat Volume" icon={<TrendingUp size={16} />} span="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="chats" stroke="#7c3aed" strokeWidth={2} fill="url(#chatGrad)" name="Chats" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* AI Health Summary */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <BrainCircuit size={16} /> AI Health
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Response Rate', value: `${Math.min(100, Math.round((totalConversations / Math.max(totalConversations + unansweredQuestions, 1)) * 100))}%`, color: 'bg-emerald-400' },
              { label: 'Training Completion', value: `${Math.max(0, 100 - Math.round((unansweredQuestions / Math.max(totalConversations, 1)) * 100))}%`, color: 'bg-blue-400' },
              { label: 'Course Coverage', value: `${Math.min(100, totalCourses * 10)}%`, color: 'bg-amber-400' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-indigo-200">{item.label}</span>
                  <span className="font-bold">{item.value}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className={`${item.color} rounded-full h-1.5`} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Searched Fields */}
        <ChartCard title="Most Searched Fields" icon={<BarChart size={16} />}>
          {mostSearchedFields.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mostSearchedFields} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="count" name="Searches" radius={[4, 4, 0, 0]}>
                  {mostSearchedFields.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Not enough data yet — start chatting to see results!
            </div>
          )}
        </ChartCard>

        {/* Popular Courses Pie */}
        <ChartCard title="Popular Courses Mentioned" icon={<BookOpen size={16} />}>
          {popularCourses.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={popularCourses}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  dataKey="count"
                  label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {popularCourses.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Not enough data yet — start chatting to see results!
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
