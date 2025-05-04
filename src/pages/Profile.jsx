import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  FiEdit2, FiUpload, FiUser, FiBriefcase, FiSettings, 
  FiAward, FiDollarSign, FiGlobe, FiStar, FiClock,
  FiBook, FiCheckCircle, FiMapPin, FiMail, FiPhone,
  FiGithub, FiLinkedin, FiTwitter, FiShare2
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { uploadImageToImgBB } from '../utils/imageUpload';
import ImageUpload from '../components/ImageUpload';
import SkillVerificationManager from '../components/Skills/SkillVerificationManager';
import ReviewsManager from '../components/Reviews/ReviewsManager';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    title: '',
    bio: '',
    skills: [],
    hourlyRate: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    avatar: '',
    userType: 'freelancer',
    company: '',
    position: '',
    experience: '',
    education: '',
    languages: [],
    availability: 'full-time',
    portfolio: [],
    certifications: [],
    jobPostsRemaining: 5,
    jobApplicationsRemaining: 10
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData(prev => ({
            ...prev,
            ...data,
            skills: Array.isArray(data.skills) ? data.skills : [],
            languages: Array.isArray(data.languages) ? data.languages : [],
            portfolio: Array.isArray(data.portfolio) ? data.portfolio : [],
            certifications: Array.isArray(data.certifications) ? data.certifications : [],
            jobPostsRemaining: Math.max(0, data.jobPostsRemaining || 5),
            jobApplicationsRemaining: Math.max(0, data.jobApplicationsRemaining || 10),
            paymentInfo: data.paymentInfo || {
              bankName: '',
              accountNumber: '',
              routingNumber: '',
              paypalEmail: ''
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e, field) => {
    const values = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setProfileData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        [name]: value
      }
    }));
  };

  const handleAvatarUpload = async (imageUrl) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        avatar: imageUrl,
        updatedAt: new Date()
      });
      setProfileData(prev => ({
        ...prev,
        avatar: imageUrl
      }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update profile picture');
    }
  };

  const handleLanguageChange = (languages) => {
    setProfileData(prev => ({
      ...prev,
      languages
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date()
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header - Full Width */}
      <div className="bg-white shadow-lg pt-20 pb-10 border border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Profile Image and Info */}
          <div className="flex items-center gap-6 min-w-0">
            <div className="relative w-24 h-24">
              <img
                src={profileData.avatar || '/default-avatar.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              {/* Online Indicator */}
              <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
              {/* Edit Icon Overlay */}
              <button
                className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow hover:bg-gray-100 flex items-center justify-center"
                title="Edit profile picture"
                style={{ transform: 'translate(30%, 30%)' }}
              >
                <FiEdit2 className="h-5 w-5 text-primary" />
              </button>
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight truncate">{profileData.fullName || 'Your Name'}</h1>
              <div className="flex items-center text-gray-600 text-base gap-2 mt-1">
                <FiMapPin className="h-4 w-4" />
                <span className="truncate max-w-[160px]">{profileData.location || 'Your Location'}</span>
                <span className="mx-1">–</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} local time</span>
              </div>
            </div>
          </div>
          {/* Right: Buttons and Share */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 ml-auto mt-4 md:mt-0">
            <button
              className="border border-green-600 text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition text-base"
            >
              See public view
            </button>
            <Link
              to="/profile/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FiSettings className="mr-2" />
              Profile Settings
            </Link>
            <div className="flex items-center gap-1 text-green-700 cursor-pointer hover:text-green-800 ml-2 text-sm mt-2 md:mt-0">
              <span>Share</span>
              <FiShare2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Daily Limits Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Daily Limits</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-700">Job Posts</span>
                    <span className="text-gray-900">{profileData.jobPostsRemaining} remaining</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-1.5">
                    <div 
                      className="bg-emerald-500 rounded h-1.5 transition-all duration-300" 
                      style={{ width: `${(profileData.jobPostsRemaining / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-700">Job Applications</span>
                    <span className="text-gray-900">{profileData.jobApplicationsRemaining} remaining</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-1.5">
                    <div 
                      className="bg-emerald-500 rounded h-1.5 transition-all duration-300" 
                      style={{ width: `${(profileData.jobApplicationsRemaining / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                <button 
                  className="text-primary hover:text-primary-dark"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-light text-primary"
                  >
                    {skill}
                  </span>
                ))}
                {profileData.skills.length === 0 && (
                  <p className="text-gray-500 text-sm">Add your skills to stand out</p>
                )}
              </div>
            </div>

            {/* Languages Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Languages</h2>
                <button 
                  className="text-primary hover:text-primary-dark"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {profileData.languages.map((language, index) => (
                  <div key={index} className="flex items-center justify-between text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <FiCheckCircle className="h-4 w-4 mr-2 text-primary" />
                      <span>{language.name}</span>
                    </div>
                    <span className="text-sm font-medium text-primary-dark">{language.proficiency}</span>
                  </div>
                ))}
                {profileData.languages.length === 0 && (
                  <p className="text-gray-500 text-sm">Add languages you speak</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Links</h2>
                <button 
                  className="text-primary hover:text-primary-dark"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {profileData.website && (
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center text-gray-600 hover:text-primary">
                    <FiGlobe className="h-4 w-4 mr-2" />
                    <span>Website</span>
                  </a>
                )}
                {profileData.github && (
                  <a href={profileData.github} target="_blank" rel="noopener noreferrer"
                     className="flex items-center text-gray-600 hover:text-primary">
                    <FiGithub className="h-4 w-4 mr-2" />
                    <span>GitHub</span>
                  </a>
                )}
                {profileData.linkedin && (
                  <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer"
                     className="flex items-center text-gray-600 hover:text-primary">
                    <FiLinkedin className="h-4 w-4 mr-2" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profileData.twitter && (
                  <a href={profileData.twitter} target="_blank" rel="noopener noreferrer"
                     className="flex items-center text-gray-600 hover:text-primary">
                    <FiTwitter className="h-4 w-4 mr-2" />
                    <span>Twitter</span>
                  </a>
                )}
                {!profileData.website && !profileData.github && !profileData.linkedin && !profileData.twitter && (
                  <p className="text-gray-500 text-sm">Add your social and professional links</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                <button 
                  className="text-primary hover:text-primary-dark"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">
                {profileData.bio || 'Add a bio to tell others about yourself'}
              </p>
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
                <button 
                  className="text-primary hover:text-primary-dark"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-gray-600 whitespace-pre-wrap">
                {profileData.experience || 'Add your work experience'}
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                <button 
                  className="text-primary hover:text-primary-dark"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-gray-600 whitespace-pre-wrap">
                {profileData.education || 'Add your educational background'}
              </div>
            </div>

            {/* Certifications Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
                <button 
                  className="text-primary hover:text-primary-dark"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {profileData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <FiAward className="h-4 w-4 mr-2 text-primary" />
                    <span>{cert}</span>
                  </div>
                ))}
                {profileData.certifications.length === 0 && (
                  <p className="text-gray-500 text-sm">Add your certifications and achievements</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;