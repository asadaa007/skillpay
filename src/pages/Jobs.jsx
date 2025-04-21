import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit, updateDoc, doc, increment, arrayUnion, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase.jsx';
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
  ChatBubbleLeftIcon,
  CalendarIcon
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
    relevantExperience: '',
    attachment: null
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
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    budget: '',
    hourlyRate: '',
    deadline: '',
    skills: '',
    category: '',
    type: 'fixed',
    experience: 'entry',
    country: 'US'
  });
  const [remainingJobPosts, setRemainingJobPosts] = useState(5);

  // List of countries with their flags
  const countries = [
    { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
    { code: 'AL', name: 'Albania', flag: '🇦🇱' },
    { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
    { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
    { code: 'AO', name: 'Angola', flag: '🇦🇴' },
    { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
    { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
    { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
    { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
    { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
    { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
    { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
    { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
    { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
    { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
    { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
    { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
    { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
    { code: 'TD', name: 'Chad', flag: '🇹🇩' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
    { code: 'CG', name: 'Congo', flag: '🇨🇬' },
    { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
    { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
    { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
    { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
    { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
    { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
    { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
    { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
    { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
    { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
    { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
    { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
    { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'GR', name: 'Greece', flag: '🇬🇷' },
    { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
    { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
    { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
    { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
    { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
    { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
    { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'IR', name: 'Iran', flag: '🇮🇷' },
    { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: 'IL', name: 'Israel', flag: '🇮🇱' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
    { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
    { code: 'KP', name: 'North Korea', flag: '🇰🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
    { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: 'LA', name: 'Laos', flag: '🇱🇦' },
    { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
    { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
    { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
    { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
    { code: 'LY', name: 'Libya', flag: '🇱🇾' },
    { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
    { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
    { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: 'MT', name: 'Malta', flag: '🇲🇹' },
    { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
    { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
    { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
    { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
    { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
    { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
    { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
    { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
    { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
    { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
    { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
    { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
    { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
    { code: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'OM', name: 'Oman', flag: '🇴🇲' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
    { code: 'PW', name: 'Palau', flag: '🇵🇼' },
    { code: 'PA', name: 'Panama', flag: '🇵🇦' },
    { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
    { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
    { code: 'PE', name: 'Peru', flag: '🇵🇪' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
    { code: 'RO', name: 'Romania', flag: '🇷🇴' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
    { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
    { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
    { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
    { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
    { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
    { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
    { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
    { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
    { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
    { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
    { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'SY', name: 'Syria', flag: '🇸🇾' },
    { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
    { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
    { code: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
    { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
    { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
    { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
    { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
    { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
    { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
    { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' }
  ];

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
    if (!selectedJob || !user) {
      toast.error('Please login to apply');
      return;
    }

    try {
      let attachmentUrl = '';
      
      // Upload attachment if exists using IMGBB
      if (applicationForm.attachment) {
        const file = applicationForm.attachment;
        
        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('File size must be less than 10MB');
          return;
        }

        // Create FormData for IMGBB upload
        const formData = new FormData();
        formData.append('image', file);
        formData.append('key', process.env.REACT_APP_IMGBB_API_KEY);

        try {
          const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          if (data.success) {
            attachmentUrl = data.data.url;
          } else {
            toast.error('Failed to upload file. Please try again.');
            return;
          }
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error('Failed to upload file. Please try again.');
          return;
        }
      }

      // Create the application first
      const applicationData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        freelancerId: user.uid,
        freelancerName: user.displayName || 'Anonymous',
        freelancerPhoto: user.photoURL || '',
        clientId: selectedJob.clientId,
        coverLetter: applicationForm.coverLetter,
        proposedBudget: Number(applicationForm.proposedBudget) || 0,
        estimatedTime: Number(applicationForm.estimatedTime) || 0,
        relevantExperience: applicationForm.relevantExperience,
        attachmentUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      // Add application to Firestore
      const applicationRef = await addDoc(collection(db, 'applications'), applicationData);

      // Then update job's applications array
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        applications: arrayUnion(user.uid)
      });

      // Finally, update user's application count
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: increment(-1),
        dailyApplicationCount: increment(1)
      });

      setUserCredits(prev => prev - 1);
      setDailyApplicationCount(prev => prev + 1);
      
      toast.success('Application submitted successfully');
      setShowApplicationModal(false);
      setApplicationForm({
        coverLetter: '',
        proposedBudget: '',
        estimatedTime: '',
        relevantExperience: '',
        attachment: null
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
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
      // Handle Firestore Timestamp
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      // Handle regular date string or timestamp
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

  const handlePostJob = async (e) => {
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
        ...jobFormData,
        clientId: user.uid,
        clientName: user.displayName,
        status: 'open',
        createdAt: serverTimestamp(),
        applications: [],
        hiredFreelancer: null
      };

      await addDoc(collection(db, 'jobs'), jobData);
      toast.success('Job posted successfully');
      setShowJobForm(false);
      setJobFormData({
        title: '',
        description: '',
        budget: '',
        hourlyRate: '',
        deadline: '',
        skills: '',
        category: '',
        type: 'fixed',
        experience: 'entry',
        country: 'US'
      });
      fetchJobs();
      fetchDailyJobCount();
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
    }
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteJob = async (jobId) => {
    if (!user) {
      toast.error('Please login to delete a job');
      return;
    }

    try {
      // Get the job to verify ownership
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (!jobDoc.exists()) {
        toast.error('Job not found');
        return;
      }
      
      const jobData = jobDoc.data();
      
      // Verify the user is the job poster
      if (jobData.clientId !== user.uid) {
        toast.error('You can only delete your own jobs');
        return;
      }
      
      // Delete the job
      await deleteDoc(jobRef);
      
      // Update the jobs list
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setFilteredJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job. Please try again.');
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
                  onClick={() => setShowJobForm(true)}
                  disabled={dailyJobCount >= 5}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${dailyJobCount >= 5
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
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  {/* Main Content */}
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
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${job.status === 'open' ? 'bg-green-100 text-green-800' :
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
                              onClick={() => handleDeleteJob(job.id)}
                              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-center transition-colors block "
                            >
                              Delete Job
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(job.id)}
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
      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Post a New Job</h2>
              <button
                onClick={() => setShowJobForm(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={jobFormData.title}
                    onChange={handleJobFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="e.g., Senior React Developer"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={jobFormData.category}
                    onChange={handleJobFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select a category</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="design">Design</option>
                    <option value="writing">Writing</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={jobFormData.description}
                  onChange={handleJobFormChange}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Describe the job requirements, responsibilities, and any other relevant details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={jobFormData.type}
                    onChange={handleJobFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                {jobFormData.type === 'fixed' ? (
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                      Budget
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        value={jobFormData.budget}
                        onChange={handleJobFormChange}
                        required={jobFormData.type === 'fixed'}
                        min="1"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        value={jobFormData.hourlyRate}
                        onChange={handleJobFormChange}
                        required={jobFormData.type === 'hourly'}
                        min="1"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        placeholder="Enter hourly rate"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={jobFormData.experience}
                    onChange={handleJobFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={jobFormData.skills}
                    onChange={handleJobFormChange}
                    required
                    placeholder="e.g., React, Node.js, MongoDB"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                  <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={jobFormData.country}
                    onChange={handleJobFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    {countries.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={jobFormData.deadline}
                  onChange={handleJobFormChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={remainingJobPosts <= 0}
                >
                  Post Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Submit Application</h2>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitApplication(); }} className="space-y-6">
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="coverLetter"
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                  placeholder="Explain why you're the best fit for this job..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proposedBudget" className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedJob?.type === 'hourly' ? 'Proposed Hourly Rate' : 'Proposed Budget'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="proposedBudget"
                      value={applicationForm.proposedBudget}
                      onChange={(e) => setApplicationForm({ ...applicationForm, proposedBudget: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      required
                      min="1"
                      placeholder={selectedJob?.type === 'hourly' ? 'Enter hourly rate' : 'Enter fixed budget'}
                    />
                  </div>
                  {selectedJob?.type === 'hourly' ? (
                    <p className="mt-1 text-sm text-gray-500">Original rate: ${selectedJob?.hourlyRate}/hr</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">Original budget: ${selectedJob?.budget}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time (in days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="estimatedTime"
                    value={applicationForm.estimatedTime}
                    onChange={(e) => setApplicationForm({ ...applicationForm, estimatedTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                    min="1"
                    placeholder="Enter number of days"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="relevantExperience" className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="relevantExperience"
                  value={applicationForm.relevantExperience}
                  onChange={(e) => setApplicationForm({ ...applicationForm, relevantExperience: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                  placeholder="Describe your relevant experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setApplicationForm({ ...applicationForm, attachment: file });
                            }
                          }}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB</p>
                  </div>
                </div>
                {applicationForm.attachment && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected file: {applicationForm.attachment.name}
                    <button
                      type="button"
                      onClick={() => setApplicationForm({ ...applicationForm, attachment: null })}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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