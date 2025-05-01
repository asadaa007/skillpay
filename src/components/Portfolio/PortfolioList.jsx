import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { PencilIcon, TrashIcon, ChartBarIcon, ShareIcon } from '@heroicons/react/24/outline';
import PortfolioAnalytics from './PortfolioAnalytics';
import PortfolioSharing from './PortfolioSharing';
import PortfolioDetails from './PortfolioDetails';

const PortfolioList = ({ onEdit }) => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPortfolioItems();
  }, [user]);

  const fetchPortfolioItems = async () => {
    try {
      const q = query(
        collection(db, 'portfolio'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPortfolioItems(items.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await deleteDoc(doc(db, 'portfolio', itemId));
        setPortfolioItems(items => items.filter(item => item.id !== itemId));
        toast.success('Portfolio item deleted successfully');
      } catch (error) {
        console.error('Error deleting portfolio item:', error);
        toast.error('Failed to delete portfolio item');
      }
    }
  };

  const handleViewAnalytics = (item) => {
    setSelectedItem(item);
    setShowAnalytics(true);
  };

  const handleShare = (item) => {
    setSelectedItem(item);
    setShowSharing(true);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleCloseModals = () => {
    setShowAnalytics(false);
    setShowSharing(false);
    setShowDetails(false);
    setSelectedItem(null);
  };

  const renderPortfolioItem = (item) => {
    const baseClasses = "relative group cursor-pointer transition-all duration-300 hover:shadow-lg rounded-lg overflow-hidden";
    
    return (
      <div 
        key={item.id} 
        className={baseClasses}
        onClick={() => handleViewDetails(item)}
      >
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
          >
            <TrashIcon className="h-4 w-4 text-red-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewAnalytics(item);
            }}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
          >
            <ChartBarIcon className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(item);
            }}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
          >
            <ShareIcon className="h-4 w-4 text-green-600" />
          </button>
        </div>

        <div className="aspect-w-16 aspect-h-9">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 bg-white">
          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
              >
                {skill}
              </span>
            ))}
            {item.skills.length > 3 && (
              <span className="text-xs text-gray-500">+{item.skills.length - 3} more</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg" />
            <div className="mt-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map(renderPortfolioItem)}
      </div>

      {showAnalytics && selectedItem && (
        <PortfolioAnalytics
          portfolioId={selectedItem.id}
          onClose={handleCloseModals}
        />
      )}

      {showSharing && selectedItem && (
        <PortfolioSharing
          portfolioId={selectedItem.id}
          onClose={handleCloseModals}
        />
      )}

      {showDetails && selectedItem && (
        <PortfolioDetails
          item={selectedItem}
          onClose={handleCloseModals}
        />
      )}
    </>
  );
};

export default PortfolioList; 