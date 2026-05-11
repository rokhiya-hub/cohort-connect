
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const quickLinks = [
  { to: '/feed', emoji: '📰', label: 'Feed', desc: 'Latest posts & updates' },
  { to: '/videos', emoji: '🎬', label: 'Video Feed', desc: 'Watch educational content' },
  { to: '/connect', emoji: '👥', label: 'Find Mentors', desc: 'Connect with seniors & faculty' },
  { to: '/messages', emoji: '💬', label: 'Messages', desc: 'Chat with your connections' },
  { to: '/doubts', emoji: '❓', label: 'Ask a Doubt', desc: 'Get answers from the community' },
  { to: '/groups', emoji: '📖', label: 'Study Groups', desc: 'Join or create study groups' },
  { to: '/upload', emoji: '📤', label: 'Upload Video', desc: 'Share knowledge with others' },
  { to: '/leaderboard', emoji: '🏆', label: 'Leaderboard', desc: 'See top contributors' },
  { to: '/ai-studio', emoji: '✨', label: 'AI Studio', desc: 'Create AI-powered content' },
];

const categories = [
  { to: '/videos?category=interviews', emoji: '💼', label: 'Interviews' },
  { to: '/videos?category=internships', emoji: '🚀', label: 'Internships' },
  { to: '/videos?category=exam-prep', emoji: '📝', label: 'Exam Prep' },
  { to: '/videos?category=resources', emoji: '📚', label: 'Resources' },
  { to: '/videos?category=events', emoji: '🎉', label: 'Events' },
  { to: '/videos?category=tech-ai', emoji: '🤖', label: 'Tech & AI' },
];

const features = [
  {
    icon: '📝',
    title: 'Smart Feed',
    desc: 'Stay updated with posts from students, faculty, and admins — sorted by what matters most to you.',
  },
  {
    icon: '🤖',
    title: 'AI Studio',
    desc: 'Generate professional posters, videos via Manim, captions, and thumbnails with a single prompt.',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    desc: 'Earn points for quality content. Likes, saves, and engagement move you up the ranks.',
  },
  {
    icon: '💬',
    title: 'Discussions',
    desc: 'Threaded comments, replies, and likes — have meaningful conversations on every post.',
  },
  {
    icon: '🛡️',
    title: 'Safe Platform',
    desc: 'Content moderation, reporting system, and role-based access keep the community healthy.',
  },
  {
    icon: '👥',
    title: 'Role-Based Access',
    desc: 'Tailored experience for Students, Faculty, and Admins — each with the right permissions.',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div className="space-y-8 bg-gray-800" >
      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/60 via-indigo-900/40 to-gray-900 border border-purple-800/30 p-8">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mb-4">
            CohortConnect is your space to learn, share, and grow. Connect with mentors, watch curated videos, and collaborate with peers.
          </p>
          <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/50 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-4">
            <span>🚀</span> Your campus, connected
          </div>
          <div className="flex gap-3 mt-5 flex-wrap">
            <Link
              to="/feed"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Explore Feed
            </Link>
            <Link
              to="/videos"
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Watch Videos
            </Link>
            <Link
              to="/connect"
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors border border-gray-700"
            >
              Find Mentors
            </Link>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none hidden sm:block">🎓</div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col gap-2 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-600/40 rounded-2xl transition-all group"
            >
              <span className="text-3xl">{link.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{link.label}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Browse by category */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.to}
              to={cat.to}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-indigo-600/20 border border-gray-800 hover:border-indigo-600/50 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all"
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="border-t border-gray-800 pt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">What You Can Do</h2>
          <p className="text-gray-400 text-sm">Explore all the amazing features CohortConnect has to offer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
              className="bg-gray-900 border border-gray-800 hover:border-purple-700/50 rounded-2xl p-6 text-left transition-all hover:bg-gray-800/50"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className={`text-gray-400 text-sm ${expandedSection === idx ? 'line-clamp-none' : 'line-clamp-2'}`}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-indigo-400 mb-1">500+</div>
          <p className="text-gray-400 text-sm">Active Students</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">1K+</div>
          <p className="text-gray-400 text-sm">Video Resources</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-pink-400 mb-1">50+</div>
          <p className="text-gray-400 text-sm">Study Groups</p>
        </div>
      </div>

      {/* CTA card */}
      <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-700/50 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-white font-semibold text-base">Have knowledge to share?</p>
          <p className="text-gray-400 text-sm mt-1">Upload a video or create AI content to help your fellow students learn something new.</p>
        </div>
        <Link
          to="/upload"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex-shrink-0 whitespace-nowrap"
        >
          📤 Upload Video
        </Link>
      </div>
    </div>
  );
}
