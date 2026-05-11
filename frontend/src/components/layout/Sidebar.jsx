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
  const queryPart = path.includes('?')
    ? new URLSearchParams(path.split('?')[1])
    : null;

  let active = false;

  if (queryPart) {
    const catParam = queryPart.get('category');
    active =
      location.pathname === pathPart &&
      searchParams.get('category') === catParam;
  } else {
    active =
      location.pathname === path ||
      (path !== '/home' && location.pathname.startsWith(pathPart));
  }

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center justify-between px-5 py-2.5 rounded-xl transition-all duration-150
        ${
          active
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-gray-600 hover:text-gray-900 hover:bg-blue-100'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg select-none">{emoji}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>

      {badge && (
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {badge}
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 w-80 flex flex-col bg-purple-50 border-r border-blue-200
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-blue-200 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/90">
                <img
                  src="/logo.png"
                  alt="CohortConnect logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-gray-600 text-xs capitalize leading-tight">
                {user?.role} account
              </p>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-blue-100"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts, profiles..."
              className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-3 text-sm"
            />
          </form>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          <div>
            <SectionLabel>Menu</SectionLabel>
            {menuItems.map((item) => (
              <SidebarItem key={item.path} {...item} onClick={onClose} />
            ))}
          </div>

          <div>
            <SectionLabel>Connect</SectionLabel>
            {connectItems.map((item) => (
              <SidebarItem key={item.path} {...item} onClick={onClose} />
            ))}
          </div>

          <div>
            <SectionLabel>Platform</SectionLabel>
            {platformItems.map((item) => (
              <SidebarItem key={item.path} {...item} onClick={onClose} />
            ))}
            {user?.role === 'admin' && (
              <SidebarItem
                path="/admin"
                label="Admin Panel"
                emoji="⚙️"
                onClick={onClose}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-blue-200 p-4">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-100 mb-2"
          >
            <Avatar
              src={user?.profilePicture}
              name={user?.fullName}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.email}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-red-600 hover:bg-red-100"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}