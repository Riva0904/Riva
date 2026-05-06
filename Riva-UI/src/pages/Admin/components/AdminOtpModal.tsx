import React, { useState } from 'react';
import { verifyOtp, resendOtp } from '../../../api/auth';

interface Props {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const AdminOtpModal: React.FC<Props> = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await verifyOtp({ email, otpCode: otp });
      setStatus('Account verified! You can now log in.');
      setTimeout(onVerified, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await resendOtp(email);
      setStatus('New OTP sent to your email.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="mb-2 text-xl font-bold text-slate-800">Verify your email</h2>
        <p className="mb-6 text-sm text-slate-500">
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {status && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{status}</div>}
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text" maxLength={6} placeholder="000000"
            value={otp} onChange={e => setOtp(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none focus:border-purple-500"
            required
          />
          <button type="submit" disabled={loading}
            className="w-full rounded-full bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-700">← Back</button>
          <button onClick={handleResend} className="text-purple-600 hover:underline">Resend OTP</button>
        </div>
      </div>
    </div>
  );
};

export default AdminOtpModal;
