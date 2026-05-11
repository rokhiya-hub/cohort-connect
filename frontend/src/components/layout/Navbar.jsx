import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const navItems = [
  { path: '/feed', label: 'Feed', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/leaderboard', label: 'Leaderboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path: '/ai-studio', label: 'AI Studio', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'user', 'category'

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (searchType === 'user') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=user`);
    } else if (searchType === 'category') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=category`);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery('');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-blue-50/95 backdrop-blur-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/feed" className="flex items-center gap-3" aria-label="CohortConnect home">
            <img src="/logo.png" alt="CohortConnect logo" className="w-12 h-12 rounded-2xl bg-white shadow-sm object-cover" />
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-blue-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="hidden md:block">{item.label}</span>
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/admin' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-blue-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="hidden md:block">Admin</span>
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, posts..."
              className="bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none w-40"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-blue-50 text-xs text-gray-700 rounded px-2 py-1 border border-blue-200 focus:outline-none cursor-pointer hover:bg-blue-100"
            >
              <option value="all">All</option>
              <option value="user">Users</option>
              <option value="category">Category</option>
            </select>
          </form>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{user?.fullName}</p>
              <p className="text-xs text-blue-600 capitalize">{user?.role}</p>
            </div>
            <Link to="/profile" className="flex items-center gap-2 group">
              <Avatar src={user?.profilePicture} name={user?.fullName} size="sm" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-blue-100"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
