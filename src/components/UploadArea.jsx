import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from './AuthProvider';
import { imageProcessingService } from '../lib/imageProcessing';
import { Upload, Image, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadArea = ({ onViewChange }) => {
  const { addProject } = useApp();
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    if (!user) {
      toast.error('Please sign in to upload images');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setValidationErrors([]);
    
    try {
      // Validate the image file
      const validation = await imageProcessingService.validateImageFile(file);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error(validation.errors[0]);
        return;
      }

      setUploadProgress(20);

      // Compress image if needed
      let processedFile = file;
      if (file.size > 2 * 1024 * 1024) { // If larger than 2MB
        processedFile = await imageProcessingService.compressImage(file, 0.8);
        setUploadProgress(40);
      }

      // Upload to cloud storage
      const uploadResult = await imageProcessingService.uploadImage(processedFile);
      setUploadProgress(80);

      // Create project name from filename
      const productName = file.name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

      // Create new project
      const newProject = addProject({
        productName,
        productImageURL: uploadResult.url,
        userId: user.id,
        metadata: {
          originalFileName: file.name,
          fileSize: file.size,
          dimensions: validation.dimensions,
          cloudinaryPublicId: uploadResult.publicId
        }
      });

      setUploadProgress(100);
      toast.success('Image uploaded successfully!');
      
      // Navigate to project view
      onViewChange('project', newProject);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-dark-border hover:border-gray-600'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      {isUploading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="w-full max-w-xs">
            <div className="bg-dark-border rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2 text-center">
              {uploadProgress < 20 ? 'Validating image...' :
               uploadProgress < 40 ? 'Compressing image...' :
               uploadProgress < 80 ? 'Uploading to cloud...' :
               uploadProgress < 100 ? 'Creating project...' :
               'Complete!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-dark-border rounded-lg flex items-center justify-center">
            {isDragging ? (
              <Upload className="w-8 h-8 text-primary" />
            ) : (
              <Image className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-white font-medium mb-1">
              {isDragging ? 'Drop your image here' : 'Upload ad variations'}
            </p>
            <p className="text-gray-400 text-sm">
              Drag and drop or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse files
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </p>
          </div>
          <p className="text-gray-500 text-xs">PNG, JPG, WebP up to 10MB</p>
        </div>
      )}
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium text-sm">Upload Error</p>
              <ul className="text-red-300 text-sm mt-1 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
