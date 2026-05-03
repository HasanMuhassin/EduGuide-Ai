import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Clock } from 'lucide-react';

const ChatHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/history?userId=${user.id}`);
        // The API returns all history but we can filter by user.id if the API supports it,
        // or the API should return all history and we filter here (simulated for now)
        const userHistory = response.data.filter(h => h.user_id === user.id);
        setHistory(userHistory);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchHistory();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Clock className="text-indigo-600" /> Your Chat History
      </h2>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No history yet</h3>
          <p className="text-gray-500">Start a conversation with EduGuide AI to see it here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {history.map((session, idx) => (
              <li key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="bg-indigo-50 text-indigo-900 rounded-lg p-3 rounded-tl-none inline-block max-w-[80%]">
                      <p className="font-medium text-sm">You:</p>
                      <p className="text-gray-800">{session.query}</p>
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 rounded-tr-none inline-block max-w-[80%] float-right">
                      <p className="font-medium text-sm text-indigo-600 flex items-center gap-1">
                        EduGuide AI:
                      </p>
                      <p className="text-gray-700 mt-1">{session.response}</p>
                    </div>
                    <div className="clear-both"></div>
                  </div>
                  <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    {new Date(session.timestamp).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
