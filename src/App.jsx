import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './components/AuthProvider';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectView from './components/ProjectView';
import { AppProvider } from './context/AppContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [authMode, setAuthMode] = useState('signin');

  const handleViewChange = (view, project = null) => {
    setCurrentView(view);
    setSelectedProject(project);
  };

  if (!isAuthenticated) {
    return <LoginForm mode={authMode} onModeChange={setAuthMode} />;
  }

  return (
    <AppProvider>
      <div className="flex h-screen bg-dark text-white">
        <Sidebar onViewChange={handleViewChange} currentView={currentView} />
        <main className="flex-1 overflow-auto">
          {currentView === 'dashboard' && <Dashboard onViewChange={handleViewChange} />}
          {currentView === 'project' && selectedProject && (
            <ProjectView project={selectedProject} onBack={() => handleViewChange('dashboard')} />
          )}
        </main>
      </div>
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(220, 20%, 18%)',
            color: 'white',
            border: '1px solid hsl(220, 15%, 25%)',
          },
          success: {
            iconTheme: {
              primary: 'hsl(130, 60%, 45%)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
