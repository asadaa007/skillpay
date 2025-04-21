import React, { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { uploadImageToImgBB } from '../utils/imageUpload';
import { toast } from 'react-hot-toast';

const ImageUpload = ({
  currentImageUrl,
  onImageUploaded,
  placeholder = 'Upload Image',
  className = '',
  imageClassName = '',
  showRemoveButton = false,
  onRemove
}) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to ImgBB
    setLoading(true);
    try {
      const imageUrl = await uploadImageToImgBB(file);
      onImageUploaded(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      // Reset preview on error
      setPreviewUrl(currentImageUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Uploaded"
            className={`object-cover ${imageClassName}`}
          />
          {showRemoveButton && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
            <label className="cursor-pointer text-white text-sm flex flex-col items-center">
              <FiUpload className="h-6 w-6 mb-1" />
              <span>Change Photo</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
          <div className="flex flex-col items-center justify-center py-6">
            <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 text-center">
              <span className="font-semibold">Click to upload</span>
              <br />
              or drag and drop
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;