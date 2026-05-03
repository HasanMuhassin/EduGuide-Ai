import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search } from 'lucide-react';

const ChatHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory();
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(h => 
    h.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (h.user_id && h.user_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Chat History</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search messages or User ID..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-sm text-gray-600">Time</th>
              <th className="p-4 font-semibold text-sm text-gray-600">User ID</th>
              <th className="p-4 font-semibold text-sm text-gray-600 w-1/3">Message</th>
              <th className="p-4 font-semibold text-sm text-gray-600 w-1/3">Bot Reply</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">No history found.</td>
              </tr>
            ) : (
              filteredHistory.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                    {item.timestamp ? new Date(item.timestamp._seconds * 1000).toLocaleString() : 'N/A'}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{item.user_id || 'Anonymous'}</td>
                  <td className="p-4 text-sm text-gray-900 align-top">{item.message}</td>
                  <td className="p-4 text-sm text-gray-600 align-top">{item.reply}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChatHistory;
