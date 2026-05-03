import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Users, BookOpen, MessageSquare, AlertCircle, TrendingUp,
  ArrowRight, BrainCircuit, Clock, Activity, Zap, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, change, bg }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 border border-gray-100 shadow-sm bg-white group hover:shadow-md transition-all`}>
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 ${bg}`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value ?? '—'}</h3>
        {change !== undefined && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${bg} bg-opacity-15`}>
        <div className={color}>{icon}</div>
      </div>
    </div>
  </div>
);

const ActivityRow = ({ msg }) => {
  const ts = msg.timestamp?._seconds
    ? new Date(msg.timestamp._seconds * 1000)
    : new Date();
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <MessageSquare size={14} className="text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{msg.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{ts.toLocaleString()}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalytics(),
      fetch('http://localhost:5000/api/history').then(r => r.json())
    ]).then(([aRes, history]) => {
      setAnalytics(aRes.data);
      setRecent(Array.isArray(history) ? history.slice(0, 8) : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { title: 'Total Students', value: analytics.totalUsers, icon: <Users size={22} />, color: 'text-blue-600', bg: 'bg-blue-500', change: 12 },
    { title: 'Total Courses', value: analytics.totalCourses, icon: <BookOpen size={22} />, color: 'text-violet-600', bg: 'bg-violet-500', change: 5 },
    { title: 'Total Chats', value: analytics.totalConversations, icon: <MessageSquare size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-500', change: 23 },
    { title: 'Pending Training', value: analytics.unansweredQuestions, icon: <BrainCircuit size={22} />, color: 'text-orange-600', bg: 'bg-orange-500', change: -4 },
  ] : [];

  const quickActions = [
    { label: 'Add New Course', to: '/admin/courses', icon: <BookOpen size={16} />, color: 'bg-violet-600 hover:bg-violet-700' },
    { label: 'Train Chatbot', to: '/admin/training', icon: <BrainCircuit size={16} />, color: 'bg-orange-500 hover:bg-orange-600' },
    { label: 'View Analytics', to: '/admin/analytics', icon: <TrendingUp size={16} />, color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Manage Users', to: '/admin/users', icon: <Users size={16} />, color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading dashboard...
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, Admin. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
          <Activity size={12} className="text-emerald-500" />
          Live data
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" /> Recent Conversations
            </h2>
            <Link to="/admin/history" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No conversations yet.</p>
          ) : (
            <div className="space-y-1">
              {recent.map(msg => <ActivityRow key={msg.id} msg={msg} />)}
            </div>
          )}
        </div>

        {/* Quick Actions + Summary */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Zap size={16} className="text-yellow-500" /> Quick Actions
            </h2>
            <div className="space-y-2">
              {quickActions.map((a, i) => (
                <Link key={i} to={a.to}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${a.color}`}
                >
                  <span className="flex items-center gap-2">{a.icon}{a.label}</span>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>

          {analytics && (
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-base mb-3">AI Activity Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Total Chats</span>
                  <span className="font-bold">{analytics.totalConversations}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="bg-white rounded-full h-1.5" style={{ width: '68%' }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">AI Accuracy</span>
                  <span className="font-bold text-emerald-300">68%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Needs Training</span>
                  <span className="font-bold text-orange-300">{analytics.unansweredQuestions} items</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
