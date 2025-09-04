import React from 'react';
import { 
  Home, 
  Plus, 
  BarChart3, 
  Settings, 
  Users, 
  Target,
  Zap,
  Instagram,
  Music
} from 'lucide-react';

const Sidebar = ({ onViewChange, currentView }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'campaigns', icon: Target, label: 'Campaigns' },
    { id: 'automation', icon: Zap, label: 'Automation' },
    { id: 'audiences', icon: Users, label: 'Audiences' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const platforms = [
    { id: 'instagram', icon: Instagram, label: 'Instagram' },
    { id: 'tiktok', icon: Music, label: 'TikTok' },
  ];

  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">AdSpark</h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === item.id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-border'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-dark-border">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Connected Platforms</h3>
        <div className="space-y-2">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-dark-border"
            >
              <platform.icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{platform.label}</span>
              <div className="ml-auto w-2 h-2 bg-accent rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;