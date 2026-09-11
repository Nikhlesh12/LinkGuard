import { MESSAGE_RULES } from '../../data/messageRules.js'
import { calculateRiskScore, createReportId } from '../../utils/scoring.js'

function extractLinks(text) {
  const pattern = /(?:https?|hxxps?):\/\/[^\s<>"']+|(?:www\.)[a-z0-9][^\s<>"']+/gi
  return (text.match(pattern) || []).map(value => value.replace(/[.,;!?)]$/, ''))
}

export function classifyPossiblePattern(ids, text) {
  const has = id => ids.includes(id)
  if (has('credentials') && /kyc|verify/i.test(text)) return 'Fake KYC / Verification'
  if (has('credentials')) return 'Credential Phishing'
  if (has('payment') && /courier|parcel|delivery/i.test(text)) return 'Fake Delivery Message'
  if (has('payment')) return 'Payment Scam'
  if (has('reward')) return 'Prize / Reward Scam'
  if (has('riskyAction') && /support|remote|screen share/i.test(text)) return 'Tech Support Scam'
  if (has('impersonation')) return 'Impersonation Attempt'
  return 'Unknown / Insufficient Signals'
}

export function generateRecommendations(ids, links) {
  const recommendations = new Set(['Verify the message using independently verified contact information.'])
  if (ids.includes('credentials')) recommendations.add('Do not enter passwords, PINs, CVVs, or OTPs through an unverified link.')
  if (ids.includes('payment')) recommendations.add('Avoid making payments based only on an unsolicited message.')
  if (ids.includes('riskyAction')) recommendations.add('Avoid installing unknown APK files or remote-access applications.')
  if (ids.includes('impersonation')) recommendations.add("Use the organization’s official website or app instead of the message instructions.")
  if (links.length) recommendations.add('Inspect the actual registered domain before trusting any extracted link.')
  return [...recommendations]
}

export function analyzeMessage(input) {
  const text = input.trim()
  if (!text) throw new Error('Paste a message to analyze.')
  if (text.length > 10000) throw new Error('Analyze messages shorter than 10,000 characters.')
  const lower = text.toLowerCase()
  const matchesTerm = term => new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(lower)
  const findings = MESSAGE_RULES.map(rule => {
    const matches = rule.terms.filter(matchesTerm)
    return matches.length ? { ...rule, evidence: matches.map(term => `“${term}”`).join(', ') } : null
  }).filter(Boolean)
  const links = extractLinks(text)
  if (links.length) findings.push({ id: 'links', title: 'External Link Included', severity: 'Medium', weight: 12, evidence: `${links.length} link${links.length > 1 ? 's' : ''} found`, explanation: 'Links can move the conversation to a page where identity, payment, or account details are requested.' })
  const risk = calculateRiskScore(findings)
  const ids = findings.map(item => item.id)
  const pattern = risk.score >= 25 ? classifyPossiblePattern(ids, text) : 'Unknown / Insufficient Signals'
  const possibleIntent = []
  if (ids.includes('credentials')) possibleIntent.push('Collect login or authentication information')
  if (ids.includes('payment')) possibleIntent.push('Collect a payment or fee')
  if (ids.includes('riskyAction')) possibleIntent.push('Convince the recipient to install software or provide device access')
  if (ids.includes('impersonation')) possibleIntent.push('Impersonate a trusted organization or service')
  if (/whatsapp|another number/i.test(text)) possibleIntent.push('Redirect the recipient to another communication channel')
  const signalNames = findings.slice(0, 3).map(item => item.title.toLowerCase())
  const summary = findings.length
    ? `This message contains ${signalNames.join(', ')}. These are possible scam or phishing signals and should be verified carefully.`
    : 'No configured scam phrases were detected. This does not prove the message is trustworthy; verify unexpected requests independently.'
  return { type: 'message', id: createReportId(text), timestamp: new Date().toISOString(), ...risk, findings, links, pattern, possibleIntent, recommendations: generateRecommendations(ids, links), summary, description: pattern }
}
