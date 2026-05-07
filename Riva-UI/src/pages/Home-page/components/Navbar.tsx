import React from 'react';
import { getStoredAuthToken } from '../../../api/client';
import { getStoredRole } from '../../../api/auth';

interface NavbarProps { onMenuToggle: () => void; }

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const isLoggedIn = !!getStoredAuthToken();
  const role = getStoredRole();

  return (
    <header className="navbar-green">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        <a href="/" className="flex items-center gap-2.5">
          <div className="logo-icon text-base">R</div>
          <span className="text-xl font-black text-slate-900">
            Digital<span className="text-green">Invitation</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="/"          className="navbar-link nav-link">Home</a>
          <a href="#templates" className="navbar-link nav-link">Templates</a>
          <a href="#features"  className="navbar-link nav-link">Features</a>
          <a href="#pricing"   className="navbar-link nav-link">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {role === 'Admin' && (
                <a href="/admin" className="navbar-btn-outline hidden md:inline-flex">⚡ Admin</a>
              )}
              <a href="/dashboard" className="navbar-btn-primary">My Dashboard</a>
            </>
          ) : (
            <>
              <a href="/login"    className="navbar-btn-outline hidden md:inline-flex">Login</a>
              <a href="/register" className="navbar-btn-primary">Get Started</a>
            </>
          )}

          <button onClick={onMenuToggle} className="navbar-btn-outline md:hidden p-2">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
