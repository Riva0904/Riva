import { apiFetch } from './client';

export interface InitiatePaymentRequest {
  amount: number;
  currency?: string;
  notes?: string;
}

export interface PaymentDto {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface RequestOtpRequest {
  paymentId: number;
}

export interface VerifyOtpRequest {
  paymentId: number;
  code: string;
}

export interface CreateOrderResponse {
  paymentId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface VerifyPaymentRequest {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export const initiatePayment = async (request: InitiatePaymentRequest): Promise<PaymentDto> => {
  return apiFetch('/payment/initiate', {
    method: 'POST',
    body: JSON.stringify(request)
  });
};

export const requestOtp = async (request: RequestOtpRequest): Promise<{ message: string; success: boolean }> => {
  return apiFetch('/payment/request-otp', {
    method: 'POST',
    body: JSON.stringify(request)
  });
};

export const verifyOtp = async (request: VerifyOtpRequest): Promise<{ isValid: boolean }> => {
  return apiFetch('/payment/verify-otp', {
    method: 'POST',
    body: JSON.stringify(request)
  });
};

export const createOrder = async (paymentId: number): Promise<CreateOrderResponse> => {
  return apiFetch('/payment/create-order', {
    method: 'POST',
    body: JSON.stringify({ paymentId })
  });
};

export const verifyPayment = async (request: VerifyPaymentRequest): Promise<PaymentDto> => {
  return apiFetch('/payment/verify', {
    method: 'POST',
    body: JSON.stringify(request)
  });
};