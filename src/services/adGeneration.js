import { aiService } from '../lib/openai';
import { dbHelpers } from '../lib/supabase';
import toast from 'react-hot-toast';

export const adGenerationService = {
  // Generate ad variations with proper error handling and usage tracking
  async generateVariations(projectId, userId, productName, imageUrl, platforms, count = 3) {
    try {
      // Track usage for billing
      await dbHelpers.trackUsage(userId, 'ad_generation', {
        projectId,
        platforms,
        count,
        timestamp: new Date().toISOString()
      });

      // Generate variations using AI
      const variations = await aiService.generateAdVariations(
        productName,
        imageUrl,
        platforms,
        count
      );

      // Save variations to database
      const savedVariations = await dbHelpers.createAdVariations(
        variations.map(variation => ({
          ...variation,
          project_id: projectId,
          ad_variation_id: variation.id
        }))
      );

      return savedVariations;
    } catch (error) {
      console.error('Error in ad generation service:', error);
      throw error;
    }
  },

  // Analyze image and provide preview before generation
  async analyzeProductImage(imageUrl) {
    try {
      const analysis = await aiService.analyzeImage(imageUrl);
      return {
        description: analysis,
        suggestions: this.extractSuggestions(analysis)
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  },

  // Extract actionable suggestions from image analysis
  extractSuggestions(analysis) {
    const suggestions = [];
    
    if (analysis.toLowerCase().includes('lifestyle')) {
      suggestions.push('Consider lifestyle-focused ad copy');
    }
    
    if (analysis.toLowerCase().includes('professional')) {
      suggestions.push('Emphasize quality and professionalism');
    }
    
    if (analysis.toLowerCase().includes('color')) {
      suggestions.push('Highlight the color scheme in your ads');
    }
    
    if (analysis.toLowerCase().includes('modern')) {
      suggestions.push('Target tech-savvy and modern audiences');
    }
    
    return suggestions.length > 0 ? suggestions : ['Focus on key product benefits'];
  },

  // Generate platform-specific optimizations
  async optimizeForPlatform(variation, platform) {
    try {
      const optimizations = {
        instagram: {
          aspectRatio: '1:1',
          maxCopyLength: 150,
          hashtagCount: '8-12',
          style: 'lifestyle-focused'
        },
        tiktok: {
          aspectRatio: '9:16',
          maxCopyLength: 100,
          hashtagCount: '4-6',
          style: 'entertainment-focused'
        }
      };

      const platformConfig = optimizations[platform];
      
      // Generate optimized hashtags
      const hashtags = await aiService.generateHashtags(
        variation.productName,
        platform,
        variation.copy
      );

      return {
        ...variation,
        platform,
        hashtags,
        optimizations: platformConfig,
        optimizedCopy: this.truncateCopy(variation.copy, platformConfig.maxCopyLength)
      };
    } catch (error) {
      console.error('Error optimizing for platform:', error);
      return variation; // Return original if optimization fails
    }
  },

  // Truncate copy to platform limits
  truncateCopy(copy, maxLength) {
    if (copy.length <= maxLength) return copy;
    
    // Find the last complete word within the limit
    const truncated = copy.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  },

  // Batch generate variations for multiple projects
  async batchGenerate(projects, userId, platforms) {
    const results = [];
    const errors = [];

    for (const project of projects) {
      try {
        const variations = await this.generateVariations(
          project.id,
          userId,
          project.productName,
          project.productImageURL,
          platforms
        );
        results.push({ projectId: project.id, variations });
      } catch (error) {
        errors.push({ projectId: project.id, error: error.message });
      }
    }

    return { results, errors };
  },

  // Get generation history for a user
  async getGenerationHistory(userId, limit = 50) {
    try {
      const history = await dbHelpers.getUserUsage(
        userId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        new Date().toISOString()
      );

      return history
        .filter(item => item.action === 'ad_generation')
        .slice(0, limit)
        .map(item => ({
          id: item.usage_id,
          timestamp: item.created_at,
          projectId: item.metadata?.projectId,
          platforms: item.metadata?.platforms,
          count: item.metadata?.count
        }));
    } catch (error) {
      console.error('Error getting generation history:', error);
      return [];
    }
  },

  // Validate generation request
  validateGenerationRequest(productName, imageUrl, platforms) {
    const errors = [];

    if (!productName || productName.trim().length < 2) {
      errors.push('Product name must be at least 2 characters long');
    }

    if (!imageUrl || !this.isValidImageUrl(imageUrl)) {
      errors.push('Valid product image is required');
    }

    if (!platforms || platforms.length === 0) {
      errors.push('At least one platform must be selected');
    }

    const validPlatforms = ['instagram', 'tiktok'];
    const invalidPlatforms = platforms.filter(p => !validPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      errors.push(`Invalid platforms: ${invalidPlatforms.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Check if URL is a valid image
  isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(pathname) || url.includes('blob:');
    } catch {
      return false;
    }
  },

  // Estimate generation cost/usage
  estimateUsage(platforms, count = 3) {
    const baseCredits = 1; // Base cost per variation
    const platformMultiplier = platforms.length;
    const countMultiplier = count;
    
    return {
      totalCredits: baseCredits * platformMultiplier * countMultiplier,
      breakdown: {
        platforms: platforms.length,
        variationsPerPlatform: count,
        totalVariations: platforms.length * count
      }
    };
  }
};
