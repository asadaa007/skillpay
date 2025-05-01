import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { 
  ChartBarIcon, 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const PortfolioAnalytics = ({ portfolioId }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    trend: 'neutral', // 'up', 'down', or 'neutral'
    weeklyViews: [],
    topReferrers: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    if (portfolioId) {
      fetchAnalytics();
    }
  }, [portfolioId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch basic analytics
      const analyticsRef = doc(db, 'portfolio_analytics', portfolioId);
      const analyticsDoc = await getDoc(analyticsRef);
      
      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        
        // Calculate trend based on weekly views
        const weeklyViews = data.weeklyViews || [];
        const trend = calculateTrend(weeklyViews);
        
        setAnalytics({
          views: data.views || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          trend,
          weeklyViews: weeklyViews.slice(-7), // Last 7 days
          topReferrers: data.topReferrers || []
        });
      } else {
        // If analytics document doesn't exist, create it with default values
        await setDoc(analyticsRef, {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          weeklyViews: [],
          topReferrers: []
        });
        
        setAnalytics({
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          trend: 'neutral',
          weeklyViews: [],
          topReferrers: []
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (weeklyViews) => {
    if (weeklyViews.length < 2) return 'neutral';
    
    const lastTwoWeeks = weeklyViews.slice(-2);
    const difference = lastTwoWeeks[1] - lastTwoWeeks[0];
    
    if (difference > 0) return 'up';
    if (difference < 0) return 'down';
    return 'neutral';
  };

  const handleShare = async () => {
    try {
      const analyticsRef = doc(db, 'portfolio_analytics', portfolioId);
      const analyticsDoc = await getDoc(analyticsRef);
      
      if (analyticsDoc.exists()) {
        // Update share count if document exists
        await updateDoc(analyticsRef, {
          shares: increment(1)
        });
      } else {
        // Create document with initial values if it doesn't exist
        await setDoc(analyticsRef, {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 1,
          weeklyViews: [],
          topReferrers: []
        });
      }
      
      // Update local state
      setAnalytics(prev => ({
        ...prev,
        shares: prev.shares + 1
      }));
      
      // Generate shareable link
      const shareableLink = `${window.location.origin}/portfolio/${portfolioId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);
      
      // Show success message
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing portfolio:', error);
      toast.error('Failed to share portfolio');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Portfolio Analytics</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'week' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'month' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'year' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <EyeIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-500">Views</span>
            </div>
            {analytics.trend === 'up' && (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            )}
            {analytics.trend === 'down' && (
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.views}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <HeartIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-500">Likes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.likes}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-500">Comments</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.comments}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <ShareIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-500">Shares</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.shares}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Views Over Time</h4>
        <div className="h-40 bg-gray-50 rounded-lg p-4">
          {/* Simple bar chart visualization */}
          <div className="flex items-end h-full space-x-2">
            {analytics.weeklyViews.length > 0 ? (
              analytics.weeklyViews.map((views, index) => (
                <div 
                  key={index} 
                  className="flex-1 bg-primary/20 rounded-t"
                  style={{ height: `${Math.max(5, (views / Math.max(...analytics.weeklyViews)) * 100)}%` }}
                ></div>
              ))
            ) : (
              <div className="w-full text-center text-gray-500">No view data available</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Top Referrers</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          {analytics.topReferrers.length > 0 ? (
            <ul className="space-y-2">
              {analytics.topReferrers.map((referrer, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{referrer.source}</span>
                  <span className="text-sm font-medium text-gray-900">{referrer.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No referrer data available</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <ShareIcon className="h-5 w-5 mr-2" />
          Share Portfolio
        </button>
      </div>
    </div>
  );
};

export default PortfolioAnalytics; 