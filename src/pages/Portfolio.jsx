import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import PortfolioForm from '../components/Portfolio/PortfolioForm';
import PortfolioList from '../components/Portfolio/PortfolioList';
import { PlusIcon, ChartBarIcon, ShareIcon, LinkIcon, PhotoIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const Portfolio = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [portfolioStats, setPortfolioStats] = useState({
    totalItems: 0,
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      fetchPortfolioStats();
    }
  }, [user]);

  const fetchPortfolioStats = async () => {
    try {
      setLoading(true);
      
      // Fetch portfolio items
      const portfolioRef = collection(db, 'portfolio');
      const portfolioQuery = query(
        portfolioRef,
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(portfolioQuery);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculate total stats
      let totalViews = 0;
      let totalLikes = 0;
      let totalShares = 0;
      
      // Fetch analytics for each portfolio item
      for (const item of items) {
        const analyticsDoc = await getDoc(doc(db, 'portfolio_analytics', item.id));
        if (analyticsDoc.exists()) {
          const analytics = analyticsDoc.data();
          totalViews += analytics.views || 0;
          totalLikes += analytics.likes || 0;
          totalShares += analytics.shares || 0;
        }
      }
      
      setPortfolioStats({
        totalItems: items.length,
        totalViews,
        totalLikes,
        totalShares
      });
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await deleteDoc(doc(db, 'portfolio', itemId));
        toast.success('Portfolio item deleted successfully');
        fetchPortfolioStats();
        // Increment refresh trigger to refresh the portfolio list
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting portfolio item:', error);
        toast.error('Failed to delete portfolio item');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchPortfolioStats();
    // Increment refresh trigger to refresh the portfolio list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Item
        </button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md mr-3">
              <PhotoIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-xl font-bold text-gray-900">{portfolioStats.totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md mr-3">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-xl font-bold text-gray-900">{portfolioStats.totalViews}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-md mr-3">
              <HeartIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Likes</p>
              <p className="text-xl font-bold text-gray-900">{portfolioStats.totalLikes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md mr-3">
              <ShareIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Shares</p>
              <p className="text-xl font-bold text-gray-900">{portfolioStats.totalShares}</p>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <PortfolioForm
            initialData={editingItem}
            onSuccess={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        </div>
      )}

      <PortfolioList 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default Portfolio; 