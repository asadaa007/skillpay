import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { 
  PencilIcon,
  TrashIcon,
  CodeBracketIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const PortfolioList = ({ onEdit, onDelete }) => {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPortfolioItems();
  }, [user]);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
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
      
      // Sort items by timestamp in memory
      items.sort((a, b) => {
        const timeA = a.timestamp?.toDate() || new Date(0);
        const timeB = b.timestamp?.toDate() || new Date(0);
        return timeB - timeA;
      });
      
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Web Development':
      case 'Mobile Development':
        return <CodeBracketIcon className="h-6 w-6" />;
      case 'UI/UX Design':
      case 'Graphic Design':
        return <PhotoIcon className="h-6 w-6" />;
      default:
        return <DocumentTextIcon className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Please Log In</h3>
        <p className="mt-2 text-sm text-gray-500">
          You need to be logged in to view your portfolio.
        </p>
      </div>
    );
  }

  if (portfolioItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No portfolio items yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Start adding your projects to showcase your skills and experience.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolioItems.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-48 bg-gray-100">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              {getCategoryIcon(item.category)}
              <span className="text-sm font-medium text-gray-500">
                {item.category}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {item.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioList; 