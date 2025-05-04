import React, { useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, updateDoc, getDocs, collection, query, where, deleteDoc, getDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { toast } from 'react-hot-toast';

function maskEmail(email) {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return '*'.repeat(user.length) + '@' + domain;
  return user[0] + '*'.repeat(user.length - 2) + user.slice(-1) + '@' + domain;
}

function maskPhone(phone) {
  if (!phone) return '';
  // Keep first 2 and last 2 digits visible, mask the rest
  return phone.replace(/(\d{2})\d+(\d{2})/, '$1****$2');
}

const ContactInfo = () => {
  const { user } = useAuth();
  const [showEditId, setShowEditId] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [userIdInput, setUserIdInput] = useState(user?.userId || '');
  const [idError, setIdError] = useState('');
  const [idLoading, setIdLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [locationData, setLocationData] = useState({
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    address: '',
    phone: ''
  });
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setLocationData({
              timeZone: userData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              address: userData.address || '',
              phone: userData.phone || ''
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load user data');
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Check if userId is unique
  const checkUserIdUnique = async (id) => {
    if (!id) return false;
    const q = query(collection(db, 'users'), where('userId', '==', id));
    const snap = await getDocs(q);
    return snap.empty || (snap.docs.length === 1 && snap.docs[0].id === user.uid);
  };

  // Save new userId
  const handleSaveUserId = async (e) => {
    e.preventDefault();
    setIdError('');
    setIdLoading(true);
    try {
      const unique = await checkUserIdUnique(userIdInput.trim());
      if (!unique) {
        setIdError('This User ID is already taken. Please choose another.');
        setIdLoading(false);
        return;
      }
      await updateDoc(doc(db, 'users', user.uid), { userId: userIdInput.trim() });
      setShowEditId(false);
    } catch (err) {
      setIdError('Error updating User ID.');
    } finally {
      setIdLoading(false);
    }
  };

  // Save location data
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setLocationLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        timeZone: locationData.timeZone,
        address: locationData.address,
        phone: locationData.phone
      });
      toast.success('Location information updated successfully');
      setShowEditLocation(false);
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location information');
    } finally {
      setLocationLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      setDeleteSuccess('Account deleted.');
      window.location.href = '/';
    } catch (err) {
      setDeleteError('Failed to delete account. Please re-authenticate and try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const userIdSet = Boolean(user?.userId);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8">Contact info</h2>
      {/* Account Section */}
      <div className="bg-white rounded-lg border p-6 mb-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-primary"
          onClick={() => { setShowEditId(true); setIdError(''); }}
          title="View Account Details"
        >
          <FiEdit2 />
        </button>
        <h3 className="text-lg font-semibold mb-4">Account</h3>
        <div className="space-y-1 text-gray-800">
          <div><span className="font-semibold">User ID</span> <span className="ml-2">{user?.userId || <span className="text-gray-400">Not set</span>}</span></div>
          <div><span className="font-semibold">Name</span> <span className="ml-2">{user?.fullName || user?.displayName || '—'}</span></div>
          <div><span className="font-semibold">Email</span> <span className="ml-2">{maskEmail(user?.email) || '—'}</span></div>
        </div>
        <button className="mt-4 text-red-600 hover:underline text-sm" onClick={() => setShowDelete(true)}>Close my account</button>
      </div>
      {/* Edit User ID Modal */}
      {showEditId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-primary text-xl" onClick={() => setShowEditId(false)}>&times;</button>
            <h4 className="text-lg font-semibold mb-4">Account Details</h4>
            <div className="mb-4 space-y-2">
              <div><span className="font-semibold">Name:</span> <span className="ml-2">{user?.fullName || user?.displayName || '—'}</span></div>
              <div><span className="font-semibold">Email:</span> <span className="ml-2">{user?.email || '—'}</span></div>
              <div><span className="font-semibold">Current User ID:</span> <span className="ml-2">{user?.userId || 'Not set'}</span></div>
            </div>
            {!userIdSet && (
              <form onSubmit={handleSaveUserId} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Set User ID</label>
                  <input 
                    type="text" 
                    value={userIdInput} 
                    onChange={e => setUserIdInput(e.target.value)} 
                    className="border rounded px-3 py-2 w-full" 
                    required 
                  />
                </div>
                {idError && <div className="text-red-600 text-sm">{idError}</div>}
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 w-full" disabled={idLoading}>
                  {idLoading ? 'Saving...' : 'Save User ID'}
                </button>
              </form>
            )}
            {userIdSet && (
              <div className="text-sm text-gray-600 mt-4">
                Note: User ID can only be set once and cannot be changed after setting.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete Account Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-primary text-xl" onClick={() => setShowDelete(false)}>&times;</button>
            <h4 className="text-lg font-semibold mb-4 text-red-600">Delete Account</h4>
            <p className="mb-4 text-gray-700">Are you sure you want to <span className="font-semibold text-red-600">permanently delete</span> your account? This action cannot be undone.</p>
            {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
            {deleteSuccess && <div className="text-green-600 text-sm mb-2">{deleteSuccess}</div>}
            <div className="flex gap-4 mt-6">
              <button className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700 flex-1" onClick={handleDeleteAccount} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Yes, delete my account'}</button>
              <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 flex-1" onClick={() => setShowDelete(false)}>No, keep my account</button>
            </div>
          </div>
        </div>
      )}
      {/* Additional Accounts Section */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Additional accounts</h3>
        <p className="text-gray-600 mb-4 text-sm">Creating a new account allows you to use Upwork in different ways, while still having just one login.</p>
        <div className="mb-4">
          <div className="font-semibold mb-1">Client Account</div>
          <div className="text-gray-600 text-sm mb-2">Hire, manage and pay as a different company. Each client company has its own freelancers, payment methods and reports.</div>
          <button className="border border-green-600 text-green-600 rounded px-4 py-1 font-medium hover:bg-green-50">New Client Account</button>
        </div>
        <div>
          <div className="font-semibold mb-1">Agency Account</div>
          <div className="text-gray-600 text-sm mb-2">Find jobs and earn money as manager of a team of freelancers.</div>
          <button className="border border-green-600 text-green-600 rounded px-4 py-1 font-medium hover:bg-green-50">New Agency Account</button>
        </div>
      </div>
      {/* Location Section */}
      <div className="bg-white rounded-lg border p-6 relative">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-primary"
          onClick={() => setShowEditLocation(true)}
          title="Edit Location Information"
        >
          <FiEdit2 />
        </button>
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Time Zone</span>
            <span className="ml-2 text-gray-700">{locationData.timeZone}</span>
          </div>
          <div>
            <span className="font-semibold">Address</span>
            <div className="ml-2 text-gray-700 whitespace-pre-line">
              {locationData.address || 'Not set'}
            </div>
          </div>
          <div>
            <span className="font-semibold">Phone</span>
            <span className="ml-2 text-gray-700">
              {locationData.phone ? maskPhone(locationData.phone) : 'Not set'}
            </span>
          </div>
        </div>
      </div>
      {/* Edit Location Modal */}
      {showEditLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-primary text-xl"
              onClick={() => setShowEditLocation(false)}
            >
              &times;
            </button>
            <h4 className="text-lg font-semibold mb-4">Edit Location Information</h4>
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Time Zone</label>
                <select
                  value={locationData.timeZone}
                  onChange={(e) => setLocationData(prev => ({ ...prev, timeZone: e.target.value }))}
                  className="border rounded px-3 py-2 w-full"
                >
                  {Intl.supportedValuesOf('timeZone').map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={locationData.address}
                  onChange={(e) => setLocationData(prev => ({ ...prev, address: e.target.value }))}
                  className="border rounded px-3 py-2 w-full"
                  rows="3"
                  placeholder="Enter your full address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={locationData.phone}
                  onChange={(e) => setLocationData(prev => ({ ...prev, phone: e.target.value }))}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter your phone number"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 w-full"
                disabled={locationLoading}
              >
                {locationLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInfo; 