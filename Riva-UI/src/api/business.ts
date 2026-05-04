import { apiFetch } from './client'

export interface PaymentSummary {
  totalRevenue: number
  recentTransactions: number
  paidCustomers: number
  pendingInvoices: number
  lastUpdated: string
}

export interface SubscriberOverview {
  activeSubscribers: number
  newThisMonth: number
  churnRate: number
  trialUsers: number
  avgLifetimeDays: number
}

export async function getPaymentSummary(): Promise<PaymentSummary> {
  return apiFetch<PaymentSummary>('business/payment-summary', {
    method: 'GET',
  })
}

export async function getSubscriberOverview(): Promise<SubscriberOverview> {
  return apiFetch<SubscriberOverview>('business/subscriber-overview', {
    method: 'GET',
  })
}
