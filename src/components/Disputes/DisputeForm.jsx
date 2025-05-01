import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import DisputeEvidence from './DisputeEvidence';
import DisputeEscalation from './DisputeEscalation';

const DisputeForm = ({ orderId, otherPartyId, projectTitle, onSuccess }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [disputeId, setDisputeId] = useState(null);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  const disputeReasons = [
    'Payment Issue',
    'Work Quality',
    'Communication Problem',
    'Deadline Not Met',
    'Terms Violation',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const disputeRef = await addDoc(collection(db, 'disputes'), {
        orderId,
        projectTitle,
        reason,
        description,
        status: 'open',
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        otherPartyId,
        messages: [],
        resolution: null,
        evidence: [],
        escalatedAt: null,
        escalatedReason: null
      });

      setDisputeId(disputeRef.id);
      setShowEvidenceForm(true);
      toast.success('Dispute submitted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting dispute:', error);
      toast.error('Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Open a Dispute</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Dispute
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a reason</option>
            {disputeReasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue in detail..."
            className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Dispute'}
        </button>
      </form>

      {disputeId && (
        <>
          <DisputeEscalation
            disputeId={disputeId}
            createdAt={new Date().toISOString()}
            status="open"
          />
          
          {showEvidenceForm && (
            <DisputeEvidence disputeId={disputeId} />
          )}
        </>
      )}
    </div>
  );
};

export default DisputeForm; 