import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    connects: 10,
    features: ['10 Connects per month', 'Standard proposals', 'Basic visibility'],
    color: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
  },
  {
    id: 'freelancer_plus',
    name: 'Freelancer Plus',
    price: '$20/mo',
    connects: 80,
    features: ['80 Connects per month', 'Boosted proposals', 'Profile featured badge', 'Competitor bid insight'],
    color: 'border-primary',
    badge: 'bg-primary/10 text-primary',
    recommended: true,
  },
];

const MembershipConnects = () => {
  const { user } = useAuth();
  const [connectsBalance, setConnectsBalance] = useState(null);
  const [plan, setPlan] = useState('basic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setConnectsBalance(data.connectsBalance ?? 10);
          setPlan(data.membershipPlan || 'basic');
        }
      } catch (err) {
        console.error('Error loading membership:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8">Membership &amp; Connects</h2>

      {/* Connects balance */}
      <div className="bg-white rounded-xl border p-6 mb-8 max-w-lg">
        <h3 className="text-base font-semibold mb-1 text-gray-900">Your Connects balance</h3>
        <p className="text-sm text-gray-500 mb-4">
          Connects are used to submit proposals to job postings.
        </p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        ) : (
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-primary">{connectsBalance ?? 0}</span>
            <span className="text-gray-500 mb-1 text-sm">connects available</span>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Unused connects roll over each month (up to your plan maximum).
        </p>
      </div>

      {/* Plan cards */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        {PLANS.map(p => (
          <div
            key={p.id}
            className={`relative bg-white rounded-xl border-2 p-6 transition-shadow ${p.color} ${plan === p.id ? 'shadow-md' : ''}`}
          >
            {p.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Recommended
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{p.name}</h4>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.badge}`}>
                {plan === p.id ? 'Current plan' : p.price}
              </span>
            </div>
            <ul className="space-y-1.5 mb-5">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {plan !== p.id ? (
              <button
                className="w-full border border-primary text-primary rounded-lg py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                onClick={() => {
                  // In production this would open a Stripe checkout
                  alert('Stripe checkout integration required for plan upgrade.');
                }}
              >
                {p.price === 'Free' ? 'Downgrade to Basic' : `Upgrade — ${p.price}`}
              </button>
            ) : (
              <div className="w-full border border-green-500 text-green-600 rounded-lg py-2 text-sm font-medium text-center bg-green-50">
                ✓ Your current plan
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400 max-w-lg">
        Plan changes take effect at the next billing cycle. Connects purchased separately never expire.
      </p>
    </div>
  );
};

export default MembershipConnects;
