import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ds_token');
    const savedUser = localStorage.getItem('ds_user');
    if (token && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        setStudent(u.student || null);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        localStorage.removeItem('ds_token');
        localStorage.removeItem('ds_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    if (data.requireOtp) {
      return data; // { requireOtp: true, email, role, message }
    }
    localStorage.setItem('ds_token', data.token);
    localStorage.setItem('ds_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    setStudent(data.student || null);
    return data;
  };

  const register = async (userData) => {
    const { data } = await axios.post('/api/auth/register', userData);
    localStorage.setItem('ds_token', data.token);
    localStorage.setItem('ds_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    setStudent(data.student || null);
    return data;
  };

  const verifyLoginOtp = async (email, otp) => {
    const { data } = await axios.post('/api/auth/verify-login-otp', { email, otp });
    localStorage.setItem('ds_token', data.token);
    localStorage.setItem('ds_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    setStudent(data.student || null);
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await axios.post('/api/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const { data } = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
    return data;
  };

  const resendOtp = async (email, purpose) => {
    const { data } = await axios.post('/api/auth/resend-otp', { email, purpose });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ds_token');
    localStorage.removeItem('ds_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setStudent(null);
  };

  const updateProfile = async (formData) => {
    const { data } = await axios.put('/api/auth/update-profile', formData);
    if (data.user) {
      const updatedUser = { ...user, ...data.user };
      if (data.student) {
        updatedUser.student = data.student;
        setStudent(data.student);
      }
      setUser(updatedUser);
      localStorage.setItem('ds_user', JSON.stringify(updatedUser));
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      student, 
      loading, 
      login, 
      register,
      verifyLoginOtp, 
      forgotPassword, 
      resetPassword, 
      resendOtp, 
      updateProfile,
      logout, 
      isAdmin: ['admin', 'superadmin', 'superproadmin'].includes((user?.role || '').toString().trim().toLowerCase()),
      isSuperAdmin: ['superadmin', 'superproadmin'].includes((user?.role || '').toString().trim().toLowerCase()),
      isSuperProAdmin: (user?.role || '').toString().trim().toLowerCase() === 'superproadmin',
      isTeacher: ['teacher', 'faculty'].includes((user?.role || '').toString().trim().toLowerCase())
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
