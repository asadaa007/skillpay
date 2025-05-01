import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  FiEdit2, FiUpload, FiUser, FiBriefcase, FiSettings, 
  FiAward, FiDollarSign, FiGlobe, FiStar, FiClock,
  FiBook, FiCheckCircle, FiMapPin, FiMail, FiPhone,
  FiGithub, FiLinkedin, FiTwitter
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { uploadImageToImgBB } from '../utils/imageUpload';
import ImageUpload from '../components/ImageUpload';
import EditSectionModal from '../components/Profile/EditProfileModal';
import SkillVerificationManager from '../components/Skills/SkillVerificationManager';
import ReviewsManager from '../components/Reviews/ReviewsManager';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
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
      setActiveModal(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleModalOpen = (section) => {
    setActiveModal(section);
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
      <div className="bg-white shadow-sm">
        <div className="relative h-32 bg-primary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="absolute -bottom-12 left-8">
              <ImageUpload
                currentImageUrl={profileData.avatar}
                onImageUploaded={handleAvatarUpload}
                placeholder="Upload Profile Picture"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white"
                imageClassName="w-24 h-24 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-16 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileData.fullName}</h1>
                <p className="text-lg text-gray-600 mt-1">{profileData.title || 'Add your professional title'}</p>
                <div className="flex items-center mt-2 text-gray-600">
                  <FiMapPin className="h-4 w-4 mr-1" />
                  <span>{profileData.location || 'Add location'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleModalOpen('basic')}
                  className="btn-primary flex items-center"
                >
                  <FiEdit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
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
                    <span className="text-gray-900">5 remaining</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-1.5">
                    <div 
                      className="bg-emerald-500 rounded h-1.5 transition-all duration-300" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-700">Job Applications</span>
                    <span className="text-gray-900">10 remaining</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-1.5">
                    <div 
                      className="bg-emerald-500 rounded h-1.5 transition-all duration-300" 
                      style={{ width: '100%' }}
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
                  onClick={() => handleModalOpen('skills')}
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
                  onClick={() => handleModalOpen('languages')}
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
                  onClick={() => handleModalOpen('links')}
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
                  onClick={() => handleModalOpen('basic')}
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
                  onClick={() => handleModalOpen('experience')}
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
                  onClick={() => handleModalOpen('education')}
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
                  onClick={() => handleModalOpen('certifications')}
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

      {/* Individual Edit Modals */}
      <EditSectionModal
        isOpen={activeModal === 'basic'}
        onClose={handleModalClose}
        title="Basic Information"
        section="basic"
        profileData={profileData}
        handleInputChange={handleInputChange}
        handleArrayInputChange={handleArrayInputChange}
        handleLanguageChange={handleLanguageChange}
        handleSubmit={handleSubmit}
        saving={saving}
      />

      <EditSectionModal
        isOpen={activeModal === 'languages'}
        onClose={handleModalClose}
        title="Languages"
        section="languages"
        profileData={profileData}
        handleInputChange={handleInputChange}
        handleArrayInputChange={handleArrayInputChange}
        handleLanguageChange={handleLanguageChange}
        handleSubmit={handleSubmit}
        saving={saving}
      />

      <EditSectionModal
        isOpen={activeModal === 'skills'}
        onClose={handleModalClose}
        title="Skills"
        section="skills"
        profileData={profileData}
        handleInputChange={handleInputChange}
        handleArrayInputChange={handleArrayInputChange}
        handleLanguageChange={handleLanguageChange}
        handleSubmit={handleSubmit}
        saving={saving}
      />

      <EditSectionModal
        isOpen={activeModal === 'experience'}
        onClose={handleModalClose}
        title="Experience"
        section="experience"
        profileData={profileData}
        handleInputChange={handleInputChange}
        handleArrayInputChange={handleArrayInputChange}
        handleLanguageChange={handleLanguageChange}
        handleSubmit={handleSubmit}
        saving={saving}
      />

      <EditSectionModal
        isOpen={activeModal === 'education'}
        onClose={handleModalClose}
        title="Education"
        section="education"
        profileData={profileData}
        handleInputChange={handleInputChange}
        handleArrayInputChange={handleArrayInputChange}
        handleLanguageChange={handleLanguageChange}
        handleSubmit={handleSubmit}
        saving={saving}
      />

      <EditSectionModal
        isOpen={activeModal === 'certifications'}
        onClose={handleModalClose}
        title="Certifications"
        section="certifications"
        profileData={profileData}
        handleInputChange={handleInputChange}
        handleArrayInputChange={handleArrayInputChange}
        handleLanguageChange={handleLanguageChange}
        handleSubmit={handleSubmit}
        saving={saving}
      />

      <EditSectionModal
        isOpen={activeModal === 'links'}
        onClose={handleModalClose}
        title="Social Links"
        section="links"
        profileData={profileData}
        handleInputChange={handleInputChange}
        handleArrayInputChange={handleArrayInputChange}
        handleLanguageChange={handleLanguageChange}
        handleSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
};

export default Profile;