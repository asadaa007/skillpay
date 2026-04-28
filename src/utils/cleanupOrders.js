import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export const cleanupDuplicateOrders = async () => {
  try {
    const ordersSnapshot = await getDocs(collection(db, 'orders'));

    // Group non-deleted orders by jobId
    const ordersByJob = {};
    ordersSnapshot.forEach(docSnap => {
      const order = { id: docSnap.id, ...docSnap.data() };
      if (order.isDeleted || !order.jobId) return;
      if (!ordersByJob[order.jobId]) {
        ordersByJob[order.jobId] = [];
      }
      ordersByJob[order.jobId].push(order);
    });

    for (const [, orders] of Object.entries(ordersByJob)) {
      if (orders.length > 1) {
        orders.sort((a, b) => {
          const tA = a.createdAt?.toDate?.() || new Date(0);
          const tB = b.createdAt?.toDate?.() || new Date(0);
          return tB - tA;
        });

        const [newestOrder, ...duplicates] = orders;

        if (newestOrder.status === 'pending') {
          await updateDoc(doc(db, 'orders', newestOrder.id), {
            status: 'in_progress',
            updatedAt: new Date()
          });
        }

        // Soft-delete duplicates (rules don't allow deleteDoc)
        for (const duplicate of duplicates) {
          await updateDoc(doc(db, 'orders', duplicate.id), {
            isDeleted: true,
            deletedAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    console.log('Order cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning up orders:', error);
    throw error;
  }
}; 