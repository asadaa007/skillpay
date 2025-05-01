import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const GIGS_PER_PAGE = 20;

export const useGigData = (initialFilters = {}) => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Cache management
  const cache = useRef(new Map());
  const cacheTimestamp = useRef(new Map());

  const getCacheKey = useCallback((filters, page) => {
    return JSON.stringify({ filters, page });
  }, []);

  const isCacheValid = useCallback((key) => {
    const timestamp = cacheTimestamp.current.get(key);
    return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
  }, []);

  const buildQuery = useCallback(() => {
    let queryConditions = [];

    // Base query - always order by createdAt for consistency
    queryConditions.push(orderBy('createdAt', 'desc'));

    // Apply category filter
    if (filters.category !== 'all') {
      queryConditions.push(where('category', '==', filters.category));
    }

    // Apply skill level filter
    if (filters.skillLevel !== 'all') {
      queryConditions.push(where('sellerLevel', '==', filters.skillLevel));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'rating':
        queryConditions.push(orderBy('rating', 'desc'));
        break;
      case 'reviews':
        queryConditions.push(orderBy('reviews', 'desc'));
        break;
      case 'price_asc':
        queryConditions.push(orderBy('price', 'asc'));
        break;
      case 'price_desc':
        queryConditions.push(orderBy('price', 'desc'));
        break;
      // 'newest' is handled by default createdAt ordering
    }

    // Apply pagination
    if (lastVisible) {
      queryConditions.push(startAfter(lastVisible));
    }
    queryConditions.push(limit(GIGS_PER_PAGE));

    return queryConditions;
  }, [filters, lastVisible]);

  const fetchGigs = useCallback(async (reset = false) => {
    if (reset) {
      setGigs([]);
      setLastVisible(null);
      setHasMore(true);
      setPage(1);
    }

    const cacheKey = getCacheKey(filters, page);
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cachedData = cache.current.get(cacheKey);
      if (cachedData) {
        setGigs(prev => reset ? cachedData.gigs : [...prev, ...cachedData.gigs]);
        setLastVisible(cachedData.lastVisible);
        setHasMore(cachedData.hasMore);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const gigsRef = collection(db, 'gigs');
      const queryConditions = buildQuery();
      const gigsQuery = query(gigsRef, ...queryConditions);
      
      const querySnapshot = await getDocs(gigsQuery);
      
      const newGigs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Gig',
          description: data.description || 'No description available',
          price: parseFloat(data.price) || 0,
          deliveryTime: data.deliveryTime || '7 days',
          category: data.category || 'Uncategorized',
          skills: Array.isArray(data.skills) ? data.skills : [],
          rating: parseFloat(data.rating) || 0,
          reviews: parseInt(data.reviews) || 0,
          sellerLevel: data.sellerLevel || 'Level 1',
          userId: data.userId,
          image: data.images && data.images.length > 0 ? 
            data.images[0] : 
            'https://via.placeholder.com/500x300?text=No+Image',
          images: Array.isArray(data.images) ? data.images : [],
          createdAt: data.createdAt?.toDate() || new Date(),
          isNew: data.createdAt ? 
            (new Date() - data.createdAt.toDate()) < (7 * 24 * 60 * 60 * 1000) : 
            false
        };
      });

      // Update cache
      const hasMore = querySnapshot.docs.length >= GIGS_PER_PAGE;
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      cache.current.set(cacheKey, {
        gigs: newGigs,
        lastVisible,
        hasMore
      });
      cacheTimestamp.current.set(cacheKey, Date.now());

      // Update state
      setGigs(prev => reset ? newGigs : [...prev, ...newGigs]);
      setLastVisible(lastVisible);
      setHasMore(hasMore);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setError('Failed to load gigs');
      toast.error('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  }, [filters, page, buildQuery, getCacheKey, isCacheValid]);

  // Fetch gigs when filters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGigs(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, fetchGigs]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      fetchGigs(false);
    }
  }, [hasMore, loading, fetchGigs]);

  const invalidateCache = useCallback(() => {
    cache.current.clear();
    cacheTimestamp.current.clear();
  }, []);

  return {
    gigs,
    loading,
    error,
    filters,
    hasMore,
    handleFilterChange,
    handleLoadMore,
    invalidateCache
  };
}; 