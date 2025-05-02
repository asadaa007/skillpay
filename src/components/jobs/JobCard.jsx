import React from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const JobCard = ({ job, user, countries, onApply, onDelete, onEdit }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';

    try {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Section - Job Details */}
          <div className="flex-1 space-y-4 border-r border-gray-200 pr-6">
            {/* Title and Status */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-left text-gray-900">{job.title}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span className="flex items-center font-bold">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {job.clientName || 'Anonymous'}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    {countries.find(c => c.code === job.country)?.flag || '🌍'} {countries.find(c => c.code === job.country)?.name || 'Remote'}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                job.status === 'open' ? 'bg-green-100 text-green-800' :
                job.status === 'hired' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {job.status || 'open'}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-left">{job.description}</p>

            {/* Job Details Grid */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-lg mt-4">
              <div className="flex items-center space-x-2">
                <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 font-medium">{job.experience || 'Entry'} Level</span>
              </div>

              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                {job.type === 'hourly' ? (
                  <span className="text-gray-700 font-medium">${job.hourlyRate || '0'}/hour</span>
                ) : (
                  <span className="text-gray-700 font-medium">${job.budget || '0'} fixed</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Posted <span className="text-green-700">{formatDate(job.createdAt)}</span></span>
              </div>

              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Deadline: <span className="text-red-700">{formatDate(job.deadline)}</span></span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 text-left">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills?.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Action Button */}
          <div className="lg:w-48 flex-shrink-0">
            {user ? (
              job.clientId === user.uid ? (
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                  >
                    Your Posted Job
                  </button>
                  <Link
                    to={`/jobs/${job.id}/edit`}
                    className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-center transition-colors block"
                  >
                    Edit Job
                  </Link>
                  <button
                    onClick={() => onDelete(job.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-center transition-colors block"
                  >
                    Delete Job
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onApply(job.id)}
                  disabled={job.applications?.includes(user.uid)}
                  className={`w-full px-4 py-2 rounded-md transition-colors ${
                    job.applications?.includes(user.uid)
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {job.applications?.includes(user.uid) ? 'Applied' : 'Apply Now'}
                </button>
              )
            ) : (
              <Link 
                to="/login" 
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-center transition-colors block"
              >
                Login to Apply
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard; 