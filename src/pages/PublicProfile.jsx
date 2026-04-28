import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiMessageSquare,
} from 'react-icons/fi';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userSnap, gigsSnap, reviewsSnap] = await Promise.all([
          getDoc(doc(db, 'users', userId)),
          getDocs(query(collection(db, 'gigs'), where('userId', '==', userId), where('status', '==', 'active'))),
          getDocs(query(collection(db, 'reviews'), where('freelancerId', '==', userId), where('status', '==', 'published'))),
        ]);
        if (userSnap.exists()) setProfile(userSnap.data());
        setGigs(gigsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const reviewsList = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const total = reviewsList.length;
        const avg = total > 0 ? reviewsList.reduce((s, r) => s + r.rating, 0) / total : 0;
        setReviews(reviewsList);
        setReviewStats({ avg, total });
      } catch (err) {
        console.error('Error fetching public profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleMessage = () => {
    if (!currentUser) { navigate('/login'); return; }
    if (isOwnProfile) { toast('This is your own profile.', { icon: 'ℹ️' }); return; }
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
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

  const avatar = profile.avatarUrl || profile.avatar || profile.photoURL;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header card */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="px-8 pb-6 -mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-4">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={profile.fullName}
                    className="h-28 w-28 rounded-full border-4 border-white object-cover shadow"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow">
                    <FiUser className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.fullName || 'Freelancer'}</h1>
                  <p className="text-gray-500 text-sm capitalize">{profile.userType || 'freelancer'}</p>
                  {reviewStats.total > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium">{reviewStats.avg.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({reviewStats.total} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pb-1">
                {isOwnProfile ? (
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleMessage}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <FiMessageSquare className="h-4 w-4" />
                      Message
                    </button>
                    <Link
                      to={`/portfolio/${userId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-sm font-medium rounded-lg text-primary bg-white hover:bg-primary/5 transition-colors"
                    >
                      <FiBriefcase className="h-4 w-4" />
                      View Portfolio
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* About / contact */}
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">About</h2>
              {profile.bio ? (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No bio yet.</p>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center gap-2"><FiMapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />{profile.location}</div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-2">
                    <FiGlobe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{profile.website}</a>
                  </div>
                )}
                {profile.linkedin && (
                  <div className="flex items-center gap-2">
                    <FiLinkedin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>
                  </div>
                )}
                {profile.github && (
                  <div className="flex items-center gap-2">
                    <FiGithub className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a>
                  </div>
                )}
                {profile.twitter && (
                  <div className="flex items-center gap-2">
                    <FiTwitter className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitter</a>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience && (
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-2">Experience</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.experience}</p>
              </div>
            )}

            {/* Education */}
            {profile.education && (
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-2">Education</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.education}</p>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active gigs */}
            {gigs.length > 0 && (
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Active Gigs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gigs.map(gig => (
                    <Link
                      key={gig.id}
                      to={`/gigs/${gig.id}/view`}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {gig.images?.[0] ? (
                        <img src={gig.images[0]} alt={gig.title} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          <FiBriefcase className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{gig.title}</p>
                        <p className="text-sm font-semibold text-primary mt-1">${gig.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Reviews
                {reviewStats.total > 0 && (
                  <span className="ml-2 text-sm text-gray-400 font-normal">({reviewStats.total})</span>
                )}
              </h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map(review => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            s <= review.rating
                              ? <StarIcon key={s} className="h-4 w-4 text-yellow-400" />
                              : <StarOutline key={s} className="h-4 w-4 text-gray-300" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{review.reviewerName || 'Anonymous'}</span>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
