import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  UsersIcon, Search, Shield, GraduationCap, Mail, MapPin,
  Calendar, School, Phone, RefreshCw
} from 'lucide-react';

const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-red-100 text-red-700',
    client: 'bg-violet-100 text-violet-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${styles[role] || 'bg-gray-100 text-gray-600'}`}>
      {role === 'admin' ? <Shield size={10} /> : <GraduationCap size={10} />}
      {role?.toUpperCase() || 'USER'}
    </span>
  );
};

const UserCard = ({ user }) => {
  const initials = (user.name || user.email || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['from-violet-500 to-indigo-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500', 'from-pink-500 to-rose-500'];
  const colorIdx = (user.name || '').charCodeAt(0) % colors.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${colors[colorIdx]} p-5 flex items-center gap-4`}>
        {user.profilePic ? (
          <img src={user.profilePic} alt="profile" className="w-14 h-14 rounded-xl object-cover border-2 border-white/50 shadow-md" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
        )}
        <div>
          <h3 className="text-white font-bold text-base leading-tight">{user.name || 'Anonymous'}</h3>
          <p className="text-white/70 text-xs mt-0.5">{user.email || 'No email'}</p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <RoleBadge role={user.role} />
          <span className="text-[10px] text-gray-400 font-mono">{user.id?.slice(0, 8)}...</span>
        </div>

        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-1">
          {user.schoolName && (
            <div className="col-span-2 flex items-center gap-2 text-xs text-gray-600">
              <School size={12} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.schoolName}</span>
            </div>
          )}
          {user.address && (
            <div className="col-span-2 flex items-center gap-2 text-xs text-gray-600">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.address}</span>
            </div>
          )}
          {user.age && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar size={12} className="text-gray-400" />
              <span>Age: {user.age}</span>
            </div>
          )}
          {user.language && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-gray-400">🌐</span>
              <span>{user.language}</span>
            </div>
          )}
          {user.createdAt && (
            <div className="col-span-2 flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={11} className="text-gray-400 flex-shrink-0" />
              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchUsers = () => {
    setLoading(true);
    api.getUsers()
      .then(r => setUsers(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filter === 'all' || u.role === filter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 text-sm px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 font-medium transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'client', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filter === role ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {role === 'all' ? 'All' : role === 'client' ? 'Students' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UsersIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(user => <UserCard key={user.id} user={user} />)}
        </div>
      )}
    </div>
  );
};

export default Users;
