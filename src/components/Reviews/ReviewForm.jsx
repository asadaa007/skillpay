import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { db } from '../../config/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const ReviewForm = ({ freelancerId, projectId, projectTitle, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        freelancerId,
        projectId,
        projectTitle,
        rating,
        comment,
        reviewerId: user.uid,
        reviewerName: user.displayName,
        reviewerAvatar: user.photoURL,
        createdAt: new Date().toISOString(),
        status: 'published'
      });

      toast.success('Review submitted successfully');
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Leave a Review</h3>
      
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <FiStar
              className={`w-8 h-8 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        rows={4}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm; 