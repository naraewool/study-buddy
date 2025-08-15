import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ParentLogin from './components/ParentLogin';
import ParentRegister from './components/ParentRegister';
import ParentDashboard from './components/ParentDashboard';
import './App.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'parent') {
    if (showRegister) {
      return <ParentRegister onBackToLogin={() => setShowRegister(false)} />;
    }
    return <ParentLogin onShowRegister={() => setShowRegister(true)} />;
  }

  return <ParentDashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
