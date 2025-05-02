import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const JobHeader = ({ 
  user, 
  userCredits, 
  setShowJobPostingModal, 
  totalJobs, 
  openJobs, 
  hiredJobs 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Section - Stats */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Job</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Jobs</h3>
              <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">Open Jobs</h3>
              <p className="text-2xl font-bold text-green-700">{openJobs}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">Hired Jobs</h3>
              <p className="text-2xl font-bold text-blue-700">{hiredJobs}</p>
            </div>
          </div>
        </div>

        {/* Right Section - Post Job Button */}
        <div className="lg:w-48 flex-shrink-0">
          {user ? (
            <button
              onClick={() => setShowJobPostingModal(true)}
              disabled={userCredits < 1}
              className={`w-full px-4 py-2 rounded-md text-white transition-colors flex items-center justify-center space-x-2 ${
                userCredits < 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Post a Job</span>
            </button>
          ) : (
            <button
              onClick={() => setShowJobPostingModal(true)}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Post a Job</span>
            </button>
          )}
          {user && userCredits < 1 && (
            <p className="text-sm text-red-600 mt-2 text-center">
              You need at least 1 credit to post a job
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobHeader; 