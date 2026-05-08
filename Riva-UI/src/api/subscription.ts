import { apiFetch } from './client';

export interface SubscriptionPlan {
  id: number;
  name: string;
  priceUsd: number;
  priceInr: number;
  templatesAccess: 'free_only' | 'all';
  maxInvitations: number | null;
}

export interface UserSubscription {
  plan: string;
  expiresAt: string | null;
  isActive: boolean;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return apiFetch<SubscriptionPlan[]>('subscription/plans');
}

export async function getMySubscription(): Promise<UserSubscription> {
  return apiFetch<UserSubscription>('subscription/my');
}

export async function initiateSubscriptionPayment(planId: number): Promise<{ paymentId: number; amount: number }> {
  return apiFetch('subscription/initiate', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  });
}

export async function confirmSubscriptionUpgrade(paymentId: number, planId: number): Promise<{ message: string }> {
  return apiFetch('subscription/confirm', {
    method: 'POST',
    body: JSON.stringify({ paymentId, planId }),
  });
}
