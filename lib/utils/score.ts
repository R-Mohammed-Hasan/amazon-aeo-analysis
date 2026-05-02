import { RoastIssue, AEOModelResult } from '@/types'

export function calcRoastScore(issues: RoastIssue[]): number {
  let score = 10
  for (const issue of issues) {
    if (issue.severity === 'critical') score -= 2
    else if (issue.severity === 'warning') score -= 1
    else score -= 0.5
  }
  return Math.max(1, Math.round(score * 10) / 10)
}

export function calcAEOScore(results: AEOModelResult[]): number {
  if (results.length === 0) return 0
  const avg = results.reduce((sum, r) => sum + (r.queriesMatched / r.totalQueries) * 10, 0) / results.length
  return Math.round(avg * 10) / 10
}
