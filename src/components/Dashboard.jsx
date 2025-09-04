import React from 'react';
import { useApp } from '../context/AppContext';
import UploadArea from './UploadArea';
import AdCard from './AdCard';
import PerformanceChart from './PerformanceChart';
import { Plus, TrendingUp, Eye, MousePointer } from 'lucide-react';

const Dashboard = ({ onViewChange }) => {
  const { projects } = useApp();

  const stats = [
    { label: 'Total Views', value: '12.5K', icon: Eye, color: 'text-blue-500' },
    { label: 'Engagement Rate', value: '8.7%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Click Rate', value: '2.3%', icon: MousePointer, color: 'text-purple-500' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">AdSpark</h2>
        <p className="text-gray-400">Scale your ecommerce and social media automation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Product Image</h3>
            <UploadArea onViewChange={onViewChange} />
          </div>

          {/* Recent Ad Variations */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Recent ad variations</h3>
              <button className="text-gray-400 hover:text-white">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  onClick={() => onViewChange('project', project)}
                  className="cursor-pointer"
                >
                  <AdCard
                    imageUrl={project.productImageURL}
                    title={project.productName}
                    status={project.adVariations.length > 0 ? 'generated' : 'pending'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Performance Chart */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
            <PerformanceChart />
          </div>

          {/* Ad Networks */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ad Networks</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Instagram</span>
                <span className="text-accent">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">TikTok</span>
                <span className="text-gray-500">Not connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;