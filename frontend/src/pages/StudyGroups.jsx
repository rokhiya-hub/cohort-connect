import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cohort_connect_study_groups';
const JOINED_KEY = 'cohort_connect_study_groups_joined';
const SAMPLE_GROUP_IDS = new Set([1, 2, 3, 4, 5, 6]);

const SAMPLE_GROUPS = [
  {
    id: 1,
    name: 'DSA & Competitive Programming',
    emoji: '⚡',
    desc: 'Daily problems, weekly contests, and interview prep for placements.',
    members: 142,
    tags: ['DSA', 'Leetcode', 'CP'],
    color: 'from-indigo-900/40 to-blue-900/30',
    border: 'border-indigo-800/40',
  },
  {
    id: 2,
    name: 'Placement Preparation 2025',
    emoji: '💼',
    desc: 'Resume reviews, mock interviews, and company-specific preparation.',
    members: 98,
    tags: ['Placements', 'Interviews', 'Resume'],
    color: 'from-purple-900/40 to-violet-900/30',
    border: 'border-purple-800/40',
  },
  {
    id: 3,
    name: 'GATE 2025 Aspirants',
    emoji: '📝',
    desc: 'Study notes, PYQs, and daily timetable for GATE preparation.',
    members: 67,
    tags: ['GATE', 'Exam Prep', 'Notes'],
    color: 'from-green-900/40 to-emerald-900/30',
    border: 'border-green-800/40',
  },
  {
    id: 4,
    name: 'Web Dev & Open Source',
    emoji: '🌐',
    desc: 'Building projects together, contributing to open source, and sharing resources.',
    members: 115,
    tags: ['Web Dev', 'Open Source', 'Projects'],
    color: 'from-orange-900/40 to-amber-900/30',
    border: 'border-orange-800/40',
  },
  {
    id: 5,
    name: 'AI & Machine Learning',
    emoji: '🤖',
    desc: 'Research papers, hands-on ML projects, and career paths in AI.',
    members: 89,
    tags: ['AI', 'ML', 'Deep Learning'],
    color: 'from-pink-900/40 to-rose-900/30',
    border: 'border-pink-800/40',
  },
  {
    id: 6,
    name: 'Internship Hunters',
    emoji: '🚀',
    desc: 'Find internship opportunities, share referrals, and prepare together.',
    members: 204,
    tags: ['Internships', 'Referrals', 'Experience'],
    color: 'from-cyan-900/40 to-sky-900/30',
    border: 'border-cyan-800/40',
  },
];

const GROUP_THEMES = [
  { emoji: '📚', color: 'from-slate-900/40 to-slate-800/40', border: 'border-slate-800/40' },
  { emoji: '🧠', color: 'from-indigo-900/40 to-violet-900/40', border: 'border-indigo-800/40' },
  { emoji: '🛠️', color: 'from-orange-900/40 to-amber-900/40', border: 'border-orange-800/40' },
  { emoji: '🌱', color: 'from-emerald-900/40 to-teal-900/40', border: 'border-emerald-800/40' },
  { emoji: '🎯', color: 'from-fuchsia-900/40 to-pink-900/40', border: 'border-pink-800/40' },
];

function GroupCard({ group, joined, onJoin }) {
  return (
    <div className={`bg-gradient-to-br ${group.color} border ${group.border} rounded-2xl p-5 hover:scale-[1.01] transition-transform`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{group.emoji}</span>
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">{group.name}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{group.members.toLocaleString()} members</p>
          </div>
        </div>
        <button
          onClick={() => onJoin(group.id)}
          className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex-shrink-0 ${
            joined
              ? 'bg-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {joined ? 'Joined ✓' : 'Join'}
        </button>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed mb-4">{group.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {group.tags.map((tag) => (
          <span key={tag} className="bg-black/30 text-gray-400 text-xs px-2.5 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StudyGroups() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', desc: '', tags: '' });
  const [groups, setGroups] = useState(SAMPLE_GROUPS);
  const [joined, setJoined] = useState({});

  useEffect(() => {
    const storedGroups = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const storedJoined = JSON.parse(localStorage.getItem(JOINED_KEY) || '{}');
    const mergedGroups = Array.isArray(storedGroups) && storedGroups.length
      ? [...storedGroups, ...SAMPLE_GROUPS]
      : SAMPLE_GROUPS;

    if (storedJoined && Object.keys(storedJoined).length) {
      setGroups(
        mergedGroups.map((group) => ({
          ...group,
          members:
            SAMPLE_GROUP_IDS.has(group.id) && storedJoined[group.id]
              ? group.members + 1
              : group.members,
        }))
      );
    } else {
      setGroups(mergedGroups);
    }

    setJoined(storedJoined);
  }, []);

  const saveCreatedGroups = (nextGroups) => {
    const createdGroups = nextGroups.filter((group) => !SAMPLE_GROUP_IDS.has(group.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createdGroups));
  };

  const saveJoined = (nextJoined) => {
    localStorage.setItem(JOINED_KEY, JSON.stringify(nextJoined));
  };

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleJoin = (id) => {
    setJoined((prevJoined) => {
      const nextJoined = { ...prevJoined, [id]: !prevJoined[id] };
      saveJoined(nextJoined);
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === id
            ? { ...group, members: group.members + (nextJoined[id] ? 1 : -1) }
            : group
        )
      );
      return nextJoined;
    });
  };

  const getTheme = () => GROUP_THEMES[Math.floor(Math.random() * GROUP_THEMES.length)];

  const handleCreate = (e) => {
    e.preventDefault();
    const tags = newGroup.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    const theme = getTheme();
    const id = Date.now();
    const createdGroup = {
      id,
      name: newGroup.name.trim() || 'New Study Group',
      emoji: theme.emoji,
      desc: newGroup.desc.trim() || 'A new study community for learners.',
      members: 1,
      tags: tags.length ? tags : ['General'],
      color: theme.color,
      border: theme.border,
    };

    setGroups((prevGroups) => {
      const nextGroups = [createdGroup, ...prevGroups];
      saveCreatedGroups(nextGroups);
      return nextGroups;
    });

    setJoined((prevJoined) => {
      const nextJoined = { ...prevJoined, [id]: true };
      saveJoined(nextJoined);
      return nextJoined;
    });

    setShowCreate(false);
    setNewGroup({ name: '', desc: '', tags: '' });
  };

  const totalMembers = groups.reduce((sum, group) => sum + group.members, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-cyan-300">Study Groups</h1>
          <p className="text-gray-500 text-sm mt-0.5">Join communities and study together</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { emoji: '📖', label: 'Active Groups', value: groups.length },
          { emoji: '👥', label: 'Total Members', value: totalMembers.toLocaleString() },
          { emoji: '✅', label: 'You Joined', value: Object.values(joined).filter(Boolean).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
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
          placeholder="Search groups by name or topic…"
          className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <span className="text-5xl mb-4 block">📖</span>
          <p className="text-gray-400 font-medium">No groups match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} joined={Boolean(joined[group.id])} onJoin={handleJoin} />
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
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
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                <textarea
                  value={newGroup.desc}
                  onChange={(e) => setNewGroup((p) => ({ ...p, desc: e.target.value }))}
                  placeholder="What is this group about?"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags</label>
                <input
                  type="text"
                  value={newGroup.tags}
                  onChange={(e) => setNewGroup((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="DSA, Placement, Notes (comma separated)"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Create Group
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">
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
