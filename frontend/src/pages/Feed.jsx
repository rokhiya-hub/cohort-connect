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
          <h1 className="text-2xl font-bold text-[#2563FF] mb-1">Feed</h1>
          <p className="text-gray-500 text-sm">Latest posts from all users.</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0b1f44] via-[#10254f] to-[#122a5c] border border-blue-300/20 shadow-[0_20px_60px_-30px_rgba(37,99,255,0.4)]">
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
        <section className="rounded-[28px] border border-blue-200/40 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(37,99,255,0.35)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2563FF] to-[#8B5CF6] text-purple-100 shadow-lg shadow-blue-500/20">
              <span className="text-xl">🔥</span>
            </div>
            <div>
              <h2 className="text-[#2563FF] font-semibold text-lg">Trending</h2>
              <p className="text-slate-500 text-sm">Top community posts</p>
            </div>
          </div>
          <div className="space-y-4">
            {sidebarLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : trending.length === 0 ? (
              <p className="text-slate-500 text-sm">No trending posts yet</p>
            ) : (
              trending.map((post, index) => (
                <div key={post._id} className="group rounded-[24px] border border-blue-200/20 bg-gradient-to-br from-[#111d44] via-[#0f1f56] to-[#081f49] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#2563FF]/25">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.26em] text-[#8B5CF6]">{String(index + 1).padStart(2, '0')}</span>
                    <span className="inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[11px] font-medium text-sky-100">Hot</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-100 leading-snug min-h-[52px]">
                    {post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="rounded-full bg-sky-300/10 px-3 py-1 text-sky-100">{post.likeCount} likes</span>
                    <span className="rounded-full bg-slate-100/5 px-3 py-1 text-slate-200">{post.views} views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-200/50 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">📅</span>
            <div>
              <h2 className="text-[#2563FF] font-semibold">Deadlines</h2>
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
                <div key={post._id} className="flex items-start gap-3 rounded-2xl border border-blue-200/30 bg-[#081225] p-4 shadow-sm">
                  <div className="min-w-[48px] rounded-2xl bg-[#2563FF] px-3 py-2 text-center text-sm font-semibold text-purple-100 shadow-sm">
                    <div>{new Date(post.createdAt).getDate()}</div>
                    <div className="text-[10px] uppercase text-gray-200">{new Date(post.createdAt).toLocaleString('default', { month: 'short' })}</div>
                  </div>
                  <div>
                    <p className="text-sm text-purple-100 font-semibold">{post.content.length > 40 ? post.content.substring(0, 40) + '...' : post.content}</p>
                    <p className="text-xs text-gray-400">Posted by {post.author.fullName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-200/50 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">💡</span>
            <div>
              <h2 className="text-[#2563FF] font-semibold">Upload Tips</h2>
              <p className="text-gray-500 text-xs">Maximize views</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
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
