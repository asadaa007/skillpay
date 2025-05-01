import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';

const ReviewModeration = () => {
  const [reportedReviews, setReportedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportedReviews();
  }, []);

  const fetchReportedReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('status', '==', 'reported')
      );
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReportedReviews(reviews);
    } catch (error) {
      console.error('Error fetching reported reviews:', error);
      toast.error('Failed to load reported reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (reviewId, action) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: action === 'approve' ? 'published' : 'removed',
        moderatedAt: new Date().toISOString()
      });
      toast.success(`Review ${action === 'approve' ? 'approved' : 'removed'}`);
      fetchReportedReviews();
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Failed to moderate review');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Review Moderation</h1>
      
      {reportedReviews.length === 0 ? (
        <p className="text-gray-500">No reviews need moderation</p>
      ) : (
        <div className="space-y-6">
          {reportedReviews.map(review => (
            <div key={review.id} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <h3 className="font-medium">Report Reason:</h3>
                <p className="text-red-600">{review.reportReason}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium">Review Content:</h3>
                <p>{review.comment}</p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleModeration(review.id, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleModeration(review.id, 'remove')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewModeration; 