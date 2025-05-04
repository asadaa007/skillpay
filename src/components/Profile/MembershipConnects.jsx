import React from 'react';

const MembershipConnects = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-8">Membership & Connects</h2>
    <div className="bg-gray-50 rounded-lg border p-12 flex flex-col items-center justify-center max-w-3xl mx-auto">
      {/* You can replace this emoji with an SVG or image if you have one */}
      <div className="mb-6">
        <span style={{fontSize: '64px'}} role="img" aria-label="profile">🪪</span>
      </div>
      <p className="text-gray-700 text-lg text-center">
        Once your profile has been approved you can view your membership plan on this page.
      </p>
    </div>
  </div>
);

export default MembershipConnects; 