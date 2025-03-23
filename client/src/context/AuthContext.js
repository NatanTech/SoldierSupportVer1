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
    console.log("Running checkAuth");
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("No token found");
      setUser(null);
      setLoading(false);
      // Remove Authorization header if no token
      delete axios.defaults.headers.common['Authorization'];
      return false;
    }
    
    // Set the token in axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      console.log("Checking auth with token");
      const res = await axios.get('/api/auth/me');
      console.log("Auth response:", res.data);
      setUser(res.data);
      setLoading(false);
      return true;
    } catch (error) {
      console.log('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
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
  
  // Add persistent login check
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      setLoading(true);
      await checkAuth();
      setLoading(false);
    };
    
    checkUserLoggedIn();
  }, []);

  // Improved login function with better error handling
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      // Set Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      setUser(response.data);
      
      return { success: true };
    } catch (error) {
      let message = 'שגיאה בהתחברות, אנא נסה שנית';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          message = 'שם משתמש או סיסמה שגויים';
        } else if (error.response.data && error.response.data.message) {
          message = error.response.data.message;
        }
      } else if (error.request) {
        // No response received
        message = 'אין תקשורת עם השרת, אנא נסה שוב מאוחר יותר';
      }
      
      return { 
        success: false, 
        message 
      };
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