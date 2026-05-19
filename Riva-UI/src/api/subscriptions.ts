import { apiFetch } from './client';

export interface MyPlan {
  subscription: {
    planType: string; billingCycle: string; status: string;
    startDate: string; endDate: string; amount: number;
  } | null;
  purchasedTemplateIds: number[];
}

export interface AccessResult { hasAccess: boolean; reason: string; }

export interface PlanSettings {
  monthlyPrice: number; yearlyPrice:  number;
  monthlyLimit: number; yearlyLimit:  number; // 0 = unlimited
}

export interface AllPlanSettings {
  premium: PlanSettings;
  pro:     PlanSettings;
}

export const checkTemplateAccess = (templateId: number): Promise<AccessResult> =>
  apiFetch('subscription/check-access', { method: 'POST', body: JSON.stringify({ templateId }) });

export const getMyPlan = (): Promise<MyPlan> =>
  apiFetch('subscription/my-plan');

export const recordPurchase = (templateId: number, amount: number, razorpayPaymentId?: string) =>
  apiFetch('subscription/record-purchase', {
    method: 'POST', body: JSON.stringify({ templateId, amount, razorpayPaymentId }),
  });

export const recordSubscription = (planType: string, billingCycle: string, razorpayPaymentId?: string) =>
  apiFetch('subscription/record-subscription', {
    method: 'POST', body: JSON.stringify({ planType, billingCycle, razorpayPaymentId }),
  });

export const getAllPlanSettings = (): Promise<AllPlanSettings> =>
  apiFetch('subscription/admin/plan-settings');

export const savePlanSettings = (
  planType: 'Paid' | 'Pro',
  monthlyPrice: number, yearlyPrice: number,
  monthlyLimit: number, yearlyLimit: number,
) =>
  apiFetch('subscription/admin/plan-settings', {
    method: 'POST',
    body: JSON.stringify({ planType, monthlyPrice, yearlyPrice, monthlyLimit, yearlyLimit }),
  });
