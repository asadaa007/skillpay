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
  DocumentTextIcon,
  ShieldCheckIcon,
  LinkIcon,
  PaperClipIcon
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
  const [referenceGigs, setReferenceGigs] = useState({});

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (applications.length > 0) {
      const fetchReferenceGigs = async () => {
        const gigIds = applications
          .map(app => app.referenceGig)
          .filter(id => id && !referenceGigs[id]);
        if (gigIds.length === 0) return;
        const gigsData = {};
        for (const gigId of gigIds) {
          try {
            const gigDoc = await getDoc(doc(db, 'gigs', gigId));
            if (gigDoc.exists()) {
              gigsData[gigId] = gigDoc.data();
            }
          } catch (e) { /* ignore */ }
        }
        setReferenceGigs(prev => ({ ...prev, ...gigsData }));
      };
      fetchReferenceGigs();
    }
    // eslint-disable-next-line
  }, [applications]);

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
      if (user && jobData.clientId === user.uid) {
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
        console.log('Fetched applications:', applicationsData);
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
    if (!user || !job) return;

    try {
      // Create the order
      const orderData = {
        jobId: job.id,
        jobTitle: job.title,
        jobDescription: job.description,
        buyerId: job.clientId,
        sellerId: application.freelancerId,
        amount: job.budget,
        status: 'in_progress',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        milestones: [],
        deliverables: job.deliverables || [],
        timeline: job.timeline || 'Not specified',
        requirements: job.requirements || []
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Update job status to hired
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'hired',
        hiredFreelancerId: application.freelancerId,
        orderId: orderRef.id,
        updatedAt: serverTimestamp()
      });

      // Create notification for the freelancer
      await addDoc(collection(db, 'notifications'), {
        userId: application.freelancerId,
        type: 'order_started',
        title: 'Job Application Accepted',
        message: `Your application for "${job.title}" has been accepted!`,
        orderId: orderRef.id,
        jobId: job.id,
        read: false,
        createdAt: serverTimestamp()
      });

      // Create notification for the client
      await addDoc(collection(db, 'notifications'), {
        userId: job.clientId,
        type: 'order_started',
        title: 'Order Created',
        message: `You have hired a freelancer for "${job.title}"`,
        orderId: orderRef.id,
        jobId: job.id,
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success('Application accepted and order created successfully');
      navigate(`/orders/${orderRef.id}`);
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
            {/* Redesigned Job Header */}
            <div className="bg-gradient-to-r from-green-100 via-white to-blue-100 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between p-6 mb-8 border border-gray-100">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                  <BriefcaseIcon className="h-7 w-7 text-primary" />
                  {job.title}
                </h1>
                <div className="flex items-center gap-3 mb-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 font-medium">{job.clientName}</span>
                  <span className="text-gray-400">•</span>
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">{formatDate(job.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    Budget: <span className="ml-1">${job.budget}</span>
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Deadline: <span className="ml-1">{job.deadline}</span>
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm ${
                    job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    {job.status || 'open'}
                  </span>
                </div>
              </div>
            </div>

            {/* Job Info Card */}
            <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5 text-primary" />
                  Job Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>
              {job.skills && (
                <div className="mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider before applications */}
            <div className="flex items-center my-10">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-gray-400 font-semibold uppercase tracking-wider text-xs">Applicants</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {isJobPoster && applications.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Applications</h2>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 bg-gray-50 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                      {/* Freelancer Photo */}
                      <div className="flex-shrink-0 flex flex-col items-center md:items-start w-32">
                        {application.freelancerPhoto ? (
                          <img
                            src={application.freelancerPhoto}
                            alt={application.freelancerName}
                            className="h-16 w-16 rounded-full object-cover border mb-2"
                            onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                            <span className="text-2xl text-gray-400">👤</span>
                          </div>
                        )}
                        <div className="text-center md:text-left">
                          <h3 className="font-medium text-gray-900">{application.freelancerName}</h3>
                          <p className="text-xs text-gray-500">Applied on {formatDate(application.createdAt)}</p>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:gap-8 mb-2">
                          <div>
                            <p className="text-sm text-gray-500">Proposed Budget</p>
                            <p className="font-medium">${application.proposedBudget || application.proposedRate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Proposed Deadline</p>
                            <p className="font-medium">{application.proposedDeadline || application.estimatedTimeline} days</p>
                          </div>
                          {/* Always show Relevant Experience, even if empty */}
                          <div className="mb-2">
                            <h4 className="font-medium text-gray-900 mb-1">Relevant Experience</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{application.relevantExperience || <span className="italic text-gray-400">No experience provided.</span>}</p>
                          </div>
                          {/* Portfolio/Work Samples section, show fallback if missing */}
                          <div className="mb-2">
                            <h4 className="font-medium text-gray-900 mb-1">Portfolio/Work Samples</h4>
                            {(() => { 
                              const linksRaw = application.portfolioLinks || '';
                              const links = linksRaw.split('\n').map(l => l.trim()).filter(Boolean);
                              console.log('Applicant', application.freelancerName, 'portfolioLinks:', links);
                              if (links.length === 0) {
                                return <span className="italic text-gray-400">No samples attached.</span>;
                              }
                              return (
                                <div className="flex flex-wrap gap-3">
                                  {links.map((link, idx) => {
                                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(link);
                                    if (isImage) {
                                      return (
                                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer">
                                          <img src={link} alt="Sample" className="h-16 w-16 object-cover rounded border" />
                                        </a>
                                      );
                                    }
                                    return (
                                      <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-700 hover:underline">
                                        <PaperClipIcon className="h-5 w-5" />
                                        {link.split('/').pop()}
                                      </a>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        {application.coverLetter && (
                          <div className="mb-2">
                            <h4 className="font-medium text-gray-900 mb-1">Cover Letter</h4>
                            <p className="text-gray-600 whitespace-pre-wrap">{application.coverLetter}</p>
                          </div>
                        )}
                        {/* Revisions and Back Support */}
                        <div className="flex flex-wrap gap-4 mt-2 mb-2">
                          {application.revisions && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-200 text-gray-700 font-medium text-xs">
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              {application.revisions === 'unlimited' ? 'Unlimited Revisions' : `${application.revisions} Revision${application.revisions !== 1 ? 's' : ''}`}
                            </span>
                          )}
                          {application.backSupport && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-xs">
                              <ShieldCheckIcon className="h-4 w-4 mr-1" />
                              Free Back Support
                            </span>
                          )}
                          {application.referenceGig && referenceGigs[application.referenceGig] && (
                            <button
                              type="button"
                              onClick={() => navigate(`/gigs/${application.referenceGig}/view`)}
                              className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-xs hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <BriefcaseIcon className="h-4 w-4 mr-1" />
                              Reference Gig: {referenceGigs[application.referenceGig].title} (${referenceGigs[application.referenceGig].price})
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status || 'pending'}
                          </span>
                          {/* Optionally, add a link to view freelancer profile if you have that route */}
                          {/* <Link to={`/profile/${application.freelancerId}`} className="ml-2 text-primary underline text-sm">View Profile</Link> */}
                        </div>
                        {application.status === 'pending' && (
                          <div className="flex space-x-4 mt-4">
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