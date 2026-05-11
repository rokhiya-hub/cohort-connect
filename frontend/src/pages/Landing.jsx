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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-blue-200 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-white/70 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/30">CC</div>
            <span className="font-bold text-xl text-gray-900">CohortConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-blue-100">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md shadow-blue-500/20">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-1.5 text-sm text-blue-700 mb-6 font-medium">
          <span>🚀</span> Your campus, connected
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 text-gray-900">
          Where Campus Life
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Comes Together
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          CohortConnect is the social platform built for students and faculty — share opportunities,
          generate AI content, and build your academic reputation.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-blue-500/30">
            Get Started Free
          </Link>
          <Link to="/login" className="px-8 py-3.5 bg-white hover:bg-blue-50 border-2 border-blue-200 text-gray-900 font-semibold rounded-xl transition-all text-lg">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Everything you need</h2>
        <p className="text-gray-600 text-center mb-12">Built for the modern campus community</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-blue-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all hover:scale-105">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-blue-200 py-20 text-center px-6 bg-gradient-to-r from-blue-100 to-purple-100">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to join your cohort?</h2>
        <p className="text-gray-600 mb-8">Sign up today and start sharing, learning, and growing.</p>
        <Link to="/signup" className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all text-lg shadow-lg shadow-blue-500/30">
          Create Your Account
        </Link>
      </section>

      <footer className="border-t border-blue-200 py-6 text-center text-sm text-gray-600 bg-white">
        © 2025 CohortConnect · Built for students, by students
      </footer>
    </div>
  );
}
