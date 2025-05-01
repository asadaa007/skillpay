import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import DisputeCard from '../components/Disputes/DisputeCard';
import DisputeForm from '../components/Disputes/DisputeForm';

const Disputes = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDisputeForm, setShowNewDisputeForm] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [user]);

  const fetchDisputes = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'disputes'),
        where('createdBy', '==', user.uid),
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
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
          <button
            onClick={() => setShowNewDisputeForm(!showNewDisputeForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showNewDisputeForm ? 'Cancel' : 'Open New Dispute'}
          </button>
        </div>

        {showNewDisputeForm && (
          <div className="mb-8">
            <DisputeForm
              onSuccess={() => {
                setShowNewDisputeForm(false);
                fetchDisputes();
              }}
            />
          </div>
        )}

        <div className="space-y-6">
          {disputes.length === 0 ? (
            <p className="text-center text-gray-500">No disputes found</p>
          ) : (
            disputes.map(dispute => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Disputes; 