import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateCard from './pages/CreateCard';
import CardsPage from './pages/CardsPage';
import CardDetails from './pages/CardDetails';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import NotFound from './pages/NotFound';

// Private route component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>טוען...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>טוען...</div>;
  
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="cards" element={<CardsPage />} />
        <Route path="cards/:id" element={<CardDetails />} />
        
        {/* Protected routes */}
        <Route path="create-card" element={
          <PrivateRoute>
            <CreateCard />
          </PrivateRoute>
        } />
        <Route path="chat/:id" element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        } />
        
        {/* Admin routes */}
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;