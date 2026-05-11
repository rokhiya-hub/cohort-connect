import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import AIStudio from './pages/AIStudio';
import AdminPanel from './pages/AdminPanel';
import Home from './pages/Home';
import Categories from './pages/Categories';
import MyPosts from './pages/MyPosts';
import Saved from './pages/Saved';
import VideoFeed from './pages/VideoFeed';
import VideoUpload from './pages/VideoUpload';
import Connect from './pages/Connect';
import Messages from './pages/Messages';
import StudyGroups from './pages/StudyGroups';
import Doubts from './pages/Doubts';
import Search from './pages/Search';
import Layout from './components/layout/Layout';
import Spinner from './components/common/Spinner';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-950"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-950"><Spinner size="lg" /></div>;
  if (user) return <Navigate to="/home" replace />;
  return children;
}

function P({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected — main app */}
      <Route path="/home" element={<P><Feed /></P>} />
      <Route path="/feed" element={<P><Feed /></P>} />
      <Route path="/my-posts" element={<P><MyPosts /></P>} />
      <Route path="/saved" element={<P><Saved /></P>} />
      <Route path="/categories" element={<P><Categories /></P>} />
      <Route path="/profile" element={<P><Profile /></P>} />
      <Route path="/profile/:id" element={<P><Profile /></P>} />
      <Route path="/leaderboard" element={<P><Leaderboard /></P>} />
      <Route path="/ai-studio" element={<P><AIStudio /></P>} />
      <Route path="/search" element={<P><Search /></P>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminPanel /></Layout></ProtectedRoute>} />

      {/* Videos */}
      <Route path="/videos" element={<P><VideoFeed /></P>} />
      <Route path="/my-videos" element={<Navigate to="/my-posts" replace />} />
      <Route path="/upload" element={<P><VideoUpload /></P>} />

      {/* Connect & Chat */}
      <Route path="/connect" element={<P><Connect /></P>} />
      <Route path="/messages" element={<P><Messages /></P>} />
      <Route path="/groups" element={<P><StudyGroups /></P>} />
      <Route path="/doubts" element={<P><Doubts /></P>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
