import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Edit2, Trash2, Plus } from 'lucide-react';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.getFaqs();
      setFaqs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setFormData(faq);
      setEditingId(faq.id);
    } else {
      setFormData({ question: '', answer: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateFaq(editingId, formData);
      } else {
        await api.addFaq(formData);
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await api.deleteFaq(id);
        fetchFaqs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading FAQs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage FAQ</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-sm text-gray-600 w-1/3">Question</th>
              <th className="p-4 font-semibold text-sm text-gray-600 w-1/2">Answer</th>
              <th className="p-4 font-semibold text-sm text-gray-600 w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">No FAQs found.</td>
              </tr>
            ) : (
              faqs.map(faq => (
                <tr key={faq.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 align-top">{faq.question}</td>
                  <td className="p-4 text-gray-600 align-top whitespace-pre-wrap">{faq.answer}</td>
                  <td className="p-4 flex gap-3 align-top">
                    <button onClick={() => handleOpenModal(faq)} className="text-indigo-600 hover:text-indigo-900"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea required className="w-full border rounded-lg p-2 h-32" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQ;
