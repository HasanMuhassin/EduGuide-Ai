import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Shield, Key } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Profile</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="bg-white p-2 rounded-full inline-block border-4 border-white shadow-md">
              <div className="bg-indigo-100 p-6 rounded-full">
                <User size={48} className="text-indigo-600" />
              </div>
            </div>
            <button 
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
              <p className="text-indigo-600 font-medium flex items-center gap-1 mt-1">
                <Shield size={16} /> {user?.role}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1">
                  <Mail size={16} /> Email Address
                </label>
                {editing ? (
                  <input type="email" defaultValue={user?.email} className="w-full border p-2 rounded-lg" />
                ) : (
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1">
                  <Key size={16} /> Password
                </label>
                {editing ? (
                  <input type="password" placeholder="Enter new password" className="w-full border p-2 rounded-lg" />
                ) : (
                  <p className="text-gray-900 font-medium">••••••••</p>
                )}
              </div>
            </div>
            
            {editing && (
              <div className="pt-4 flex justify-end">
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
