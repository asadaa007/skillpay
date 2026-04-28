import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { GIG_CATEGORIES } from '../constants';

const categories = GIG_CATEGORIES;

const priceRanges = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $500', min: 100, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: 'Over $1000', min: 1000, max: null }
];

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchGigs();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedPriceRange, sortBy]);

  const fetchGigs = async () => {
    setLoading(true);
    setError(null);
    try {
      let gigsQuery = collection(db, 'gigs');
      
      // Apply filters
      if (selectedCategory) {
        gigsQuery = query(gigsQuery, where('category', '==', selectedCategory));
      }
      
      if (selectedPriceRange) {
        const range = priceRanges.find(r => r.label === selectedPriceRange);
        if (range) {
          gigsQuery = query(gigsQuery, where('price', '>=', range.min));
          if (range.max) {
            gigsQuery = query(gigsQuery, where('price', '<=', range.max));
          }
        }
      }

      // Apply search term
      if (searchTerm) {
        gigsQuery = query(gigsQuery, where('title', '>=', searchTerm), where('title', '<=', searchTerm + '\uf8ff'));
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          gigsQuery = query(gigsQuery, orderBy('createdAt', 'desc'));
          break;
        case 'price-low':
          gigsQuery = query(gigsQuery, orderBy('price', 'asc'));
          break;
        case 'price-high':
          gigsQuery = query(gigsQuery, orderBy('price', 'desc'));
          break;
        case 'rating':
          gigsQuery = query(gigsQuery, orderBy('rating', 'desc'));
          break;
      }

      // Limit results
      gigsQuery = query(gigsQuery, limit(20));

      const querySnapshot = await getDocs(gigsQuery);
      const gigsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGigs(gigsData);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setError('Failed to fetch gigs. Please try again later.');
      toast.error('Failed to fetch gigs. Please try again later.');
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPriceRange('');
    setSortBy('newest');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for services..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="">Any Price</option>
                  {priceRanges.map((range) => (
                    <option key={range.label} value={range.label}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading results...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
              <p className="mt-4 text-gray-500">{error}</p>
              <button
                onClick={fetchGigs}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Try Again
              </button>
            </div>
          ) : gigs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No gigs found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {gigs.map((gig) => (
                <Link
                  key={gig.id}
                  to={`/gigs/${gig.id}/view`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    {gig.images?.[0] ? (
                      <img
                        src={gig.images[0]}
                        alt={gig.title}
                        className="object-cover rounded-t-lg w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-t-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {gig.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {gig.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-medium">
                        ${gig.price}
                      </span>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-gray-600">
                          {gig.rating || 'New'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search; 