import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { uploadImageToImgBB } from '../../utils/imageUpload';
import { 
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  ChartBarIcon,
  ShareIcon,
  LinkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import PortfolioTemplates from './PortfolioTemplates';

const PortfolioForm = ({ onSuccess, initialData = null }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [skills, setSkills] = useState(initialData?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [images, setImages] = useState(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.template || 'grid');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [customFields, setCustomFields] = useState(initialData?.customFields || {});
  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' });
  const [descriptionLength, setDescriptionLength] = useState(description.length);

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'Video Production',
    'Music Production',
  ];

  useEffect(() => {
    setDescriptionLength(description.length);
  }, [description]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const totalFiles = files.length;
      let completedFiles = 0;
      
      const uploadPromises = files.map(async (file) => {
        try {
          const url = await uploadImageToImgBB(file);
          completedFiles++;
          setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
          return url;
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });
      
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(url => url !== null);
      
      if (successfulUploads.length > 0) {
        setImages([...images, ...successfulUploads]);
        toast.success(`Successfully uploaded ${successfulUploads.length} image(s)`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addCustomField = () => {
    if (newCustomField.key.trim() && newCustomField.value.trim()) {
      setCustomFields({
        ...customFields,
        [newCustomField.key.trim()]: newCustomField.value.trim()
      });
      setNewCustomField({ key: '', value: '' });
    }
  };

  const removeCustomField = (key) => {
    const updatedFields = { ...customFields };
    delete updatedFields[key];
    setCustomFields(updatedFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || skills.length === 0 || images.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const portfolioData = {
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        category,
        skills,
        images,
        template: selectedTemplate,
        customFields,
        timestamp: new Date(),
      };

      let portfolioId;
      
      if (initialData) {
        await updateDoc(doc(db, 'portfolio', initialData.id), portfolioData);
        portfolioId = initialData.id;
      } else {
        const docRef = await addDoc(collection(db, 'portfolio'), portfolioData);
        portfolioId = docRef.id;
        
        // Initialize analytics for new portfolio item
        try {
          await setDoc(doc(db, 'portfolio_analytics', portfolioId), {
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            weeklyViews: [],
            topReferrers: []
          });
        } catch (analyticsError) {
          console.error('Error initializing analytics:', analyticsError);
          // Continue with portfolio creation even if analytics initialization fails
        }
      }

      toast.success(initialData ? 'Portfolio updated successfully' : 'Portfolio item added successfully');
      
      // Call the onSuccess callback to hide the form and return to the portfolio list
      if (onSuccess) {
        onSuccess(portfolioId);
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast.error('Failed to save portfolio');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
              placeholder="Project title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                placeholder="Describe your project"
                required
                maxLength={1000}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {descriptionLength}/1000
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Skills Used <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-primary hover:text-primary-dark"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-primary focus:border-primary"
                placeholder="Add a skill"
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary-dark"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            {skills.length === 0 && (
              <p className="mt-1 text-sm text-red-500">At least one skill is required</p>
            )}
          </div>

          {/* Custom Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Information
            </label>
            <div className="mt-1 space-y-2">
              {Object.entries(customFields).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">{key}:</span>
                  <span className="text-gray-600 flex-1">{value}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomField(key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newCustomField.key}
                onChange={(e) => setNewCustomField({ ...newCustomField, key: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                placeholder="Field name"
              />
              <input
                type="text"
                value={newCustomField.value}
                onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                placeholder="Field value"
              />
            </div>
            <button
              type="button"
              onClick={addCustomField}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Field
            </button>
          </div>

          {/* Template Selection */}
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Template
            </label>
            <PortfolioTemplates 
              selectedTemplate={selectedTemplate} 
              onSelectTemplate={setSelectedTemplate} 
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Images <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Project image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
                      <span className="text-xs text-gray-500 mt-1">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  )}
                </label>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload up to 5 images (PNG, JPG, GIF)
            </p>
            {images.length === 0 && (
              <p className="mt-1 text-sm text-red-500">At least one image is required</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowSharing(!showSharing)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            {showSharing ? 'Hide Sharing' : 'Show Sharing'}
          </button>
        </div>
        
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initialData ? 'Update Portfolio' : 'Add Portfolio Item'}
        </button>
      </div>
    </form>
  );
};

export default PortfolioForm; 