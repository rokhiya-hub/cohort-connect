import { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/feed/PostCard';
import Spinner from '../components/common/Spinner';

export default function Saved() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchSavedPosts();
  }, [page]);

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/posts/saved?page=${page}&limit=10`);
      setPosts(response.data.posts);
      setTotalPages(response.data.pages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load saved posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cyan-300 mb-1">Saved Posts</h1>
        <p className="text-gray-400 text-sm">Your collection of saved posts</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-300 text-sm">
          {error}
        </div>
      )}

      {posts.length === 0 && !error ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔖</div>
          <p className="text-gray-400">No saved posts yet</p>
          <p className="text-gray-500 text-sm mt-2">Save posts to view them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={fetchSavedPosts} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
