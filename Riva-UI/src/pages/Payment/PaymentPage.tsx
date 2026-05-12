import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  initiatePayment, requestOtp, verifyOtp, createOrder, verifyPayment,
  type CreateOrderResponse,
} from '../../api/payment';
import { confirmSubscriptionUpgrade } from '../../api/subscription';
import { getStoredAuthToken } from '../../api/client';

declare global { interface Window { Razorpay: any; } }

type Step = 'details' | 'otp' | 'pay' | 'success';
type Mode = 'template' | 'subscription';

const PLAN_LABELS: Record<string, { name: string; priceInr: number }> = {
  '2': { name: 'Premium', priceInr: 1590 },
  '3': { name: 'Business', priceInr: 3750 },
};

const stepVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -40 },
};

const PaymentPage: React.FC = () => {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();

  const mode: Mode     = params.get('planId') ? 'subscription' : 'template';
  const planId         = params.get('planId') ?? '';
  const templateId     = params.get('templateId') ?? '';
  const amountParam    = params.get('amount') ?? '';
  const templateName   = params.get('name') ?? 'Template';

  const plan           = PLAN_LABELS[planId];
  const amountInr      = mode === 'subscription' ? (plan?.priceInr ?? 0) : Number(amountParam);

  const [step,      setStep]      = useState<Step>('details');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [otp,       setOtp]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredAuthToken()) navigate('/login');
  }, [navigate]);

  const handleInitiate = async () => {
    setLoading(true); setError(null);
    try {
      const payment = await initiatePayment({ amount: amountInr, currency: 'INR',
        notes: mode === 'subscription' ? `${plan?.name} plan upgrade` : `Template: ${templateName}` });
      setPaymentId(payment.id);
      await requestOtp({ paymentId: payment.id });
      setStep('otp');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to initiate payment');
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (!paymentId) return;
    setLoading(true); setError(null);
    try { await requestOtp({ paymentId }); setError(null); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!paymentId || !otp.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await verifyOtp({ paymentId, code: otp.trim() });
      if (res.isValid) { setStep('pay'); }
      else { setError('Invalid OTP — please try again'); }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OTP verification failed');
    } finally { setLoading(false); }
  };

  const handlePay = async () => {
    if (!paymentId) return;
    setLoading(true); setError(null);
    try {
      const order = await createOrder(paymentId);
      openRazorpay(order);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create order');
      setLoading(false);
    }
  };

  const openRazorpay = (order: CreateOrderResponse) => {
    const rzp = new window.Razorpay({
      key:        order.key,
      amount:     order.amount * 100,
      currency:   order.currency,
      order_id:   order.razorpayOrderId,
      name:       'Riva Digital Invitations',
      description: mode === 'subscription' ? `${plan?.name} Plan` : templateName,
      image:      '/logo.png',
      theme:      { color: 'var(--color-primary)' },
      handler: async (response: any) => {
        try {
          await verifyPayment({
            razorpayPaymentId:  response.razorpay_payment_id,
            razorpayOrderId:    response.razorpay_order_id,
            razorpaySignature:  response.razorpay_signature,
          });
          if (mode === 'subscription' && paymentId) {
            await confirmSubscriptionUpgrade(paymentId, Number(planId));
          }
          setStep('success');
        } catch {
          setError('Payment verification failed. Contact support.');
        } finally { setLoading(false); }
      },
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.open();
  };

  const handleSuccess = () => {
    if (mode === 'subscription') { navigate('/dashboard'); }
    else { navigate(`/invitation/new/${templateId}`); }
  };

  return (
    <div className="bg-light-green min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="card-green w-full max-w-md overflow-hidden">

        {/* Header */}
        <div style={{ background: 'var(--color-gradient)' }} className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="logo-icon text-base">R</div>
            <span className="font-black text-white text-lg">Riva</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">
            {mode === 'subscription' ? `Upgrade to ${plan?.name ?? 'Plan'}` : `Buy Template`}
          </h1>
          <p className="text-green-200 text-sm mt-1">
            {mode === 'subscription'
              ? 'Unlock unlimited premium templates'
              : `Unlock: ${templateName}`}
          </p>
          <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-white">
            <span className="text-3xl font-black">₹{amountInr.toLocaleString()}</span>
            {mode === 'subscription' && <span className="text-green-200 text-sm ml-1">/month</span>}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-4 bg-green-50 border-b border-green-100">
          {(['details', 'otp', 'pay', 'success'] as Step[]).map((s, i) => (
            <motion.div key={s}
              animate={{ scale: step === s ? 1.2 : 1, backgroundColor: step === s ? 'var(--color-primary)' : ['details','otp','pay','success'].indexOf(step) > i ? 'var(--color-primary)' : 'rgba(var(--color-primary-rgb),0.08)' }}
              className="h-2.5 w-2.5 rounded-full" />
          ))}
        </div>

        <div className="p-8">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-4 rounded-xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-700 font-semibold flex gap-2">
              <span>⚠️</span> {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* Step 1 — Details */}
            {step === 'details' && (
              <motion.div key="details" variants={stepVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="space-y-5">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">
                      {mode === 'subscription' ? 'Plan' : 'Template'}
                    </span>
                    <span className="font-black text-slate-800">
                      {mode === 'subscription' ? plan?.name : templateName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Amount</span>
                    <span className="font-black text-green-700">₹{amountInr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Currency</span>
                    <span className="font-black text-slate-800">INR</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  An OTP will be sent to your registered email to confirm this payment.
                </p>
                <motion.button onClick={handleInitiate} disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-green w-full py-3.5 disabled:opacity-50">
                  {loading ? '⏳ Sending OTP…' : 'Continue →'}
                </motion.button>
                <button onClick={() => navigate(-1)}
                  className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition">
                  Cancel
                </button>
              </motion.div>
            )}

            {/* Step 2 — OTP */}
            {step === 'otp' && (
              <motion.div key="otp" variants={stepVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="space-y-5">
                <div className="text-center">
                  <div className="text-4xl mb-2">📧</div>
                  <p className="font-black text-slate-800">Check your email</p>
                  <p className="text-sm text-slate-400 mt-1">Enter the OTP we sent to verify your identity</p>
                </div>
                <input
                  type="text" maxLength={6} placeholder="Enter 6-digit OTP"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-green text-center text-2xl tracking-[0.5em] font-black"
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()} />
                <motion.button onClick={handleVerifyOtp} disabled={loading || otp.length < 4}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-green w-full py-3.5 disabled:opacity-50">
                  {loading ? '⏳ Verifying…' : 'Verify OTP →'}
                </motion.button>
                <button onClick={handleResendOtp} disabled={loading}
                  className="w-full text-center text-sm text-green-700 hover:underline font-semibold disabled:opacity-50">
                  Resend OTP
                </button>
              </motion.div>
            )}

            {/* Step 3 — Pay */}
            {step === 'pay' && (
              <motion.div key="pay" variants={stepVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="space-y-5">
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-black text-slate-800">OTP Verified!</p>
                  <p className="text-sm text-slate-400 mt-1">Complete your payment via Razorpay</p>
                </div>
                <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4 text-center">
                  <p className="text-sm text-slate-500">Total to pay</p>
                  <p className="text-3xl font-black text-green-700 mt-1">₹{amountInr.toLocaleString()}</p>
                </div>
                <motion.button onClick={handlePay} disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-green w-full py-3.5 disabled:opacity-50">
                  {loading ? '⏳ Opening Razorpay…' : '💳 Pay Now'}
                </motion.button>
              </motion.div>
            )}

            {/* Step 4 — Success */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }} className="space-y-5 text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl"
                  style={{ background: 'var(--color-gradient)' }}>
                  🎉
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Payment Successful!</h2>
                  <p className="text-slate-500 mt-2 text-sm">
                    {mode === 'subscription'
                      ? `Your ${plan?.name} plan is now active. Enjoy unlimited templates!`
                      : 'Template unlocked! Start creating your invitation.'}
                  </p>
                </div>
                <motion.button onClick={handleSuccess}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="btn-green w-full py-3.5">
                  {mode === 'subscription' ? '🚀 Go to Dashboard' : '✨ Create Invitation →'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
