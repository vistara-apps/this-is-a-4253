import React from 'react';
import { Instagram, Music, Eye, Heart, MousePointer, CheckCircle, Clock } from 'lucide-react';

const AdVariationCard = ({ variation }) => {
  const PlatformIcon = variation.platform === 'instagram' ? Instagram : Music;
  
  const getStatusColor = () => {
    switch (variation.status) {
      case 'posted':
        return 'text-accent';
      case 'posting':
        return 'text-yellow-500';
      case 'generated':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (variation.status) {
      case 'posted':
        return <CheckCircle className="w-4 h-4" />;
      case 'posting':
      case 'generated':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-dark-border rounded-lg overflow-hidden">
      {/* Image */}
      <div className="aspect-square bg-gray-800">
        <img 
          src={variation.assetURL} 
          alt="Ad variation"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Platform & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlatformIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300 capitalize">{variation.platform}</span>
          </div>
          <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm capitalize">{variation.status}</span>
          </div>
        </div>

        {/* Copy */}
        <p className="text-sm text-gray-300 line-clamp-3">{variation.copy}</p>

        {/* Performance Metrics */}
        {variation.performanceMetrics && (
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-dark-border">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{variation.performanceMetrics.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{variation.performanceMetrics.engagement}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <MousePointer className="w-3 h-3" />
              <span>{variation.performanceMetrics.clicks}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdVariationCard;