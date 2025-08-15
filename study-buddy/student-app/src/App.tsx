import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    if (showRegister) {
      return <Register onBackToLogin={() => setShowRegister(false)} />;
    }
    return <Login onShowRegister={() => setShowRegister(true)} />;
  }

  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
