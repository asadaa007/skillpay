import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  StarIcon, 
  ChatBubbleLeftIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const Skills = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Dummy freelancer data
  const dummyFreelancers = [
    {
      id: 'dummy1',
      fullName: 'John Smith',
      title: 'Senior Web Developer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 4.9,
      reviews: 128,
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      hourlyRate: 45,
      description: 'Experienced full-stack developer with 8+ years of experience in web development.',
      isDummy: true
    },
    {
      id: 'dummy2',
      fullName: 'Sarah Johnson',
      title: 'UI/UX Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 4.8,
      reviews: 95,
      skills: ['Figma', 'Adobe XD', 'Sketch', 'UI Design'],
      hourlyRate: 35,
      description: 'Creative UI/UX designer specializing in user-centered design and modern interfaces.',
      isDummy: true
    },
    {
      id: 'dummy3',
      fullName: 'Michael Chen',
      title: 'Mobile App Developer',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 4.7,
      reviews: 76,
      skills: ['React Native', 'iOS', 'Android', 'Flutter'],
      hourlyRate: 40,
      description: 'Mobile app developer with expertise in cross-platform development.',
      isDummy: true
    }
  ];

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const realFreelancers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isDummy: false
        }));

        // Combine real and dummy freelancers
        setFreelancers([...realFreelancers, ...dummyFreelancers]);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  const handleStartChat = (freelancerId) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = '/login';
      return;
    }
    // Navigate to chat with the freelancer
    window.location.href = `/messages?user=${freelancerId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Find Skilled Freelancers
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Browse through our talented pool of freelancers and find the perfect match for your project
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.map((freelancer) => (
            <div key={freelancer.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center">
                  {freelancer.avatar ? (
                    <img
                      src={freelancer.avatar}
                      alt={freelancer.fullName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {freelancer.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">{freelancer.title}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">
                      {freelancer.rating} ({freelancer.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Skills</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {freelancer.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {freelancer.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">
                    ${freelancer.hourlyRate}/hr
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/profile/${freelancer.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleStartChat(freelancer.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills; 