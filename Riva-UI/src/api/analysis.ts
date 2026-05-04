import { apiFetch } from './client'

export interface AnalysisSummary {
  status: string
  serverTimeUtc: string
  host: string
  runtime: string
}

export async function getAnalysisSummary(): Promise<AnalysisSummary> {
  return apiFetch<AnalysisSummary>('analysis/summary', {
    method: 'GET',
  })
}
