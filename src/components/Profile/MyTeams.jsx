import React from 'react';

const MyTeams = () => (
  <div>
    <div className="bg-white rounded-lg border p-8 max-w-2xl mx-auto flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-2 w-full text-left">My teams</h2>
      <div className="text-gray-600 mb-6 w-full text-left text-sm">Teams are used to group contract by department or manager</div>
      <div className="flex flex-col items-center justify-center">
        {/* Emoji or SVG illustration */}
        <span style={{fontSize: '64px'}} role="img" aria-label="no teams">📄<span style={{fontSize: '32px', position: 'relative', left: '-20px', top: '10px'}}>🔍❌</span></span>
        <div className="mt-6 text-gray-500">There are no teams</div>
      </div>
    </div>
  </div>
);

export default MyTeams; 