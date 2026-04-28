import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const WITHDRAWAL_METHODS = ['PayPal', 'Bank Transfer (ACH)', 'Payoneer', 'Wise'];

const GetPaid = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [lastWithdrawal, setLastWithdrawal] = useState(null);
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [methodDetails, setMethodDetails] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [userSnap, paymentsSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(query(
            collection(db, 'payments'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(10)
          )),
        ]);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setBalance(data.availableBalance || 0);
          setPendingBalance(data.pendingBalance || 0);
          setWithdrawalMethods(data.withdrawalMethods || []);
        }
        const pmts = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const lastW = pmts.find(p => p.type === 'withdrawal');
        setLastWithdrawal(lastW || null);
      } catch (err) {
        console.error('Error fetching payment info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAddMethod = async (e) => {
    e.preventDefault();
    if (!selectedMethod || !methodDetails.trim()) return;
    setSaving(true);
    try {
      const newMethod = { type: selectedMethod, detail: methodDetails.trim(), addedAt: new Date().toISOString() };
      await updateDoc(doc(db, 'users', user.uid), {
        withdrawalMethods: [...withdrawalMethods, newMethod],
      });
      setWithdrawalMethods(prev => [...prev, newMethod]);
      setShowAddMethod(false);
      setSelectedMethod('');
      setMethodDetails('');
    } catch (err) {
      console.error('Error saving withdrawal method:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8">Get paid</h2>

      {/* Balance card */}
      <div className="bg-white rounded-xl border p-8 mb-8 max-w-2xl">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Available balance</div>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              <div className="text-3xl font-bold text-green-600">${balance.toFixed(2)}</div>
              {pendingBalance > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  +${pendingBalance.toFixed(2)} pending clearance
                </div>
              )}
            </>
          )}
        </div>

        {withdrawalMethods.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-5 text-sm text-yellow-800">
            To withdraw earnings, first add a withdrawal method below.
          </div>
        ) : (
          <button
            disabled={balance <= 0}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            onClick={() => alert('Withdrawal flow requires Stripe Connect or similar backend integration.')}
          >
            Withdraw funds
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 max-w-2xl">
        <div className="bg-white rounded-xl border p-5">
          <div className="font-semibold text-gray-700 mb-1 text-sm">Withdrawal schedule</div>
          <div className="text-gray-500 text-sm">
            {withdrawalMethods.length === 0
              ? "Set up a withdrawal method to configure a schedule."
              : "Monthly automatic withdrawal on the 1st."}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="font-semibold text-gray-700 mb-1 text-sm">Last withdrawal</div>
          {lastWithdrawal ? (
            <div className="text-sm text-gray-700">
              ${lastWithdrawal.amount?.toFixed(2)} on{' '}
              {lastWithdrawal.timestamp?.toDate?.()?.toLocaleDateString() || '—'}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No withdrawals yet.</div>
          )}
        </div>
      </div>

      {/* Withdrawal methods */}
      <div className="bg-white rounded-xl border p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-gray-800">Withdrawal methods</div>
            <div className="text-gray-500 text-sm mt-0.5">
              {withdrawalMethods.length === 0 ? "No methods added yet." : `${withdrawalMethods.length} method${withdrawalMethods.length > 1 ? 's' : ''} on file`}
            </div>
          </div>
          <button
            onClick={() => setShowAddMethod(v => !v)}
            className="border border-primary text-primary rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
          >
            {showAddMethod ? 'Cancel' : 'Add a method'}
          </button>
        </div>

        {withdrawalMethods.length > 0 && (
          <ul className="divide-y mb-4">
            {withdrawalMethods.map((m, i) => (
              <li key={i} className="py-3 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-800">{m.type}</span>
                <span className="text-gray-500">{m.detail}</span>
              </li>
            ))}
          </ul>
        )}

        {showAddMethod && (
          <form onSubmit={handleAddMethod} className="border-t pt-4 space-y-3 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={selectedMethod}
                onChange={e => setSelectedMethod(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select a method</option>
                {WITHDRAWAL_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedMethod === 'PayPal' ? 'PayPal email' :
                 selectedMethod === 'Payoneer' ? 'Payoneer email' :
                 selectedMethod === 'Wise' ? 'Wise email or account ID' :
                 'Account / routing number (last 4 digits only)'}
              </label>
              <input
                type="text"
                value={methodDetails}
                onChange={e => setMethodDetails(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-primary focus:border-primary"
                placeholder="Enter details…"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {saving ? 'Saving…' : 'Save method'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GetPaid;
