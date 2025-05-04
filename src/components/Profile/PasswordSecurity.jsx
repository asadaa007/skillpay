import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, linkWithPopup } from 'firebase/auth';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordSecurity = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRe, setShowRe] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is logged in with Google
  const isGoogle = user?.providerData?.some(p => p.providerId === 'google.com');

  // Modal submit handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== rePassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (!isGoogle) {
        // Re-authenticate with old password
        const cred = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, cred);
      }
      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully!');
      setShowModal(false);
      setOldPassword(''); setNewPassword(''); setRePassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google connect handler
  const handleGoogleConnect = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(user, provider);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8">Password and security</h2>
      {/* Login Section */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-6">Login</h3>
        <div className="mb-6">
          <div className="font-semibold">SkillPay password</div>
          <div className="text-gray-600 text-sm mb-1">
            You've set a SkillPay password. <button className="text-green-700 underline" onClick={() => { setShowModal(true); setError(''); setSuccess(''); }}>Change password</button>
          </div>
        </div>
        {/* Change Password Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-primary text-xl" onClick={() => setShowModal(false)}>&times;</button>
              <h4 className="text-lg font-semibold mb-4">Change Password</h4>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {!isGoogle && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Old password</label>
                    <div className="relative">
                      <input type={showOld ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="border rounded px-3 py-2 w-full pr-10" required />
                      <button type="button" className="absolute right-2 top-2 text-gray-500" onClick={() => setShowOld(v => !v)}>{showOld ? <FiEyeOff /> : <FiEye />}</button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">New password</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="border rounded px-3 py-2 w-full pr-10" required />
                    <button type="button" className="absolute right-2 top-2 text-gray-500" onClick={() => setShowNew(v => !v)}>{showNew ? <FiEyeOff /> : <FiEye />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Re-enter new password</label>
                  <div className="relative">
                    <input type={showRe ? 'text' : 'password'} value={rePassword} onChange={e => setRePassword(e.target.value)} className="border rounded px-3 py-2 w-full pr-10" required />
                    <button type="button" className="absolute right-2 top-2 text-gray-500" onClick={() => setShowRe(v => !v)}>{showRe ? <FiEyeOff /> : <FiEye />}</button>
                  </div>
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 w-full" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>
              </form>
            </div>
          </div>
        )}
        {/* Google Login Row */}
        <div className="flex items-center justify-between border-t border-b py-6">
          <div>
            <div className="font-semibold text-left">Log in with Google</div>
            <div className="text-gray-600 text-sm text-left">
              {isGoogle
                ? 'Connected. You are logged in with Google.'
                : 'Not connected. You can choose to log in with Google.'}
            </div>
          </div>
          {!isGoogle && (
            <button className="border border-green-600 text-green-600 rounded px-6 py-2 font-semibold hover:bg-green-50" onClick={handleGoogleConnect}>Connect</button>
          )}
        </div>
      </div>
      {/* Two-step verification Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Two-step verification</h3>
          <button className="text-green-700 text-xl" title="Manage two-step verification">
            <span role="img" aria-label="settings">⚙️</span>
          </button>
        </div>
        <div className="flex items-center justify-between border-t py-6">
          <div>
            <div className="font-semibold text-left">Mobile app notifications</div>
            <div className="text-gray-600 text-sm">Verify notifications with your SkillPay mobile app.</div>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" disabled />
            <span className="w-11 h-6 bg-gray-200 rounded-full relative transition-colors duration-200"></span>
          </label>
        </div>
        <div className="flex items-center justify-between border-t py-6">
          <div>
            <div className="font-semibold text-left">Authenticator app codes</div>
            <div className="text-gray-600 text-sm">Verify one-time codes generated in your preferred third party authenticator app.</div>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" disabled />
            <span className="w-11 h-6 bg-gray-200 rounded-full relative transition-colors duration-200"></span>
          </label>
        </div>
        <div className="flex items-center justify-between border-t py-6">
          <div>
            <div className="font-semibold text-left">Security question and answer</div>
            <div className="text-gray-600 text-sm text-left">You've set up a question to answer when you can't use your mobile device for two-step verification. <a href="#" className="text-green-700 underline">Update question and answer</a></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordSecurity; 