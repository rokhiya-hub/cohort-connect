import { Link } from 'react-router-dom';

const categories = [
  { label: 'Interviews', path: '/videos?category=interviews' },
  { label: 'Internships', path: '/videos?category=internships' },
  { label: 'Exam Prep', path: '/videos?category=exam-prep' },
  { label: 'Resources', path: '/videos?category=resources' },
  { label: 'Events', path: '/videos?category=events' },
  { label: 'Tech & AI', path: '/videos?category=tech-ai' },
  { label: 'Other', path: '/videos?category=other' },
];

export default function Categories() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="text-gray-400 text-sm">Browse all content categories, including an "Other" option.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link
            key={category.label}
            to={category.path}
            className="group block rounded-3xl border border-gray-800 bg-gray-900 p-6 hover:border-indigo-500/40 hover:bg-gray-800 transition-all"
          >
            <div className="text-sm uppercase tracking-[0.2em] text-indigo-300 mb-3">Category</div>
            <h2 className="text-lg font-semibold text-white">{category.label}</h2>
            <p className="text-gray-400 text-sm mt-3">View posts and resources for {category.label}.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
