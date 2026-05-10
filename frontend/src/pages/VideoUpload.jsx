import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Spinner from '../components/common/Spinner';

const CATEGORIES = [
  { value: 'general', label: '⚡ General' },
  { value: 'interviews', label: '💼 Interviews' },
  { value: 'internships', label: '🚀 Internships' },
  { value: 'exam-prep', label: '📝 Exam Prep' },
  { value: 'resources', label: '📚 Resources' },
  { value: 'events', label: '🎉 Events' },
  { value: 'tech-ai', label: '🤖 Tech & AI' },
];

const AI_TYPES = [
  { value: 'video', label: 'Video', emoji: '🎬', desc: 'Animated Manim video' },
  { value: 'poster', label: 'Poster / Image', emoji: '🖼️', desc: 'Gradient poster or thumbnail' },
];

const AI_EXAMPLES = {
  video: 'Create a short animated video explaining Binary Search with step-by-step visualization',
  poster: 'Design a poster for a Web Dev internship at Google — deadline June 30, 2025',
};

/* ─── Shared metadata form ─────────────────────────────────── */
function MetaForm({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="e.g. How to crack TCS NQT — Full Guide"
          maxLength={150}
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
        />
        <p className="text-gray-600 text-xs mt-1 text-right">{form.title.length}/150</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="What will viewers learn from this video?"
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            placeholder="DSA, interview (comma separated)"
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── File/URL Upload tab ───────────────────────────────────── */
function UploadTab({ form, setForm, onSubmit, loading, error }) {
  const [dragOver, setDragOver] = useState(false);
  const [localFile, setLocalFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setLocalFile(file);

    // Upload immediately to backend
    setUploading(true);
    setUploadProgress(0);
    const fd = new FormData();
    fd.append('video', file);
    try {
      const token = localStorage.getItem('token');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/video`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          setForm((p) => ({ ...p, url: data.url }));
        } else {
          const err = JSON.parse(xhr.responseText);
          alert(err.message || 'Upload failed');
          setLocalFile(null);
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        alert('Upload failed — check the server is running');
        setLocalFile(null);
      };

      xhr.send(fd);
    } catch {
      setUploading(false);
    }
  }, [setForm]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setLocalFile(null);
    setForm((p) => ({ ...p, url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isReady = form.url && form.title.trim();

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      {!localFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragOver
              ? 'border-indigo-500 bg-indigo-600/10 scale-[1.01]'
              : 'border-gray-700 hover:border-indigo-600/60 hover:bg-gray-800/30'
          }`}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-colors ${
            dragOver ? 'bg-indigo-600/20' : 'bg-gray-800'
          }`}>
            📁
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">
              {dragOver ? 'Drop to upload' : 'Drag & drop your video here'}
            </p>
            <p className="text-gray-500 text-xs mt-1">or click to browse — MP4, WebM, MOV, AVI up to 500 MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={onInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🎬</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{localFile.name}</p>
              <p className="text-gray-500 text-xs">{(localFile.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
            <button onClick={clearFile} className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {uploading ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : form.url ? (
            <div className="space-y-2">
              <p className="text-green-400 text-xs font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Uploaded successfully
              </p>
              <video src={form.url} controls className="w-full max-h-48 rounded-xl bg-black" />
            </div>
          ) : null}
        </div>
      )}

      {/* OR: paste a URL */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-800" />
        <p className="text-gray-600 text-xs flex-shrink-0">or paste a URL</p>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      <input
        type="url"
        value={localFile ? form.url : form.url}
        onChange={(e) => {
          setLocalFile(null);
          setForm((p) => ({ ...p, url: e.target.value }));
        }}
        placeholder="https://youtube.com/watch?v=… or any video URL"
        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
      />

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Thumbnail URL (optional)</label>
        <input
          type="url"
          value={form.thumbnail}
          onChange={(e) => setForm((p) => ({ ...p, thumbnail: e.target.value }))}
          placeholder="https://… preview image"
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
        />
        {form.thumbnail && (
          <img
            src={form.thumbnail}
            alt="thumbnail"
            className="mt-2 w-full max-h-36 object-cover rounded-xl border border-gray-700"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>

      {/* Metadata */}
      <MetaForm form={form} setForm={setForm} />

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!isReady || loading || uploading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
      >
        {loading ? <><Spinner size="sm" /> Saving…</> : '📤 Upload Video'}
      </button>
    </div>
  );
}

/* ─── AI Generate tab ───────────────────────────────────────── */
function AIGenerateTab({ form, setForm, onUseResult }) {
  const [aiType, setAiType] = useState('video');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [reprompt, setReprompt] = useState('');
  const manimUrl = import.meta.env.VITE_MANIM_SERVICE_URL || 'http://localhost:5001';

  const generate = async (customPrompt) => {
    const p = customPrompt || prompt;
    if (!p.trim()) return;
    setGenerating(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/ai/generate', { prompt: p.trim(), type: aiType });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Generation failed. Make sure the Manim service is running on port 5001.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReprompt = () => {
    if (!reprompt.trim()) return;
    const combined = `${result ? 'Previous: ' + prompt + '\nChanges: ' : ''}${reprompt}`;
    setPrompt(reprompt);
    setReprompt('');
    generate(combined);
  };

  const handleUse = () => {
    const fullUrl = `${manimUrl}${result.url}`;
    onUseResult(fullUrl, result.type === 'video');
  };

  return (
    <div className="space-y-5">
      {/* Service notice */}
      <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl px-4 py-3 text-xs text-purple-300">
        <strong>Requires Manim service</strong> running at{' '}
        <code className="bg-purple-900/30 px-1 rounded">localhost:5001</code>.
        Start it: <code className="bg-purple-900/30 px-1 rounded">cd manim-service && python app.py</code>
      </div>

      {/* Type tabs */}
      <div className="flex gap-3">
        {AI_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => { setAiType(t.value); setResult(null); setError(''); }}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${
              aiType === t.value
                ? 'border-purple-500 bg-purple-900/20 text-white'
                : 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-600'
            }`}
          >
            <span className="text-2xl">{t.emoji}</span>
            <span className="text-sm font-medium">{t.label}</span>
            <span className="text-gray-500 text-xs">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Prompt */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 space-y-3">
        <label className="block text-sm font-medium text-gray-300">Your prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setError(''); }}
          placeholder={AI_EXAMPLES[aiType]}
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPrompt(AI_EXAMPLES[aiType])}
            className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
          >
            Use example prompt ↗
          </button>
          <button
            onClick={() => generate()}
            disabled={!prompt.trim() || generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {generating ? <><Spinner size="sm" /> Generating…</> : <>✨ Generate</>}
          </button>
        </div>
      </div>

      {/* Generating state */}
      {generating && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Spinner size="md" />
          </div>
          <p className="text-white font-medium text-sm">
            {aiType === 'video' ? 'Rendering Manim animation…' : 'Generating image…'}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {aiType === 'video' ? 'This usually takes 30–90 seconds' : 'A few seconds…'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && !generating && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Result */}
      {result && !generating && (
        <div className="bg-gray-900 border border-purple-700/40 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800">
            <span className="text-green-400 text-lg">✓</span>
            <p className="text-white font-semibold text-sm capitalize">{result.type} Generated</p>
          </div>

          {/* Preview */}
          <div className="p-4">
            {result.type === 'video' ? (
              <video
                src={`${manimUrl}${result.url}`}
                controls
                autoPlay
                className="w-full rounded-xl max-h-72 bg-black"
              />
            ) : (
              <img
                src={`${manimUrl}${result.url}`}
                alt="AI generated"
                className="w-full rounded-xl max-h-80 object-contain bg-gray-800"
              />
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-2 flex-wrap">
            <button
              onClick={handleUse}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              📤 Use this &amp; upload
            </button>
            <a
              href={`${manimUrl}${result.url}`}
              download={result.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-xl transition-colors"
            >
              ⬇ Download
            </a>
          </div>

          {/* Re-prompt */}
          <div className="px-4 pb-4 border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-xs font-medium mb-2">🔄 Request changes</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={reprompt}
                onChange={(e) => setReprompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReprompt()}
                placeholder="e.g. Make the text larger, add a blue background…"
                className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={handleReprompt}
                disabled={!reprompt.trim() || generating}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Re-generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function VideoUpload() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'ai'
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    category: 'general',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError('Title is required');
    if (!form.url.trim()) return setError('Video URL or file is required');
    setLoading(true);
    setError('');
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.post('/videos', { ...form, tags });
      navigate('/my-videos');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save video');
    } finally {
      setLoading(false);
    }
  };

  // Called when user clicks "Use this & upload" from AI tab
  const handleUseAIResult = (url, isVideo) => {
    setForm((p) => ({
      ...p,
      url,
      category: isVideo ? p.category : 'resources',
    }));
    setActiveTab('upload');
  };

  const tabs = [
    { id: 'upload', label: '📁 Upload / URL', desc: 'File drag & drop or paste a link' },
    { id: 'ai', label: '✨ AI Generate', desc: 'Create with Manim via prompt' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Video</h1>
        <p className="text-gray-500 text-sm mt-0.5">Share educational content or generate with AI</p>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-2 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError(''); }}
            className={`flex flex-col items-center gap-1 py-4 rounded-2xl border transition-all ${
              activeTab === tab.id
                ? tab.id === 'ai'
                  ? 'border-purple-500 bg-purple-900/20 text-white'
                  : 'border-indigo-500 bg-indigo-900/20 text-white'
                : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-gray-300'
            }`}
          >
            <span className="text-lg font-semibold">{tab.label}</span>
            <span className="text-xs text-gray-500">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        {activeTab === 'upload' ? (
          <UploadTab
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        ) : (
          <AIGenerateTab
            form={form}
            setForm={setForm}
            onUseResult={handleUseAIResult}
          />
        )}
      </div>

      {/* Tips */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-3">💡 Tips</p>
        <ul className="space-y-1.5 text-xs text-gray-500">
          <li>• <strong className="text-gray-400">Upload tab:</strong> drag & drop any video file (MP4, WebM, MOV) or paste a YouTube/Drive URL</li>
          <li>• <strong className="text-gray-400">AI Generate:</strong> describe what you want and Manim renders it — then click "Use this & upload"</li>
          <li>• Use "Re-generate" to refine the AI output with change requests before saving</li>
          <li>• Pick the right category so peers discover your content easily</li>
        </ul>
      </div>
    </div>
  );
}
