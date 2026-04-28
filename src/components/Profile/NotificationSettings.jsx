import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

function maskEmail(email) {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return '*'.repeat(user.length) + '@' + domain;
  return user[0] + '*'.repeat(user.length - 2) + user.slice(-1) + '@' + domain;
}

const DEFAULT_PREFS = {
  desktopActivity: 'all',
  desktopSound: true,
  desktopCounter: 'all',
  mobileActivity: 'all',
  mobileCounter: 'all',
  emailActivity: 'all',
  emailFrequency: '15min',
  emailOfflineOnly: false,
  // recruiting
  recruitingFor: 'only_mine',
  recJobPosted: true,
  recProposalReceived: true,
  recInterviewAccepted: true,
  recInterviewDeclined: true,
  recOfferAccepted: true,
  recJobExpiring: true,
  recNoInterviews: true,
  // freelancer proposals
  fpInterviewInitiated: true,
  fpOfferReceived: true,
  fpOfferWithdrawn: true,
  fpProposalRejected: true,
  fpJobCancelled: false,
  fpProposalWithdrawn: true,
  // contracts
  contractsFor: 'only_hired',
  ctHireMade: true,
  ctTimeLogging: true,
  ctTermsModified: true,
  ctContractEnds: true,
  ctTimelogReview: true,
  ctFeedbackChanges: true,
  ctDailySnapshot: true,
  ctWeeklyBilling: true,
  ctOtherMessages: true,
  ctPaymentReceipts: false,
  // groups
  grpMembership: true,
  grpForwarded: true,
  grpInvitation: true,
  grpAccessRevoked: true,
  // membership
  memSubscription: true,
  // misc
  miscTips: true,
  miscLocalEvents: true,
  miscJobViewers: true,
  miscExpiringConnects: true,
  miscPurchasedConnects: true,
  // top talent
  topTalentRec: true,
  // comms
  commsUseful: true,
  // tax
  taxDigital: false,
};

