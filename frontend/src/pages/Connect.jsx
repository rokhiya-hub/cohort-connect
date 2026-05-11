import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';

const ROLE_FILTERS = [
  { value: 'all', label: 'Everyone' },
  { value: 'faculty', label: '🎓 Faculty' },
  { value: 'student', label: '📚 Students' },
  { value: 'admin', label: '⚙️ Admin' },
];

function UserCard({ user, connected, connecting, onConnect, onMessage }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-600/30 transition-all">
      <div className="flex items-start gap-4">
        <Avatar src={user.profilePicture} name={user.fullName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold text-sm">{user.fullName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user.role === 'faculty' ? 'bg-purple-600/20 text-purple-400' :
              user.role === 'admin' ? 'bg-red-600/20 text-red-400' :
              'bg-indigo-600/20 text-indigo-400'
            }`}>
              {user.role === 'faculty' ? '🎓' : user.role === 'admin' ? '⚙️' : '📚'} {user.role}
            </span>
          </div>
          {user.designation && (
            <p className="text-gray-400 text-xs mt-0.5">{user.designation}</p>
          )}
          {user.department && (
            <p className="text-gray-600 text-xs">{user.department}</p>
          )}
          {user.institution && !user.department && (
            <p className="text-gray-600 text-xs">{user.institution}{user.branch ? ` · ${user.branch}` : ''}{user.year ? ` · Year ${user.year}` : ''}</p>
          )}
          {user.bio && (
            <p className="text-gray-500 text-xs mt-2 line-clamp-2">{user.bio}</p>
          )}
          {user.points > 0 && (
            <p className="text-yellow-500 text-xs mt-1 font-medium">🏆 {user.points} points</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2 flex-wrap">
        {connected ? (
          <>
            <button
              onClick={() => onMessage(user._id)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
            <span className="flex-none px-3 py-2 rounded-xl text-xs text-green-300 bg-green-900/20 border border-green-800">
              Connected
            </span>
          </>
        ) : (
          <button
            onClick={() => onConnect(user._id)}
            disabled={connecting === user._id}
            className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 hover:text-white text-xs font-semibold py-2 rounded-xl transition-colors"
          >
            {connecting === user._id ? 'Connecting...' : 'Connect'}
          </button>
        )}
        <a
          href={`/profile/${user._id}`}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
        >
          View Profile
        </a>
      </div>
    </div>
  );
}

export default function Connect() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [starting, setStarting] = useState(null);

  const fetchConnections = useCallback(async () => {
    setLoadingConnections(true);
    try {
      const { data } = await api.get('/connections/me');
      setConnections(data);
    } catch {
      setConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  const fetchUsers = useCallback(async (q, role) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (role && role !== 'all') params.set('role', role);
      const { data } = await api.get(`/connections/peers?${params}`);
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
    fetchUsers(search, roleFilter);
  }, [fetchConnections, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search, roleFilter);
  };

  const handleConnect = async (userId) => {
    setStarting(userId);
    try {
      const { data } = await api.post(`/connections/${userId}`);
      setConnections(data.connections || []);
    } catch {
      // ignore connection error, user will see no message option
    } finally {
      setStarting(null);
    }
  };

  const handleMessage = async (userId) => {
    setStarting(userId);
    try {
      const { data } = await api.post('/messages/conversations', { participantId: userId });
      navigate(`/messages?conv=${data._id}`);
    } catch {
      navigate('/messages');
    } finally {
      setStarting(null);
    }
  };

  const connectedIds = new Set(connections.map((c) => c._id));
  const filtered = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Find & Connect</h1>
        <p className="text-gray-500 text-sm mt-0.5">Reach out to faculty, seniors, and peers for mentorship or collaboration</p>
      </div>

      {/* Mentorship tips */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-800/30 rounded-2xl p-5">
        <p className="text-white font-semibold text-sm mb-2">👥 How to connect</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { emoji: '🔍', tip: 'Search by name or department' },
            { emoji: '💬', tip: 'Connect first, then message' },
            { emoji: '📖', tip: 'Join study groups together' },
          ].map((item) => (
            <div key={item.tip} className="flex items-center gap-2 text-xs text-gray-400">
              <span>{item.emoji}</span>
              <span>{item.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-48">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, bio…"
            className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                roleFilter === f.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <span className="text-5xl mb-4 block">👥</span>
          <p className="text-gray-400 font-medium">No users found</p>
          <p className="text-sm mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <UserCard
              key={u._id}
              user={u}
              connected={connectedIds.has(u._id)}
              connecting={starting}
              onConnect={handleConnect}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
