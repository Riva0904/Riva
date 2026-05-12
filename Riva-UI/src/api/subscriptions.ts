import { apiFetch } from './client';

export interface MyPlan {
  subscription: {
    planType: string;
    billingCycle: string;
    status: string;
    startDate: string;
    endDate: string;
    amount: number;
  } | null;
  purchasedTemplateIds: number[];
}

export interface AccessResult {
  hasAccess: boolean;
  reason: string;
}

export const checkTemplateAccess = (templateId: number): Promise<AccessResult> =>
  apiFetch('/subscription/check-access', { method: 'POST', body: JSON.stringify({ templateId }) });

export const getMyPlan = (): Promise<MyPlan> =>
  apiFetch('/subscription/my-plan');

export const recordPurchase = (templateId: number, amount: number, razorpayPaymentId?: string) =>
  apiFetch('/subscription/record-purchase', {
    method: 'POST',
    body: JSON.stringify({ templateId, amount, razorpayPaymentId }),
  });

export const recordSubscription = (planType: string, billingCycle: string, razorpayPaymentId?: string) =>
  apiFetch('/subscription/record-subscription', {
    method: 'POST',
    body: JSON.stringify({ planType, billingCycle, razorpayPaymentId }),
  });

export const getAdminPool = (planType: string): Promise<{ planType: string; templateIds: number[]; monthlyQuota: number; yearlyQuota: number }> =>
  apiFetch(`/subscription/admin/pool/${planType}`);

export const setYearlyQuota = (planType: string, yearlyQuota: number) =>
  apiFetch('/subscription/admin/yearly-quota', {
    method: 'POST',
    body: JSON.stringify({ planType, yearlyQuota }),
  });

export const setAdminPool = (planType: string, templateIds: number[], monthlyQuota: number) =>
  apiFetch('/subscription/admin/pool', {
    method: 'POST',
    body: JSON.stringify({ planType, templateIds, monthlyQuota }),
  });