const NotificationSettings = () => {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState('');
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserEmail(data.email || user.email || '');
          if (data.notificationPrefs) {
            setPrefs(prev => ({ ...prev, ...data.notificationPrefs }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [user]);

  const handleChange = useCallback((field, value) => {
    setPrefs(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { notificationPrefs: prefs });
      toast.success('Notification preferences saved');
    } catch (err) {
      console.error('Error saving notification prefs:', err);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ field }) => (
    <input
      type="checkbox"
      checked={!!prefs[field]}
      onChange={e => handleChange(field, e.target.checked)}
      className="form-checkbox rounded text-primary"
    />
  );

  const Select = ({ field, children }) => (
    <select
      value={prefs[field]}
      onChange={e => handleChange(field, e.target.value)}
      className="border rounded px-3 py-2 w-full max-w-xs focus:ring-primary focus:border-primary"
    >
      {children}
    </select>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">Notification settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Messages */}
      <div className="mb-12">
        <div className="flex gap-8 border-b mb-8">
          <span className="text-primary font-semibold border-b-2 border-primary pb-2">Messages</span>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-left">Desktop</h3>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4 justify-between">
            <div className="flex-1 text-left mb-2 md:mb-0">
              <label className="block text-sm font-medium mb-1">Show notifications for:</label>
              <Select field="desktopActivity">
                <option value="all">All activity</option>
                <option value="direct">Direct messages only</option>
                <option value="none">None</option>
              </Select>
            </div>
            <div className="flex items-center mt-2 md:mt-6">
              <Toggle field="desktopSound" />
              <label className="ml-2 text-sm">Also play a sound</label>
            </div>
          </div>
          <div className="flex-1 text-left">
            <label className="block text-sm font-medium mb-1">Increment message counter for:</label>
            <Select field="desktopCounter">
              <option value="all">All activity</option>
              <option value="direct">Direct messages only</option>
              <option value="none">None</option>
            </Select>
          </div>
        </div>
        <hr className="my-8" />
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-left">Mobile</h3>
          <div className="mb-4 text-left">
            <label className="block text-sm font-medium mb-1">Show notifications for:</label>
            <Select field="mobileActivity">
              <option value="all">All activity</option>
              <option value="direct">Direct messages only</option>
              <option value="none">None</option>
            </Select>
          </div>
          <div className="text-left">
            <label className="block text-sm font-medium mb-1">Increment message counter for:</label>
            <Select field="mobileCounter">
              <option value="all">All activity</option>
              <option value="direct">Direct messages only</option>
              <option value="none">None</option>
            </Select>
          </div>
        </div>
        <hr className="my-8" />
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Email</h3>
          <div className="text-sm text-gray-600 mb-2">(Sending to {maskEmail(userEmail)})</div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Send an email with unread activity for:</label>
              <Select field="emailActivity">
                <option value="all">All activity</option>
                <option value="direct">Direct messages only</option>
                <option value="none">None</option>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Frequency:</label>
              <Select field="emailFrequency">
                <option value="15min">Every 15 minutes</option>
                <option value="1hour">Every hour</option>
                <option value="daily">Daily digest</option>
              </Select>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Toggle field="emailOfflineOnly" />
            <label className="ml-2 text-sm">Only send when offline or idle</label>
          </div>
        </div>
      </div>

      {/* Email Updates */}
      <div className="mb-12">
        <div className="flex gap-8 border-b mb-8">
          <span className="text-primary font-semibold border-b-2 border-primary pb-2">Email updates</span>
        </div>
        <div className="text-sm text-gray-600 mb-6">Send email updates to {maskEmail(userEmail)} for the following.</div>

        <div className="mb-8 text-left">
          <h4 className="font-semibold mb-2">Recruiting</h4>
          <div className="mb-2">
            <label className="block mb-1 text-sm">Receive recruiting emails for:</label>
            <Select field="recruitingFor">
              <option value="only_mine">Only jobs I post</option>
              <option value="all">All jobs</option>
            </Select>
          </div>
          <div className="space-y-2 mt-3">
            {[
              ['recJobPosted', 'A job is posted or modified'],
              ['recProposalReceived', 'A proposal is received'],
              ['recInterviewAccepted', 'An interview is accepted or offer terms are modified'],
              ['recInterviewDeclined', 'An interview or offer is declined or withdrawn'],
              ['recOfferAccepted', 'An offer is accepted'],
              ['recJobExpiring', 'A job posting will expire soon'],
              ['recNoInterviews', 'No interviews have been initiated'],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <Toggle field={field} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-8 text-left">
          <h4 className="font-semibold mb-4">Freelancer and agency proposals</h4>
          <div className="space-y-2">
            {[
              ['fpInterviewInitiated', 'An interview is initiated'],
              ['fpOfferReceived', 'An offer or interview invitation is received'],
              ['fpOfferWithdrawn', 'An offer or interview invitation is withdrawn'],
              ['fpProposalRejected', 'A proposal is rejected'],
              ['fpJobCancelled', 'A job I applied to has been cancelled or closed'],
              ['fpProposalWithdrawn', 'A proposal is withdrawn'],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <Toggle field={field} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-8 text-left">
          <h4 className="font-semibold mb-2">Contracts</h4>
          <div className="mb-2">
            <label className="block mb-1 text-sm">Receive contract emails for:</label>
            <Select field="contractsFor">
              <option value="only_hired">Only freelancers I hire</option>
              <option value="all">All contracts</option>
            </Select>
          </div>
          <div className="space-y-2 mt-3">
            {[
              ['ctHireMade', 'A hire is made or a contract begins'],
              ['ctTimeLogging', 'Time logging begins'],
              ['ctTermsModified', 'Contract terms are modified'],
              ['ctContractEnds', 'A contract ends'],
              ['ctTimelogReview', 'A timelog is ready for review'],
              ['ctFeedbackChanges', 'Feedback changes are made'],
              ['ctDailySnapshot', 'Daily snapshot of time recorded by your freelancers'],
              ['ctWeeklyBilling', 'Weekly billing digest'],
              ['ctOtherMessages', 'Other contract related messages'],
              ['ctPaymentReceipts', 'Payment receipts and other financial related emails'],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <Toggle field={field} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-8 text-left">
          <h4 className="font-semibold mb-4">Groups and invitations</h4>
          <div className="space-y-2">
            {[
              ['grpMembership', 'Group membership events occur'],
              ['grpForwarded', "Someone forwards me a freelancer's profile"],
              ['grpInvitation', 'Someone sends me an invitation'],
              ['grpAccessRevoked', 'Team access is revoked'],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <Toggle field={field} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-8 text-left">
          <h4 className="font-semibold mb-4">Membership</h4>
          <label className="flex items-center gap-2 text-sm">
            <Toggle field="memSubscription" /> Subscription related events occur
          </label>
        </div>

        <div className="mb-8 text-left">
          <h4 className="font-semibold mb-4">Miscellaneous</h4>
          <div className="space-y-2">
            {[
              ['miscTips', 'SkillPay has a tip to help me start'],
              ['miscLocalEvents', 'Notify me of SkillPay events happening in my local area'],
              ['miscJobViewers', 'Notify me of who viewed my job post'],
              ['miscExpiringConnects', 'I have connects expiring soon'],
              ['miscPurchasedConnects', 'I have purchased or received connects'],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <Toggle field={field} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-8 text-left">
          <h4 className="font-semibold mb-4">Project recommendations for our Top Talent</h4>
          <label className="flex items-center gap-2 text-sm">
            <Toggle field="topTalentRec" /> Send recommendations if I qualify as top SkillPay talent
          </label>
        </div>

        <div className="mb-8 text-left">
          <h4 className="font-semibold mb-4">Communications from SkillPay</h4>
          <label className="flex items-center gap-2 text-sm">
            <Toggle field="commsUseful" /> Send me genuinely useful emails every now and then to help me get the most out of SkillPay
          </label>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="mb-12">
        <div className="flex gap-8 border-b mb-8">
          <span className="text-primary font-semibold border-b-2 border-primary pb-2">Tax settings</span>
        </div>
        <label className="flex items-center gap-2 mt-6 text-sm">
          <Toggle field="taxDigital" />
          I want to receive tax documents digitally (including Form 1099-K)
        </label>
      </div>

      <div className="sticky bottom-0 bg-white border-t py-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
