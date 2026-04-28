import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userGigs, setUserGigs] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedRate: '',
    estimatedTimeline: '',
    relevantExperience: '',
    revisions: 'unlimited',
    backSupport: false,
    referenceGig: '',
    portfolioLinks: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchJob();
    fetchUserGigs();
  }, [jobId, user]);

  const fetchJob = async () => {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (!jobDoc.exists()) {
        toast.error('Job not found');
        navigate('/jobs');
        return;
      }
      const jobData = { id: jobDoc.id, ...jobDoc.data() };

      if (jobData.clientId === user.uid) {
        toast.error('You cannot apply to your own job');
        navigate(`/jobs/${jobId}`);
        return;
      }

      const alreadyApplied = query(
        collection(db, 'applications'),
        where('jobId', '==', jobId),
        where('freelancerId', '==', user.uid)
      );
      const existing = await getDocs(alreadyApplied);
      if (!existing.empty) {
        toast.error('You have already applied to this job');
        navigate(`/jobs/${jobId}`);
        return;
      }

      setJob(jobData);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGigs = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'gigs'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setUserGigs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Error fetching gigs:', e);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      const urls = await Promise.all(files.map(async (file) => {
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: 'POST', body: fd });
        const data = await res.json();
        return data.data?.url || null;
      }));
      const valid = urls.filter(Boolean);
      const next = [...uploadedFiles, ...valid];
      setUploadedFiles(next);
      setFormData(prev => ({ ...prev, portfolioLinks: next.join('\n') }));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    const next = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(next);
    setFormData(prev => ({ ...prev, portfolioLinks: next.join('\n') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.coverLetter.trim() || !formData.proposedRate || !formData.estimatedTimeline) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const applicationData = {
        jobId: job.id,
        freelancerId: user.uid,
        freelancerName: user.fullName || user.displayName || 'Anonymous',
        freelancerPhoto: user.avatar || user.photoURL || '',
        clientId: job.clientId,
        coverLetter: formData.coverLetter,
        proposedRate: Number(formData.proposedRate),
        estimatedTimeline: Number(formData.estimatedTimeline),
        relevantExperience: formData.relevantExperience,
        portfolioLinks: formData.portfolioLinks,
        revisions: formData.revisions,
        backSupport: formData.backSupport,
        referenceGig: formData.referenceGig,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const applicationRef = await addDoc(collection(db, 'applications'), applicationData);

      await updateDoc(doc(db, 'jobs', job.id), {
        applications: [...(job.applications || []), user.uid]
      });

      await addDoc(collection(db, 'notifications'), {
        userId: job.clientId,
        type: 'new_application',
        title: 'New Application Received',
        message: `${user.fullName || user.displayName || 'A freelancer'} applied to "${job.title}"`,
        read: false,
        createdAt: serverTimestamp(),
        jobId: job.id,
        data: {
          freelancerName: user.fullName || user.displayName || 'Anonymous',
          freelancerPhoto: user.avatar || user.photoURL || '',
          applicationId: applicationRef.id
        }
      });

      toast.success('Application submitted successfully!');
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) return null;

  const isClosed = job.status === 'hired' || job.status === 'in_progress';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="mb-6 inline-flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Job
        </button>

        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Job</h1>
          <p className="text-gray-600 mb-6 font-medium">{job.title}</p>

          {isClosed ? (
            <div className="p-8 text-center text-blue-700 font-semibold text-lg">
              This position has been filled. Applications are closed.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange}
                      required
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Write your cover letter here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relevant Experience <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="relevantExperience"
                      value={formData.relevantExperience}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Describe your relevant experience..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio / Work Samples
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <label className="cursor-pointer text-primary hover:text-primary-dark text-sm font-medium">
                          <span>Upload files</span>
                          <input type="file" multiple className="sr-only" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
                        </label>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC up to 10MB</p>
                      </div>
                    </div>
                    {isUploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-600 truncate">{url.split('/').pop()}</span>
                            <button type="button" onClick={() => handleRemoveFile(idx)} className="text-red-500 hover:text-red-700">
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {job.type === 'fixed' ? 'Proposed Budget' : 'Proposed Hourly Rate'} ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="proposedRate"
                      value={formData.proposedRate}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Timeline (days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="estimatedTimeline"
                      value={formData.estimatedTimeline}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Number of days"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Revisions</label>
                    <select
                      name="revisions"
                      value={formData.revisions}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="unlimited">Unlimited Revisions</option>
                      {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} Revision{i + 1 !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="backSupport"
                      checked={formData.backSupport}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">I will provide free back support</label>
                  </div>

                  {userGigs.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attach a Relevant Gig (Optional)
                      </label>
                      <select
                        name="referenceGig"
                        value={formData.referenceGig}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      >
                        <option value="">-- Select a gig --</option>
                        {userGigs.map(gig => (
                          <option key={gig.id} value={gig.id}>{gig.title} — ${gig.price}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${jobId}`)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
