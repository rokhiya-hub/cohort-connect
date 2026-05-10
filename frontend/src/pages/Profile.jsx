import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwnProfile = !id || id === currentUser?._id;
  const profileId = id || currentUser?._id;

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${profileId}`)
      .then((res) => {
        setProfile(res.data);
        setForm({
          fullName: res.data.fullName || '',
          username: res.data.username || '',
          institution: res.data.institution || '',
          branch: res.data.branch || '',
          year: res.data.year || '',
          department: res.data.department || '',
          designation: res.data.designation || '',
          personalEmail: res.data.personalEmail || '',
          linkedin: res.data.linkedin || '',
          phone: res.data.phone || '',
          bio: res.data.bio || '',
          profilePicture: res.data.profilePicture || '',
        });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/users/me', form);
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmNew) {
      return setPwError('New passwords do not match');
    }
    if (pwForm.newPassword.length < 6) {
      return setPwError('New password must be at least 6 characters');
    }
    setSaving(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setChangingPassword(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const roleColors = { student: 'bg-blue-900/30 text-blue-300 border-blue-700/50', faculty: 'bg-green-900/30 text-green-300 border-green-700/50', admin: 'bg-red-900/30 text-red-300 border-red-700/50' };
  const roleBadge = roleColors[profile?.role] || 'bg-gray-800 text-gray-300 border-gray-700';

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!profile) return <p className="text-center text-gray-400 py-20">Profile not found</p>;

  return (
    <div className="max-w-2xl mx-auto">
      {success && (
        <div className="bg-green-900/30 border border-green-700/50 rounded-xl px-4 py-3 mb-4 text-green-400 text-sm">{success}</div>
      )}

      {/* Profile Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-5">
          <Avatar src={profile.profilePicture} name={profile.fullName} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white">{profile.fullName}</h1>
                {profile.username && <p className="text-sm text-gray-400">@{profile.username}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${roleBadge}`}>
                {profile.role}
              </span>
            </div>

            {profile.bio && <p className="text-sm text-gray-300 mt-2 leading-relaxed">{profile.bio}</p>}

            <div className="mt-3 space-y-1">
              {(profile.institution || profile.department) && (
                <p className="text-sm text-gray-400">
                  🏫 {profile.institution || profile.department}
                  {profile.designation && ` · ${profile.designation}`}
                  {profile.branch && ` · ${profile.branch}`}
                  {profile.year && ` · ${profile.year}`}
                </p>
              )}
              {profile.personalEmail && <p className="text-sm text-gray-400">📧 {profile.personalEmail}</p>}
              {profile.phone && <p className="text-sm text-gray-400">📱 {profile.phone}</p>}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
                  🔗 LinkedIn
                </a>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{profile.points?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">Points</p>
              </div>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setChangingPassword(true)}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
            >
              Change Password
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Profile" size="lg">
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <div className="space-y-4">
          {[
            { label: 'Full Name', key: 'fullName' },
            { label: 'Username', key: 'username' },
            { label: 'Profile Picture URL', key: 'profilePicture' },
            { label: profile?.role === 'faculty' ? 'Department' : 'Institution', key: profile?.role === 'faculty' ? 'department' : 'institution' },
            profile?.role === 'student' && { label: 'Branch', key: 'branch' },
            profile?.role === 'student' && { label: 'Year / Semester', key: 'year' },
            profile?.role === 'faculty' && { label: 'Designation', key: 'designation' },
            { label: 'Personal Email (optional)', key: 'personalEmail' },
            { label: 'LinkedIn URL (optional)', key: 'linkedin' },
            { label: 'Phone (optional)', key: 'phone' },
          ].filter(Boolean).map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-gray-400 mb-1.5">{field.label}</label>
              <input
                value={form[field.key] || ''}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Bio (optional)</label>
            <textarea
              value={form.bio || ''}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              maxLength={500}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={changingPassword} onClose={() => setChangingPassword(false)} title="Change Password">
        {pwError && <p className="text-red-400 text-sm mb-3">{pwError}</p>}
        <div className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirmNew' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm text-gray-400 mb-1.5">{f.label}</label>
              <input
                type="password"
                value={pwForm[f.key]}
                onChange={(e) => setPwForm((p) => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
          <button
            onClick={handlePasswordChange}
            disabled={saving}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
