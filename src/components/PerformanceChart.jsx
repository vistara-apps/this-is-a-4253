import React from 'react';

const PerformanceChart = () => {
  const data = [
    { day: 'Mon', views: 320 },
    { day: 'Tue', views: 450 },
    { day: 'Wed', views: 380 },
    { day: 'Thu', views: 520 },
    { day: 'Fri', views: 680 },
    { day: 'Sat', views: 750 },
    { day: 'Sun', views: 640 },
  ];

  const maxViews = Math.max(...data.map(d => d.views));

  return (
    <div className="space-y-4">
      <div className="flex items-end space-x-2 h-32">
        {data.map((point, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-primary rounded-t-sm transition-all duration-300"
              style={{ 
                height: `${(point.views / maxViews) * 100}%`,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-gray-400 mt-2">{point.day}</span>
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-white">1,247</p>
        <p className="text-sm text-gray-400">Total views this week</p>
      </div>
    </div>
  );
};

export default PerformanceChart;