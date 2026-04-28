import { useState } from 'react';
import { cleanupDuplicateOrders } from '../utils/cleanupOrders';
import toast from 'react-hot-toast';

const CleanupOrders = () => {
  const [cleaning, setCleaning] = useState(false);

  const handleCleanup = async () => {
    try {
      setCleaning(true);
      await cleanupDuplicateOrders();
      toast.success('Orders cleaned up successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast.error('Failed to clean up orders');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Clean Up Orders</h1>
          <p className="text-gray-600 mb-6">
            This will clean up duplicate orders and update their statuses. Only the most recent order for each job will be kept.
          </p>
          <button
            onClick={handleCleanup}
            disabled={cleaning}
            className={`px-4 py-2 rounded-md text-white ${
              cleaning ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {cleaning ? 'Cleaning up...' : 'Clean Up Orders'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleanupOrders; 