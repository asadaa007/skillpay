import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const OrderCard = ({ order }) => {
  const isGigOrder = Boolean(order.gigId);
  const title = order.gigTitle || order.jobTitle || `Order #${order.id?.substring(0, 8)}`;
  const counterpartName = isGigOrder
    ? (order.sellerName || order.buyerName || 'Unknown')
    : (order.freelancerName || order.buyerName || 'Unknown');
  const counterpartLabel = isGigOrder ? 'Seller' : 'Freelancer';

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed':   return 'bg-green-100 text-green-700';
      case 'cancelled':   return 'bg-red-100 text-red-700';
      case 'pending':     return 'bg-yellow-100 text-yellow-700';
      default:            return 'bg-gray-100 text-gray-700';
    }
  };

  const createdAt = order.createdAt instanceof Date ? order.createdAt : order.createdAt?.toDate?.();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${getStatusColor(order.status)}`}>
          {order.status?.replace('_', ' ')}
        </span>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-0.5">
            {order.jobType === 'hourly' ? 'Hourly rate' : 'Fixed price'}
          </div>
          <div className="text-xl font-bold text-gray-900">${order.amount}</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{title}</h3>

      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-5 gap-x-6 gap-y-1">
        {createdAt && (
          <span>Created {formatDistanceToNow(createdAt, { addSuffix: true })}</span>
        )}
        {order.country && <span>{order.country}</span>}
      </div>

      <div className="mb-5">
        <div className="text-sm font-semibold text-gray-600 mb-2">{counterpartLabel}</div>
        <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2.5 w-max gap-3">
          <img
            src={order.freelancerPhoto || order.sellerPhoto || '/default-avatar.png'}
            alt={counterpartName}
            className="w-10 h-10 rounded-full object-cover bg-gray-200"
            onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
          />
          <div>
            <div className="font-medium text-gray-900 text-sm">{counterpartName}</div>
            <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getStatusColor(order.status)}`}>
              {order.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="flex items-center justify-between">
        {isGigOrder ? (
          <Link
            to={`/gigs/${order.gigId}/view`}
            className="text-primary font-medium hover:underline text-sm"
          >
            View gig
          </Link>
        ) : (
          <Link
            to={`/jobs/${order.jobId}`}
            className="text-primary font-medium hover:underline text-sm"
          >
            View all proposals
          </Link>
        )}
        <Link
          to={`/orders/${order.id}`}
          className="bg-gray-100 px-5 py-2 rounded-lg font-medium text-gray-900 hover:bg-gray-200 text-sm"
        >
          View project
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
