import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (this would typically be done server-side)
const cloudinaryConfig = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET
};

export const imageProcessingService = {
  // Upload image to Cloudinary
  async uploadImage(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'adspark_uploads'); // You need to create this preset in Cloudinary
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  },

  // Generate optimized versions for different platforms
  async generatePlatformOptimizedImages(imageUrl, platforms) {
    const optimizations = {
      instagram: {
        width: 1080,
        height: 1080,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto:good',
        format: 'jpg'
      },
      tiktok: {
        width: 1080,
        height: 1920,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto:good',
        format: 'jpg'
      }
    };

    const optimizedImages = {};

    for (const platform of platforms) {
      const config = optimizations[platform];
      if (config) {
        // Generate Cloudinary transformation URL
        const transformedUrl = this.generateCloudinaryUrl(imageUrl, config);
        optimizedImages[platform] = transformedUrl;
      }
    }

    return optimizedImages;
  },

  // Generate Cloudinary transformation URL
  generateCloudinaryUrl(imageUrl, transformations) {
    // Extract public ID from Cloudinary URL
    const publicId = this.extractPublicId(imageUrl);
    if (!publicId) return imageUrl;

    const transformParams = Object.entries(transformations)
      .map(([key, value]) => `${key}_${value}`)
      .join(',');

    return `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/${transformParams}/${publicId}`;
  },

  // Extract public ID from Cloudinary URL
  extractPublicId(url) {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return null;
      
      const publicIdParts = urlParts.slice(uploadIndex + 2);
      const publicId = publicIdParts.join('/').split('.')[0];
      return publicId;
    } catch {
      return null;
    }
  },

  // Validate image file
  validateImageFile(file) {
    const errors = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Please upload JPG, PNG, WebP, or GIF images.');
    }

    if (file.size > maxSize) {
      errors.push('File size too large. Please upload images smaller than 10MB.');
    }

    // Check image dimensions (client-side preview)
    return new Promise((resolve) => {
      if (errors.length > 0) {
        resolve({ isValid: false, errors });
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width < 300 || img.height < 300) {
          errors.push('Image too small. Please upload images at least 300x300 pixels.');
        }

        resolve({
          isValid: errors.length === 0,
          errors,
          dimensions: { width: img.width, height: img.height }
        });
      };

      img.onerror = () => {
        errors.push('Invalid image file.');
        resolve({ isValid: false, errors });
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Create image preview
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  },

  // Compress image for faster upload
  async compressImage(file, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 2048px on longest side)
        const maxSize = 2048;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Generate thumbnail
  async generateThumbnail(imageUrl, size = 200) {
    const publicId = this.extractPublicId(imageUrl);
    if (!publicId) return imageUrl;

    return `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/w_${size},h_${size},c_fill,g_center,q_auto:good/${publicId}`;
  },

  // Analyze image colors for design suggestions
  async analyzeImageColors(imageUrl) {
    try {
      // This would typically use a color analysis API or library
      // For now, return mock data
      return {
        dominantColors: ['#2563eb', '#ffffff', '#1f2937'],
        colorPalette: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
        suggestions: {
          textColor: '#ffffff',
          backgroundColor: '#1f2937',
          accentColor: '#2563eb'
        }
      };
    } catch (error) {
      console.error('Color analysis error:', error);
      return null;
    }
  },

  // Get image metadata
  async getImageMetadata(imageUrl) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      return {
        size: contentLength ? parseInt(contentLength) : null,
        type: contentType,
        url: imageUrl
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return null;
    }
  }
};
