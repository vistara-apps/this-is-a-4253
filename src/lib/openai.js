import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export const aiService = {
  // Generate ad copy variations for a product
  async generateAdCopy(productName, platform, imageDescription, count = 3) {
    try {
      const platformPrompts = {
        instagram: `Create ${count} engaging Instagram ad captions for ${productName}. 
        Image description: ${imageDescription}
        
        Requirements:
        - Use relevant hashtags (3-5 per caption)
        - Include emojis naturally
        - Keep under 150 characters
        - Focus on lifestyle and aspirational messaging
        - Include a clear call-to-action
        - Make each caption unique and compelling
        
        Return as a JSON array of strings.`,
        
        tiktok: `Create ${count} viral TikTok ad captions for ${productName}.
        Image description: ${imageDescription}
        
        Requirements:
        - Use trending language and slang
        - Keep under 100 characters
        - Include relevant hashtags (2-4 per caption)
        - Focus on entertainment and relatability
        - Use emojis strategically
        - Make each caption unique and engaging
        
        Return as a JSON array of strings.`
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert social media copywriter specializing in high-converting ad copy. Always return valid JSON arrays."
          },
          {
            role: "user",
            content: platformPrompts[platform] || platformPrompts.instagram
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating ad copy:', error);
      throw new Error('Failed to generate ad copy. Please try again.');
    }
  },

  // Analyze image and extract description for ad generation
  async analyzeImage(imageUrl) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this product image and provide a detailed description focusing on: product type, key features, colors, style, target audience, and emotional appeal. Keep it concise but comprehensive for ad copy generation."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 300
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  },

  // Generate image variations using DALL-E
  async generateImageVariations(originalImageUrl, productName, count = 2) {
    try {
      // First, analyze the original image to understand the product
      const imageDescription = await this.analyzeImage(originalImageUrl);
      
      const variations = [];
      
      for (let i = 0; i < count; i++) {
        const stylePrompts = [
          "professional product photography with clean white background",
          "lifestyle photography showing the product in use",
          "minimalist aesthetic with soft lighting",
          "modern flat lay composition with complementary props"
        ];
        
        const selectedStyle = stylePrompts[i % stylePrompts.length];
        
        const prompt = `${imageDescription}, ${selectedStyle}, high quality, commercial photography, ${productName}`;
        
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          size: "1024x1024",
          quality: "standard",
          n: 1
        });
        
        variations.push(response.data[0].url);
      }
      
      return variations;
    } catch (error) {
      console.error('Error generating image variations:', error);
      throw new Error('Failed to generate image variations. Please try again.');
    }
  },

  // Generate complete ad variations (copy + images)
  async generateAdVariations(productName, originalImageUrl, platforms, count = 3) {
    try {
      // Analyze the original image
      const imageDescription = await this.analyzeImage(originalImageUrl);
      
      // Generate image variations
      const imageVariations = await this.generateImageVariations(originalImageUrl, productName, count);
      
      const allVariations = [];
      
      for (const platform of platforms) {
        // Generate ad copy for this platform
        const adCopies = await this.generateAdCopy(productName, platform, imageDescription, count);
        
        // Create variations combining copy and images
        for (let i = 0; i < count; i++) {
          allVariations.push({
            id: Date.now() + Math.random(),
            assetURL: i < imageVariations.length ? imageVariations[i] : originalImageUrl,
            copy: adCopies[i] || adCopies[0], // Fallback to first copy if not enough generated
            platform,
            status: 'generated',
            performanceMetrics: null,
            generatedAt: new Date().toISOString()
          });
        }
      }
      
      return allVariations;
    } catch (error) {
      console.error('Error generating ad variations:', error);
      throw new Error('Failed to generate ad variations. Please try again.');
    }
  },

  // Analyze ad performance and provide insights
  async analyzePerformance(adVariations) {
    try {
      const performanceData = adVariations
        .filter(ad => ad.performanceMetrics)
        .map(ad => ({
          platform: ad.platform,
          copy: ad.copy,
          metrics: ad.performanceMetrics
        }));

      if (performanceData.length === 0) {
        return {
          insights: ["Not enough performance data available yet. Check back after your ads have been running for a while."],
          recommendations: ["Continue posting variations to gather performance data."]
        };
      }

      const prompt = `Analyze the following ad performance data and provide actionable insights:

${JSON.stringify(performanceData, null, 2)}

Please provide:
1. Key insights about what's working well
2. Patterns in high-performing content
3. Specific recommendations for improvement
4. Suggestions for future ad variations

Return as JSON with "insights" and "recommendations" arrays.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert growth hacker and social media analyst. Provide data-driven insights and actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing performance:', error);
      throw new Error('Failed to analyze performance. Please try again.');
    }
  },

  // Generate hashtag suggestions
  async generateHashtags(productName, platform, copy) {
    try {
      const prompt = `Generate relevant hashtags for this ${platform} post about ${productName}:
      
      "${copy}"
      
      Requirements:
      - ${platform === 'instagram' ? '8-12' : '4-6'} hashtags
      - Mix of popular and niche hashtags
      - Include product-specific and lifestyle hashtags
      - Avoid banned or shadowbanned hashtags
      
      Return as a JSON array of hashtag strings (without #).`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a social media hashtag expert. Always return valid JSON arrays."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating hashtags:', error);
      return []; // Return empty array as fallback
    }
  }
};
