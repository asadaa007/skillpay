import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const ReviewCard = ({ review, showActions }) => {
  const { rating, comment, reviewerName, reviewerAvatar, createdAt, projectTitle } = review;
  const { user } = useAuth();
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReport = async () => {
    try {
      await updateDoc(doc(db, 'reviews', review.id), {
        status: 'reported',
        reportReason,
        reportedBy: user.uid,
        reportedAt: new Date().toISOString()
      });
      toast.success('Review reported successfully');
      setIsReporting(false);
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error('Failed to report review');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-center mb-4">
        <img 
          src={reviewerAvatar || '/default-avatar.png'} 
          alt={reviewerName}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h3 className="font-medium text-gray-900">{reviewerName}</h3>
          <p className="text-sm text-gray-500">{new Date(createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
      
      <p className="text-sm text-gray-600 mb-2">Project: {projectTitle}</p>
      <p className="text-gray-700">{comment}</p>

      {showActions && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => setIsReporting(!isReporting)}
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Report Review
          </button>

          {isReporting && (
            <div className="mt-4">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this review?"
                className="w-full p-2 border rounded-md"
                rows={3}
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setIsReporting(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Submit Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard; 