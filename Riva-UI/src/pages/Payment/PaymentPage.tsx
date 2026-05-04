import React, { useState } from 'react';
import { initiatePayment, requestOtp, verifyOtp, createOrder, verifyPayment } from '../../api/payment';
import type { InitiatePaymentRequest, CreateOrderResponse } from '../../api/payment';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage: React.FC = () => {
  const [step, setStep] = useState<'details' | 'otp' | 'pay' | 'success'>('details');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<InitiatePaymentRequest>({
    amount: 100,
    currency: 'INR',
    notes: ''
  });

  const [otp, setOtp] = useState('');

  const handleInitiate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payment = await initiatePayment(formData);
      setPaymentId(payment.id);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!paymentId) return;
    setLoading(true);
    setError(null);
    try {
      await requestOtp({ paymentId });
      alert('OTP sent successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!paymentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await verifyOtp({ paymentId, code: otp });
      if (result.isValid) {
        setStep('pay');
      } else {
        setError('Invalid OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!paymentId) return;
    setLoading(true);
    setError(null);
    try {
      const order = await createOrder(paymentId);
      handleRazorpayPayment(order);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = (order: CreateOrderResponse) => {
    const options = {
      key: order.key,
      amount: order.amount * 100,
      currency: order.currency,
      order_id: order.razorpayOrderId,
      name: 'Riva Payment',
      description: 'Test Payment',
      handler: async (response: any) => {
        try {
          await verifyPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          });
          setStep('success');
        } catch (err) {
          setError('Payment verification failed');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="payment-page p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment Flow</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {step === 'details' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleInitiate}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Initiating...' : 'Initiate Payment'}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <p>Enter OTP sent to your registered contact</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Resend OTP
            </button>
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      )}

      {step === 'pay' && (
        <div className="space-y-4">
          <p>OTP verified. Ready to pay ₹{formData.amount}</p>
          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating Order...' : 'Pay Now'}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-4">
          <div className="text-green-500 text-4xl">✓</div>
          <h2 className="text-xl font-semibold">Payment Successful!</h2>
          <p>Your payment has been processed successfully.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;