import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const menuItems = [
  { path: '/home', label: 'Home', emoji: '🏠' },
  { path: '/my-posts', label: 'My Posts', emoji: '📝' },
  { path: '/saved', label: 'Saved', emoji: '🔖' },
  { path: '/upload', label: 'Upload', emoji: '📤' },
  { path: '/categories', label: 'Categories', emoji: '🗂️' },
];

const categories = [
  { path: '/videos', label: 'All Videos', emoji: '⚡' },
  { path: '/videos?category=interviews', label: 'Interviews', emoji: '💼' },
  { path: '/videos?category=internships', label: 'Internships', emoji: '🚀' },
  { path: '/videos?category=exam-prep', label: 'Exam Prep', emoji: '📝' },
  { path: '/videos?category=resources', label: 'Resources', emoji: '📚' },
  { path: '/videos?category=events', label: 'Events', emoji: '🎉' },
  { path: '/videos?category=tech-ai', label: 'Tech & AI', emoji: '🤖' },
  { path: '/videos?category=other', label: 'Other', emoji: '📌' },
];

const connectItems = [
  { path: '/connect', label: 'Find Mentors', emoji: '👥' },
  { path: '/messages', label: 'Messages', emoji: '💬' },
  { path: '/groups', label: 'Study Groups', emoji: '📖' },
];

const platformItems = [
  { path: '/doubts', label: 'Ask a Doubt', emoji: '❓' },
  { path: '/leaderboard', label: 'Leaderboard', emoji: '🏆' },
  { path: '/ai-studio', label: 'AI Studio', emoji: '✨' },
];

function SidebarItem({ path, label, emoji, badge, onClick }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathPart = path.split('?')[0];
  const queryPart = path.includes('?') ? new URLSearchParams(path.split('?')[1]) : null;

  let active = false;
  if (queryPart) {
    const catParam = queryPart.get('category');
    active = location.pathname === pathPart && searchParams.get('category') === catParam;
  } else if (path === '/videos') {
    // "All Videos" — active when on /videos with no category filter
    active = location.pathname === '/videos' && !searchParams.get('category');
  } else {
    active =
      location.pathname === path ||
      (path !== '/home' && path !== '/feed' && path !== '/' &&
        location.pathname.startsWith(pathPart));
  }

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl mx-2 transition-all duration-150 group ${active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
          : 'text-gray-600 hover:text-gray-900 hover:bg-blue-100'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg leading-none select-none">{emoji}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[22px] text-center leading-none">
          6
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest px-5 mb-1.5 mt-1">
      {children}
    </p>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 w-80 flex flex-col bg-purple-50 border-r border-blue-200
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header / Logo */}
        <div className="px-5 py-5 border-b border-blue-200 flex flex-col gap-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-36 h-36 rounded-xl">
                <img src="/logo.png" alt="CohortConnect logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-600 text-xs capitalize truncate">{user?.role} account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts, profiles..."
              className="w-full bg-white border border-blue-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </form>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* MENU */}
          <div>
            <SectionLabel>Menu</SectionLabel>
            <nav className="space-y-0.5">
              {menuItems.map((item) => (
                <SidebarItem key={item.path} {...item} onClick={onClose} />
              ))}
            </nav>
          </div>

          {/* CONNECT */}
          <div>
            <SectionLabel>Connect</SectionLabel>
            <nav className="space-y-0.5">
              {connectItems.map((item) => (
                <SidebarItem key={item.path} {...item} onClick={onClose} />
              ))}
            </nav>
          </div>

          {/* PLATFORM */}
          <div>
            <SectionLabel>Platform</SectionLabel>
            <nav className="space-y-0.5">
              {platformItems.map((item) => (
                <SidebarItem key={item.path} {...item} onClick={onClose} />
              ))}
              {user?.role === 'admin' && (
                <SidebarItem path="/admin" label="Admin Panel" emoji="⚙️" onClick={onClose} />
              )}
            </nav>
          </div>
        </div>

        {/* Bottom: profile + logout */}
        <div className="border-t border-blue-200 p-4 flex-shrink-0">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-100 transition-colors mb-2 group"
          >
            <Avatar src={user?.profilePicture} name={user?.fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate leading-tight">{user?.fullName}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
            <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-red-600 hover:bg-red-100 transition-colors"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
