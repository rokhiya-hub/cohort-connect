import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import PostCard from '../components/feed/PostCard';
import Spinner from '../components/common/Spinner';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Search() {
  const query = useQuery();
  const q = query.get('q') || '';
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q) {
      setLoading(false);
      setPosts([]);
      setProfiles([]);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const [postsRes, profilesRes] = await Promise.all([
          api.get('/posts?page=1&limit=50'),
          api.get(`/connections/peers?search=${encodeURIComponent(q)}`),
        ]);
        setPosts(postsRes.data.posts.filter((post) => post.content?.toLowerCase().includes(q.toLowerCase())));
        setProfiles(profilesRes.data);
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [q]);

  const headerText = q ? `Search results for “${q}”` : 'Search posts and profiles';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{headerText}</h1>
        <p className="text-gray-400 text-sm">{q ? 'Showing matching posts and users.' : 'Enter a query in the search bar to begin.'}</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : q ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Posts</h2>
            {posts.length === 0 ? (
              <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">No matching posts found.</div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} currentUser={{}} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Profiles</h2>
            {profiles.length === 0 ? (
              <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">No matching profiles found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map((profile) => (
                  <div key={profile._id} className="border border-gray-800 rounded-3xl bg-gray-900 p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {profile.fullName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{profile.fullName}</p>
                        <p className="text-gray-400 text-xs">{profile.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-3 line-clamp-3">{profile.bio || 'No bio available.'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
