import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — matches sidebar width w-72 = 288px */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-16 bg-white border-b border-blue-200 shadow-sm">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3 rounded-2xl bg-white border border-blue-100 px-3 py-2 shadow-sm">
            <img
              src="/logo.png"
              alt="CohortConnect"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">CohortConnect</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-blue-500">Campus Network</p>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}