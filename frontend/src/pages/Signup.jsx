import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const ROLES = [
  { value: 'student', label: 'Student', emoji: '🎓', desc: 'Access courses, posts & opportunities' },
  { value: 'faculty', label: 'Faculty', emoji: '👨‍🏫', desc: 'Share knowledge & manage content' },
  { value: 'admin', label: 'Admin', emoji: '🛠️', desc: 'Full platform management' },
];

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Biomedical', 'MBA', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];
const SEMESTERS = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

const COLLEGE_MAPPING = {
  'ACET': '@acet.ac.in',
  'Aditya University': '@adityauniversity.in',
  'Pragati': '@pragati.ac.in',
  'IIT Delhi': '@iitd.ac.in',
  'IIT Madras': '@iitm.ac.in',
  'IIT Bombay': '@iitb.ac.in',
  'IIT Kanpur': '@iitk.ac.in',
  'IIT Guwahati': '@iitg.ac.in',
  'Delhi Technological University': '@dtu.ac.in',
};

const COLLEGE_NAMES = Object.keys(COLLEGE_MAPPING);

function Field({ label, name, type = 'text', placeholder, required, form, errors, set, subText }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 font-medium mb-1.5">{label}{required && ' *'}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-blue-50 border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
          errors[name] ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
        }`}
      />
      {errors[name] && <p className="text-red-600 text-xs mt-1">{errors[name]}</p>}
      {subText && !errors[name] && <p className="text-xs text-gray-500 mt-1">{subText}</p>}
    </div>
  );
}

function PasswordField({ label, name, placeholder, required, form, errors, set, showPassword, setShowPassword }) {
  const isPasswordField = name === 'password';
  return (
    <div>
      <label className="block text-sm text-gray-700 font-medium mb-1.5">{label}{required && ' *'}</label>
      <div className="relative">
        <input
          type={showPassword[name] ? 'text' : 'password'}
          value={form[name]}
          onChange={(e) => set(name, e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-blue-50 border rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
            errors[name] ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
          }`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword({ ...showPassword, [name]: !showPassword[name] })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors p-1"
            title={showPassword[name] ? 'Hide password' : 'Show password'}
          >
            {showPassword[name] ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 4.5c3.59 0 6.748 2.045 8.268 5-.336.666-.763 1.287-1.265 1.855l-2.318-2.318a3 3 0 01-4 4l-2.318-2.318A9.956 9.956 0 0110 4.5zM2.732 7.732A9.957 9.957 0 0110 3c3.59 0 6.748 2.045 8.268 5a10.02 10.02 0 01-1.265 1.855l-2.318-2.318A3 3 0 107.732 9.732l-2.318-2.318z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </div>
      {errors[name] && <p className="text-red-600 text-xs mt-1">{errors[name]}</p>}
      {!errors[name] && name === 'password' && (
        <div className="text-xs text-gray-600 mt-2 space-y-1">
          <div className={form.password.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-500'}>✓ At least 8 characters</div>
          <div className={/[a-z]/.test(form.password) ? 'text-green-600 font-medium' : 'text-gray-500'}>✓ Lowercase letter</div>
          <div className={/[A-Z]/.test(form.password) ? 'text-green-600 font-medium' : 'text-gray-500'}>✓ Uppercase letter</div>
          <div className={/[0-9]/.test(form.password) ? 'text-green-600 font-medium' : 'text-gray-500'}>✓ Number</div>
          <div className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password) ? 'text-green-600 font-medium' : 'text-gray-500'}>✓ Special character</div>
        </div>
      )}
    </div>
  );
}

function SelectField({ label, name, options, required, form, errors, set }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 font-medium mb-1.5">{label}{required && ' *'}</label>
      <select
        value={form[name]}
        onChange={(e) => set(name, e.target.value)}
        className={`w-full bg-blue-50 border rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
          errors[name] ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
        }`}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
        ))}
      </select>
      {errors[name] && <p className="text-red-600 text-xs mt-1">{errors[name]}</p>}
    </div>
  );
}

