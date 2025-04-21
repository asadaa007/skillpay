import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiUpload, FiUser, FiBriefcase, FiSettings, FiAward, FiDollarSign, FiGlobe } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { uploadImageToImgBB } from '../utils/imageUpload';
import ImageUpload from '../components/ImageUpload';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
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
    paymentInfo: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      paypalEmail: ''
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, profileData);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <ImageUpload
                    currentImageUrl={profileData.avatar}
                    onImageUploaded={handleAvatarUpload}
                    placeholder="Upload Profile Picture"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                    imageClassName="w-32 h-32 rounded-full object-cover"
                    showRemoveButton={true}
                    onRemove={() => handleAvatarUpload('')}
                  />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.fullName || 'Add Your Name'}</h2>
                  <p className="text-lg text-gray-600 mt-1">{profileData.userType === 'freelancer' ? 'Freelancer' : 'Client'}</p>
                  {profileData.location && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-center md:justify-start">
                      <FiGlobe className="mr-1" />
                      {profileData.location}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
                <Link
                  to={`/profile/${user.uid}`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <FiUser className="mr-2" />
                  View Public Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs with updated styling */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                } flex-1 md:flex-none whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm flex items-center justify-center transition-colors duration-200`}
              >
                <FiUser className="mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('professional')}
                className={`${
                  activeTab === 'professional'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                } flex-1 md:flex-none whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm flex items-center justify-center transition-colors duration-200`}
              >
                <FiBriefcase className="mr-2" />
                Professional Info
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`${
                  activeTab === 'portfolio'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                } flex-1 md:flex-none whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm flex items-center justify-center transition-colors duration-200`}
              >
                <FiAward className="mr-2" />
                Portfolio
              </button>
            </nav>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={4}
                      value={profileData.bio}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      value={Array.isArray(profileData.skills) ? profileData.skills.join(', ') : ''}
                      onChange={(e) => handleArrayInputChange(e, 'skills')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        id="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        id="linkedin"
                        value={profileData.linkedin}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                        GitHub
                      </label>
                      <input
                        type="url"
                        name="github"
                        id="github"
                        value={profileData.github}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                        Twitter
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        id="twitter"
                        value={profileData.twitter}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="space-y-6">
                  {profileData.userType === 'freelancer' ? (
                    <>
                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          name="hourlyRate"
                          id="hourlyRate"
                          value={profileData.hourlyRate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                          Experience
                        </label>
                        <textarea
                          name="experience"
                          id="experience"
                          rows={4}
                          value={profileData.experience}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                          Education
                        </label>
                        <textarea
                          name="education"
                          id="education"
                          rows={4}
                          value={profileData.education}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                          Languages (comma-separated)
                        </label>
                        <input
                          type="text"
                          name="languages"
                          id="languages"
                          value={Array.isArray(profileData.languages) ? profileData.languages.join(', ') : ''}
                          onChange={(e) => handleArrayInputChange(e, 'languages')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          id="company"
                          value={profileData.company}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                          Position
                        </label>
                        <input
                          type="text"
                          name="position"
                          id="position"
                          value={profileData.position}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                      Portfolio Items (comma-separated URLs)
                    </label>
                    <input
                      type="text"
                      name="portfolio"
                      id="portfolio"
                      value={Array.isArray(profileData.portfolio) ? profileData.portfolio.join(', ') : ''}
                      onChange={(e) => handleArrayInputChange(e, 'portfolio')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                      Certifications (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="certifications"
                      id="certifications"
                      value={Array.isArray(profileData.certifications) ? profileData.certifications.join(', ') : ''}
                      onChange={(e) => handleArrayInputChange(e, 'certifications')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;