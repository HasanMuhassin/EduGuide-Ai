import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  HelpCircle, 
  BrainCircuit, 
  Users, 
  MessageSquare, 
  BarChart3,
  UserCircle
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage Courses', path: '/admin/courses', icon: <BookOpen size={20} /> },
    { name: 'Manage FAQ', path: '/admin/faq', icon: <HelpCircle size={20} /> },
    { name: 'Train Chatbot', path: '/admin/training', icon: <BrainCircuit size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Chat History', path: '/admin/history', icon: <MessageSquare size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Admin Profile', path: '/admin/profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight">EduGuide Admin</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-800 text-white' 
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
