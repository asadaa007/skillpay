import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserCircleIcon, LinkIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const PublicPortfolio = () => {
  const { userId } = useParams();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const [userSnap, portfolioSnap] = await Promise.all([
          getDoc(doc(db, 'users', userId)),
          getDocs(query(collection(db, 'portfolio'), where('userId', '==', userId))),
        ]);
        if (userSnap.exists()) setOwner({ id: userSnap.id, ...userSnap.data() });
        const portfolioItems = portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        portfolioItems.sort((a, b) => {
          const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return tb - ta;
        });
        setItems(portfolioItems);
      } catch (err) {
        console.error('Error loading public portfolio:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Portfolio not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Owner card */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 flex items-center gap-6 border border-gray-100">
          {owner.avatarUrl || owner.avatar || owner.photoURL ? (
            <img
              src={owner.avatarUrl || owner.avatar || owner.photoURL}
              alt={owner.fullName || owner.displayName}
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <UserCircleIcon className="w-20 h-20 text-gray-300" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{owner.fullName || owner.displayName || 'Freelancer'}</h1>
            {owner.bio && <p className="text-gray-600 mt-1 text-sm line-clamp-2">{owner.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-3">
              {owner.skills?.slice(0, 6).map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{skill}</span>
              ))}
            </div>
          </div>
          <Link
            to={`/profile/${userId}`}
            className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
          >
            <UserCircleIcon className="h-4 w-4" /> View profile
          </Link>
        </div>

        {/* Portfolio items */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <EyeIcon className="h-12 w-12 mx-auto mb-3" />
            <p className="text-lg">No portfolio items yet.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              Portfolio <span className="text-gray-400 text-base font-normal">({items.length} items)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow text-left"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                      <LinkIcon className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="h-3.5 w-3.5" /> {item.views || 0}
                      </span>
                      {item.projectUrl && (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <LinkIcon className="h-3.5 w-3.5" /> View project
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.title} className="w-full h-64 object-cover rounded-t-xl" />
            )}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selected.title}</h2>
              {selected.category && (
                <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">{selected.category}</span>
              )}
              {selected.description && (
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{selected.description}</p>
              )}
              {selected.technologies?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.technologies.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                {selected.projectUrl && (
                  <a
                    href={selected.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1 font-medium"
                  >
                    <LinkIcon className="h-4 w-4" /> Live project
                  </a>
                )}
                {selected.githubUrl && (
                  <a
                    href={selected.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:underline text-sm flex items-center gap-1"
                  >
                    GitHub
                  </a>
                )}
                <button onClick={() => setSelected(null)} className="ml-auto text-gray-400 hover:text-gray-600 text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicPortfolio;
