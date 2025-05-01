import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { FiAlertCircle, FiCheckCircle, FiClock, FiFileText, FiDollarSign } from 'react-icons/fi';

const DisputeModeration = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [showResolutionForm, setShowResolutionForm] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const q = query(
        collection(db, 'disputes'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const disputesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDisputes(disputesList);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId, action) => {
    try {
      const disputeRef = doc(db, 'disputes', disputeId);
      const updates = {
        status: action === 'approve' ? 'resolved' : 'rejected',
        resolvedAt: new Date().toISOString(),
        resolution: resolution,
        refundAmount: action === 'approve' ? refundAmount : 0
      };

      await updateDoc(disputeRef, updates);

      // If approved, update the order status and process refund
      if (action === 'approve') {
        const dispute = disputes.find(d => d.id === disputeId);
        if (dispute?.orderId) {
          const orderRef = doc(db, 'orders', dispute.orderId);
          await updateDoc(orderRef, {
            status: 'cancelled',
            refundAmount: refundAmount,
            cancellationReason: 'Dispute resolved'
          });
        }
      }

      toast.success(`Dispute ${action === 'approve' ? 'resolved' : 'rejected'}`);
      setShowResolutionForm(false);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <FiAlertCircle className="text-red-500" />;
      case 'in_progress':
        return <FiClock className="text-yellow-500" />;
      case 'resolved':
        return <FiCheckCircle className="text-green-500" />;
      default:
        return <FiFileText className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dispute Moderation</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowResolutionForm(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Back to List
            </button>
          </div>
        </div>

        {showResolutionForm && selectedDispute ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Resolve Dispute</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Dispute Details</h3>
              <p className="text-gray-600">{selectedDispute.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Enter resolution details..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleResolveDispute(selectedDispute.id, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => handleResolveDispute(selectedDispute.id, 'approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {disputes.length === 0 ? (
              <p className="text-center text-gray-500">No disputes found</p>
            ) : (
              disputes.map(dispute => (
                <div key={dispute.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{dispute.projectTitle}</h3>
                      <p className="text-sm text-gray-500">
                        Opened on {format(new Date(dispute.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
                      {getStatusIcon(dispute.status)}
                      <span className="ml-2 capitalize">{dispute.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Reason:</p>
                    <p className="text-gray-600">{dispute.reason}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Description:</p>
                    <p className="text-gray-600">{dispute.description}</p>
                  </div>

                  {dispute.status === 'open' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setShowResolutionForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Resolve Dispute
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeModeration; 