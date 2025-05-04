import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  {
    section: 'Billing',
    items: [
      { label: 'Billing & Payments', to: '/profile/settings/billing' },
    ],
  },
  {
    section: 'User Settings',
    items: [
      { label: 'Membership & Connects', to: '/profile/settings/membership' },
      { label: 'Contact Info', to: '/profile/settings/contact' },
      { label: 'Profile Settings', to: '/profile/settings' },
      { label: 'Get Paid', to: '/profile/settings/get-paid' },
      { label: 'My Teams', to: '/profile/settings/my-teams' },
      { label: 'Password & Security', to: '/profile/settings/password-security' },
      { label: 'Notification Settings', to: '/profile/settings/notification-settings' },
    ],
  },
];

const isActive = (currentPath, linkPath) => {
  // Profile Settings is only active on exact /profile/settings
  if (linkPath === '/profile/settings') return currentPath === '/profile/settings';
  // Other links are active if currentPath starts with linkPath
  return currentPath.startsWith(linkPath);
};

const ProfileSettings = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isIndex = currentPath === '/profile/settings';

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-20">
      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden border">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white p-6 flex-shrink-0">
          <nav className="space-y-2">
            {navItems.map(section => (
              <div className="mb-6" key={section.section}>
                <h2 className="text-xs font-bold text-gray-500 uppercase mb-6 border-b border-gray-100">{section.section}</h2>
                {section.items.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block py-2 px-1 rounded transition font-medium ${
                      isActive(currentPath, item.to)
                        ? 'text-primary font-semibold bg-gray-100'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {isIndex ? (
            <>
              <h1 className="text-2xl font-bold mb-8">Settings</h1>
              {/* My Profile Section */}
              <section className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">My profile</h2>
                {/* Add fields for visibility, project preference, earnings privacy, etc. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Visibility</label>
                    <select className="mt-1 block w-full border-gray-300 rounded-md">
                      <option>Private</option>
                      <option>Public</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project preference</label>
                    <select className="mt-1 block w-full border-gray-300 rounded-md">
                      <option>Select project preference</option>
                    </select>
                  </div>
                </div>
              </section>
              {/* Experience Level Section */}
              <section className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Experience level</h2>
                <div className="flex gap-4">
                  <button className="border rounded-lg px-4 py-2 flex-1 text-left">Entry level<br /><span className="text-xs text-gray-500">I am relatively new to this field</span></button>
                  <button className="border rounded-lg px-4 py-2 flex-1 text-left border-primary bg-primary/10">Intermediate<br /><span className="text-xs text-gray-500">I have substantial experience in this field</span></button>
                  <button className="border rounded-lg px-4 py-2 flex-1 text-left">Expert<br /><span className="text-xs text-gray-500">I have comprehensive and deep expertise in this field</span></button>
                </div>
              </section>
              {/* Categories Section */}
              <section className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Categories</h2>
                  <button className="text-primary hover:underline">✏️</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Ecommerce Development</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Mobile Development</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Web Development</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Web & Mobile Design</span>
                </div>
              </section>
              {/* Linked Accounts Section */}
              <section className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Linked accounts</h2>
                <div className="flex gap-4">
                  <button className="border rounded px-4 py-2 flex-1">GitHub</button>
                  <button className="border rounded px-4 py-2 flex-1">StackOverflow</button>
                </div>
              </section>
            </>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings; 