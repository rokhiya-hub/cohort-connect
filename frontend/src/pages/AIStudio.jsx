import { useState } from 'react';
import api from '../utils/api';
import Spinner from '../components/common/Spinner';

const TYPES = [
  { value: 'video', label: 'Video', emoji: '🎬', desc: 'Animated video with Manim — title, bullet points, transitions' },
  { value: 'poster', label: 'Poster', emoji: '🖼️', desc: '800×1000 gradient poster with title, details & branding' },
  { value: 'caption', label: 'Caption', emoji: '✍️', desc: 'Engaging caption + hashtags for any post or event' },
  { value: 'thumbnail', label: 'Thumbnail', emoji: '📸', desc: '1280×720 YouTube-style thumbnail with bold text' },
];

const EXAMPLES = {
  video: 'Create a short video for AI Hackathon 2025 at our college',
  poster: 'Design a poster for a web development internship at Google, deadline June 30',
  caption: 'Write a caption for our college placement drive featuring top MNCs',
  thumbnail: 'Make a thumbnail for a machine learning tutorial series',
};

export default function AIStudio() {
  const [type, setType] = useState('poster');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/ai/generate', { prompt: prompt.trim(), type });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Ensure the Manim service is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCaption = () => {
    const text = result?.content + '\n\n' + (result?.hashtags || []).join(' ');
    navigator.clipboard.writeText(text);
  };

  const manimServiceUrl = import.meta.env.VITE_MANIM_SERVICE_URL || 'http://localhost:5001';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">AI Studio</h1>
        <p className="text-gray-400 text-sm">Generate professional content for your cohort using AI</p>
      </div>

      {/* Service status notice */}
      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl px-4 py-3 mb-6 text-sm text-indigo-300">
        <strong>Note:</strong> Video, poster, and thumbnail generation requires the Manim service running at{' '}
        <code className="text-indigo-200 bg-indigo-900/30 px-1 rounded">localhost:5001</code>.
        Start it with: <code className="text-indigo-200 bg-indigo-900/30 px-1 rounded">cd manim-service && python app.py</code>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => { setType(t.value); setResult(null); setError(''); }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              type === t.value
                ? 'border-purple-500 bg-purple-900/20 text-white'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            <span className="text-3xl">{t.emoji}</span>
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Selected type info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-4 text-sm text-gray-400">
        {TYPES.find((t) => t.value === type)?.desc}
      </div>

      {/* Prompt input */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
        <label className="block text-sm text-gray-400 mb-2">Your prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={EXAMPLES[type]}
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors"
        />
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setPrompt(EXAMPLES[type])}
            className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
          >
            Use example prompt
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? <Spinner size="sm" /> : <span>✨</span>}
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {type === 'video' ? 'Rendering Manim animation (this takes ~30-60s)...' : 'Generating your content...'}
          </p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="bg-gray-900 border border-purple-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-400">✓</span>
            <h3 className="font-semibold text-white capitalize">{result.type} Generated</h3>
          </div>

          {result.type === 'caption' ? (
            <div>
              <div className="bg-gray-800 rounded-xl p-4 mb-3">
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{result.content}</p>
              </div>
              {result.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.hashtags.map((tag) => (
                    <span key={tag} className="text-xs bg-purple-900/30 text-purple-300 border border-purple-700/40 px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              <button
                onClick={handleCopyCaption}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-xl text-sm transition-colors"
              >
                Copy Caption + Hashtags
              </button>
            </div>
          ) : (
            <div>
              {result.type === 'video' ? (
                <video
                  src={`${manimServiceUrl}${result.url}`}
                  controls
                  className="w-full rounded-xl max-h-80 bg-gray-800"
                />
              ) : (
                <img
                  src={`${manimServiceUrl}${result.url}`}
                  alt="Generated content"
                  className="w-full rounded-xl max-h-96 object-contain bg-gray-800"
                />
              )}
              <div className="flex gap-2 mt-3">
                <a
                  href={`${manimServiceUrl}${result.url}`}
                  download={result.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
