import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const JobHeader = ({ 
  user, 
  userCredits, 
  setShowJobPostingModal, 
  totalJobs, 
  openJobs, 
  hiredJobs,
  jobPostingCredits,
  jobApplicationCredits
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

        {/* Right Section - Post Job Button and Credits */}
        <div className="lg:w-64 flex-shrink-0 space-y-4">
          <button
            onClick={() => setShowJobPostingModal(true)}
            disabled={!user || jobPostingCredits < 1}
            className={`w-full px-4 py-2 rounded-md text-white transition-colors flex items-center justify-center space-x-2 ${
              !user || jobPostingCredits < 1
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            <PlusIcon className="h-5 w-5" />
            <span>{!user ? 'Login to Post a Job' : 'Post a Job'}</span>
          </button>
          
          {/* Credits Information */}
          <div className={`bg-gray-50 p-3 rounded-lg space-y-2 ${!user ? 'opacity-50 blur-[1px]' : ''}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Job Posting Credits</span>
              <span className="text-sm font-medium text-gray-900">{jobPostingCredits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Application Credits</span>
              <span className="text-sm font-medium text-gray-900">{jobApplicationCredits}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Credits reset daily at midnight
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobHeader; 