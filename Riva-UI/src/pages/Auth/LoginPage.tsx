import React, { useState } from 'react';
import { login } from '../../api/auth';

const inp = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

const LoginPage: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const res = await login({ emailOrUsername, password });
      // Redirect based on role
      if (res.role === 'Admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (x: unknown) {
      setError(x instanceof Error ? x.message : 'Login failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg">R</div>
            <span className="text-xl font-bold text-slate-900">Digital<span className="text-purple-600">Invitation</span></span>
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-900/10 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Login to access your invitations</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
              <strong>Error:</strong> {error}
              {error.toLowerCase().includes('not verified') && (
                <span className="block mt-1">
                  <a href="/register" className="font-semibold underline">Verify your account</a>
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={lbl}>Email or Username</label>
              <input
                className={inp}
                value={emailOrUsername}
                onChange={e => setEmailOrUsername(e.target.value)}
                placeholder="Enter email or username"
                required
              />
            </div>
            <div>
              <label className={lbl}>Password</label>
              <input
                type="password"
                className={inp}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" disabled={busy}
              className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 disabled:opacity-50 transition">
              {busy ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <a href="/register"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              🎉 Create new account
            </a>
            <a href="/admin"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-purple-200 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 transition">
              ⚡ Admin Portal
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 Riva Digital Invitation Platform
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
