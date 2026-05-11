import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import CommentSection from './CommentSection';
import Modal from '../common/Modal';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'nudity', label: 'Nudity' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'fake', label: 'Fake / Misleading' },
];

export default function PostCard({ post, currentUser, onDelete, onUpdate }) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [saved, setSaved] = useState(post.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const isOwner = post.author?._id === currentUser?._id;
  const [shareCount, setShareCount] = useState(post.shares || 0);

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch {}
  };

  const handleSave = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/save`);
      setSaved(res.data.saved);
      onUpdate?.(res.data);
    } catch {}
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
    } catch {}
    setShowMenu(false);
  };

  const handleConnect = () => {
    navigate(`/connect?search=${encodeURIComponent(post.author?.fullName || '')}`);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await api.put(`/posts/${post._id}`, { content: editContent });
      onUpdate?.(res.data);
      setIsEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const shareText = `${post.author?.fullName} shared a post on CohortConnect: ${window.location.origin}/posts/${post._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Check out this post', text: shareText, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Share link copied to clipboard');
      }
      setShareCount((count) => count + 1);
    } catch {
      // ignore share errors
    }
  };

  const handleCalendar = () => {
    alert('Added to your calendar.');
    setShowMenu(false);
  };

  const handleReport = async () => {
    if (!reportReason) return;
    setReporting(true);
    try {
      await api.post('/reports', { contentType: 'post', contentId: post._id, reason: reportReason });
      setShowReport(false);
      setReportReason('');
      alert('Report submitted. Our team will review it.');
    } catch {
    } finally {
      setReporting(false);
    }
  };

  const roleColors = { student: 'text-blue-400', faculty: 'text-green-400', admin: 'text-red-400' };

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl p-5 transition-all hover:border-gray-700">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?._id}`}>
            <Avatar src={post.author?.profilePicture} name={post.author?.fullName} size="md" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post.author?._id}`} className="font-semibold text-white hover:text-purple-400 transition-colors text-sm">
                {post.author?.fullName}
              </Link>
              {post.author?.role === 'faculty' && (
                <span className="text-xs bg-green-500/15 text-green-300 px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs capitalize font-medium ${roleColors[post.author?.role] || 'text-gray-400'}`}>
                {post.author?.role}
              </span>
              <span className="text-gray-600">·</span>
              <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
              {post.isAIGenerated && (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full">AI Generated</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleConnect}
            className="rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800/90 transition-colors"
          >
            Connect
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 min-w-40 py-1">
              {isOwner && (
                <>
                  <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Edit Post
                  </button>
                  <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors">
                    Delete Post
                  </button>
                </>
              )}
              <button onClick={handleCalendar} className="w-full text-left px-4 py-2 text-sm text-cyan-300 hover:bg-gray-700 transition-colors">
                Mark in Calendar
              </button>
              {!isOwner && (
                <button onClick={() => { setShowReport(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-gray-700 transition-colors">
                  Report Post
                </button>
              )}
              <button onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-purple-500"
            rows={4}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleEdit} disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => { setIsEditing(false); setEditContent(post.content); }} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words">{post.content}</p>
      )}

      {post.mediaUrls?.length > 0 && (
        <div className={`grid gap-2 mb-4 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.mediaUrls.map((url, i) =>
            post.mediaType === 'video' ? (
              <video key={i} src={url} controls className="w-full rounded-xl max-h-80 object-cover bg-gray-800" />
            ) : (
              <img key={i} src={url} alt="" className="w-full rounded-xl max-h-80 object-cover bg-gray-800" />
            )
          )}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            liked ? 'text-purple-400 bg-purple-900/30' : 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/20'
          }`}
        >
          <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likeCount > 0 ? likeCount : ''} {likeCount === 1 ? 'Like' : 'Likes'}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.commentCount > 0 ? post.commentCount : ''} Comments
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ml-auto ${
            saved ? 'text-yellow-400 bg-yellow-900/30' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/20'
          }`}
        >
          <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-cyan-300 hover:bg-cyan-900/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10" />
          </svg>
          {shareCount > 0 ? `${shareCount} Share${shareCount === 1 ? '' : 's'}` : 'Share'}
        </button>
      </div>

      {showComments && <CommentSection postId={post._id} currentUser={currentUser} />}

      <Modal isOpen={showReport} onClose={() => setShowReport(false)} title="Report Post">
        <p className="text-sm text-gray-400 mb-4">Select a reason for reporting this post:</p>
        <div className="space-y-2 mb-6">
          {REPORT_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 cursor-pointer hover:bg-gray-750 transition-colors">
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reportReason === r.value}
                onChange={(e) => setReportReason(e.target.value)}
                className="text-purple-600"
              />
              <span className="text-sm text-gray-300">{r.label}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleReport}
          disabled={!reportReason || reporting}
          className="w-full py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {reporting ? 'Submitting...' : 'Submit Report'}
        </button>
      </Modal>
    </article>
  );
}
