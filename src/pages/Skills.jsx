import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  StarIcon, 
  ChatBubbleLeftIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { FiFilter, FiStar, FiClock, FiTrendingUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ImageWithFallback from '../components/ImageWithFallback';
import { useGigData } from '../hooks/useGigData';

const GIGS_PER_PAGE = 20;

const Skills = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    gigs,
    loading,
    error,
    filters,
    hasMore,
    handleFilterChange,
    handleLoadMore
  } = useGigData({
    category: 'all',
    skillLevel: 'all',
    sortBy: 'newest',
    showNew: false
  });

  const handleStartChat = async (gigId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // ... rest of chat handling code ...
  };

  return (
    <div className="container-custom py-12 pt-20">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find the Perfect Freelance Service</h1>
        <p className="text-lg text-gray-600">
          Browse through our curated selection of professional services. Filter by category, skill level, and more to find exactly what you need.
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="ui-design">UI Design</option>
              <option value="graphic-design">Graphic Design</option>
              <option value="content-writing">Content Writing</option>
              <option value="digital-marketing">Digital Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Level
            </label>
            <select
              value={filters.skillLevel}
              onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
              <option value="Top Rated">Top Rated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="rating">Highest Rating</option>
              <option value="reviews">Most Reviews</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showNew}
                onChange={(e) => handleFilterChange('showNew', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show New Freelancers</span>
            </label>
          </div>
        </div>
      </div>

      {/* Gigs Grid */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      ) : loading && gigs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map(gig => (
            <div key={gig.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative aspect-w-16 aspect-h-9">
                <ImageWithFallback
                  src={gig.image}
                  alt={gig.title}
                  className="w-full h-full object-cover"
                  priority={gigs.indexOf(gig) < 6}
                />
                {gig.isNew && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                    New
                  </span>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {gig.title}
                  </h3>
                  <span className="text-lg font-bold text-primary">
                    ${gig.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {gig.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FiStar className="text-yellow-400 w-5 h-5" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {gig.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({gig.reviews})
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FiClock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{gig.deliveryTime}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(gig.skills || []).slice(0, 3).map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {gig.skills?.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{gig.skills.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-6 w-6 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">
                      {gig.sellerLevel}
                    </span>
                  </div>
                  <button
                    onClick={() => handleStartChat(gig.id)}
                    className="flex items-center text-primary hover:text-primary-dark"
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm">Contact</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="btn-primary flex items-center"
          >
            Load More
            <FiChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Skills; 