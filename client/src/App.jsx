import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Client Imports
import ChatWindow from './components/ChatWindow';
import Navbar from './components/Navbar';
import UserProfile from './pages/UserProfile';
import ClientChatHistory from './pages/ChatHistory';

// Admin Imports
import Sidebar from './components/admin/Sidebar';
import Dashboard from './pages/admin/Dashboard';
import Courses from './pages/admin/Courses';
import FAQ from './pages/admin/FAQ';
import Training from './pages/admin/Training';
import Users from './pages/admin/Users';
import AdminChatHistory from './pages/admin/ChatHistory';
import Analytics from './pages/admin/Analytics';
import AdminProfile from './pages/admin/Profile';

// Shared
import Login from './pages/Login';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/chat'} replace />;
  }
  return children;
};

const ClientLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
    <Navbar />
    <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {children}
    </main>
  </div>
);

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-left">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">EduGuide AI Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">Hello, Admin</span>
            <button
              onClick={logout}
              className="text-sm px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Client Routes */}
          <Route path="/chat" element={
            <ProtectedRoute allowedRole="client">
              <ClientLayout>
                <div className="h-[calc(100vh-140px)] w-full flex justify-center">
                  <ChatWindow />
                </div>
              </ClientLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute allowedRole="client">
              <ClientLayout><UserProfile /></ClientLayout>
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute allowedRole="client">
              <ClientLayout><ClientChatHistory /></ClientLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Courses /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/faq" element={<ProtectedRoute allowedRole="admin"><AdminLayout><FAQ /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/training" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Training /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/history" element={<ProtectedRoute allowedRole="admin"><AdminLayout><AdminChatHistory /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="admin"><AdminLayout><Analytics /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><AdminLayout><AdminProfile /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
