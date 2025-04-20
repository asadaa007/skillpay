import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditGig = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gig, setGig] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deliveryTime: '',
    revisions: '',
    features: [''],
    images: [],
  });
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    fetchGig();
  }, [gigId, user]);

  const fetchGig = async () => {
    if (!user || !gigId) return;
    
    try {
      const gigDoc = await getDoc(doc(db, 'gigs', gigId));
      
      if (!gigDoc.exists()) {
        toast.error('Gig not found');
        navigate('/gigs');
        return;
      }
      
      const gigData = {
        id: gigDoc.id,
        ...gigDoc.data()
      };
      
      // Verify the gig belongs to the current user
      if (gigData.userId !== user.uid) {
        toast.error('You do not have permission to edit this gig');
        navigate('/gigs');
        return;
      }
      
      setGig(gigData);
      setFormData({
        title: gigData.title || '',
        description: gigData.description || '',
        category: gigData.category || '',
        price: gigData.price || '',
        deliveryTime: gigData.deliveryTime || '',
        revisions: gigData.revisions || '',
        features: gigData.features || [''],
        images: gigData.images || [],
      });
      setImagePreviews(gigData.images || []);
    } catch (error) {
      console.error('Error fetching gig:', error);
      toast.error('Failed to load gig details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    // If it's an existing image, mark it for deletion
    if (index < formData.images.length) {
      setImagesToDelete(prev => [...prev, formData.images[index]]);
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // If it's a new image, just remove it from the new files
      const adjustedIndex = index - formData.images.length;
      setNewImageFiles(prev => prev.filter((_, i) => i !== adjustedIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !gig || saving) return;
    
    setSaving(true);
    
    try {
      // Upload new images to ImgBB
      const newImageUrls = [];
      for (const file of newImageFiles) {
        try {
          console.log(`Uploading image to ImgBB: ${file.name}`);
          
          // Create form data for ImgBB API
          const formData = new FormData();
          formData.append('image', file);
          
          // Get ImgBB API key from environment variables
          const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
          
          const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`ImgBB API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('ImgBB upload successful:', data);
          
          if (data.success && data.data && data.data.url) {
            newImageUrls.push(data.data.url);
          } else {
            throw new Error('ImgBB response missing URL');
          }
        } catch (uploadError) {
          console.error(`Error uploading image ${file.name} to ImgBB:`, uploadError);
          toast.error(`Failed to upload image: ${file.name}. Continuing without it.`);
        }
      }
      
      // Note: We can't delete images from ImgBB as we don't have that capability
      // The imagesToDelete array is kept for reference but no deletion is performed
      
      // Update gig data
      const updatedGigData = {
        ...formData,
        images: [...formData.images, ...newImageUrls],
        updatedAt: new Date(),
      };
      
      await updateDoc(doc(db, 'gigs', gig.id), updatedGigData);
      
      toast.success('Gig updated successfully');
      navigate(`/gigs/${gig.id}`);
    } catch (error) {
      console.error('Error updating gig:', error);
      toast.error('Failed to update gig');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return null;
  }

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/gigs/${gig.id}`)}
          className="inline-flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gig Details
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Gig</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="">Select a category</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="ui-design">UI Design</option>
                <option value="graphic-design">Graphic Design</option>
                <option value="content-writing">Content Writing</option>
                <option value="digital-marketing">Digital Marketing</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                Delivery Time (days)
              </label>
              <input
                type="number"
                id="deliveryTime"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                required
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="revisions" className="block text-sm font-medium text-gray-700">
                Number of Revisions
              </label>
              <input
                type="number"
                id="revisions"
                name="revisions"
                value={formData.revisions}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Enter a feature"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="btn-secondary"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="btn-secondary mt-2"
            >
              Add Feature
            </button>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
            />
          </div>
          
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/gigs/${gig.id}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGig; 