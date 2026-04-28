import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

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
  if (linkPath === '/profile/settings') return currentPath === '/profile/settings';
  return currentPath.startsWith(linkPath);
};

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry level', description: 'I am relatively new to this field' },
  { value: 'intermediate', label: 'Intermediate', description: 'I have substantial experience in this field' },
  { value: 'expert', label: 'Expert', description: 'I have comprehensive and deep expertise in this field' },
];

const VISIBILITY_OPTIONS = ['Public', 'Private', 'Connections only'];
const PROJECT_PREFS = ['Long-term projects', 'Short-term projects', 'Both', 'No preference'];

const ProfileSettings = () => {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const isIndex = currentPath === '/profile/settings';

  const [settings, setSettings] = useState({
    visibility: 'Public',
    projectPreference: 'No preference',
    experienceLevel: 'intermediate',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !isIndex) return;
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setSettings(prev => ({
            ...prev,
            visibility: data.visibility || prev.visibility,
            projectPreference: data.projectPreference || prev.projectPreference,
            experienceLevel: data.experienceLevel || prev.experienceLevel,
          }));
        }
      } catch (err) {
        console.error('Error loading profile settings:', err);
      }
    };
    fetchSettings();
  }, [user, isIndex]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        visibility: settings.visibility,
        projectPreference: settings.projectPreference,
        experienceLevel: settings.experienceLevel,
      });
      toast.success('Settings saved');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Settings</h1>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>

              {/* My Profile Section */}
              <section className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">My profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                    <select
                      value={settings.visibility}
                      onChange={e => setSettings(s => ({ ...s, visibility: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    >
                      {VISIBILITY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project preference</label>
                    <select
                      value={settings.projectPreference}
                      onChange={e => setSettings(s => ({ ...s, projectPreference: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    >
                      {PROJECT_PREFS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* Experience Level Section */}
              <section className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Experience level</h2>
                <div className="flex gap-4">
                  {EXPERIENCE_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, experienceLevel: level.value }))}
                      className={`border rounded-lg px-4 py-2 flex-1 text-left transition-colors ${
                        settings.experienceLevel === level.value
                          ? 'border-primary bg-primary/10 font-semibold'
                          : 'hover:border-gray-400'
                      }`}
                    >
                      {level.label}<br />
                      <span className="text-xs text-gray-500">{level.description}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Linked Accounts Section */}
              <section className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Linked accounts</h2>
                <div className="flex gap-4">
                  <button className="border rounded px-4 py-2 flex-1 hover:bg-gray-50 transition-colors">GitHub</button>
                  <button className="border rounded px-4 py-2 flex-1 hover:bg-gray-50 transition-colors">StackOverflow</button>
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
