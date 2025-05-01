import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ReviewCard from './ReviewCard';
import { FiStar } from 'react-icons/fi';

const ReviewsManager = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('freelancerId', '==', userId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviewsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate stats
      const total = reviewsList.length;
      const average = total > 0 
        ? reviewsList.reduce((acc, review) => acc + review.rating, 0) / total 
        : 0;

      setReviews(reviewsList);
      setStats({ average: average.toFixed(1), total });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Review Summary</h3>
            <p className="text-gray-600 mt-1">Based on {stats.total} reviews</p>
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-gray-900">{stats.average}</span>
            <FiStar className="w-6 h-6 text-yellow-400 ml-2" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review}
              showActions={true}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">No reviews yet</p>
        )}
      </div>
    </div>
  );
};

export default ReviewsManager; 