import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import DisputeCard from '../components/Disputes/DisputeCard';

const Disputes = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, [user]);

  const fetchDisputes = async () => {
    if (!user) return;

    try {
      // Fetch disputes where user is the creator
      const createdByQuery = query(
        collection(db, 'disputes'),
        where('createdBy', '==', user.uid)
      );
      // Fetch disputes where user is the other party
      const otherPartyQuery = query(
        collection(db, 'disputes'),
        where('otherPartyId', '==', user.uid)
      );

      const [createdSnap, otherSnap] = await Promise.all([
        getDocs(createdByQuery),
        getDocs(otherPartyQuery)
      ]);

      const seen = new Set();
      const all = [];
      [...createdSnap.docs, ...otherSnap.docs].forEach(doc => {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          all.push({ id: doc.id, ...doc.data() });
        }
      });

      all.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const tB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return tB - tA;
      });

      setDisputes(all);
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
          <Link
            to="/orders"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Raise Dispute from an Order
          </Link>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          To open a new dispute, go to the relevant order and use the dispute option there.
        </p>

        <div className="space-y-6">
          {disputes.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm">
              No disputes found
            </div>
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