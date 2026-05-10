import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

function Comment({ comment, postId, currentUser, onDelete }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [localReplies, setLocalReplies] = useState(comment.replies || []);

  const handleLike = async () => {
    try {
      const res = await api.post(`/comments/${comment._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch {}
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: replyText,
        parentComment: comment._id,
      });
      setLocalReplies((prev) => [...prev, res.data]);
      setReplyText('');
      setShowReplyForm(false);
    } catch {}
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex gap-3">
      <Avatar src={comment.author?.profilePicture} name={comment.author?.fullName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">{comment.author?.fullName}</span>
            <span className="text-xs text-purple-400 capitalize">{comment.author?.role}</span>
          </div>
          <p className="text-sm text-gray-200 break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-2">
          <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-purple-400' : 'text-gray-500 hover:text-purple-400'}`}
          >
            <svg className="w-3 h-3" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likeCount > 0 && likeCount}
          </button>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
          >
            Reply
          </button>
          {comment.author?._id === currentUser?._id && (
            <button
              onClick={() => onDelete(comment._id)}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>

        {showReplyForm && (
          <form onSubmit={handleReply} className="flex gap-2 mt-2 px-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
              Reply
            </button>
          </form>
        )}

        {localReplies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l border-gray-700">
            {localReplies.map((reply) => (
              <Comment key={reply._id} comment={reply} postId={postId} currentUser={currentUser} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    api.get(`/posts/${postId}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: text });
      setComments((prev) => [res.data, ...prev]);
      setText('');
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {}
  };

  return (
    <div className="mt-4 border-t border-gray-800 pt-4">
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <Avatar src={currentUser?.profilePicture} name={currentUser?.fullName} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Spinner size="sm" /> : 'Post'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              postId={postId}
              currentUser={currentUser}
              onDelete={handleDelete}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">No comments yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  );
}