function TextAreaField({ label, name, placeholder, required, form, errors, set, maxChars }) {
  const charCount = form[name]?.length || 0;
  return (
    <div>
      <label className="block text-sm text-gray-700 font-medium mb-1.5">{label}{required && ' *'} {maxChars && `(${charCount}/${maxChars})`}</label>
      <textarea
        value={form[name]}
        onChange={(e) => set(name, e.target.value.slice(0, maxChars))}
        placeholder={placeholder}
        maxLength={maxChars}
        className={`w-full bg-blue-50 border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none ${
          errors[name] ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
        }`}
        rows="3"
      />
      {errors[name] && <p className="text-red-600 text-xs mt-1">{errors[name]}</p>}
    </div>
  );
}

export default function Signup() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    college: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    branch: '',
    branchOther: '',
    year: '',
    semester: '',
    rollNumber: '',
    bio: '',
    studentType: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => {
    const updated = { ...f, [k]: v };
    if (k === 'branch' && v !== 'Other') {
      updated.branchOther = '';
    }
    return updated;
  });

  const getDomainFromCollege = (college) => {
    return COLLEGE_MAPPING[college] || null;
  };

  const validateEmailForCollege = (email, college) => {
    const domain = getDomainFromCollege(college);
    return domain && email.endsWith(domain);
  };

  const validatePassword = (pwd) => {
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    return hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough;
  };

  const validateStep2 = () => {
    const e = {};

    // College validation
    if (!form.college) {
      e.college = 'College is required';
    }

    // Full Name validation
    if (!form.fullName.trim()) {
      e.fullName = 'Full name is required';
    } else if (form.fullName.length < 3) {
      e.fullName = 'Full name must be at least 3 characters';
    } else if (/[^a-zA-Z\s]/.test(form.fullName)) {
      e.fullName = 'Full name cannot contain special symbols';
    }

    // Email validation
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Valid email required';
    } else if (!form.college) {
      e.college = 'Please select your college first';
    } else if (!validateEmailForCollege(form.email, form.college)) {
      const domain = getDomainFromCollege(form.college);
      e.email = domain ? `Email must end with ${domain}` : 'Invalid email for selected college';
    }

    // Password validation
    if (!form.password) {
      e.password = 'Password is required';
    } else if (!validatePassword(form.password)) {
      e.password = 'Password must have 8+ chars, uppercase, lowercase, number & special char';
    }

    // Branch validation for students
    if (role === 'student') {
      if (!form.branch) {
        e.branch = 'Branch is required';
      } else if (form.branch === 'Other' && !form.branchOther.trim()) {
        e.branchOther = 'Please enter your branch name';
      }
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validations
    if (role === 'student') {
      if (!form.department) e.department = 'Department is required';
      if (!form.year) e.year = 'Year of study is required';
      if (!form.semester) e.semester = 'Semester is required';
      if (!form.rollNumber.trim()) {
        e.rollNumber = 'Roll number is required';
      } else if (!/^[a-zA-Z0-9]+$/.test(form.rollNumber)) {
        e.rollNumber = 'Roll number can only contain letters and numbers';
      }
      if (!form.studentType) e.studentType = 'Please select Junior or Senior';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    setApiError('');
    try {
      await register({
        ...form,
        role,
        institution: form.college,
        branch: form.branch === 'Other' ? form.branchOther.trim() : form.branch,
      });
      navigate('/feed');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center px-4 py-8">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-60 h-25 rounded-xl ">
        <img src="/logo.png" alt="CohortConnect logo" />
        </div>
      </Link>

      <div className="bg-white border border-blue-200 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg shadow-blue-500/10">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600 text-sm mb-6">First, choose your role</p>
            <div className="space-y-3 mb-6">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    role === r.value ? 'border-blue-400 bg-blue-100 shadow-md shadow-blue-200' : 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-white'
                  }`}
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{r.label}</p>
                    <p className="text-xs text-gray-600">{r.desc}</p>
                  </div>
                  {role === r.value && (
                    <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => role && setStep(2)}
              disabled={!role}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Continue as {role ? ROLES.find((r) => r.value === role)?.label : '...'}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-blue-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
                <p className="text-sm text-gray-600">Registering as <span className="text-blue-600 capitalize font-medium">{role}</span></p>
              </div>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common Fields */}
              <Field
                label="Full Name"
                name="fullName"
                placeholder="John Doe"
                required
                form={form}
                errors={errors}
                set={set}
                subText="No special symbols allowed"
              />

              <SelectField
                label="College"
                name="college"
                options={COLLEGE_NAMES}
                required
                form={form}
                errors={errors}
                set={set}
              />

              <Field
                label="College Email"
                name="email"
                type="email"
                placeholder={`you${getDomainFromCollege(form.college) || '@domain.com'}`}
                required
                form={form}
                errors={errors}
                set={set}
                subText={form.college ? `Must end with ${getDomainFromCollege(form.college)}` : 'Select college first'}
              />

              <PasswordField
                label="Password"
                name="password"
                placeholder="Min 8 chars with uppercase, lowercase, number & special char"
                required
                form={form}
                errors={errors}
                set={set}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />

              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Repeat password"
                required
                form={form}
                errors={errors}
                set={set}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />

              {/* Student-Specific Fields */}
              {role === 'student' && (
                <>
                  <SelectField
                    label="Department"
                    name="department"
                    options={DEPARTMENTS}
                    required
                    form={form}
                    errors={errors}
                    set={set}
                  />

                  <SelectField
                    label="Branch"
                    name="branch"
                    options={[...DEPARTMENTS, 'Other']}
                    required
                    form={form}
                    errors={errors}
                    set={set}
                  />

                  {form.branch === 'Other' && (
                    <Field
                      label="Branch Name"
                      name="branchOther"
                      placeholder="Enter your branch name"
                      required
                      form={form}
                      errors={errors}
                      set={set}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <SelectField
                      label="Year of Study"
                      name="year"
                      options={YEARS}
                      required
                      form={form}
                      errors={errors}
                      set={set}
                    />

                    <SelectField
                      label="Semester"
                      name="semester"
                      options={SEMESTERS}
                      required
                      form={form}
                      errors={errors}
                      set={set}
                    />
                  </div>

                  <Field
                    label="Roll Number"
                    name="rollNumber"
                    placeholder="Your unique roll number"
                    required
                    form={form}
                    errors={errors}
                    set={set}
                    subText="Used for institution verification"
                  />

                  <div className="space-y-3">
                    <label className="block text-sm text-gray-700 font-medium mb-3">Student Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Junior', 'Senior'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => set('studentType', type)}
                          className={`p-3 rounded-xl border transition-all text-center ${
                            form.studentType === type ? 'border-blue-400 bg-blue-100 shadow-md shadow-blue-200' : 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-white'
                          }`}
                        >
                          <p className="text-gray-900 font-semibold">{type}</p>
                          <p className="text-xs text-gray-600">{type === 'Junior' ? '1st-2nd Year' : '3rd-4th Year'}</p>
                        </button>
                      ))}
                    </div>
                    {errors.studentType && <p className="text-red-600 text-xs">{errors.studentType}</p>}
                  </div>

                  <TextAreaField
                    label="Bio"
                    name="bio"
                    placeholder="Tell us about yourself... (optional)"
                    form={form}
                    errors={errors}
                    set={set}
                    maxChars={200}
                  />
                </>
              )}

              {/* Faculty-Specific Fields */}
              {role === 'faculty' && (
                <>
                  <SelectField
                    label="Department"
                    name="department"
                    options={DEPARTMENTS}
                    required
                    form={form}
                    errors={errors}
                    set={set}
                  />

                  <TextAreaField
                    label="Bio"
                    name="bio"
                    placeholder="Your academic background and research interests... (optional)"
                    form={form}
                    errors={errors}
                    set={set}
                    maxChars={200}
                  />
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all mt-6 shadow-md shadow-blue-500/20"
              >
                {loading && <Spinner size="sm" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
