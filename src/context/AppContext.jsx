import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      productName: 'Wireless Headphones',
      productImageURL: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      createdAt: new Date('2024-01-15'),
      adVariations: [
        {
          id: 1,
          assetURL: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          copy: 'Experience crystal clear sound with our premium wireless headphones',
          platform: 'instagram',
          status: 'posted',
          performanceMetrics: { views: 1240, engagement: 8.5, clicks: 105 }
        },
        {
          id: 2,
          assetURL: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
          copy: 'Upgrade your audio game 🎧 Premium sound quality meets comfort',
          platform: 'tiktok',
          status: 'posted',
          performanceMetrics: { views: 3200, engagement: 12.3, clicks: 394 }
        }
      ]
    },
    {
      id: 2,
      productName: 'Smart Watch',
      productImageURL: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      createdAt: new Date('2024-01-18'),
      adVariations: []
    }
  ]);

  const [user, setUser] = useState({
    userId: 1,
    email: 'user@example.com',
    paymentStatus: 'active',
    connectedAccounts: ['instagram']
  });

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now(),
      createdAt: new Date(),
      adVariations: []
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const addAdVariations = (projectId, variations) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, adVariations: [...project.adVariations, ...variations] }
        : project
    ));
  };

  const updateAdVariation = (projectId, variationId, updates) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            adVariations: project.adVariations.map(variation =>
              variation.id === variationId ? { ...variation, ...updates } : variation
            )
          }
        : project
    ));
  };

  return (
    <AppContext.Provider value={{
      projects,
      user,
      addProject,
      addAdVariations,
      updateAdVariation
    }}>
      {children}
    </AppContext.Provider>
  );
};