import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for an existing session on load
    const storedUser = localStorage.getItem('eduguide_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Admin Hardcoded Demo
    if (email === 'admin@eduguide.com' && password === 'admin123') {
      const userData = { id: 'usr_admin', email, name: 'EduGuide Admin', role: 'admin' };
      setUser(userData);
      localStorage.setItem('eduguide_user', JSON.stringify(userData));
      return { success: true, role: 'admin' };
    }
    
    // Client Hardcoded Demo
    if (email === 'student@eduguide.com' && password === 'student123') {
      const userData = { id: 'usr_student', email, name: 'Student Explorer', role: 'client', program: 'Undecided' };
      setUser(userData);
      localStorage.setItem('eduguide_user', JSON.stringify(userData));
      return { success: true, role: 'client' };
    }
    
    return { success: false, error: 'Invalid credentials.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduguide_user');
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
