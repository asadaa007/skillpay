import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { 
  ChartBarIcon, 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeGigs: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalOrders: 0,
    earningsGrowth: 0,
  });
  const [recentGigs, setRecentGigs] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setError(null);
        setLoading(true);
        
        // Fetch user's gigs
        const gigsQuery = query(
          collection(db, 'gigs'),
          where('userId', '==', user.uid)
        );
        
        const gigsSnapshot = await getDocs(gigsQuery);
        const userGigs = gigsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort gigs by createdAt
        userGigs.sort((a, b) => {
          const timeA = a.createdAt?.toDate() || new Date(0);
          const timeB = b.createdAt?.toDate() || new Date(0);
          return timeB - timeA;
        });
        
        setRecentGigs(userGigs.slice(0, 5));
        
        // Fetch user's orders as seller
        const sellerOrdersQuery = query(
          collection(db, 'orders'),
          where('sellerId', '==', user.uid)
        );
        
        // Fetch user's orders as buyer
        const buyerOrdersQuery = query(
          collection(db, 'orders'),
          where('buyerId', '==', user.uid)
        );
        
        // Get both sets of orders
        const [sellerOrdersSnapshot, buyerOrdersSnapshot] = await Promise.all([
          getDocs(sellerOrdersQuery),
          getDocs(buyerOrdersQuery)
        ]);
        
        // Combine and process orders
        const sellerOrders = sellerOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'seller'
        }));
        
        const buyerOrders = buyerOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'buyer'
        }));
        
        const allOrders = [...sellerOrders, ...buyerOrders];
        
        // Sort orders by createdAt
        allOrders.sort((a, b) => {
          const timeA = a.createdAt?.toDate() || new Date(0);
          const timeB = b.createdAt?.toDate() || new Date(0);
          return timeB - timeA;
        });
        
        setRecentOrders(allOrders.slice(0, 5));
        
        // Calculate stats
        const completedOrders = allOrders.filter(order => order.status === 'completed').length;
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        const totalEarnings = sellerOrders.reduce((sum, order) => {
          return sum + (order.status === 'completed' ? (order.amount || 0) : 0);
        }, 0);
        
        setStats({
          totalEarnings,
          activeGigs: userGigs.filter(gig => gig.status === 'active').length,
          completedOrders,
          pendingOrders,
          totalOrders: allOrders.length,
          earningsGrowth: 0 // You can calculate this based on previous period if needed
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="container-custom pt-16 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-16">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link to="/gigs/create" className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Gig
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  {stats.earningsGrowth >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stats.earningsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(stats.earningsGrowth)}% from last month
                  </span>
                </div>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Gigs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeGigs}</p>
                <p className="text-sm text-gray-500 mt-1">Out of {recentGigs.length} total</p>
              </div>
              <BriefcaseIcon className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                <p className="text-sm text-gray-500 mt-1">Out of {stats.totalOrders} total</p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                <p className="text-sm text-gray-500 mt-1">Requires attention</p>
              </div>
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>
        </div>

        {/* Recent Gigs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Gigs</h2>
            <Link to="/gigs" className="text-primary hover:text-primary-dark">
              View All
            </Link>
          </div>
          {recentGigs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentGigs.map((gig) => (
                    <tr key={gig.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/gigs/${gig.id}`} className="text-primary hover:text-primary-dark">
                          {gig.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {gig.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${gig.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          gig.status === 'active' ? 'bg-green-100 text-green-800' : 
                          gig.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {gig.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {gig.views || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No gigs yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first gig.</p>
              <div className="mt-6">
                <Link
                  to="/gigs/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Create New Gig
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-primary hover:text-primary-dark">
              View All
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gig
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/gigs/${order.gigId}`} className="text-primary hover:text-primary-dark">
                          {order.gigTitle}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.buyerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">Orders will appear here when you start receiving them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 