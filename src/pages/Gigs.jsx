import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, storage } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Gigs = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gigs, setGigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchGigs();
  }, [user]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      let gigsQuery;
      
      if (user) {
        // If user is logged in, fetch their gigs
        gigsQuery = query(
          collection(db, 'gigs'),
          where('userId', '==', user.uid)
        );
      } else {
        // If no user is logged in, fetch all active gigs
        gigsQuery = query(
          collection(db, 'gigs'),
          where('status', '==', 'active')
        );
      }
      
      const querySnapshot = await getDocs(gigsQuery);
      const gigsData = querySnapshot.docs.map(doc => {
        try {
          return {
            id: doc.id,
            ...doc.data(),
          };
        } catch (error) {
          console.error(`Error processing gig ${doc.id}:`, error);
          return null;
        }
      }).filter(gig => gig !== null); // Remove any gigs that failed to process
      
      // Sort gigs by createdAt in memory instead of in the query
      gigsData.sort((a, b) => {
        const timeA = a.createdAt?.toDate() || new Date(0);
        const timeB = b.createdAt?.toDate() || new Date(0);
        return timeB - timeA;
      });
      
      setGigs(gigsData);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      // Don't show error toast for permission errors
      if (!error.message?.includes('permission-denied')) {
        toast.error('Failed to load gigs');
      }
      setGigs([]); // Set empty array instead of leaving previous state
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
    setImageFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setFormErrors({});
    
    try {
      // Upload images to ImgBB instead of Firebase Storage
      const imageUrls = [];
      if (imageFiles.length > 0) {
        try {
          for (const file of imageFiles) {
            console.log(`Uploading image to ImgBB: ${file.name}`);
            
            // Create form data for ImgBB API
            const formData = new FormData();
            formData.append('image', file);
            
            // Replace 'YOUR_IMGBB_API_KEY' with your actual ImgBB API key
            const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY || 'YOUR_IMGBB_API_KEY';
            
            try {
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
                imageUrls.push(data.data.url);
              } else {
                throw new Error('ImgBB response missing URL');
              }
            } catch (uploadError) {
              console.error(`Error uploading image ${file.name} to ImgBB:`, uploadError);
              toast.error(`Failed to upload image: ${file.name}. Continuing without it.`);
            }
          }
        } catch (uploadError) {
          console.error('Error in image upload process:', uploadError);
          toast.error(`Some images failed to upload. Continuing with the gig creation.`);
        }
      }
      
      const gigData = {
        ...formData,
        images: imageUrls,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };
      
      console.log('Saving gig data:', gigData);
      
      if (editingGig) {
        // Update existing gig
        await updateDoc(doc(db, 'gigs', editingGig.id), gigData);
        toast.success('Gig updated successfully');
      } else {
        // Create new gig
        const docRef = await addDoc(collection(db, 'gigs'), gigData);
        console.log('Gig created with ID:', docRef.id);
        toast.success('Gig created successfully');
      }
      
      // Reset form and refresh gigs
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        deliveryTime: '',
        revisions: '',
        features: [''],
        images: [],
      });
      setImageFiles([]);
      setImagePreviews([]);
      setShowForm(false);
      setEditingGig(null);
      fetchGigs();
    } catch (error) {
      console.error('Error saving gig:', error);
      if (error.errors) {
        setFormErrors(error.errors);
      }
      toast.error(`Failed to save gig: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (gig) => {
    setEditingGig(gig);
    setFormData({
      title: gig.title,
      description: gig.description,
      category: gig.category,
      price: gig.price,
      deliveryTime: gig.deliveryTime,
      revisions: gig.revisions,
      features: gig.features,
      images: gig.images,
    });
    setImagePreviews(gig.images);
    setShowForm(true);
  };

  const handleDelete = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this gig?')) return;
    
    try {
      await deleteDoc(doc(db, 'gigs', gigId));
      toast.success('Gig deleted successfully');
      fetchGigs();
    } catch (error) {
      console.error('Error deleting gig:', error);
      toast.error('Failed to delete gig');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {user ? 'My Gigs' : 'All Gigs'}
        </h1>
        {user && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingGig(null);
              setFormData({
                title: '',
                description: '',
                category: '',
                price: '',
                deliveryTime: '',
                revisions: '',
                features: [''],
                images: [],
              });
              setImageFiles([]);
              setImagePreviews([]);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Gig
          </button>
        )}
      </div>
      
      {showForm ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingGig ? 'Edit Gig' : 'Create New Gig'}
          </h2>
          
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
                  className={`mt-1 block w-full border ${
                    formErrors.title ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
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
                  className={`mt-1 block w-full border ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                >
                  <option value="">Select a category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="ui-design">UI Design</option>
                  <option value="graphic-design">Graphic Design</option>
                  <option value="content-writing">Content Writing</option>
                  <option value="digital-marketing">Digital Marketing</option>
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
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
                  className={`mt-1 block w-full border ${
                    formErrors.price ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                )}
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
                  className={`mt-1 block w-full border ${
                    formErrors.deliveryTime ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {formErrors.deliveryTime && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.deliveryTime}</p>
                )}
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
                  className={`mt-1 block w-full border ${
                    formErrors.revisions ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {formErrors.revisions && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.revisions}</p>
                )}
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
                    placeholder={`Feature ${index + 1}`}
                    className={`flex-1 border ${
                      formErrors.features ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {formErrors.features && (
                <p className="mt-1 text-sm text-red-600">{formErrors.features}</p>
              )}
              <button
                type="button"
                onClick={addFeature}
                className="mt-2 text-primary hover:text-primary-dark"
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
              {formErrors.images && (
                <p className="mt-1 text-sm text-red-600">{formErrors.images}</p>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark ${
                  formErrors.images ? 'border-red-500' : ''
                }`}
              />
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingGig(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : editingGig ? 'Update Gig' : 'Create Gig'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.map(gig => (
          <div key={gig.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              {gig.images[0] ? (
                <img
                  src={gig.images[0]}
                  alt={gig.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEdit(gig)}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <PencilIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(gig.id)}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <TrashIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {gig.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {gig.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-primary font-semibold">
                  ${gig.price}
                </span>
                <span className="text-sm text-gray-500">
                  {gig.deliveryTime} days delivery
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {gigs.length === 0 && !showForm && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No gigs yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first gig to start selling your services
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Create Your First Gig
          </button>
        </div>
      )}
    </div>
  );
};

export default Gigs; 