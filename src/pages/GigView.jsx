import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserIcon, CurrencyDollarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const GigView = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      try {
        const gigDoc = await getDoc(doc(db, 'gigs', gigId));
        if (gigDoc.exists()) {
          setGig({ id: gigDoc.id, ...gigDoc.data() });
        } else {
          setGig(null);
        }
      } catch (e) {
        setGig(null);
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [gigId]);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading gig...</div>;
  if (!gig) return <div className="py-20 text-center text-red-500">Gig not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-primary hover:underline">
        <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
      </button>
      <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{gig.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <UserIcon className="h-5 w-5 text-gray-400" />
          <span className="text-gray-700 font-medium">{gig.ownerName || 'Unknown Owner'}</span>
          <CurrencyDollarIcon className="h-5 w-5 text-gray-400 ml-4" />
          <span className="text-primary font-semibold text-lg">${gig.price}</span>
        </div>
        {gig.images && gig.images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            {gig.images.map((img, idx) => (
              <img key={idx} src={img} alt="Gig" className="rounded-lg border object-cover w-full h-40" />
            ))}
          </div>
        )}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
        </div>
        {gig.skills && (
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {gig.skills.split(',').map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{skill.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GigView; 