import React, { useEffect, useState } from 'react';
import { getCurrentUser, login, logout, register } from '../../../api/auth';
import type { UserDto } from '../../../api/auth';

const AuthPanel: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    };

    loadUser();
  }, []);

  const handleAuthError = (error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred.');
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus('Logging in...');

    try {
      await login({ emailOrUsername: username, password });
      const user = await getCurrentUser();
      setCurrentUser(user);
      setStatus(`Logged in as ${user.username} (${user.role})`);
      setPassword('');
    } catch (err) {
      handleAuthError(err);
      setStatus(null);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus('Registering...');

    try {
      const response = await register({ username, email, password });
      setStatus(response.message);
      setMode('login');
      setEmail('');
      setPassword('');
    } catch (err) {
      handleAuthError(err);
      setStatus(null);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setStatus('Logged out.');
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Connect to the API</h2>
          <p className="text-sm text-slate-500">Login, register, and view the current authenticated user directly from the UI.</p>
        </div>
        {currentUser && (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {status && <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{status}</div>}

      {currentUser ? (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm text-slate-500">Authenticated user details</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Username</h3>
              <p className="text-sm text-slate-600">{currentUser.username}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Email</h3>
              <p className="text-sm text-slate-600">{currentUser.email}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Role</h3>
              <p className="text-sm text-slate-600">{currentUser.role}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Active</h3>
              <p className="text-sm text-slate-600">{currentUser.isActive ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                {mode === 'login' ? 'Login' : 'Register'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                  setStatus(null);
                }}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
              >
                {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">API integration status</p>
            <ul className="mt-4 space-y-2">
              <li>• Sends login and registration requests to the backend.</li>
              <li>• Stores the JWT token in local storage.</li>
              <li>• Loads the current authenticated user from the API.</li>
              <li>• Displays errors and backend messages in the UI.</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export default AuthPanel;
