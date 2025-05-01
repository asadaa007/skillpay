import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import DisputeMessages from './DisputeMessages';

const DisputeCard = ({ dispute }) => {
  const [showMessages, setShowMessages] = useState(false);

  const getStatusIcon = () => {
    switch (dispute.status) {
      case 'open':
        return <FiAlertCircle className="text-red-500" />;
      case 'in_progress':
        return <FiClock className="text-yellow-500" />;
      case 'resolved':
        return <FiCheckCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (dispute.status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-gray-900">{dispute.projectTitle}</h3>
          <p className="text-sm text-gray-500">
            Opened on {format(new Date(dispute.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
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

      {dispute.resolution && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700">Resolution:</p>
          <p className="text-gray-600">{dispute.resolution}</p>
        </div>
      )}

      {showMessages && (
        <div className="mt-4">
          <DisputeMessages disputeId={dispute.id} />
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowMessages(!showMessages)}
          className="text-blue-600 hover:text-blue-800"
        >
          {showMessages ? 'Hide Messages' : 'Show Messages'}
        </button>
      </div>
    </div>
  );
};

export default DisputeCard; 