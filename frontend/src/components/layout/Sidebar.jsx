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
      className={`flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-200 ease-in-out shadow-sm border
        ${
          active
            ? 'bg-gradient-to-r from-[#2563FF] to-[#8B5CF6] text-white shadow-lg ring-2 ring-[#2563FF]/30 border-transparent'
            : 'bg-white text-gray-700 border-blue-200/50 hover:bg-[#2563FF]/5 hover:shadow-md hover:border-[#2563FF]/30 hover:scale-[1.02]'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg select-none">{emoji}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>

      {badge && (
        <span className="bg-[#2563FF] text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[#2563FF] text-xs font-semibold uppercase tracking-widest px-5 mb-2 mt-2">
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
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: #F2EEF7; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #2563FF; border-radius: 3px; }
      `}} />
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 w-72 flex flex-col bg-[#F2EEF7] border-r border-blue-200/30
        transition-transform duration-300 backdrop-blur-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header — Logo + role + close button */}
        <div className="px-4 py-4 border-b border-blue-200/30 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            {/* Full logo with text */}
            <Link to="/home" onClick={onClose} className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="CohortConnect"
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-900 p-1.5 rounded-xl hover:bg-[#2563FF]/10 transition-colors"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Role badge */}
          <span className="inline-flex items-center self-start px-3 py-1 rounded-2xl bg-[#2563FF]/10 text-[#2563FF] text-xs font-medium capitalize shadow-sm">
            {user?.role} account
          </span>

          {/* Search — desktop only */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts, profiles..."
              className="w-full bg-white border border-blue-200/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563FF] shadow-sm"
            />
          </form>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 sidebar-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2563FF #F2EEF7' }}>
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

        {/* Footer — profile + sign out */}
        <div className="border-t border-blue-200/30 p-4 shrink-0">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#2563FF]/10 transition-all duration-200 shadow-sm mb-2"
          >
            <Avatar
              src={user?.profilePicture}
              name={user?.fullName}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-2xl text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}