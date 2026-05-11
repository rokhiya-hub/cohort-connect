import { useState, useEffect } from 'react';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';

const TAGS = ['DSA', 'Placements', 'Internships', 'GATE', 'Web Dev', 'AI/ML', 'Resume', 'General'];

function DoubtCard({ post, onLike, currentUserId }) {
  const liked = post.likes?.includes(currentUserId);
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadComments = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    setLoadingComments(true);
    try {
      const { data } = await api.get(`/posts/${post._id}/comments`);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { content: reply });
      setComments((prev) => [...prev, data]);
      setReply('');
    } catch {}
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={post.author?.profilePicture} name={post.author?.fullName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white text-sm font-medium">{post.author?.fullName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              post.author?.role === 'faculty' ? 'bg-purple-600/20 text-purple-400' :
              'bg-indigo-600/20 text-indigo-400'
            }`}>
              {post.author?.role}
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <span className="bg-yellow-500/10 text-yellow-500 text-xs font-semibold px-2.5 py-1 rounded-lg border border-yellow-500/20 flex-shrink-0">
          ❓ Doubt
        </span>
      </div>

      {/* Content */}
      <p className="text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-line">{post.content}</p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((t) => (
            <span key={t} className="bg-gray-800 text-gray-500 text-xs px-2 py-0.5 rounded-full">#{t}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
          }`}
        >
          <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {post.likes?.length ?? 0} likes
        </button>
        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {expanded ? 'Hide' : `${post.commentCount ?? 0} answers`}
        </button>
      </div>

      {/* Comments / Answers */}
      {expanded && (
        <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-800">
          {loadingComments ? (
            <Spinner size="sm" />
          ) : comments.length === 0 ? (
            <p className="text-gray-600 text-xs">No answers yet — be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="flex gap-2.5">
                <Avatar src={c.author?.profilePicture} name={c.author?.fullName} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">{c.author?.fullName}
                    {c.author?.role === 'faculty' && (
                      <span className="ml-1.5 text-purple-400 text-xs">🎓 Faculty</span>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))
          )}

          {/* Reply input */}
          <form onSubmit={handleReply} className="flex gap-2 mt-3">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write your answer…"
              className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
            />
            <button
              type="submit"
              disabled={!reply.trim() || submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {submitting ? '…' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Doubts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts?limit=30');
      setPosts(data.posts || data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/posts', {
        content: `[DOUBT] ${content}`,
        tags: selectedTags,
      });
      setPosts((prev) => [data, ...prev]);
      setContent('');
      setSelectedTags([]);
      setShowForm(false);
    } catch {}
    finally { setSubmitting(false); }
  };

  const handleLike = async (id) => {
    try {
      await api.post(`/posts/${id}/like`);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== id) return p;
          const liked = p.likes?.includes(user?._id);
          return {
            ...p,
            likes: liked
              ? p.likes.filter((l) => l !== user?._id)
              : [...(p.likes || []), user?._id],
          };
        })
      );
    } catch {}
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = posts.filter((post) => {
    const isDoubt = post.content?.toLowerCase().includes('[doubt]');
    const matchesTag = activeTag ? post.tags?.includes(activeTag) : true;
    return isDoubt && matchesTag;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-cyan-300">Ask a Doubt</h1>
          <p className="text-gray-500 text-sm mt-0.5">Post your questions and get answers from seniors & faculty</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ask Doubt
        </button>
      </div>

      {/* Ask form */}
      {showForm && (
        <form onSubmit={handlePost} className="bg-gray-900 border border-indigo-700/30 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">❓ Post Your Doubt</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your doubt clearly. Be specific — include what you've tried and where you're stuck."
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition-colors resize-none"
            required
          />
          <div>
            <p className="text-gray-400 text-xs mb-2">Tags (select all that apply):</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {submitting ? 'Posting…' : 'Post Doubt'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tag filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTag('')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
            !activeTag ? 'bg-indigo-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          All Doubts
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              activeTag === tag ? 'bg-indigo-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Doubts list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">❓</span>
          <p className="text-gray-400 font-medium text-lg">No doubts yet</p>
          <p className="text-gray-600 text-sm mt-1">Ask the first question and get help from the community!</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Ask a Doubt
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <DoubtCard
              key={post._id}
              post={post}
              onLike={handleLike}
              currentUserId={user?._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
