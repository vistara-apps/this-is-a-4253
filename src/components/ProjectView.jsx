import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Wand2, Send, Instagram, Music, Loader2 } from 'lucide-react';
import PlatformSelector from './PlatformSelector';
import AdVariationCard from './AdVariationCard';
import ProgressIndicator from './ProgressIndicator';

const ProjectView = ({ project, onBack }) => {
  const { addAdVariations, updateAdVariation } = useApp();
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [generationStep, setGenerationStep] = useState('idle');

  const generateAdVariations = async () => {
    setIsGenerating(true);
    setGenerationStep('analyzing');

    // Simulate AI processing steps
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGenerationStep('generating');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerationStep('optimizing');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock variations
    const variations = selectedPlatforms.flatMap(platform => [
      {
        id: Date.now() + Math.random(),
        assetURL: project.productImageURL,
        copy: platform === 'instagram' 
          ? `Transform your style with ${project.productName} ✨ #fashion #lifestyle #upgrade`
          : `This ${project.productName} hits different 🔥 #viral #musthave`,
        platform,
        status: 'generated',
        performanceMetrics: null
      },
      {
        id: Date.now() + Math.random() + 1,
        assetURL: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
        copy: platform === 'instagram'
          ? `Level up your game with premium ${project.productName} 💫 Limited time offer!`
          : `POV: You found the perfect ${project.productName} 💯`,
        platform,
        status: 'generated',
        performanceMetrics: null
      }
    ]);

    addAdVariations(project.id, variations);
    setIsGenerating(false);
    setGenerationStep('complete');
  };

  const postVariations = async () => {
    setIsPosting(true);
    
    // Simulate posting process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update variations with posted status
    project.adVariations.forEach(variation => {
      if (variation.status === 'generated') {
        updateAdVariation(project.id, variation.id, {
          status: 'posted',
          performanceMetrics: {
            views: Math.floor(Math.random() * 5000) + 500,
            engagement: Math.floor(Math.random() * 15) + 5,
            clicks: Math.floor(Math.random() * 200) + 50
          }
        });
      }
    });
    
    setIsPosting(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-dark-border rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">{project.productName}</h2>
          <p className="text-gray-400">Create and manage ad variations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product & Controls */}
        <div className="space-y-6">
          {/* Product Image */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Product Image</h3>
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <img 
                src={project.productImageURL} 
                alt={project.productName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Target Platforms</h3>
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onSelectionChange={setSelectedPlatforms}
            />
          </div>

          {/* Generation Controls */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="space-y-4">
              <button
                onClick={generateAdVariations}
                disabled={isGenerating || selectedPlatforms.length === 0}
                className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate Ad Variations'}</span>
              </button>

              {project.adVariations.length > 0 && (
                <button
                  onClick={postVariations}
                  disabled={isPosting}
                  className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {isPosting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{isPosting ? 'Posting...' : 'Post to Social Media'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Generated Variations */}
        <div className="lg:col-span-2">
          {isGenerating && (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-6">
              <ProgressIndicator step={generationStep} />
            </div>
          )}

          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Generated Variations ({project.adVariations.length})
            </h3>
            
            {project.adVariations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.adVariations.map((variation) => (
                  <AdVariationCard
                    key={variation.id}
                    variation={variation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-dark-border rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No ad variations generated yet</p>
                <p className="text-gray-500 text-sm">Click "Generate Ad Variations" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;