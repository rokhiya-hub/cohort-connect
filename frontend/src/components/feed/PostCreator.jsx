import { useState } from 'react';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

export default function PostCreator({ currentUser, onPost }) {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const urls = mediaUrls.trim() ? mediaUrls.split('\n').map((u) => u.trim()).filter(Boolean) : [];
      const res = await api.post('/posts', {
        content: content.trim(),
        mediaUrls: urls,
        mediaType: urls.length > 0 ? (mediaType || 'image') : null,
      });
      onPost?.(res.data);
      setContent('');
      setMediaUrls('');
      setMediaType('');
      setExpanded(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex gap-3">
        <Avatar src={currentUser?.profilePicture} name={currentUser?.fullName} size="md" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="Share something with your cohort..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors"
            rows={expanded ? 4 : 2}
          />

          {expanded && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Media URLs (one per line, optional)</label>
                <textarea
                  value={mediaUrls}
                  onChange={(e) => setMediaUrls(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-purple-500"
                  rows={2}
                />
              </div>
              {mediaUrls.trim() && (
                <div className="flex gap-3">
                  {['image', 'video', 'file'].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mediaType"
                        value={t}
                        checked={mediaType === t}
                        onChange={(e) => setMediaType(e.target.value)}
                        className="text-purple-600"
                      />
                      <span className="text-xs text-gray-400 capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          {expanded && (
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${content.length > 4800 ? 'text-red-400' : 'text-gray-500'}`}>
                {content.length}/5000
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setExpanded(false); setContent(''); setMediaUrls(''); setError(''); }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting || content.length > 5000}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? <Spinner size="sm" /> : null}
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
