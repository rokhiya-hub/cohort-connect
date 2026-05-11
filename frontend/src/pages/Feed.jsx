import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/feed/PostCard';
import VideoCard from '../components/feed/VideoCard';
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
  const [trending, setTrending] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      const res = await api.get(`/posts/feed/unified?page=${pageNum}&limit=10`);
      const { posts: newPosts, pages } = res.data;
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setHasMore(pageNum < pages);
      setError('');
    } catch (err) {
      // Fallback to regular posts endpoint if unified feed fails
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
    }
  }, []);

  const fetchSidebar = useCallback(async () => {
    try {
      const [trendingRes, deadlinesRes] = await Promise.all([
        api.get('/posts/trending'),
        api.get('/posts/deadlines')
      ]);
      setTrending(trendingRes.data.posts);
      setDeadlines(deadlinesRes.data.posts);
    } catch {
      // Ignore errors for sidebar
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts(1).finally(() => setLoading(false));
    fetchSidebar();
  }, [fetchPosts, fetchSidebar]);

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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">Feed</h1>
          <p className="text-gray-400 text-sm">Latest posts from all users.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <PostCreator currentUser={user} onPost={handleNewPost} />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-400 text-sm">
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
              {posts.map((item) => (
                item.type === 'video' ? (
                  <VideoCard
                    key={item._id}
                    video={item}
                    currentUser={user}
                    onDelete={handleDeletePost}
                    onUpdate={handleUpdatePost}
                  />
                ) : (
                  <PostCard
                    key={item._id}
                    post={item}
                    currentUser={user}
                    onDelete={handleDeletePost}
                    onUpdate={handleUpdatePost}
                  />
                )
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
      </div>

      <aside className="space-y-6 hidden lg:block">
        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🔥</span>
            <div>
              <h2 className="text-white font-semibold">Trending</h2>
              <p className="text-gray-500 text-xs">Top community posts</p>
            </div>
          </div>
          <div className="space-y-4">
            {sidebarLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : trending.length === 0 ? (
              <p className="text-gray-500 text-sm">No trending posts yet</p>
            ) : (
              trending.map((post, index) => (
                <div key={post._id} className="rounded-3xl border border-gray-800 bg-gray-950 p-4">
                  <p className="text-xs text-indigo-400 uppercase tracking-[0.18em] mb-2">{String(index + 1).padStart(2, '0')}</p>
                  <p className="text-sm font-semibold text-white leading-snug">{post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{post.likeCount} likes · {post.views} views</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">📅</span>
            <div>
              <h2 className="text-white font-semibold">Deadlines</h2>
              <p className="text-gray-500 text-xs">Stay on schedule</p>
            </div>
          </div>
          <div className="space-y-3">
            {sidebarLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : deadlines.length === 0 ? (
              <p className="text-gray-500 text-sm">No deadline posts yet</p>
            ) : (
              deadlines.map((post, index) => (
                <div key={post._id} className="flex items-start gap-3 rounded-3xl border border-gray-800 bg-gray-950 p-4">
                  <div className="min-w-[48px] rounded-3xl bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white">
                    <div>{new Date(post.createdAt).getDate()}</div>
                    <div className="text-[10px] uppercase text-gray-500">{new Date(post.createdAt).toLocaleString('default', { month: 'short' })}</div>
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold">{post.content.length > 40 ? post.content.substring(0, 40) + '...' : post.content}</p>
                    <p className="text-xs text-gray-500">Posted by {post.author.fullName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">💡</span>
            <div>
              <h2 className="text-white font-semibold">Upload Tips</h2>
              <p className="text-gray-500 text-xs">Maximize views</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-400">
            <p>✅ Keep it under 15 mins</p>
            <p>✅ Mention company name</p>
            <p>✅ Good lighting = more views</p>
            <p>✅ Share what you wish you knew</p>
            <p>✅ Add a descriptive title</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
