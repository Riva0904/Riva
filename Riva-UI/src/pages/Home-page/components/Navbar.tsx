import React from 'react';
import { getStoredAuthToken } from '../../../api/client';
import { getStoredRole } from '../../../api/auth';

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const isLoggedIn = !!getStoredAuthToken();
  const role = getStoredRole();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        {/* Brand */}
        <a href="/" className="text-xl font-semibold tracking-tight text-slate-950">
          Digital<span className="text-purple-600">Invitation</span>
        </a>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="/"           className="hover:text-purple-600 transition">Home</a>
          <a href="#templates"  className="hover:text-purple-600 transition">Templates</a>
          <a href="#features"   className="hover:text-purple-600 transition">Features</a>
          <a href="#pricing"    className="hover:text-purple-600 transition">Pricing</a>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {role === 'Admin' && (
                <a href="/admin"
                  className="hidden rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition md:inline-flex">
                  ⚡ Admin
                </a>
              )}
              <a href="/dashboard"
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition">
                My Dashboard
              </a>
            </>
          ) : (
            <>
              <a href="/login"
                className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition md:inline-flex">
                Login
              </a>
              <a href="/register"
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition">
                Get Started
              </a>
            </>
          )}

          {/* Mobile menu toggle */}
          <button onClick={onMenuToggle}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100 transition md:hidden">
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
