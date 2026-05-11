import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';

const RANK_STYLES = {
  1: { bg: 'bg-yellow-500/20 border-yellow-500/50', text: 'text-yellow-400', icon: '🥇' },
  2: { bg: 'bg-gray-400/10 border-gray-400/30', text: 'text-gray-300', icon: '🥈' },
  3: { bg: 'bg-orange-600/20 border-orange-600/40', text: 'text-orange-400', icon: '🥉' },
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [currentRank, setCurrentRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/leaderboard')
      .then((res) => {
        setData(res.data.leaderboard);
        setCurrentRank(res.data.currentUserRank);
      })
      .catch(() => setError('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  const roleColors = { student: 'text-blue-400', faculty: 'text-green-400', admin: 'text-red-400' };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cyan-300 mb-1">Leaderboard</h1>
        <p className="text-gray-400 text-sm">Top contributors ranked by engagement & quality</p>
      </div>

      {/* How points work */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">How points are earned</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Post liked', pts: '+2' },
            { label: 'Post saved', pts: '+5' },
            { label: 'Post shared', pts: '+3' },
            { label: 'Comment received', pts: '+1' },
            { label: 'Video watch (per min)', pts: '+1' },
            { label: 'Verified fake post', pts: '-50' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`font-bold text-sm ${item.pts.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>{item.pts}</span>
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current user rank */}
      {currentRank && (
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-purple-300">Your current rank</span>
          <span className="text-lg font-bold text-white">#{currentRank}</span>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {data.length === 0 && !error ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-400">No rankings yet. Start posting to earn points!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((entry) => {
            const rankStyle = RANK_STYLES[entry.rank] || {};
            const isMe = entry._id === user?._id;
            return (
              <div
                key={entry._id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-purple-900/20 border-purple-600'
                    : rankStyle.bg
                    ? `${rankStyle.bg} border`
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="w-10 text-center">
                  {rankStyle.icon ? (
                    <span className="text-2xl">{rankStyle.icon}</span>
                  ) : (
                    <span className={`text-lg font-bold ${rankStyle.text || 'text-gray-400'}`}>#{entry.rank}</span>
                  )}
                </div>
                <Avatar src={entry.profilePicture} name={entry.fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm truncate">{entry.fullName}</p>
                    {isMe && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">You</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs capitalize font-medium ${roleColors[entry.role] || 'text-gray-400'}`}>{entry.role}</span>
                    {entry.institution && <span className="text-xs text-gray-500 truncate">· {entry.institution}</span>}
                    {entry.branch && <span className="text-xs text-gray-600">· {entry.branch}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-white">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
