import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Set the base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Add the checkAuth function
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return false;
    }
    
    try {
      // Set the token in the authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  // Add this to useEffect to check auth on initial load
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      console.error('\n\n POST error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'שגיאה ברישום, אנא נסה שנית' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email: credentials.email, passwordLength: credentials.password?.length });
      
      const res = await axios.post('/api/auth/login', credentials);
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message
      });
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'שגיאה בהתחברות, אנא נסה שנית' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  // Add this function to your AuthProvider component
  const authAxios = () => {
    const token = localStorage.getItem('token');
    return axios.create({
      baseURL: 'http://localhost:5000',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        checkAuth,
        isAuthenticated: !!user,
        authAxios
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};