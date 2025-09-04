import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from './AuthProvider';
import { adGenerationService } from '../services/adGeneration';
import { ArrowLeft, Wand2, Send, Instagram, Music, Loader2 } from 'lucide-react';
import PlatformSelector from './PlatformSelector';
import AdVariationCard from './AdVariationCard';
import ProgressIndicator from './ProgressIndicator';
import toast from 'react-hot-toast';

const ProjectView = ({ project, onBack }) => {
  const { addAdVariations, updateAdVariation } = useApp();
  const { user, checkUsageLimits } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [generationStep, setGenerationStep] = useState('idle');
  const [imageAnalysis, setImageAnalysis] = useState(null);

  const generateAdVariations = async () => {
    if (!user) {
      toast.error('Please sign in to generate ad variations');
      return;
    }

    // Check usage limits
    const usageCheck = await checkUsageLimits('ad_generation');
    if (!usageCheck.canPerformAction) {
      toast.error(`You've reached your monthly limit of ${usageCheck.limit} ad generations. Please upgrade your plan.`);
      return;
    }

    // Validate request
    const validation = adGenerationService.validateGenerationRequest(
      project.productName,
      project.productImageURL,
      selectedPlatforms
    );

    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsGenerating(true);
    setGenerationStep('analyzing');

    try {
      // Analyze image first
      if (!imageAnalysis) {
        const analysis = await adGenerationService.analyzeProductImage(project.productImageURL);
        setImageAnalysis(analysis);
      }

      setGenerationStep('generating');
      
      // Generate real AI variations
      const variations = await adGenerationService.generateVariations(
        project.id,
        user.id,
        project.productName,
        project.productImageURL,
        selectedPlatforms,
        3 // Generate 3 variations per platform
      );

      setGenerationStep('optimizing');
      
      // Optimize variations for each platform
      const optimizedVariations = await Promise.all(
        variations.map(variation => 
          adGenerationService.optimizeForPlatform(variation, variation.platform)
        )
      );

      addAdVariations(project.id, optimizedVariations);
      setGenerationStep('complete');
      
      toast.success(`Generated ${optimizedVariations.length} ad variations!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate ad variations. Please try again.');
      setGenerationStep('idle');
    } finally {
      setIsGenerating(false);
    }
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
