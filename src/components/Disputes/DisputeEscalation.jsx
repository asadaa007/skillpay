import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import { FiAlertTriangle, FiClock } from 'react-icons/fi';

const DisputeEscalation = ({ disputeId, createdAt, status }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [escalated, setEscalated] = useState(false);

  useEffect(() => {
    if (status === 'open') {
      const disputeDate = new Date(createdAt);
      const escalationDate = new Date(disputeDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const now = new Date();

      if (now >= escalationDate) {
        handleEscalation();
      } else {
        const remaining = Math.floor((escalationDate - now) / 1000);
        setTimeRemaining(remaining);

        const timer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              handleEscalation();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [disputeId, createdAt, status]);

  const handleEscalation = async () => {
    try {
      const disputeRef = doc(db, 'disputes', disputeId);
      const disputeDoc = await getDoc(disputeRef);
      
      if (disputeDoc.exists() && disputeDoc.data().status === 'open') {
        await updateDoc(disputeRef, {
          status: 'in_progress',
          escalatedAt: new Date().toISOString(),
          escalatedReason: 'Automatic escalation after 7 days'
        });
        
        setEscalated(true);
        toast.warning('Dispute has been escalated due to inactivity');
      }
    } catch (error) {
      console.error('Error escalating dispute:', error);
      toast.error('Failed to escalate dispute');
    }
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  if (status !== 'open' || escalated) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            This dispute will be automatically escalated in{' '}
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </p>
          <p className="mt-1 text-sm text-yellow-600">
            Please resolve the dispute before it is escalated to our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisputeEscalation; 