import React from 'react';

const GetPaid = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-8">Get paid</h2>
    {/* Main Card */}
    <div className="bg-white rounded-lg border p-8 mb-8 max-w-3xl">
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">Available balance</div>
        <div className="text-2xl font-bold text-green-600">$0.00</div>
        <div className="text-xs text-gray-500">+$0.00 pending <span title="Pending balance" className="ml-1">&#9432;</span></div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6 text-sm text-yellow-800">
        To withdraw earnings, please update your <a href="#" className="underline">tax information</a>. For more details, read our <a href="#" className="underline">FAQs</a>.
      </div>
      <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center text-center mb-2">
        <div className="text-lg font-medium mb-2">To withdraw earnings, first you need to set up a withdrawal method.</div>
        <div className="text-gray-500 mb-4 text-sm">It may take up to 3 days to activate your withdrawal method.</div>
        <button className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700">Add a method</button>
      </div>
    </div>
    {/* Two Cards Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl">
      <div className="bg-white rounded-lg border p-6">
        <div className="font-semibold mb-1">Withdrawal schedule</div>
        <div className="text-gray-600 text-sm">You haven't set up a schedule yet. You'll be able to set it up once you've added a withdrawal method.</div>
      </div>
      <div className="bg-white rounded-lg border p-6">
        <div className="font-semibold mb-1">Last withdrawal</div>
        <div className="text-gray-600 text-sm">You haven't made any withdrawals yet.</div>
      </div>
    </div>
    {/* Withdrawal Methods Card */}
    <div className="bg-white rounded-lg border p-6 max-w-3xl flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <div className="font-semibold mb-1">Withdrawal methods</div>
        <div className="text-gray-600 text-sm">You haven't set up any withdrawal methods yet.</div>
      </div>
      <button className="bg-white border border-green-600 text-green-600 rounded px-4 py-2 font-semibold hover:bg-green-50 mt-4 md:mt-0">Add a method</button>
    </div>
  </div>
);

export default GetPaid; 