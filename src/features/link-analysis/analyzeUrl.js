import { analyzeUrl as runUrlRules, examples, RULE_COUNT } from '../../analyzer.js'
import { calculateRiskScore } from '../../utils/scoring.js'

export function analyzeUrl(input) {
  const result = runUrlRules(input)
  const risk = calculateRiskScore(result.findings)
  const signalNames = result.findings.slice(0, 3).map(item => item.title.toLowerCase())
  const summaryText = result.findings.length
    ? `This link shows ${signalNames.join(', ')}. These URL characteristics deserve additional verification before the destination is trusted.`
    : 'No configured URL risk signals were detected. This does not guarantee the destination is safe; verify unfamiliar links independently.'
  return { ...result, ...risk, type: 'link', label: risk.label, summaryText, description: result.summary.domain }
}

export { examples, RULE_COUNT }
