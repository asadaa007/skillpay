import { useState } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export const useProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProfile = async (userId) => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('Profile not found');
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      toast.error('Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatarToImgBB = async (avatar) => {
    try {
      console.log(`Uploading avatar to ImgBB: ${avatar.name}`);
      
      // Create form data for ImgBB API
      const formData = new FormData();
      formData.append('image', avatar);
      
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
      console.error(`Error uploading avatar to ImgBB:`, uploadError);
      toast.error(`Failed to upload avatar. Continuing with existing avatar.`);
      return null;
    }
  };

  const updateProfile = async (userId, profileData, avatar = null) => {
    try {
      setLoading(true);
      
      let avatarUrl = profileData.avatarUrl;
      
      // Upload new avatar if provided
      if (avatar) {
        const newAvatarUrl = await uploadAvatarToImgBB(avatar);
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }
      
      // Update profile document
      await updateDoc(doc(db, 'users', userId), {
        ...profileData,
        avatarUrl,
        updatedAt: new Date()
      });
      
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      toast.error('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getProfile,
    updateProfile
  };
}; 