import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserIcon, CurrencyDollarIcon, ArrowLeftIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const GigView = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      try {
        const gigDoc = await getDoc(doc(db, 'gigs', gigId));
        if (gigDoc.exists()) {
          setGig({ id: gigDoc.id, ...gigDoc.data() });
        } else {
          setGig(null);
        }
      } catch (e) {
        setGig(null);
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [gigId]);

  const handleOrderGig = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (gig.userId === user.uid) {
      toast.error("You can't order your own gig");
      return;
    }
    setShowOrderModal(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!requirements.trim()) {
      toast.error('Please describe your requirements');
      return;
    }
    setOrdering(true);
    try {
      await addDoc(collection(db, 'orders'), {
        gigId: gig.id,
        gigTitle: gig.title,
        sellerId: gig.userId,
        sellerName: gig.ownerName || '',
        buyerId: user.uid,
        buyerName: user.displayName || user.fullName || user.email || '',
        amount: gig.price,
        requirements,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'notifications'), {
        userId: gig.userId,
        type: 'new_order',
        title: 'New Order Received',
        message: `${user.displayName || user.email} ordered "${gig.title}"`,
        read: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Order placed successfully!');
      setShowOrderModal(false);
      navigate('/orders');
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error('Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading gig...</div>;
  if (!gig) return <div className="py-20 text-center text-red-500">Gig not found.</div>;

  const isOwner = user && gig.userId === user.uid;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-primary hover:underline">
        <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
      </button>
      <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{gig.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <UserIcon className="h-5 w-5 text-gray-400" />
          <span className="text-gray-700 font-medium">{gig.ownerName || 'Unknown Owner'}</span>
          <CurrencyDollarIcon className="h-5 w-5 text-gray-400 ml-4" />
          <span className="text-primary font-semibold text-lg">${gig.price}</span>
        </div>
        {gig.images && gig.images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            {gig.images.map((img, idx) => (
              <img key={idx} src={img} alt="Gig" className="rounded-lg border object-cover w-full h-40" />
            ))}
          </div>
        )}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
        </div>
        {gig.skills && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(gig.skills)
                ? gig.skills
                : gig.skills.split(',')
              ).map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{typeof skill === 'string' ? skill.trim() : skill}</span>
              ))}
            </div>
          </div>
        )}
        {gig.deliveryTime && (
          <p className="text-sm text-gray-500 mb-4">Delivery: {gig.deliveryTime} day{gig.deliveryTime !== 1 ? 's' : ''}</p>
        )}

        {isOwner ? (
          <p className="text-sm text-gray-400 italic">This is your gig.</p>
        ) : (
          <button
            onClick={handleOrderGig}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Order Gig — ${gig.price}
          </button>
        )}
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Place Your Order</h2>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              You're ordering <span className="font-semibold">{gig.title}</span> for <span className="font-semibold text-primary">${gig.price}</span>
            </p>
            <form onSubmit={handlePlaceOrder}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe your requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary"
                placeholder="Tell the seller exactly what you need..."
                required
              />
              <button
                type="submit"
                disabled={ordering}
                className="mt-4 w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {ordering ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigView; 