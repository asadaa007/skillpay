import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

function maskEmail(email) {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return '*'.repeat(user.length) + '@' + domain;
    return user[0] + '*'.repeat(user.length - 2) + user.slice(-1) + '@' + domain;
}

const NotificationSettings = () => {
    const { user } = useAuth();
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserEmail(userData.email || user.email || '');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [user]);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-8">Notification settings</h2>
            {/* Messages Section */}
            <div className="mb-12">
                <div className="flex gap-8 border-b mb-8">
                    <span className="text-green-700 font-semibold border-b-2 border-green-700 pb-2">Messages</span>
                </div>
                {/* Desktop */}
                <div className="mb-8">
                    <h3 className="text-lg text-left font-semibold mb-4">Desktop</h3>
                    <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4 justify-between">
                        <div className="flex-1 text-left mb-2 md:mb-0">
                            <label className="block text-sm font-medium mb-1">Show notifications for:</label>
                            <select className="border rounded px-3 py-2 w-full max-w-xs">
                                <option>All activity</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-2 md:mt-6">
                            <input type="checkbox" className="form-checkbox mr-2" id="desktop-sound" />
                            <label htmlFor="desktop-sound" className="text-sm">Also play a sound</label>
                        </div>
                    </div>
                    <div className="flex-1 text-left">
                        <label className="block text-sm font-medium mb-1">Increment message counter for:</label>
                        <select className="border rounded px-3 py-2 w-full max-w-xs">
                            <option>All activity</option>
                        </select>
                    </div>
                </div>
                <hr className="my-8" />
                {/* Mobile */}
                <div className="mb-8">
                    <h3 className="text-lg text-left font-semibold mb-4">Mobile</h3>
                    <div className="mb-4 text-left">
                        <label className="block text-sm font-medium mb-1">Show notifications for:</label>
                        <select className="border rounded px-3 py-2 w-full max-w-xs">
                            <option>All activity</option>
                        </select>
                    </div>
                    <div className="text-left">
                        <label className="block text-sm font-medium mb-1">Increment message counter for:</label>
                        <select className="border rounded px-3 py-2 w-full max-w-xs">
                            <option>All activity</option>
                        </select>
                    </div>
                </div>
                <hr className="my-8" />
                {/* Email */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Email</h3>
                    <div className="text-sm text-gray-600 mb-2">(Sending to {maskEmail(userEmail)})</div>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Send an email with unread activity for:</label>
                            <select className="border rounded px-3 py-2 w-full max-w-xs">
                                <option>All activity</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">&nbsp;</label>
                            <select className="border rounded px-3 py-2 w-full max-w-xs">
                                <option>Every 15 minutes</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center mt-2">
                        <input type="checkbox" className="form-checkbox mr-2" id="email-offline" />
                        <label htmlFor="email-offline" className="text-sm">Only send when offline or idle</label>
                    </div>
                </div>
            </div>
            {/* Email Updates Section */}
            <div className="mb-12">
                <div className="flex gap-8 border-b mb-8">
                    <span className="text-green-700 font-semibold border-b-2 border-green-700 pb-2">Email updates</span>
                </div>
                <div className="text-sm text-gray-600 mb-6">Send email updates to {maskEmail(userEmail)} for the following.</div>
                {/* Recruiting */}
                <div className="mb-8 text-left">
                    <h4 className="font-semibold mb-2">Recruiting</h4>
                    <div className="mb-2">
                        <label className="block mb-1">Receive recruiting emails for:</label>
                        <select className="border rounded px-3 py-2 mb-2 w-full max-w-xs">
                            <option>Only jobs I post</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />A job is posted or modified</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />A proposal is received</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />An interview is accepted or offer terms are modified</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />An interview or offer is declined or withdrawn</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />An offer is accepted</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />A job posting will expire soon</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />No interviews have been initiated</label>
                    </div>
                </div>
                {/* Freelancer and agency proposals */}
                <div className="mb-8">
                    <h4 className="font-semibold text-left mb-6">Freelancer and agency proposals</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />An interview is initiated</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />An offer or interview invitation is received</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />An offer or interview invitation is withdrawn</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />A proposal is rejected</label>
                        <label className="flex items-center gap-2"><input type="checkbox" />A job I applied to has been cancelled or closed</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />A proposal is withdrawn</label>
                    </div>
                </div>
                {/* Contracts */}
                <div className="mb-8 text-left">
                    <h4 className="font-semibold mb-2">Contracts</h4>
                    <div className="mb-2">
                        <label className="block mb-1">Receive contract emails for:</label>
                        <select className="border rounded px-3 py-2 mb-2 w-full max-w-xs">
                            <option>Only freelancers I hire</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />A hire is made or a contract begins</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Time logging begins</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Contract terms are modified</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />A contract ends</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />A timelog is ready for review</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Feedback changes are made</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Daily snapshot of time recorded by your freelancers</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Weekly billing digest</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Other contract related messages</label>
                        <label className="flex items-center gap-2"><input type="checkbox" />Payment receipts and other financial related emails</label>
                    </div>
                </div>
                {/* Groups and invitations */}
                <div className="mb-8 text-left">
                    <h4 className="font-semibold mb-6">Groups and invitations</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Group membership events occur</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Someone forwards me a freelancer's profile</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Someone sends me an invitation</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Team access is revoked</label>
                    </div>
                </div>
                {/* Membership */}
                <div className="mb-8 text-left">
                    <h4 className="font-semibold mb-6">Membership</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Subscription related event occur</label>
                    </div>
                </div>
                {/* Miscellaneous */}
                <div className="mb-8 text-left">
                    <h4 className="font-semibold mb-6">Miscellaneous</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />SkillPay has a tip to help me start</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Notify me of SkillPay events happening in my local area</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Notify me of who viewed my job post</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />I have connects expiring soon</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />I have purchased or received connects</label>
                    </div>
                </div>
                {/* Project recommendations for our Top Talent */}
                <div className="mb-8 text-left">
                    <h4 className="font-semibold mb-6">Project recommendations for our Top Talent</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Send recommendations if I qualify as top SkillPay talent</label>
                    </div>
                </div>
                {/* Communications from SkillPay */}
                <div className="mb-8 text-left">
                    <h4 className="font-semibold mb-6">Communications from SkillPay</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2"><input type="checkbox" checked readOnly />Send me genuinely useful emails every now and then to help me get the most out of SkillPay</label>
                    </div>
                </div>
            </div>
            {/* Tax Settings Section */}
            <div className="mb-12">
                <div className="flex gap-8 border-b mb-8">
                    <span className="text-green-700 font-semibold border-b-2 border-green-700 pb-2">Tax settings</span>
                </div>
                <label className="flex items-center gap-2 mt-6">
                    <input type="checkbox" className="form-checkbox" />
                    I want to receive tax documents digitally (including Form 1099-K)
                </label>
            </div>
        </div>
    );
};

export default NotificationSettings; 