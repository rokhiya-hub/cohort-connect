import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';

const CATEGORY_LABELS = {
  interviews: '💼 Interviews',
  internships: '🚀 Internships',
  'exam-prep': '📝 Exam Prep',
  resources: '📚 Resources',
  events: '🎉 Events',
  'tech-ai': '🤖 Tech & AI',
  general: '⚡ General',
};

export default function MyVideos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);

  useEffect(() => {
    fetchMyVideos();
  }, []);

  const fetchMyVideos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/videos/my');
      setVideos(data);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    setDeleting(id);
    try {
      await api.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">My Videos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage the videos you've shared</p>
        </div>
        <Link
          to="/upload"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload New
        </Link>
      </div>

      {/* Stats */}
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Videos', value: videos.length, emoji: '🎬' },
            { label: 'Total Views', value: totalViews.toLocaleString(), emoji: '👁️' },
            { label: 'Total Likes', value: totalLikes.toLocaleString(), emoji: '❤️' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <span className="text-2xl">{stat.emoji}</span>
              <p className="text-white font-bold text-xl mt-1">{stat.value}</p>
              <p className="text-gray-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📁</span>
          <p className="text-lg font-medium text-gray-400">No videos yet</p>
          <p className="text-gray-600 text-sm mt-1">Upload your first video to share knowledge</p>
          <Link to="/upload" className="inline-block mt-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Upload Video
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4 hover:border-gray-700 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-32 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-800">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl opacity-30">🎬</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm leading-tight truncate">{video.title}</h3>
                    {video.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">{video.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[video.category] || video.category}
                      </span>
                      <span className="text-xs text-gray-600">👁️ {video.views} views</span>
                      <span className="text-xs text-gray-600">❤️ {video.likes?.length || 0} likes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(video._id)}
                      disabled={deleting === video._id}
                      className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === video._id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 text-xs mt-2">
                  {new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
