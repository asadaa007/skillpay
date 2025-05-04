import React from 'react';

const BillingPayments = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-8">Billing & payments</h2>
    <div className="bg-white rounded-lg border p-8 max-w-2xl">
      <h3 className="text-xl font-semibold mb-2">Billing methods</h3>
      <p className="text-gray-600 mb-4">You haven't set up any billing methods yet. Your billing method will be charged only when your available balance from SkillPay earnings is not sufficient to pay for your monthly membership and/or Connects.</p>
      <button className="text-green-600 font-semibold flex items-center gap-1 hover:underline">
        <span className="text-2xl leading-none">+</span> Add a billing method
      </button>
    </div>
  </div>
);

export default BillingPayments; 