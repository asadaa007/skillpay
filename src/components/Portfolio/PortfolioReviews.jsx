import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { StarIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const PortfolioReviews = ({ portfolioId, portfolioTitle }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  useEffect(() => {
    fetchReviews();
  }, [portfolioId]);

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'portfolio_reviews');
      const q = query(
        reviewsRef,
        where('portfolioId', '==', portfolioId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate statistics
      const totalReviews = reviewsData.length;
      const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      const distribution = reviewsData.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

      setStats({
        averageRating,
        totalReviews,
        ratingDistribution: distribution,
      });

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'portfolio_reviews'), {
        portfolioId,
        portfolioTitle,
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
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (reviewId, reason) => {
    try {
      await updateDoc(doc(db, 'portfolio_reviews', reviewId), {
        status: 'reported',
        reportReason: reason,
        reportedBy: user.uid,
        reportedAt: new Date().toISOString()
      });
      toast.success('Review reported successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error('Failed to report review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Review Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(stats.averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {stats.totalReviews} reviews
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-sm text-gray-600 w-8">{rating} stars</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{
                      width: `${
                        (stats.ratingDistribution[rating] / stats.totalReviews) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">
                  {stats.ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {user && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Leave a Review</h3>
          
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <StarIcon
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this portfolio..."
            className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary"
            rows={4}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-4">
                {review.reviewerAvatar ? (
                  <img
                    src={review.reviewerAvatar}
                    alt={review.reviewerName}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {review.reviewerName}
                      </h4>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{review.comment}</p>
                  
                  {user && user.uid !== review.reviewerId && (
                    <button
                      onClick={() => handleReport(review.id, 'inappropriate content')}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Report Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PortfolioReviews; 