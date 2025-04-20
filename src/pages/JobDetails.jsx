import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [isJobPoster, setIsJobPoster] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      
      if (!jobDoc.exists()) {
        toast.error('Job not found');
        navigate('/jobs');
        return;
      }

      const jobData = {
        id: jobDoc.id,
        ...jobDoc.data()
      };
      setJob(jobData);

      // Check if current user is the job poster
      if (user && jobData.userId === user.uid) {
        setIsJobPoster(true);
        // Fetch all applications for this job
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('jobId', '==', jobId)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(applicationsData);
      } else if (user) {
        // If user is logged in, check if they've applied
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('jobId', '==', jobId),
          where('freelancerId', '==', user.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        setHasApplied(!applicationsSnapshot.empty);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (application) => {
    try {
      // Create a new order
      const orderData = {
        jobId: jobId,
        jobTitle: job.title,
        clientId: job.userId,
        freelancerId: application.freelancerId,
        freelancerName: application.freelancerName,
        clientName: job.clientName,
        budget: application.proposedBudget,
        deadline: application.proposedDeadline,
        status: 'active',
        createdAt: serverTimestamp(),
        startDate: serverTimestamp(),
        description: job.description,
        skills: job.skills,
        applicationId: application.id
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Update job status
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'in_progress',
        acceptedApplicationId: application.id,
        orderId: orderRef.id
      });

      // Update application status
      await updateDoc(doc(db, 'applications', application.id), {
        status: 'accepted',
        orderId: orderRef.id
      });

      toast.success('Application accepted and order created successfully');
      navigate('/orders');
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Failed to accept application');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: 'rejected'
      });
      toast.success('Application rejected successfully');
      fetchJobDetails(); // Refresh the applications list
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
    try {
      const date = timestamp.toDate();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="w-full py-16">
      <div className="container-custom">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <p className="text-sm text-gray-500 mb-4">Posted by {job.clientName} on {formatDate(job.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {job.status || 'open'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900 font-medium">${job.budget}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">Deadline: {job.deadline}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.skills && (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isJobPoster && applications.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Applications</h2>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{application.freelancerName}</h3>
                          <p className="text-sm text-gray-500">Applied on {formatDate(application.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status || 'pending'}
                        </span>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Proposal</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{application.proposal}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Proposed Budget</p>
                          <p className="font-medium">${application.proposedBudget}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Proposed Deadline</p>
                          <p className="font-medium">{application.proposedDeadline}</p>
                        </div>
                      </div>
                      {application.status === 'pending' && (
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleAcceptApplication(application)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectApplication(application.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Jobs
              </button>
              {user && !isJobPoster ? (
                hasApplied ? (
                  <span className="text-sm text-gray-500">You have already applied to this job</span>
                ) : (
                  <button
                    onClick={() => navigate(`/jobs/${jobId}/apply`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                  >
                    Apply Now
                  </button>
                )
              ) : !user ? (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                >
                  Login to Apply
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails; 