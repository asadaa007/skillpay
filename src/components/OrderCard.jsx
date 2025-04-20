import { Link } from 'react-router-dom';

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            <Link to={`/gigs/${order.gigId}`} className="hover:text-primary">
              {order.gigTitle}
            </Link>
          </h3>
          <p className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Buyer</p>
          <p className="text-sm font-medium text-gray-900">{order.buyerName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-sm font-medium text-gray-900">${order.amount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-sm font-medium text-gray-900">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Delivery Due</p>
          <p className="text-sm font-medium text-gray-900">
            {order.deliveryDue ? new Date(order.deliveryDue).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          to={`/orders/${order.id}`}
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
