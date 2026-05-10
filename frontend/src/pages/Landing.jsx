import { Link } from 'react-router-dom';

const features = [
  { icon: '📝', title: 'Smart Feed', desc: 'Stay updated with posts from students, faculty, and admins — sorted by what matters most.' },
  { icon: '🤖', title: 'AI Studio', desc: 'Generate professional posters, videos (via Manim), captions, and thumbnails with a single prompt.' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Earn points for quality content. Likes, saves, and engagement move you up the ranks.' },
  { icon: '💬', title: 'Discussions', desc: 'Threaded comments, replies, and likes — have meaningful conversations on every post.' },
  { icon: '🛡️', title: 'Safe Platform', desc: 'Content moderation, reporting system, and role-based access keep the community healthy.' },
  { icon: '🎓', title: 'Role-Based', desc: 'Tailored experience for Students, Faculty, and Admins — each with the right permissions.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-lg">CC</div>
          <span className="font-bold text-xl">CohortConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            Login
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/50 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-6">
          <span>🚀</span> Your campus, connected
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
          Where Campus Life
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Comes Together
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          CohortConnect is the social platform built for students and faculty — share opportunities,
          generate AI content, and build your academic reputation.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup" className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors text-lg">
            Get Started Free
          </Link>
          <Link to="/login" className="px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold rounded-xl transition-colors text-lg">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-3">Everything you need</h2>
        <p className="text-gray-400 text-center mb-12">Built for the modern campus community</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-700/50 transition-colors">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800 py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to join your cohort?</h2>
        <p className="text-gray-400 mb-8">Sign up today and start sharing, learning, and growing.</p>
        <Link to="/signup" className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all text-lg shadow-lg shadow-purple-900/30">
          Create Your Account
        </Link>
      </section>

      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-600">
        © 2025 CohortConnect · Built for students, by students
      </footer>
    </div>
  );
}
