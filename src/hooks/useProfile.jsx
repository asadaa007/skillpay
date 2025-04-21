import { useState } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { uploadImageToImgBB } from '../utils/imageUpload';

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

  const updateProfile = async (userId, profileData, avatar = null) => {
    try {
      setLoading(true);
      
      let avatarUrl = profileData.avatarUrl;
      
      // Upload new avatar if provided
      if (avatar) {
        try {
          const newAvatarUrl = await uploadImageToImgBB(avatar);
          if (newAvatarUrl) {
            avatarUrl = newAvatarUrl;
          }
        } catch (uploadError) {
          console.error('Error uploading avatar to ImgBB:', uploadError);
          toast.error('Failed to upload avatar. Continuing with existing avatar.');
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