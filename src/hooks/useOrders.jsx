import { useState } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  addDoc, 
  updateDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (userId, role = 'buyer') => {
    try {
      setLoading(true);
      const field = role === 'buyer' ? 'buyerId' : 'sellerId';
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      
      const orderDoc = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      toast.success('Order created successfully');
      return orderDoc.id;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message);
      toast.error('Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date()
      });
      
      toast.success('Order status updated successfully');
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err.message);
      toast.error('Failed to update order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId) => {
    try {
      setLoading(true);
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      return {
        id: orderDoc.id,
        ...orderDoc.data()
      };
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
      toast.error('Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    getOrderById
  };
}; 