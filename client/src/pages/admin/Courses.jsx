import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Edit2, Trash2, Plus } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', field: '', fee: '', duration: '', university: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.getCourses();
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setFormData(course);
      setEditingId(course.id);
    } else {
      setFormData({ name: '', field: '', fee: '', duration: '', university: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Ensure fee is a number
      const payload = { ...formData, fee: Number(formData.fee) };
      if (editingId) {
        await api.updateCourse(editingId, payload);
      } else {
        await api.addCourse(payload);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.deleteCourse(id);
        fetchCourses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Courses</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} /> Add Course
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-sm text-gray-600">Name</th>
              <th className="p-4 font-semibold text-sm text-gray-600">University</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Field</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Fee</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Duration</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No courses found.</td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{course.name}</td>
                  <td className="p-4 text-gray-600">{course.university}</td>
                  <td className="p-4 text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{course.field}</span>
                  </td>
                  <td className="p-4 text-gray-600">{course.fee}</td>
                  <td className="p-4 text-gray-600">{course.duration}</td>
                  <td className="p-4 flex gap-3">
                    <button onClick={() => handleOpenModal(course)} className="text-indigo-600 hover:text-indigo-900"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Course' : 'Add Course'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field (e.g. IT, Business)</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee (Numeric)</label>
                  <input required type="number" className="w-full border rounded-lg p-2" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g. 3 Years)</label>
                  <input required type="text" className="w-full border rounded-lg p-2" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
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

export default Courses;
