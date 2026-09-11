export const RISK_LABELS = [
  { max: 24, label: 'Few Risk Signals', tone: 'low' },
  { max: 49, label: 'Some Risk Signals', tone: 'some' },
  { max: 74, label: 'Suspicious Signals', tone: 'suspicious' },
  { max: 100, label: 'Strong Risk Signals', tone: 'strong' }
]

export function calculateRiskScore(findings) {
  const rawScore = findings.reduce((sum, finding) => sum + finding.weight, 0)
  const score = Math.min(100, rawScore)
  const band = RISK_LABELS.find(item => score <= item.max)
  return { score, rawScore, label: band.label, tone: band.tone }
}

export function createReportId(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `LG-${(hash >>> 0).toString(16).padStart(8, '0').toUpperCase()}`
}
