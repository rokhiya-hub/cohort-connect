import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const ROLES = [
  { value: 'student', label: 'Student', emoji: '🎓', desc: 'Access courses, posts & opportunities' },
  { value: 'faculty', label: 'Faculty', emoji: '👨‍🏫', desc: 'Share knowledge & manage content' },
  { value: 'admin', label: 'Admin', emoji: '🛠️', desc: 'Full platform management' },
];

function Field({ label, name, type = 'text', placeholder, required, form, errors, set }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}{required && ' *'}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${errors[name] ? 'border-red-500' : 'border-gray-700 focus:border-purple-500'}`}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  );
}

export default function Signup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    institution: '', branch: '', year: '', department: '', designation: '', adminCode: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep2 = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (role === 'student' && !form.institution.trim()) e.institution = 'Institution is required';
    if (role === 'faculty' && !form.department.trim()) e.department = 'Department is required';
    if (role === 'admin' && !form.adminCode.trim()) e.adminCode = 'Admin code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    setApiError('');
    try {
      await register({ ...form, role });
      navigate('/feed');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg">CC</div>
        <span className="font-bold text-xl text-white">CohortConnect</span>
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-400 text-sm mb-6">First, choose your role</p>
            <div className="space-y-3 mb-6">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    role === r.value ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                  }`}
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <div>
                    <p className="font-semibold text-white">{r.label}</p>
                    <p className="text-xs text-gray-400">{r.desc}</p>
                  </div>
                  {role === r.value && (
                    <svg className="w-5 h-5 text-purple-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => role && setStep(2)}
              disabled={!role}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              Continue as {role ? ROLES.find((r) => r.value === role)?.label : '...'}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Fill in your details</h1>
                <p className="text-sm text-gray-400">Registering as <span className="text-purple-400 capitalize">{role}</span></p>
              </div>
            </div>

            {apiError && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full Name" name="fullName" placeholder="John Doe" required form={form} errors={errors} set={set} />
              <Field label="Email" name="email" type="email" placeholder="you@university.edu" required form={form} errors={errors} set={set} />
              <Field label="Password" name="password" type="password" placeholder="Min 6 characters" required form={form} errors={errors} set={set} />
              <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" required form={form} errors={errors} set={set} />

              {role === 'student' && (
                <>
                  <Field label="University / Institution" name="institution" placeholder="MIT, Stanford, IIT Delhi..." required form={form} errors={errors} set={set} />
                  <Field label="Branch" name="branch" placeholder="CSE, ECE, IT..." form={form} errors={errors} set={set} />
                  <Field label="Year / Semester" name="year" placeholder="3rd Year / 5th Semester" form={form} errors={errors} set={set} />
                </>
              )}
              {role === 'faculty' && (
                <>
                  <Field label="Institution" name="institution" placeholder="Your university" form={form} errors={errors} set={set} />
                  <Field label="Department" name="department" placeholder="Computer Science, EE..." required form={form} errors={errors} set={set} />
                  <Field label="Designation" name="designation" placeholder="Professor, Associate Professor..." form={form} errors={errors} set={set} />
                </>
              )}
              {role === 'admin' && (
                <>
                  <Field label="Organization" name="institution" placeholder="Your organization" form={form} errors={errors} set={set} />
                  <Field label="Admin Code" name="adminCode" type="password" placeholder="Admin secret code" required form={form} errors={errors} set={set} />
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors mt-2"
              >
                {loading && <Spinner size="sm" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
