import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const useGigs = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      let gigsQuery;

      if (user) {
        gigsQuery = query(
          collection(db, 'gigs'),
          where('userId', '==', user.uid)
        );
      } else {
        gigsQuery = collection(db, 'gigs');
      }

      const snapshot = await getDocs(gigsQuery);
      const gigsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Sort gigs by createdAt in memory
      gigsData.sort((a, b) => b.createdAt - a.createdAt);
      
      setGigs(gigsData);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToImgBB = async (image) => {
    try {
      console.log(`Uploading image to ImgBB: ${image.name}`);
      
      // Create form data for ImgBB API
      const formData = new FormData();
      formData.append('image', image);
      
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
        return data.data.url;
      } else {
        throw new Error('ImgBB response missing URL');
      }
    } catch (uploadError) {
      console.error(`Error uploading image to ImgBB:`, uploadError);
      toast.error(`Failed to upload image: ${image.name}. Continuing without it.`);
      return null;
    }
  };

  const validateGigData = (gigData) => {
    const errors = {};

    // Title validation
    if (!gigData.title) {
      errors.title = 'Title is required';
    } else if (gigData.title.length < 5 || gigData.title.length > 100) {
      errors.title = 'Title must be between 5 and 100 characters';
    }

    // Description validation
    if (!gigData.description) {
      errors.description = 'Description is required';
    } else if (gigData.description.length < 20 || gigData.description.length > 1000) {
      errors.description = 'Description must be between 20 and 1000 characters';
    }

    // Category validation
    if (!gigData.category) {
      errors.category = 'Category is required';
    }

    // Price validation
    const price = parseFloat(gigData.price);
    if (!price || isNaN(price)) {
      errors.price = 'Price is required and must be a number';
    } else if (price < 5 || price > 10000) {
      errors.price = 'Price must be between $5 and $10,000';
    }

    // Delivery time validation
    const deliveryTime = parseInt(gigData.deliveryTime);
    if (!deliveryTime || isNaN(deliveryTime)) {
      errors.deliveryTime = 'Delivery time is required and must be a number';
    } else if (deliveryTime < 1 || deliveryTime > 90) {
      errors.deliveryTime = 'Delivery time must be between 1 and 90 days';
    }

    // Revisions validation
    const revisions = parseInt(gigData.revisions);
    if (!revisions || isNaN(revisions)) {
      errors.revisions = 'Number of revisions is required and must be a number';
    } else if (revisions < 0 || revisions > 20) {
      errors.revisions = 'Number of revisions must be between 0 and 20';
    }

    // Features validation
    if (!gigData.features || !Array.isArray(gigData.features)) {
      errors.features = 'Features must be an array';
    } else {
      const validFeatures = gigData.features.filter(feature => feature.trim().length > 0);
      if (validFeatures.length === 0) {
        errors.features = 'At least one feature is required';
      }
    }

    // Images validation
    if (!gigData.images || !Array.isArray(gigData.images)) {
      errors.images = 'Images must be an array';
    } else if (gigData.images.length === 0) {
      errors.images = 'At least one image is required';
    } else if (gigData.images.length > 5) {
      errors.images = 'Maximum 5 images allowed';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const createGig = async (gigData, images) => {
    if (!user) {
      toast.error('You must be logged in to create a gig');
      throw new Error('User not authenticated');
    }

    // Validate gig data
    const validation = validateGigData({ ...gigData, images: [] }); // Validate without images first
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setLoading(true);
      
      // Upload images to ImgBB
      const imageUrls = [];
      for (const image of images) {
        const imageUrl = await uploadImageToImgBB(image);
        if (imageUrl) {
          imageUrls.push(imageUrl);
        }
      }

      // Validate with images
      const finalValidation = validateGigData({ ...gigData, images: imageUrls });
      if (!finalValidation.isValid) {
        const errorMessage = Object.values(finalValidation.errors)[0];
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Create gig document
      const gigDoc = await addDoc(collection(db, 'gigs'), {
        ...gigData,
        images: imageUrls,
        status: 'active',
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      toast.success('Gig created successfully');
      return gigDoc.id;
    } catch (err) {
      console.error('Error creating gig:', err);
      setError(err.message);
      toast.error('Failed to create gig');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGig = async (gigId, gigData, newImages = []) => {
    if (!user) {
      toast.error('You must be logged in to update a gig');
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      
      let imageUrls = gigData.images || [];
      
      // Upload new images if any
      if (newImages.length > 0) {
        for (const image of newImages) {
          const imageUrl = await uploadImageToImgBB(image);
          if (imageUrl) {
            imageUrls.push(imageUrl);
          }
        }
      }
      
      // Update gig document
      await updateDoc(doc(db, 'gigs', gigId), {
        ...gigData,
        images: imageUrls,
        updatedAt: new Date()
      });
      
      toast.success('Gig updated successfully');
    } catch (err) {
      console.error('Error updating gig:', err);
      setError(err.message);
      toast.error('Failed to update gig');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGig = async (gigId) => {
    if (!user) {
      toast.error('You must be logged in to delete a gig');
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'gigs', gigId));
      toast.success('Gig deleted successfully');
    } catch (err) {
      console.error('Error deleting gig:', err);
      setError(err.message);
      toast.error('Failed to delete gig');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGigById = async (gigId) => {
    try {
      setLoading(true);
      const gigDoc = await getDocs(doc(db, 'gigs', gigId));
      if (!gigDoc.exists()) {
        throw new Error('Gig not found');
      }
      return {
        id: gigDoc.id,
        ...gigDoc.data()
      };
    } catch (err) {
      console.error('Error fetching gig:', err);
      setError(err.message);
      toast.error('Failed to fetch gig');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    gigs,
    loading,
    error,
    fetchGigs,
    createGig,
    updateGig,
    deleteGig,
    getGigById
  };
}; 