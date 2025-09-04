import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, Image, Loader2 } from 'lucide-react';

const UploadArea = ({ onViewChange }) => {
  const { addProject } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    setIsUploading(true);
    
    // Simulate upload and project creation
    const imageUrl = URL.createObjectURL(file);
    const productName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newProject = addProject({
      productName,
      productImageURL: imageUrl
    });
    
    setIsUploading(false);
    onViewChange('project', newProject);
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
          <p className="text-gray-400">Processing your product image...</p>
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
    </div>
  );
};

export default UploadArea;