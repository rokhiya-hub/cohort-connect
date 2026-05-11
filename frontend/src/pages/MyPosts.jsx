import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/feed/PostCard';
import Spinner from '../components/common/Spinner';

function VideoItemCard({ video, onDelete }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold text-sm">{video.title}</h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{video.description || 'No description provided.'}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full">🎬 Video</span>
          <span className="text-gray-500">{video.views?.toLocaleString() || 0} views</span>
        </div>
      </div>
      {video.thumbnail ? (
        <div className="rounded-3xl overflow-hidden bg-gray-800">
          <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
        </div>
      ) : (
        <div className="rounded-3xl bg-gray-800 h-40 flex items-center justify-center text-5xl opacity-40">🎬</div>
      )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-2xl transition-colors"
        >
          Watch
        </a>
        <button
          onClick={() => onDelete(video._id)}
          className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-2xl transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function MyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyPosts = useCallback(async () => {
    try {
      const res = await api.get('/posts?page=1&limit=50');
      if (Array.isArray(res.data.posts)) {
        return res.data.posts.filter((post) => post.author?._id === user?._id);
      }
      return [];
    } catch {
      throw new Error('Failed to load your posts.');
    }
  }, [user?._id]);

  const fetchMyVideos = useCallback(async () => {
    try {
      const res = await api.get('/videos/my');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      throw new Error('Failed to load your videos.');
    }
  }, []);

  useEffect(() => {
    const loadMyContent = async () => {
      setLoading(true);
      setError('');
      try {
        const [myPosts, myVideos] = await Promise.all([fetchMyPosts(), fetchMyVideos()]);
        setPosts(myPosts);
        setVideos(myVideos);
      } catch (err) {
        setError(err.message || 'Failed to load your content.');
      } finally {
        setLoading(false);
      }
    };

    loadMyContent();
  }, [fetchMyPosts, fetchMyVideos]);

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) => prev.map((post) => (post._id === updatedPost._id ? { ...post, ...updatedPost } : post)));
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((video) => video._id !== videoId));
    } catch {
      setError('Unable to delete video.');
    }
  };

  const hasContent = posts.length > 0 || videos.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cyan-300">My Posts</h1>
        <p className="text-gray-400 text-sm">All your shared posts, videos, and updates in one place.</p>
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
      ) : !hasContent ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-lg font-medium text-gray-400">No shared content yet</p>
          <p className="text-sm">Create a post or upload a video to see it here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {videos.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">My Videos</h2>
                  <p className="text-gray-500 text-sm">Videos you uploaded and shared.</p>
                </div>
              </div>
              <div className="space-y-4">
                {videos.map((video) => (
                  <VideoItemCard key={video._id} video={video} onDelete={handleDeleteVideo} />
                ))}
              </div>
            </section>
          )}

          {posts.length > 0 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white">My Posts</h2>
                <p className="text-gray-500 text-sm">Text, image, and discussion posts you created.</p>
              </div>
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
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
