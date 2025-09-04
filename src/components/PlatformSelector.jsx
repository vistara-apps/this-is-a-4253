import React from 'react';
import { Instagram, Music } from 'lucide-react';

const PlatformSelector = ({ selectedPlatforms, onSelectionChange }) => {
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: 'bg-black' },
  ];

  const togglePlatform = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      onSelectionChange(selectedPlatforms.filter(id => id !== platformId));
    } else {
      onSelectionChange([...selectedPlatforms, platformId]);
    }
  };

  return (
    <div className="space-y-3">
      {platforms.map((platform) => (
        <div
          key={platform.id}
          onClick={() => togglePlatform(platform.id)}
          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
            selectedPlatforms.includes(platform.id)
              ? 'border-primary bg-primary/10'
              : 'border-dark-border hover:border-gray-600'
          }`}
        >
          <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center`}>
            <platform.icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium">{platform.name}</h4>
            <p className="text-gray-400 text-sm">
              {platform.id === 'instagram' ? 'Stories, Reels, Posts' : 'Short-form videos'}
            </p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 ${
            selectedPlatforms.includes(platform.id)
              ? 'border-primary bg-primary'
              : 'border-gray-600'
          }`}>
            {selectedPlatforms.includes(platform.id) && (
              <div className="w-full h-full rounded-full bg-white scale-50"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlatformSelector;