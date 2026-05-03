import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, BookOpen } from 'lucide-react';

const UserProfile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
      <div className="px-8 pb-8">
        <div className="relative flex justify-between items-end -mt-12 mb-6">
          <div className="bg-white p-2 rounded-full inline-block border-4 border-white shadow-md">
            <div className="bg-indigo-50 p-6 rounded-full">
              <User size={48} className="text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{user?.name}</h3>
            <p className="text-indigo-600 font-medium mt-1">Student Explorer</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div>
              <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1">
                <Mail size={16} /> Email Address
              </label>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1">
                <BookOpen size={16} /> Current Interest
              </label>
              <p className="text-gray-900 font-medium">{user?.program || 'Exploring options...'}</p>
            </div>
          </div>
          
          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
            <button 
              onClick={logout}
              className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
