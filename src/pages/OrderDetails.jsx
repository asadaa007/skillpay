import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DisputeForm from '../components/Disputes/DisputeForm';
import ReviewForm from '../components/Reviews/ReviewForm';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [hasDispute, setHasDispute] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId, user]);

  useEffect(() => {
    if (!order || !user) return;
    const checkExisting = async () => {
      const [reviewSnap, disputeSnap] = await Promise.all([
        getDocs(query(collection(db, 'reviews'), where('projectId', '==', order.id), where('reviewerId', '==', user.uid))),
        getDocs(query(collection(db, 'disputes'), where('orderId', '==', order.id), where('createdBy', '==', user.uid))),
      ]);
      setHasReview(!reviewSnap.empty);
      setHasDispute(!disputeSnap.empty);
    };
    checkExisting();
  }, [order, user]);

  const fetchOrder = async () => {
    if (!user || !orderId) return;
    
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      
      if (!orderDoc.exists()) {
        toast.error('Order not found');
        navigate('/orders');
        return;
      }
      
      const orderData = {
        id: orderDoc.id,
        ...orderDoc.data()
      };
      
      // Verify the order belongs to the current user
      if (orderData.buyerId !== user.uid && orderData.sellerId !== user.uid) {
        toast.error('You do not have permission to view this order');
        navigate('/orders');
        return;
      }
      
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const orderTitle = order?.gigTitle || order?.jobTitle || `Order #${order?.id?.substring(0, 8)}`;

  const handleStatusUpdate = async (newStatus) => {
    if (!order || !user) return;

    // Role-based permission checks
    if (newStatus === 'in_progress' && order.sellerId !== user.uid) {
      toast.error('Only the seller can accept this order');
      return;
    }
    if (newStatus === 'completed' && order.buyerId !== user.uid) {
      toast.error('Only the buyer can mark the order as completed');
      return;
    }
    if (newStatus === 'cancelled' && order.buyerId !== user.uid && order.sellerId !== user.uid) {
      toast.error('Only the buyer or seller can cancel the order');
      return;
    }

    try {
      setUpdating(true);

      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === 'in_progress' ? { acceptedAt: serverTimestamp() } : {}),
        ...(newStatus === 'completed' ? { completedAt: serverTimestamp() } : {}),
      });

      const otherUserId = user.uid === order.buyerId ? order.sellerId : order.buyerId;
      const statusLabels = { in_progress: 'accepted', completed: 'completed', cancelled: 'cancelled' };

      await addDoc(collection(db, 'notifications'), {
        userId: otherUserId,
        type: 'order_updated',
        title: `Order ${statusLabels[newStatus] || newStatus}`,
        message: `"${orderTitle}" has been marked as ${statusLabels[newStatus] || newStatus}`,
        orderId: order.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success(`Order marked as ${statusLabels[newStatus] || newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
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

  if (!order) {
    return null;
  }

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <Link 
          to="/orders"
          className="inline-flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.id.substring(0, 8)}
              </h1>
              <div className="flex items-center">
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Created on {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Seller: Accept pending order → in_progress */}
              {order.status === 'pending' && user.uid === order.sellerId && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={updating}
                  className="btn-primary flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Accept &amp; Start Work
                </button>
              )}
              {/* Buyer: Confirm delivery → completed */}
              {order.status === 'in_progress' && user.uid === order.buyerId && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updating}
                  className="btn-primary flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Confirm Delivery
                </button>
              )}
              {/* Either party: cancel while not yet completed */}
              {['pending', 'in_progress'].includes(order.status) && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updating}
                  className="btn-secondary flex items-center"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-lg font-semibold text-gray-900">${order.amount}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Order Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Requirements</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {order.requirements || 'No specific requirements provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Parties</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Buyer</p>
                    <p className="text-lg font-semibold text-gray-900">{order.buyerName || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Seller / Freelancer</p>
                    <p className="text-lg font-semibold text-gray-900">{order.sellerName || order.freelancerName || 'Unknown'}</p>
                  </div>
                </div>

                {(order.gigId || order.jobId) && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">{order.gigId ? 'Gig' : 'Job'}</p>
                      <Link
                        to={order.gigId ? `/gigs/${order.gigId}/view` : `/jobs/${order.jobId}`}
                        className="text-lg font-semibold text-primary hover:text-primary-dark"
                      >
                        {orderTitle}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {order.deliverables && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Deliverables</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{order.deliverables}</p>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Dispute section — available for both parties on non-cancelled orders */}
          {order.status !== 'cancelled' && (
            <div className="mt-8 border-t pt-6">
              {hasDispute ? (
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3">
                  <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">You have already opened a dispute for this order. <Link to="/disputes" className="underline">View disputes</Link></span>
                </div>
              ) : showDisputeForm ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Open a Dispute</h2>
                  <DisputeForm
                    orderId={order.id}
                    otherPartyId={user.uid === order.buyerId ? order.sellerId : order.buyerId}
                    projectTitle={order.gigTitle || order.jobTitle || `Order #${order.id.substring(0, 8)}`}
                    onSuccess={() => { setShowDisputeForm(false); setHasDispute(true); }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowDisputeForm(true)}
                  className="flex items-center gap-2 text-red-600 border border-red-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  Open a Dispute
                </button>
              )}
            </div>
          )}

          {/* Review section — buyer reviews seller after completion */}
          {order.status === 'completed' && user.uid === order.buyerId && (
            <div className="mt-8 border-t pt-6">
              {hasReview ? (
                <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3 font-medium">
                  ✓ You have already submitted a review for this order.
                </p>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave a Review</h2>
                  <ReviewForm
                    freelancerId={order.sellerId}
                    projectId={order.id}
                    projectTitle={order.gigTitle || order.jobTitle || `Order #${order.id.substring(0, 8)}`}
                    onSuccess={() => setHasReview(true)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 