import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, increment, writeBatch, orderBy, limit, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import JobHeader from '../components/jobs/JobHeader';
import JobFilters from '../components/jobs/JobFilters';
import JobCard from '../components/jobs/JobCard';
import JobPostingForm from '../components/jobs/JobPostingForm';
import ApplicationForm from '../components/jobs/ApplicationForm';
import ApplicationsList from '../components/jobs/ApplicationsList';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [userCredits, setUserCredits] = useState({
    jobPostingCredits: 5,
    jobApplicationCredits: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    budget: '',
    hourlyRate: '',
    deadline: '',
    isUrgent: false,
    skills: '',
    category: '',
    type: 'fixed',
    experience: 'entry',
    country: 'US'
  });
  const [userGigs, setUserGigs] = useState([]);
  const [applicationFormData, setApplicationFormData] = useState({
    coverLetter: '',
    proposedRate: '',
    estimatedTimeline: '',
    relevantExperience: '',
    revisions: 'unlimited',
    backSupport: false,
    referenceGig: '',
    portfolioLinks: ''
  });

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design & Creative',
    'Writing & Translation',
    'Digital Marketing',
    'Video & Animation',
    'Music & Audio',
    'Programming & Tech',
    'Business',
    'Other'
  ];

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' }
  ];

  // Add this useEffect to fetch user credits
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Get today's date at midnight
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Get the last reset date
            const lastResetDate = userData.lastCreditReset?.toDate?.() || new Date(0);
            
            // If it's a new day, reset credits
            if (lastResetDate < today) {
              // Update user document with reset credits
              await updateDoc(doc(db, 'users', user.uid), {
                jobPostsRemaining: 5,
                jobApplicationsRemaining: 10,
                lastCreditReset: serverTimestamp()
              });
              
              setUserCredits({
                jobPostingCredits: 5,
                jobApplicationCredits: 10
              });
            } else {
              // Use existing credits
              const jobPostsRemaining = Math.max(0, userData.jobPostsRemaining ?? 5);
              const jobApplicationsRemaining = Math.max(0, userData.jobApplicationsRemaining ?? 10);
              
              setUserCredits({
                jobPostingCredits: jobPostsRemaining,
                jobApplicationCredits: jobApplicationsRemaining
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user credits:', error);
        }
      }
    };

    fetchUserCredits();
  }, [user]);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));

        if (selectedCategory) {
          jobsQuery = query(jobsQuery, where('category', '==', selectedCategory));
        }

        if (selectedType) {
          jobsQuery = query(jobsQuery, where('type', '==', selectedType));
        }

        if (selectedExperience) {
          jobsQuery = query(jobsQuery, where('experience', '==', selectedExperience));
        }

        const querySnapshot = await getDocs(jobsQuery);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter by search term if provided
        const filteredJobs = searchTerm
          ? jobsData.filter(job =>
              job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              job.skills.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : jobsData;

        setJobs(filteredJobs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchTerm, selectedCategory, selectedType, selectedExperience]);

  // Check for expired jobs
  useEffect(() => {
    const checkExpiredJobs = async () => {
      try {
        const now = new Date();
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('status', '==', 'open')
        );
        
        const querySnapshot = await getDocs(jobsQuery);
        const batch = writeBatch(db);
        
        querySnapshot.forEach((doc) => {
          const jobData = doc.data();
          const deadline = jobData.deadline;
          
          // Handle both Firestore Timestamp and regular Date objects
          const deadlineDate = deadline instanceof Date 
            ? deadline 
            : deadline?.toDate?.() || null;
          
          if (deadlineDate && deadlineDate < now) {
            batch.update(doc.ref, { status: 'expired' });
          }
        });
        
        await batch.commit();
      } catch (error) {
        console.error('Error checking expired jobs:', error);
      }
    };

    // Check expired jobs every hour
    const interval = setInterval(checkExpiredJobs, 3600000);
    checkExpiredJobs(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // Add this new useEffect to fetch user's gigs
  useEffect(() => {
    const fetchUserGigs = async () => {
      if (user) {
        try {
          const gigsQuery = query(
            collection(db, 'gigs'),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(gigsQuery);
          const gigsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserGigs(gigsData);
        } catch (error) {
          console.error('Error fetching user gigs:', error);
        }
      }
    };

    fetchUserGigs();
  }, [user]);

  const handleJobFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleJobPost = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to post a job');
      return;
    }

    if (userCredits.jobPostingCredits < 1) {
      toast.error('You have no remaining job posting credits for today');
      return;
    }

    try {
      const batch = writeBatch(db);
      
      // Create job document
      const jobRef = doc(collection(db, 'jobs'));
      batch.set(jobRef, {
        ...jobFormData,
        clientId: user.uid,
        status: 'open',
        createdAt: serverTimestamp(),
        applications: []
      });

      // Update user's job posting credits
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        jobPostsRemaining: increment(-1)
      });

      await batch.commit();
      
      // Update local state
      setUserCredits(prev => ({
        ...prev,
        jobPostingCredits: prev.jobPostingCredits - 1
      }));
      
      setShowJobPostingModal(false);
      setJobFormData({
        title: '',
        description: '',
        budget: '',
        hourlyRate: '',
        deadline: '',
        isUrgent: false,
        skills: '',
        category: '',
        type: 'fixed',
        experience: 'entry',
        country: 'US'
      });
      
      toast.success('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
    }
  };

  const handleApplicationFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApplicationFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to apply for jobs');
      return;
    }

    try {
      const applicationData = {
        jobId: selectedJob.id,
        freelancerId: user.uid,
        freelancerName: user.displayName || 'Anonymous',
        freelancerPhoto: user.photoURL || '',
        coverLetter: applicationFormData.coverLetter,
        proposedRate: Number(applicationFormData.proposedRate),
        estimatedTimeline: Number(applicationFormData.estimatedTimeline),
        relevantExperience: applicationFormData.relevantExperience,
        portfolioLinks: applicationFormData.portfolioLinks,
        revisions: applicationFormData.revisions,
        backSupport: applicationFormData.backSupport,
        referenceGig: applicationFormData.referenceGig,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      // Add application to applications collection
      await addDoc(collection(db, 'applications'), applicationData);

      // Update job's applications array
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        applications: [...selectedJob.applications, user.uid]
      });

      // Reset form and close modal
      setApplicationFormData({
        coverLetter: '',
        proposedRate: '',
        estimatedTimeline: '',
        relevantExperience: '',
        revisions: 'unlimited',
        backSupport: false,
        referenceGig: '',
        portfolioLinks: ''
      });
      setShowApplicationModal(false);

      toast.success('Application submitted successfully');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const handleHireFreelancer = async (application) => {
    try {
      // Update application status
      const applicationRef = doc(db, 'applications', application.id);
      await updateDoc(applicationRef, {
        status: 'hired'
      });

      // Update job status
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        status: 'hired',
        hiredFreelancerId: application.freelancerId,
        hiredFreelancerName: application.freelancerName
      });

      // Update jobs state
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === selectedJob.id
            ? {
                ...job,
                status: 'hired',
                hiredFreelancerId: application.freelancerId,
                hiredFreelancerName: application.freelancerName
              }
            : job
        )
      );

      setShowApplicationsModal(false);
      toast.success('Freelancer hired successfully');
    } catch (error) {
      console.error('Error hiring freelancer:', error);
      toast.error('Failed to hire freelancer. Please try again.');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      // Update application status
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: 'rejected'
      });

      // Update applications state
      setApplications(prevApplications =>
        prevApplications.filter(app => app.id !== applicationId)
      );

      toast.success('Application rejected');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        // Update job status to deleted
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, {
          status: 'deleted'
        });

        // Update jobs state
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        toast.success('Job deleted successfully');
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job. Please try again.');
      }
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', '==', job.id)
      );
      const querySnapshot = await getDocs(applicationsQuery);
      const applicationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);
      setShowApplicationsModal(true);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications. Please try again.');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedExperience('');
  };

  // Calculate job stats
  const totalJobs = jobs.length;
  const openJobs = jobs.filter(job => job.status === 'open').length;
  const hiredJobs = jobs.filter(job => job.status === 'hired').length;

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <JobHeader
        user={user}
        userCredits={userCredits}
        setShowJobPostingModal={setShowJobPostingModal}
        totalJobs={totalJobs}
        openJobs={openJobs}
        hiredJobs={hiredJobs}
        jobPostingCredits={userCredits.jobPostingCredits}
        jobApplicationCredits={userCredits.jobApplicationCredits}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <JobFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
            categories={categories}
            onReset={handleResetFilters}
          />
        </div>

        {/* Job Listings */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No jobs found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  user={user}
                  countries={countries}
                  onApply={() => {
                    setSelectedJob(job);
                    setShowApplicationModal(true);
                  }}
                  onDelete={handleDeleteJob}
                  onEdit={() => handleViewApplications(job)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Posting Modal */}
      {showJobPostingModal && (
        <JobPostingForm
          jobFormData={jobFormData}
          handleJobFormChange={handleJobFormChange}
          handleJobPost={handleJobPost}
          setShowJobPostingModal={setShowJobPostingModal}
          categories={categories}
          countries={countries}
          jobPostingCredits={userCredits.jobPostingCredits}
          jobApplicationCredits={userCredits.jobApplicationCredits}
        />
      )}

      {/* Application Modal */}
      {showApplicationModal && (
        <ApplicationForm
          applicationFormData={applicationFormData}
          handleApplicationFormChange={handleApplicationFormChange}
          handleApplicationSubmit={handleApplicationSubmit}
          setShowApplicationModal={setShowApplicationModal}
          selectedJob={selectedJob}
          userGigs={userGigs}
        />
      )}

      {/* Applications List Modal */}
      {showApplicationsModal && (
        <ApplicationsList
          applications={applications}
          selectedJob={selectedJob}
          setShowApplicationsModal={setShowApplicationsModal}
          handleHireFreelancer={handleHireFreelancer}
          handleRejectApplication={handleRejectApplication}
        />
      )}
    </div>
  );
};

export default Jobs; 