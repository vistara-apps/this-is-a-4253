import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectView from './components/ProjectView';
import { AppProvider } from './context/AppContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);

  const handleViewChange = (view, project = null) => {
    setCurrentView(view);
    setSelectedProject(project);
  };

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

export default App;