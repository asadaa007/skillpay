import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  FiUser, 
  FiBriefcase, 
  FiMapPin, 
  FiGlobe, 
  FiMail, 
  FiLink,
  FiGithub,
  FiLinkedin,
  FiTwitter
} from 'react-icons/fi';

const PublicProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Profile Not Found</h2>
          <p className="mt-2 text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-primary">
            <div className="absolute -bottom-16 left-8">
              <img
                src={profile.avatar || 'https://via.placeholder.com/150'}
                alt={profile.fullName}
                className="h-32 w-32 rounded-full border-4 border-white object-cover"
              />
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                <p className="mt-1 text-lg text-gray-600">{profile.userType === 'freelancer' ? 'Freelancer' : 'Client'}</p>
              </div>
              {currentUser && currentUser.uid === userId && (
                <a
                  href="/profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Edit Profile
                </a>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {profile.location && (
                <div className="flex items-center text-gray-600">
                  <FiMapPin className="h-5 w-5 mr-2" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center text-gray-600">
                  <FiGlobe className="h-5 w-5 mr-2" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {profile.website}
                  </a>
                </div>
              )}
              {profile.linkedin && (
                <div className="flex items-center text-gray-600">
                  <FiLinkedin className="h-5 w-5 mr-2" />
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    LinkedIn
                  </a>
                </div>
              )}
              {profile.github && (
                <div className="flex items-center text-gray-600">
                  <FiGithub className="h-5 w-5 mr-2" />
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    GitHub
                  </a>
                </div>
              )}
              {profile.twitter && (
                <div className="flex items-center text-gray-600">
                  <FiTwitter className="h-5 w-5 mr-2" />
                  <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Twitter
                  </a>
                </div>
              )}
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-light text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
                <div className="mt-2 text-gray-600 whitespace-pre-wrap">{profile.experience}</div>
              </div>
            )}

            {/* Education */}
            {profile.education && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                <div className="mt-2 text-gray-600 whitespace-pre-wrap">{profile.education}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile; 