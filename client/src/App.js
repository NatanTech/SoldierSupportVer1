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

function App() {
  const { user, loading } = useAuth();

  // Custom route component for pages that should only be accessible when NOT logged in
  const PublicOnlyRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return !user ? children : <Navigate to="/" />;
  };

  // ProtectedRoute component - redirects to login if not authenticated
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
  };

  // AdminRoute component - redirects to home if not admin
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return user && user.role === 'admin' ? children : <Navigate to="/" />;
  };

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/cards/:id" element={<CardDetails />} />
        
        {/* Routes that are only accessible when NOT logged in */}
        <Route path="/login" element={
          // Removed the redirect for already logged in users
          <Login />
        } />
        <Route path="/register" element={
          // Removed the redirect for already logged in users
          <Register />
        } />

        {/* Protected routes - require authentication */}
        <Route path="/create-card" element={
          <ProtectedRoute>
            <CreateCard />
          </ProtectedRoute>
        } />
        <Route path="/chat/:id" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
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