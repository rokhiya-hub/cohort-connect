import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/feed/PostCard';
import PostCreator from '../components/feed/PostCreator';
import Spinner from '../components/common/Spinner';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      const res = await api.get(`/posts?page=${pageNum}&limit=10`);
      const { posts: newPosts, pages } = res.data;
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setHasMore(pageNum < pages);
    } catch {
      setError('Failed to load posts. Make sure the backend is running.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts(1).finally(() => setLoading(false));
  }, [fetchPosts]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    await fetchPosts(next);
    setLoadingMore(false);
  };

  const handleNewPost = (post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost } : p)));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Feed</h1>
        <p className="text-gray-400 text-sm">Latest from your cohort</p>
      </div>

      <div className="mb-6">
        <PostCreator currentUser={user} onPost={handleNewPost} />
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
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-medium text-gray-400">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onDelete={handleDeletePost}
              onUpdate={handleUpdatePost}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Spinner size="sm" /> : null}
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-gray-600 text-sm py-4">You've seen all posts</p>
          )}
        </div>
      )}
    </div>
  );
}
