import React, { useState, useEffect } from 'react';
import api from '../utils/api';

// Analytics Dashboard — scaffold for future content performance metrics
// Integrates with backend/routes/analytics.js

const Analytics = () => {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get('/analytics/overview').then((res) => setOverview(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-[#94A3B8]">Content performance metrics — full dashboard coming soon.</p>
        </div>

        {overview ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-[#334155] bg-[#111827]/95 p-6 shadow-[0_24px_80px_-40px_rgba(14,165,233,0.5)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-[#94A3B8]">Total Posts</p>
              <p className="mt-4 text-4xl font-semibold text-cyan-300">{overview.totalPosts}</p>
            </div>
            <div className="rounded-[28px] border border-[#334155] bg-[#111827]/95 p-6 shadow-[0_24px_80px_-40px_rgba(139,92,246,0.4)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-[#94A3B8]">Total Users</p>
              <p className="mt-4 text-4xl font-semibold text-purple-400">{overview.totalUsers}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#334155] bg-[#111827]/95 p-6 shadow-[0_24px_80px_-40px_rgba(100,116,139,0.35)] backdrop-blur-xl">
            <p className="text-sm text-[#94A3B8]">Loading analytics preview...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
