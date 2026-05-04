import React, { useEffect, useState } from 'react'
import { getCurrentUser, login, register } from '../../../api/auth'
import type { UserDto } from '../../../api/auth'

interface AuthModalProps {
  isOpen: boolean
  defaultMode: 'login' | 'register'
  onClose: () => void
  onLoginSuccess: (user: UserDto) => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, defaultMode, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      setUsername('')
      setPassword('')
      setEmail('')
      setStatus(null)
      setError(null)
    }
  }, [isOpen, defaultMode])

  const handleAuthError = (error: unknown) => {
    if (error instanceof Error) {
      setError(error.message)
    } else {
      setError('An unexpected error occurred.')
    }
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus('Logging in...')

    try {
      await login({ username, password })
      const user = await getCurrentUser()
      onLoginSuccess(user)
      setStatus(`Logged in as ${user.username}`)
      setPassword('')
      setTimeout(onClose, 500)
    } catch (err) {
      handleAuthError(err)
      setStatus(null)
    }
  }

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus('Registering...')

    try {
      const response = await register({ username, email, password })
      setStatus(response.message)
      setMode('login')
      setEmail('')
      setPassword('')
    } catch (err) {
      handleAuthError(err)
      setStatus(null)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/15">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{mode === 'login' ? 'Login' : 'Register'}</h2>
            <p className="text-sm text-slate-500">Use the popup to connect to the API and analyze backend status.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {status && <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{status}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="grid gap-4">
          <div>
            <label htmlFor="popup-username" className="block text-sm font-medium text-slate-700">Username</label>
            <input
              id="popup-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="popup-email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="popup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="popup-password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="popup-password"
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
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
                setStatus(null)
              }}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
            >
              {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal;
