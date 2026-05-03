import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Check, X } from 'lucide-react';

const Training = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({}); // Track input per item

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingTraining();
      setPending(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (id, val) => {
    setResponses(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (id) => {
    const answer = responses[id];
    if (!answer?.trim()) return alert("Please enter an answer");

    try {
      await api.respondToTraining(id, answer);
      // Remove from list
      setPending(prev => prev.filter(item => item.id !== id));
      setResponses(prev => {
        const newObj = {...prev};
        delete newObj[id];
        return newObj;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save response");
    }
  };

  if (loading) return <div>Loading pending questions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Train Chatbot</h2>
      </div>
      
      <p className="text-gray-600">Review questions the chatbot couldn't answer from its database and provide the correct answers to train it.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-sm text-gray-600 w-1/3">User Asked</th>
              <th className="p-4 font-semibold text-sm text-gray-600 w-1/3">AI Fallback Answer</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Your Official Answer</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Check size={48} className="text-green-500 mb-2" />
                    <p>All caught up! The chatbot has no pending training questions.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pending.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-900 font-medium align-top">{item.user_input}</td>
                  <td className="p-4 text-gray-500 align-top italic text-sm">{item.response}</td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-2">
                      <textarea 
                        className="w-full border rounded-lg p-2 text-sm"
                        rows="3"
                        placeholder="Type official answer here..."
                        value={responses[item.id] || ''}
                        onChange={(e) => handleResponseChange(item.id, e.target.value)}
                      ></textarea>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleSubmit(item.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                          <Check size={16} /> Mark as Learned
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Training;
