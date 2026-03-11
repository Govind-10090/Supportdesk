import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import NewTicket from './pages/NewTicket';
import APIDebugger from './pages/APIDebugger';
import LogAnalyzer from './pages/LogAnalyzer';
import AdminDashboard from './pages/AdminDashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center font-mono">
      <div className="text-[#141414] animate-pulse uppercase tracking-widest">Initializing Secure Session...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/tickets" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/tickets/new" element={
            <PrivateRoute roles={['customer']}>
              <NewTicket />
            </PrivateRoute>
          } />

          <Route path="/tickets/:id" element={
            <PrivateRoute>
              <TicketDetail />
            </PrivateRoute>
          } />

          <Route path="/kb" element={
            <PrivateRoute>
              <KnowledgeBase />
            </PrivateRoute>
          } />

          <Route path="/debug" element={
            <PrivateRoute roles={['engineer', 'admin']}>
              <APIDebugger />
            </PrivateRoute>
          } />

          <Route path="/logs" element={
            <PrivateRoute roles={['engineer', 'admin']}>
              <LogAnalyzer />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
