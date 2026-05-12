import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';

const CATEGORIES = [
  { value: 'all', label: 'All Videos', emoji: '⚡' },
  { value: 'interviews', label: 'Interviews', emoji: '💼' },
  { value: 'internships', label: 'Internships', emoji: '🚀' },
  { value: 'exam-prep', label: 'Exam Prep', emoji: '📝' },
  { value: 'resources', label: 'Resources', emoji: '📚' },
  { value: 'career', label: 'Career', emoji: '🎯' },
  { value: 'events', label: 'Events', emoji: '🎉' },
  { value: 'tech-ai', label: 'Tech & AI', emoji: '🤖' },
];

function VideoCard({ video, onLike }) {
  const isLiked = video.liked;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-600/40 transition-all group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
            <span className="text-5xl opacity-40">🎬</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </a>
        </div>
        <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          {video.views} views
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">{video.title}</h3>
        {video.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3">{video.description}</p>
        )}
        <div className="flex items-center justify-between">
          <Link to={`/profile/${video.author._id}`} className="flex items-center gap-2 group/author">
            <Avatar src={video.author.profilePicture} name={video.author.fullName} size="xs" />
            <div>
              <p className="text-xs font-medium text-gray-300 group-hover/author:text-white transition-colors leading-tight">
                {video.author.fullName}
              </p>
              <p className="text-gray-600 text-xs capitalize">{video.author.role}</p>
            </div>
          </Link>
          <button
            onClick={() => onLike(video._id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isLiked
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {video.likes?.length ?? 0}
          </button>
        </div>
        {video.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {video.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="bg-gray-800 text-gray-500 text-xs px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likedIds, setLikedIds] = useState(new Set());

  const activeCategory = searchParams.get('category') || 'all';

  const fetchVideos = useCallback(async (cat, pg, q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 12 });
      if (cat && cat !== 'all') params.set('category', cat);
      if (q) params.set('search', q);
      const { data } = await api.get(`/videos?${params}`);
      setVideos(data.videos);
      setTotalPages(data.pages);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchVideos(activeCategory, 1, search);
  }, [activeCategory, fetchVideos]);

  useEffect(() => {
    fetchVideos(activeCategory, page, search);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVideos(activeCategory, 1, search);
  };

  const handleLike = async (id) => {
    try {
      const { data } = await api.post(`/videos/${id}/like`);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === id ? { ...v, likes: Array(data.likes).fill(null), liked: data.liked } : v
        )
      );
      setLikedIds((prev) => {
        const next = new Set(prev);
        data.liked ? next.add(id) : next.delete(id);
        return next;
      });
    } catch {}
  };

  const setCategory = (val) => {
    if (val === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: val });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-cyan-300">Video Feed</h1>
          <p className="text-gray-500 text-sm mt-0.5">Curated learning content from seniors & faculty</p>
        </div>
        <Link
          to="/upload"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search videos, topics, tags…"
          className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
        />
      </form>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeCategory === cat.value
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <span className="text-5xl mb-4 block">🎬</span>
          <p className="text-lg font-medium text-gray-400">No videos found</p>
          <p className="text-sm mt-1">Be the first to upload in this category!</p>
          <Link to="/upload" className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Upload Video
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={{ ...video, liked: likedIds.has(video._id) }}
                onLike={handleLike}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
