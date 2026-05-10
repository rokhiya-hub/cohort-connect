import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const quickLinks = [
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

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/60 via-indigo-900/40 to-gray-900 border border-purple-800/30 p-8">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl">
            CohortConnect is your space to learn, share, and grow. Connect with mentors, watch curated videos, and collaborate with peers.
          </p>
          <div className="flex gap-3 mt-5">
            <Link
              to="/videos"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Browse Videos
            </Link>
            <Link
              to="/connect"
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors border border-gray-700"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col gap-2 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-600/40 rounded-2xl transition-all group"
            >
              <span className="text-2xl">{link.emoji}</span>
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

      {/* CTA card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-white font-semibold text-base">Have knowledge to share?</p>
          <p className="text-gray-400 text-sm mt-1">Upload a video and help your fellow students learn something new.</p>
        </div>
        <Link
          to="/upload"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
        >
          📤 Upload Video
        </Link>
      </div>
    </div>
  );
}
