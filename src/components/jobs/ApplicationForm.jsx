import React, { useState } from 'react';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const ApplicationForm = ({
  applicationFormData,
  handleApplicationFormChange,
  handleApplicationSubmit,
  setShowApplicationModal,
  selectedJob,
  userGigs
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const isJobClosed = selectedJob?.status === 'hired' || selectedJob?.status === 'in_progress';

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);

    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        return data.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploadedUrls]);
      handleApplicationFormChange({
        target: {
          name: 'portfolioLinks',
          value: [...uploadedFiles, ...uploadedUrls].join('\n')
        }
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      // Handle error (show toast notification)
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    handleApplicationFormChange({
      target: {
        name: 'portfolioLinks',
        value: newFiles.join('\n')
      }
    });
  };

  // Ensure portfolioLinks is always in sync on submit
  const onSubmit = (e) => {
    // Update portfolioLinks in form data before submit
    handleApplicationFormChange({
      target: {
        name: 'portfolioLinks',
        value: uploadedFiles.join('\n')
      }
    });
    handleApplicationSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-5xl h-[90vh] lg:h-auto lg:max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Apply for Job</h2>
          <button
            onClick={() => setShowApplicationModal(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {isJobClosed ? (
          <div className="p-8 text-center text-xl text-blue-700 font-semibold">
            This position has been filled. Applications are closed.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Job Title (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={selectedJob?.title}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    name="coverLetter"
                    value={applicationFormData.coverLetter}
                    onChange={handleApplicationFormChange}
                    required
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Write your cover letter here..."
                  />
                </div>

                {/* Relevant Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relevant Experience
                  </label>
                  <textarea
                    name="relevantExperience"
                    value={applicationFormData.relevantExperience}
                    onChange={handleApplicationFormChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe your relevant experience for this job..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio/Work Samples
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleFileUpload}
                            accept="image/*,.pdf,.doc,.docx"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF, DOC up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((url, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-600 truncate">{url}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isUploading && (
                    <div className="mt-2 text-sm text-gray-500">
                      Uploading files...
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Proposed Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedJob?.type === 'fixed' ? 'Proposed Budget' : 'Proposed Hourly Rate'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="proposedRate"
                      value={applicationFormData.proposedRate}
                      onChange={handleApplicationFormChange}
                      required
                      min="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={`Enter your ${selectedJob?.type === 'fixed' ? 'proposed budget' : 'proposed hourly rate'}`}
                    />
                  </div>
                </div>

                {/* Estimated Timeline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Timeline (in days)
                  </label>
                  <input
                    type="number"
                    name="estimatedTimeline"
                    value={applicationFormData.estimatedTimeline}
                    onChange={handleApplicationFormChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter estimated timeline in days"
                  />
                </div>

                {/* Number of Revisions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Revisions
                  </label>
                  <select
                    name="revisions"
                    value={applicationFormData.revisions}
                    onChange={handleApplicationFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="unlimited">Unlimited Revisions</option>
                    {[...Array(20)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Revision{i + 1 !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Back Support Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="backSupport"
                    checked={applicationFormData.backSupport}
                    onChange={handleApplicationFormChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    I will provide free back support for this project
                  </label>
                </div>

                {/* Reference Gig Selection */}
                {userGigs && userGigs.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Attach a Relevant Gig (Optional)
                      </label>
                      <span className="text-xs text-gray-500">Recommended</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Select one of your existing gigs to showcase your relevant experience
                    </p>
                    <select
                      name="referenceGig"
                      value={applicationFormData.referenceGig}
                      onChange={handleApplicationFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">-- Select a gig to attach --</option>
                      {userGigs.map(gig => (
                        <option key={gig.id} value={gig.id}>
                          {gig.title} - ${gig.price}
                        </option>
                      ))}
                    </select>
                    {applicationFormData.referenceGig && (
                      <div className="mt-2 text-xs text-gray-500">
                        This gig will be shown to the client as a reference for your work
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowApplicationModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplicationForm; 