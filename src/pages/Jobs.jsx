import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit, updateDoc, doc, increment, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  BriefcaseIcon,
  PlusIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  PencilIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import Chat from '../components/Chat';
import Project from '../components/Project';
import { Link } from 'react-router-dom';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [dailyJobCount, setDailyJobCount] = useState(0);
  const [dailyApplicationCount, setDailyApplicationCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    proposedBudget: '',
    estimatedTime: '',
    relevantExperience: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    budget: 'all',
    category: 'all',
    search: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    skills: '',
    category: ''
  });

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchUserCredits();
      fetchDailyJobCount();
      fetchDailyApplicationCount();
      initializeUserCredits();
      checkAndResetLimits();
    }
  }, [user]);

  useEffect(() => {
    // Apply filters locally
    let filtered = [...jobs];
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(job => job.category === filters.category);
    }
    if (filters.budget !== 'all') {
      const [min, max] = filters.budget.split('-');
      filtered = filtered.filter(job => {
        const budget = parseInt(job.budget);
        return budget >= parseInt(min) && budget <= parseInt(max);
      });
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm) ||
        job.description?.toLowerCase().includes(searchTerm) ||
        job.skills?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredJobs(filtered);
  }, [filters, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Start with a basic query ordered by createdAt
      let jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(jobsQuery);
      
      let jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(`Failed to fetch jobs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    if (!user) return;
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      if (!userDoc.empty) {
        setUserCredits(userDoc.docs[0].data().credits || 0);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const fetchDailyJobCount = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setDailyJobCount(userDoc.data().dailyJobCount || 0);
      }
    } catch (error) {
      console.error('Error fetching daily job count:', error);
    }
  };

  const fetchDailyApplicationCount = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setDailyApplicationCount(userDoc.data().dailyApplicationCount || 0);
      }
    } catch (error) {
      console.error('Error fetching daily application count:', error);
    }
  };

  const initializeUserCredits = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Initialize user with 10 credits
        await setDoc(userRef, {
          uid: user.uid,
          credits: 10,
          lastCreditReset: new Date(),
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });
        setUserCredits(10);
      } else {
        // Check if credits need to be reset (once per day)
        const userData = userDoc.data();
        const lastReset = userData.lastCreditReset?.toDate() || new Date(0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (lastReset < today) {
          // Reset credits to 10
          await updateDoc(userRef, {
            credits: 10,
            lastCreditReset: new Date()
          });
          setUserCredits(10);
        } else {
          setUserCredits(userData.credits || 0);
        }
      }
    } catch (error) {
      console.error('Error initializing user credits:', error);
      toast.error('Failed to initialize credits');
    }
  };

  const checkAndResetLimits = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get the global reset time from Firestore
      const resetTimeRef = doc(db, 'system', 'limits');
      const resetTimeDoc = await getDoc(resetTimeRef);
      
      let lastReset = null;
      if (resetTimeDoc.exists()) {
        lastReset = resetTimeDoc.data().lastReset?.toDate();
      }

      // If no last reset time or it's before today's midnight, reset the limits
      if (!lastReset || lastReset < today) {
        // Update the global reset time
        await setDoc(resetTimeRef, {
          lastReset: serverTimestamp()
        }, { merge: true });

        // Reset local counts
        setDailyJobCount(0);
        setDailyApplicationCount(0);
        
        // Update user's counts in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          dailyJobCount: 0,
          dailyApplicationCount: 0
        });
      }
    } catch (error) {
      console.error('Error checking/resetting limits:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post a job');
      return;
    }

    await checkAndResetLimits();

    if (dailyJobCount >= 5) {
      toast.error('You have reached the daily limit of 5 job posts');
      return;
    }

    try {
      const jobData = {
        ...formData,
        clientId: user.uid,
        clientName: user.displayName,
        status: 'open',
        createdAt: serverTimestamp(),
        applications: [],
        hiredFreelancer: null
      };

      await addDoc(collection(db, 'jobs'), jobData);
      toast.success('Job posted successfully');
      setShowPostModal(false);
      setFormData({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        skills: '',
        category: ''
      });
      fetchJobs();
      fetchDailyJobCount();
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
    }
  };

  const handleApply = async (jobId) => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      return;
    }

    await checkAndResetLimits();

    if (dailyApplicationCount >= 10) {
      toast.error('You have reached the daily limit of 10 job applications');
      return;
    }

    if (userCredits <= 0) {
      toast.error('You have no credits remaining. Credits reset daily at midnight.');
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    if (job.clientId === user.uid) {
      toast.error('You cannot apply to your own job');
      return;
    }

    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const submitApplication = async () => {
    if (!selectedJob || !user) return;

    try {
      const applicationData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        freelancerId: user.uid,
        freelancerName: user.displayName,
        coverLetter: applicationForm.coverLetter,
        proposedBudget: applicationForm.proposedBudget,
        estimatedTime: applicationForm.estimatedTime,
        relevantExperience: applicationForm.relevantExperience,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'applications'), applicationData);
      
      // Update job's applications array
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        applications: arrayUnion(user.uid)
      });

      // Deduct one credit from user
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: increment(-1)
      });

      setUserCredits(prev => prev - 1);
      setDailyApplicationCount(prev => prev + 1);
      
      toast.success('Application submitted successfully');
      setShowApplicationModal(false);
      setApplicationForm({
        coverLetter: '',
        proposedBudget: '',
        estimatedTime: '',
        relevantExperience: ''
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    }
  };

  const viewApplications = async (jobId) => {
    setSelectedJob(jobId);
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', '==', jobId)
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
      toast.error('Failed to fetch applications');
    }
  };

  const hireFreelancer = async (applicationId, freelancerId) => {
    try {
      const jobRef = doc(db, 'jobs', selectedJob);
      const applicationRef = doc(db, 'applications', applicationId);

      // Update job status
      await updateDoc(jobRef, {
        status: 'hired',
        hiredFreelancer: freelancerId
      });

      // Update application status
      await updateDoc(applicationRef, {
        status: 'accepted'
      });

      // Create notification for hired freelancer
      await addDoc(collection(db, 'notifications'), {
        userId: freelancerId,
        type: 'application_accepted',
        title: 'Application Accepted',
        message: 'Your application has been accepted! You can now start working on the job.',
        read: false,
        createdAt: serverTimestamp(),
        jobId: selectedJob
      });

      toast.success('Freelancer hired successfully');
      setShowApplicationsModal(false);
      fetchJobs();
    } catch (error) {
      console.error('Error hiring freelancer:', error);
      toast.error('Failed to hire freelancer');
    }
  };

  const handleChat = (job, applicant) => {
    setSelectedJob(job);
    setSelectedApplicant(applicant);
    setShowChat(true);
  };

  const handleHire = (job, applicant) => {
    setSelectedJob(job);
    setSelectedApplicant(applicant);
    setShowProject(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedJob(null);
    setSelectedApplicant(null);
  };

  const handleCloseProject = () => {
    setShowProject(false);
    setSelectedJob(null);
    setSelectedApplicant(null);
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-16">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
          <div className="flex space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{5 - dailyJobCount}</span> job posts remaining today
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{10 - dailyApplicationCount}</span> applications remaining today
                </div>
                <button
                  onClick={() => setShowPostModal(true)}
                  disabled={dailyJobCount >= 5}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    dailyJobCount >= 5
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Post a Job
                </button>
              </div>
            ) : null}
            <button
              onClick={fetchJobs}
              className="btn-secondary flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Refresh Jobs
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full px-4 py-2 border rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <select
              className="px-4 pr-10 py-2 border rounded-lg"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg"
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
            >
              <option value="all">All Budgets</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500-1000">$500 - $1000</option>
              <option value="1000-999999">$1000+</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status || 'open'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">Posted by {job.clientName || 'Anonymous'}</p>
                <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-primary font-semibold">${job.budget || '0'}</span>
                  <span className="text-sm text-gray-500">{formatDate(job.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills?.split(',').map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
                {user ? (
                  job.clientId === user.uid ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                    >
                      Your Posted Job
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="w-full btn-primary"
                    >
                      Apply Now
                    </button>
                  )
                ) : (
                  <Link to="/login" className="w-full btn-primary text-center">
                    Apply Now
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPostModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Post a Job</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="design">Design</option>
                    <option value="writing">Writing</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Submit Application</h2>
            <form onSubmit={(e) => { e.preventDefault(); submitApplication(); }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                    Cover Letter
                  </label>
                  <textarea
                    id="coverLetter"
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                    placeholder="Explain why you're the best fit for this job..."
                  />
                </div>
                <div>
                  <label htmlFor="proposedBudget" className="block text-sm font-medium text-gray-700">
                    Proposed Budget ($)
                  </label>
                  <input
                    type="number"
                    id="proposedBudget"
                    value={applicationForm.proposedBudget}
                    onChange={(e) => setApplicationForm({ ...applicationForm, proposedBudget: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
                    Estimated Time (in days)
                  </label>
                  <input
                    type="number"
                    id="estimatedTime"
                    value={applicationForm.estimatedTime}
                    onChange={(e) => setApplicationForm({ ...applicationForm, estimatedTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="relevantExperience" className="block text-sm font-medium text-gray-700">
                    Relevant Experience
                  </label>
                  <textarea
                    id="relevantExperience"
                    value={applicationForm.relevantExperience}
                    onChange={(e) => setApplicationForm({ ...applicationForm, relevantExperience: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                    placeholder="Describe your relevant experience..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationsModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Applications</h2>
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={application.freelancerPhoto || '/default-avatar.png'}
                        alt={application.freelancerName}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-medium">{application.freelancerName}</h3>
                        <p className="text-sm text-gray-500">
                          Applied {application.createdAt?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => hireFreelancer(application.id, application.freelancerId)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Hire
                      </button>
                      <button
                        onClick={() => handleChat(selectedJob, application)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                        Chat
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Cover Letter</h4>
                      <p className="mt-1 text-sm text-gray-600">{application.coverLetter}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Proposed Budget</h4>
                        <p className="mt-1 text-sm text-gray-600">${application.proposedBudget}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Estimated Time</h4>
                        <p className="mt-1 text-sm text-gray-600">{application.estimatedTime} days</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Relevant Experience</h4>
                      <p className="mt-1 text-sm text-gray-600">{application.relevantExperience}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowApplicationsModal(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showChat && selectedJob && selectedApplicant && (
        <Chat
          job={selectedJob}
          applicant={selectedApplicant}
          onClose={handleCloseChat}
        />
      )}

      {showProject && selectedJob && selectedApplicant && (
        <Project
          job={selectedJob}
          freelancer={selectedApplicant}
          onClose={handleCloseProject}
        />
      )}
    </div>
  );
};

export default Jobs; 