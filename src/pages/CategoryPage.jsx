import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.jsx';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const CategoryPage = ({ category, title, description }) => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    price: 'all',
    rating: 'all'
  });

  useEffect(() => {
    fetchGigs();
  }, [category]);

  useEffect(() => {
    // Apply filters locally
    let filtered = [...gigs];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(gig =>
        gig.title?.toLowerCase().includes(searchTerm) ||
        gig.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.price !== 'all') {
      const [min, max] = filters.price.split('-');
      filtered = filtered.filter(gig => {
        const price = parseInt(gig.price);
        return price >= parseInt(min) && price <= parseInt(max);
      });
    }

    if (filters.rating !== 'all') {
      const rating = parseInt(filters.rating);
      filtered = filtered.filter(gig => gig.rating >= rating);
    }

    setFilteredGigs(filtered);
  }, [filters, gigs]);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      // In a real app, we would query Firestore for gigs in this category
      // For now, we'll use dummy data
      const dummyGigs = generateDummyGigs(category);
      setGigs(dummyGigs);
      setFilteredGigs(dummyGigs);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      toast.error('Failed to fetch gigs');
    } finally {
      setLoading(false);
    }
  };

  // Generate dummy gigs based on category
  const generateDummyGigs = (category) => {
    const categories = {
      'web-development': [
        { title: 'Custom WordPress Website Development', price: 500, rating: 4.8, image: 'https://via.placeholder.com/300x200?text=WordPress' },
        { title: 'React.js Frontend Development', price: 800, rating: 4.9, image: 'https://via.placeholder.com/300x200?text=React' },
        { title: 'Full Stack MERN Development', price: 1200, rating: 4.7, image: 'https://via.placeholder.com/300x200?text=MERN' },
        { title: 'E-commerce Website with Shopify', price: 600, rating: 4.6, image: 'https://via.placeholder.com/300x200?text=Shopify' },
        { title: 'PHP Laravel Backend API', price: 700, rating: 4.5, image: 'https://via.placeholder.com/300x200?text=Laravel' }
      ],
      'mobile-development': [
        { title: 'iOS App Development with Swift', price: 1500, rating: 4.9, image: 'https://via.placeholder.com/300x200?text=iOS' },
        { title: 'Android App with Kotlin', price: 1300, rating: 4.8, image: 'https://via.placeholder.com/300x200?text=Android' },
        { title: 'React Native Cross-Platform App', price: 1000, rating: 4.7, image: 'https://via.placeholder.com/300x200?text=ReactNative' },
        { title: 'Flutter Mobile App Development', price: 1100, rating: 4.6, image: 'https://via.placeholder.com/300x200?text=Flutter' },
        { title: 'Mobile App UI/UX Design', price: 600, rating: 4.5, image: 'https://via.placeholder.com/300x200?text=MobileUI' }
      ],
      'ui-design': [
        { title: 'Professional Logo Design', price: 100, rating: 4.9, image: 'https://via.placeholder.com/300x200?text=Logo' },
        { title: 'Brand Identity Package', price: 300, rating: 4.8, image: 'https://via.placeholder.com/300x200?text=Brand' },
        { title: 'UI/UX Design for Web App', price: 500, rating: 4.7, image: 'https://via.placeholder.com/300x200?text=UIUX' },
        { title: 'Social Media Graphics Package', price: 150, rating: 4.6, image: 'https://via.placeholder.com/300x200?text=Social' },
        { title: 'Product Packaging Design', price: 200, rating: 4.5, image: 'https://via.placeholder.com/300x200?text=Packaging' }
      ],
      'writing': [
        { title: 'SEO-Optimized Blog Writing', price: 50, rating: 4.9, image: 'https://via.placeholder.com/300x200?text=Blog' },
        { title: 'Technical Documentation', price: 200, rating: 4.8, image: 'https://via.placeholder.com/300x200?text=TechDoc' },
        { title: 'Copywriting for Landing Pages', price: 150, rating: 4.7, image: 'https://via.placeholder.com/300x200?text=Copy' },
        { title: 'E-book Writing and Formatting', price: 500, rating: 4.6, image: 'https://via.placeholder.com/300x200?text=Ebook' },
        { title: 'Content Strategy and Planning', price: 300, rating: 4.5, image: 'https://via.placeholder.com/300x200?text=Content' }
      ],
      'marketing': [
        { title: 'Social Media Marketing Campaign', price: 400, rating: 4.9, image: 'https://via.placeholder.com/300x200?text=Social' },
        { title: 'Email Marketing Setup and Strategy', price: 250, rating: 4.8, image: 'https://via.placeholder.com/300x200?text=Email' },
        { title: 'SEO Audit and Optimization', price: 300, rating: 4.7, image: 'https://via.placeholder.com/300x200?text=SEO' },
        { title: 'Google Ads Campaign Management', price: 350, rating: 4.6, image: 'https://via.placeholder.com/300x200?text=Ads' },
        { title: 'Content Marketing Strategy', price: 450, rating: 4.5, image: 'https://via.placeholder.com/300x200?text=Content' }
      ],
      'other': [
        { title: 'Virtual Assistant Services', price: 200, rating: 4.9, image: 'https://via.placeholder.com/300x200?text=VA' },
        { title: 'Data Entry and Organization', price: 150, rating: 4.8, image: 'https://via.placeholder.com/300x200?text=Data' },
        { title: 'Translation Services', price: 100, rating: 4.7, image: 'https://via.placeholder.com/300x200?text=Translation' },
        { title: 'Video Editing and Production', price: 300, rating: 4.6, image: 'https://via.placeholder.com/300x200?text=Video' },
        { title: 'Business Consulting', price: 500, rating: 4.5, image: 'https://via.placeholder.com/300x200?text=Consulting' }
      ]
    };

    // Add IDs and other properties to make the data more realistic
    return (categories[category] || []).map((gig, index) => ({
      id: `dummy-${category}-${index}`,
      ...gig,
      userId: `user-${index}`,
      userName: `Freelancer ${index + 1}`,
      userPhoto: `https://i.pravatar.cc/150?img=${index + 10}`,
      description: `This is a sample ${gig.title.toLowerCase()} gig. In a real application, this would contain detailed information about the service offered.`,
      category,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      deliveryTime: Math.floor(Math.random() * 14) + 1,
      reviews: Math.floor(Math.random() * 100) + 10
    }));
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
      <div className="container-custom pt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search gigs..."
                className="w-full px-4 py-2 border rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg"
              value={filters.price}
              onChange={(e) => setFilters({ ...filters, price: e.target.value })}
            >
              <option value="all">All Prices</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500-1000">$500 - $1000</option>
              <option value="1000-999999">$1000+</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg"
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            >
              <option value="all">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.7">4.7+ Stars</option>
              <option value="4.9">4.9+ Stars</option>
            </select>
          </div>
        </div>

        {/* Gigs List */}
        {filteredGigs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig) => (
              <div key={gig.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={gig.image} 
                    alt={gig.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <img 
                      src={gig.userPhoto} 
                      alt={gig.userName} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-600">{gig.userName}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{gig.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gig.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{gig.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({gig.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-600">{gig.deliveryTime} days delivery</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-500 mr-1" />
                      <span className="text-lg font-bold text-gray-900">${gig.price}</span>
                    </div>
                    <Link 
                      to={`/gigs/${gig.id}`}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No gigs found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 