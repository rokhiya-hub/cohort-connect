import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function GroupCard({ group, joined, onJoin }) {
  return (
    <div className="bg-[#111827] border border-cyan-500/20 rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-cyan-500/10">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{group.emoji || 'Group'}</span>
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">{group.name}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{(group.members?.length || 0).toLocaleString()} members</p>
          </div>
        </div>
        <button
          onClick={() => onJoin(group._id)}
          className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex-shrink-0 ${
            joined
              ? 'bg-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
          }`}
        >
          {joined ? 'Joined' : 'Join'}
        </button>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed mb-4">{group.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {(group.tags || []).map((tag) => (
          <span key={tag} className="bg-white/5 text-gray-400 text-xs px-2.5 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StudyGroups() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', desc: '', tags: '' });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get('/studygroups');
        setGroups(res.data.groups || []);
      } catch (err) {
        setError('Unable to load study groups.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  const isJoined = (group) =>
    Boolean(
      group.members?.find((member) => String(member) === String(user?._id) || member?._id === user?._id)
    );

  const handleJoin = async (groupId) => {
    try {
      const res = await api.post(`/studygroups/${groupId}/join`);
      const updatedGroup = res.data.group;
      setGroups((prevGroups) => prevGroups.map((group) => (String(group._id) === String(groupId) ? updatedGroup : group)));
    } catch (err) {
      setError('Unable to update group membership.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const tags = newGroup.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      const res = await api.post('/studygroups', {
        name: newGroup.name.trim(),
        description: newGroup.desc.trim(),
        tags,
      });
      setGroups((prevGroups) => [res.data.group, ...prevGroups]);
      setShowCreate(false);
      setNewGroup({ name: '', desc: '', tags: '' });
    } catch (err) {
      setError('Unable to create new group.');
    } finally {
      setSaving(false);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      (group.tags || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const totalMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-cyan-300">Study Groups</h1>
          <p className="text-gray-400 text-sm mt-0.5">Join communities and study together.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { emoji: 'Groups', label: 'Active Groups', value: groups.length },
          { emoji: 'Members', label: 'Total Members', value: totalMembers.toLocaleString() },
          { emoji: 'Joined', label: 'You Joined', value: groups.filter(isJoined).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111827] border border-slate-800 rounded-2xl p-4 text-center shadow-sm">
            <span className="text-2xl">{stat.emoji}</span>
            <p className="text-white font-bold text-xl mt-1">{stat.value}</p>
            <p className="text-gray-500 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search groups by name or topic..."
          className="w-full bg-[#111827] border border-slate-800 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-gray-500">Loading study groups...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <span className="text-5xl mb-4 block">No results</span>
          <p className="text-gray-400 font-medium">No groups match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <GroupCard key={group._id} group={group} joined={isJoined(group)} onJoin={handleJoin} />
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-white font-bold text-lg mb-5">Create Study Group</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. GATE 2026 Aspirants"
                  required
                  className="w-full bg-[#111827] border border-slate-800 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                <textarea
                  value={newGroup.desc}
                  onChange={(e) => setNewGroup((p) => ({ ...p, desc: e.target.value }))}
                  placeholder="What is this group about?"
                  rows={3}
                  className="w-full bg-[#111827] border border-slate-800 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags</label>
                <input
                  type="text"
                  value={newGroup.tags}
                  onChange={(e) => setNewGroup((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="DSA, Placement, Notes"
                  className="w-full bg-[#111827] border border-slate-800 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Create Group'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-gray-300 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
