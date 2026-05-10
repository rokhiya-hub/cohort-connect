import { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';

const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/40',
  reviewed: 'text-blue-400 bg-blue-900/20 border-blue-700/40',
  resolved: 'text-green-400 bg-green-900/20 border-green-700/40',
  dismissed: 'text-gray-400 bg-gray-800 border-gray-700',
};

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [updating, setUpdating] = useState(null);
  const [note, setNote] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/reports?status=${filter}`)
      .then((res) => setReports(res.data))
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleUpdate = async (reportId, status) => {
    setUpdating(reportId);
    try {
      const res = await api.put(`/reports/${reportId}`, {
        status,
        moderatorNote: note[reportId] || '',
      });
      setReports((prev) => prev.map((r) => (r._id === reportId ? res.data : r)));
    } catch {
      setError('Failed to update report');
    } finally {
      setUpdating(null);
    }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
        <p className="text-gray-400 text-sm">Moderate reported content and manage the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['pending', 'reviewed', 'resolved', 'dismissed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-4 rounded-2xl border text-center transition-all capitalize ${
              filter === s ? 'border-purple-500 bg-purple-900/20' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
            }`}
          >
            <p className="text-sm font-medium text-gray-300">{s}</p>
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-gray-400">No {filter} reports</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar src={report.reporter?.profilePicture} name={report.reporter?.fullName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{report.reporter?.fullName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{timeAgo(report.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[report.status]}`}>
                  {report.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-800/50 rounded-xl p-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Content Type</p>
                  <p className="text-sm text-white capitalize">{report.contentType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Reason</p>
                  <p className="text-sm text-orange-300 capitalize">{report.reason.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Content ID</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{report.contentId}</p>
                </div>
              </div>

              {report.moderatorNote && (
                <div className="bg-gray-800 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Moderator Note</p>
                  <p className="text-sm text-gray-300">{report.moderatorNote}</p>
                </div>
              )}

              {report.status === 'pending' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Moderator Note (optional)</label>
                    <input
                      type="text"
                      value={note[report._id] || ''}
                      onChange={(e) => setNote((n) => ({ ...n, [report._id]: e.target.value }))}
                      placeholder="Add a note about this decision..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdate(report._id, 'reviewed')}
                      disabled={updating === report._id}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm disabled:opacity-50 transition-colors"
                    >
                      {updating === report._id ? '...' : 'Mark Reviewed'}
                    </button>
                    <button
                      onClick={() => handleUpdate(report._id, 'resolved')}
                      disabled={updating === report._id}
                      className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm disabled:opacity-50 transition-colors"
                    >
                      {updating === report._id ? '...' : 'Resolve (Remove Content)'}
                    </button>
                    <button
                      onClick={() => handleUpdate(report._id, 'dismissed')}
                      disabled={updating === report._id}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm disabled:opacity-50 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
