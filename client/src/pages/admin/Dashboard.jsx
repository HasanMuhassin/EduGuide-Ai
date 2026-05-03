import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Users, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.getAnalytics();
      setData(res.data);
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (!data) return <div className="p-4 text-red-500">Failed to load data. Ensure backend is running.</div>;

  const stats = [
    { name: 'Total Users', value: data.totalUsers, icon: <Users size={24} className="text-blue-500" /> },
    { name: 'Total Courses', value: data.totalCourses, icon: <BookOpen size={24} className="text-indigo-500" /> },
    { name: 'Conversations', value: data.totalConversations, icon: <MessageSquare size={24} className="text-green-500" /> },
    { name: 'Pending Training', value: data.unansweredQuestions, icon: <AlertCircle size={24} className="text-orange-500" /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <a href="/admin/courses" className="text-indigo-600 hover:underline">Add a new course</a>
            <a href="/admin/training" className="text-orange-600 hover:underline">Review {data.unansweredQuestions} pending questions</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
