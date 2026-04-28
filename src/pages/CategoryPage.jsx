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
      const rating = parseFloat(filters.rating);
      filtered = filtered.filter(gig => (gig.rating || 0) >= rating);
    }

    setFilteredGigs(filtered);
  }, [filters, gigs]);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const gigsRef = collection(db, 'gigs');
      const q = query(gigsRef, where('category', '==', category), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const gigsData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setGigs(gigsData);
      setFilteredGigs(gigsData);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      toast.error('Failed to fetch gigs');
    } finally {
      setLoading(false);
    }
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
                <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {gig.images?.[0] ? (
                    <img
                      src={gig.images[0]}
                      alt={gig.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BriefcaseIcon className="h-16 w-16 text-gray-300" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <UserIcon className="w-7 h-7 text-gray-400 mr-2 rounded-full border p-0.5" />
                    <span className="text-sm text-gray-600">{gig.ownerName || gig.userName || 'Freelancer'}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{gig.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gig.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{gig.rating ? Number(gig.rating).toFixed(1) : '—'}</span>
                    </div>
                    {gig.deliveryTime && (
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">{gig.deliveryTime} day{gig.deliveryTime !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-500 mr-1" />
                      <span className="text-lg font-bold text-gray-900">${gig.price}</span>
                    </div>
                    <Link
                      to={`/gigs/${gig.id}/view`}
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