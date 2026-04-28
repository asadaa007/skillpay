import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GigDetails = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchGig();
  }, [gigId, user]);

  const fetchGig = async () => {
    if (!gigId) return;

    try {
      const gigDoc = await getDoc(doc(db, 'gigs', gigId));

      if (!gigDoc.exists()) {
        toast.error('Gig not found');
        navigate('/gigs');
        return;
      }

      const gigData = { id: gigDoc.id, ...gigDoc.data() };

      if (user && gigData.userId !== user.uid) {
        toast.error('You do not have permission to manage this gig');
        navigate(`/gigs/${gigId}/view`);
        return;
      }

      if (!user) {
        navigate(`/gigs/${gigId}/view`);
        return;
      }

      setGig(gigData);
    } catch (error) {
      console.error('Error fetching gig:', error);
      toast.error('Failed to load gig details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!gig || updating) return;
    
    setUpdating(true);
    
    try {
      await updateDoc(doc(db, 'gigs', gig.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setGig(prev => ({
        ...prev,
        status: newStatus
      }));
      
      toast.success(`Gig status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating gig status:', error);
      toast.error('Failed to update gig status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!gig || updating) return;
    
    if (!window.confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return;
    }
    
    setUpdating(true);
    
    try {
      await deleteDoc(doc(db, 'gigs', gig.id));
      toast.success('Gig deleted successfully');
      navigate('/gigs');
    } catch (error) {
      console.error('Error deleting gig:', error);
      toast.error('Failed to delete gig');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'draft':
        return <PencilIcon className="h-5 w-5" />;
      case 'paused':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return null;
  }

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <Link 
          to="/gigs"
          className="inline-flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gigs
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {gig.title}
              </h1>
              <div className="flex items-center">
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(gig.status)}`}>
                  {getStatusIcon(gig.status)}
                  <span className="ml-1">{gig.status}</span>
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Created on {new Date(gig.createdAt?.toDate()).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Pause / Activate toggle */}
              {gig.status === 'active' ? (
                <button
                  onClick={() => handleStatusUpdate('paused')}
                  disabled={updating}
                  className="btn-secondary flex items-center"
                  title="Pause gig — it will no longer appear in search"
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Pause Gig
                </button>
              ) : (
                <button
                  onClick={() => handleStatusUpdate('active')}
                  disabled={updating}
                  className="btn-primary flex items-center"
                  title="Activate gig — it will appear in search results"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Activate Gig
                </button>
              )}
              <Link
                to={`/gigs/${gig.id}/edit`}
                className="btn-secondary flex items-center"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Gig
              </Link>
              <button
                onClick={handleDelete}
                disabled={updating}
                className="btn-secondary flex items-center text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete Gig
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gig Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p className="text-lg font-semibold text-gray-900">${gig.price}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Delivery Time</p>
                    <p className="text-lg font-semibold text-gray-900">{gig.deliveryTime} days</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Revisions</p>
                    <p className="text-lg font-semibold text-gray-900">{gig.revisions}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <StarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="text-lg font-semibold text-gray-900">{gig.category}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Views</p>
                    <p className="text-lg font-semibold text-gray-900">{gig.views || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Orders</p>
                    <p className="text-lg font-semibold text-gray-900">{gig.orders || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
            </div>
          </div>

          {gig.features && gig.features.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
              <ul className="bg-gray-50 rounded-lg p-4 space-y-2">
                {gig.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gig.images && gig.images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gig.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Gig image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetails; 