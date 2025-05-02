import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const JobPostingForm = ({
  jobFormData,
  handleJobFormChange,
  handleJobPost,
  setShowJobPostingModal,
  categories,
  countries,
  jobPostingCredits,
  jobApplicationCredits
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
          <button
            onClick={() => setShowJobPostingModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Credits Info */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Remaining Job Posting Credits: <span className="font-medium">{jobPostingCredits}</span>
          </p>
          <p className="text-sm text-gray-600">
            Remaining Application Credits: <span className="font-medium">{jobApplicationCredits}</span>
          </p>
        </div>

        <form onSubmit={handleJobPost} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={jobFormData.title}
              onChange={handleJobFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter job title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={jobFormData.description}
              onChange={handleJobFormChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter job description"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              name="type"
              value={jobFormData.type}
              onChange={handleJobFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>

          {/* Budget or Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {jobFormData.type === 'fixed' ? 'Budget' : 'Hourly Rate'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name={jobFormData.type === 'fixed' ? 'budget' : 'hourlyRate'}
                value={jobFormData.type === 'fixed' ? jobFormData.budget : jobFormData.hourlyRate}
                onChange={handleJobFormChange}
                required
                min="0"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={jobFormData.type === 'fixed' ? 'Enter budget' : 'Enter hourly rate'}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={jobFormData.category}
              onChange={handleJobFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              name="experience"
              value={jobFormData.experience}
              onChange={handleJobFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              value={jobFormData.skills}
              onChange={handleJobFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              name="country"
              value={jobFormData.country}
              onChange={handleJobFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={jobFormData.deadline}
              onChange={handleJobFormChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Urgent Job Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isUrgent"
              checked={jobFormData.isUrgent}
              onChange={handleJobFormChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Mark as Urgent (24-hour deadline)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowJobPostingModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={jobPostingCredits < 1}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                jobPostingCredits < 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm; 