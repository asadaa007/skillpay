import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ApplicationsList = ({
  applications,
  selectedJob,
  setShowApplicationsModal,
  handleHireFreelancer,
  handleRejectApplication
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Applications for {selectedJob?.title}
          </h2>
          <button
            onClick={() => setShowApplicationsModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {applications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No applications yet</p>
          ) : (
            applications.map((application) => (
              <div
                key={application.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Left Section - Application Details */}
                  <div className="flex-1 space-y-4">
                    {/* Freelancer Info */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={application.freelancerPhoto || '/default-avatar.png'}
                        alt={application.freelancerName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.freelancerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Applied {new Date(application.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter</h4>
                      <p className="text-gray-600">{application.coverLetter}</p>
                    </div>

                    {/* Proposed Rate and Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Proposed {selectedJob?.type === 'fixed' ? 'Budget' : 'Rate'}</h4>
                        <p className="text-gray-900 font-medium">${application.proposedRate}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Estimated Timeline</h4>
                        <p className="text-gray-900 font-medium">{application.estimatedTimeline} days</p>
                      </div>
                    </div>

                    {/* Relevant Experience */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Relevant Experience</h4>
                      <p className="text-gray-600">{application.relevantExperience}</p>
                    </div>

                    {/* Portfolio Links */}
                    {application.portfolioLinks && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Portfolio/Work Samples</h4>
                        <div className="space-y-1">
                          {application.portfolioLinks.split('\n').map((link, index) => (
                            <a
                              key={index}
                              href={link.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline block"
                            >
                              {link.trim()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Action Buttons */}
                  <div className="lg:w-48 flex-shrink-0 space-y-3">
                    <button
                      onClick={() => handleHireFreelancer(application)}
                      className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Hire
                    </button>
                    <button
                      onClick={() => handleRejectApplication(application.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsList; 