import React from 'react';
import { Loader2, Image, Wand2, Sparkles } from 'lucide-react';

const ProgressIndicator = ({ step }) => {
  const steps = [
    { id: 'analyzing', label: 'Analyzing product image', icon: Image },
    { id: 'generating', label: 'Generating ad variations', icon: Wand2 },
    { id: 'optimizing', label: 'Optimizing for platforms', icon: Sparkles },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === step);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Generating Ad Variations</h3>
      
      <div className="space-y-3">
        {steps.map((stepItem, index) => {
          const currentIndex = getCurrentStepIndex();
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={stepItem.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActive 
                  ? 'bg-primary text-white' 
                  : isCompleted 
                    ? 'bg-accent text-white' 
                    : 'bg-dark-border text-gray-400'
              }`}>
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <stepItem.icon className="w-4 h-4" />
                )}
              </div>
              <span className={`${
                isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {stepItem.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="w-full bg-dark-border rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((getCurrentStepIndex() + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;