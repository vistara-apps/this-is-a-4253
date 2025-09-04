import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AdCard = ({ imageUrl, title, status = 'pending', onClick }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'generated':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'posting':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'generated':
        return 'Generated';
      case 'posting':
        return 'Posting';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div 
      className="bg-dark-border rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square bg-gray-800">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h4 className="text-sm font-medium text-white truncate mb-2">{title}</h4>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-xs text-gray-400">{getStatusText()}</span>
        </div>
      </div>
    </div>
  );
};

export default AdCard;