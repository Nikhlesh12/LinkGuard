const SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'shorturl.at'])
const COMMON_TLDS = new Set(['com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'dev', 'app', 'in', 'uk', 'de', 'ai', 'me'])
const TWO_PART_SUFFIXES = new Set(['co.uk', 'org.uk', 'com.au', 'co.in', 'com.br', 'co.jp', 'co.nz'])

const rules = {
  http: ['Unencrypted HTTP', 'Medium', 14, 'The URL uses HTTP rather than HTTPS.', 'Information sent over HTTP is not encrypted in transit.', 'Avoid entering personal information and look for the official HTTPS address.'],
  long: ['Unusually Long URL', 'Low', 8, 'The URL is unusually long.', 'Long URLs can make important destination details harder to inspect.', 'Review the hostname and key path segments before proceeding.'],
  subdomains: ['Excessive Subdomains', 'Medium', 12, 'The hostname contains many subdomain levels.', 'Attackers can place trusted-looking words in subdomains while the real domain appears later.', 'Read the registered domain from right to left and verify its spelling.'],
  ip: ['IP Address Used as Hostname', 'Medium', 18, 'The destination is written as a numeric IP address.', 'Most legitimate public services use recognizable domain names. An IP-based URL can deserve additional verification.', 'Confirm the address through an independent, trusted source.'],
  credentials: ['Credentials in URL', 'High', 24, 'The URL contains username or password-style syntax before the hostname.', 'Browsers can visually de-emphasize this section, making the true destination easy to misread.', 'Do not enter credentials; verify the destination through the organization’s official site.'],
  punycode: ['Punycode Hostname', 'Medium', 16, 'The hostname includes an xn-- internationalized-domain label.', 'Punycode is legitimate, but can encode characters that resemble a different brand or domain.', 'Inspect the decoded domain carefully and navigate from a trusted bookmark if unsure.'],
  hostlong: ['Unusually Long Hostname', 'Low', 8, 'The hostname is longer than commonly expected.', 'Length can make subtle misspellings and the actual registered domain harder to notice.', 'Check the domain name carefully before trusting the page.'],
  special: ['Many Special Characters', 'Medium', 10, 'The URL contains an unusually high number of separators or symbols.', 'Dense punctuation can make a destination harder to read and may conceal nested values.', 'Pause and inspect each URL component, especially the hostname.'],
  hyphens: ['Excessive Hyphens', 'Low', 7, 'The hostname contains several hyphens.', 'Many hyphens can be used to imitate familiar brand naming patterns.', 'Compare the domain with the organization’s official domain.'],
  encoded: ['Encoded Characters', 'Low', 8, 'The URL includes percent-encoded characters.', 'Encoding is common, but can make the displayed path or query harder to understand.', 'Decode and review unfamiliar values before opening the link.'],
  keywords: ['Suspicious Keyword Combination', 'Medium', 14, 'Multiple urgency or account-related terms appear in the URL.', 'Phishing links often combine words such as verify, login, secure, update, or reward to create urgency.', 'Open the service independently instead of using the link.'],
  port: ['Unusual Network Port', 'Medium', 13, 'The URL specifies a non-standard port.', 'Public websites normally use standard web ports; another port may indicate an unusual service.', 'Verify that the port is expected for this organization or service.'],
  nested: ['Nested URL Pattern', 'High', 20, 'Another full web address appears inside the path or query.', 'Nested destinations can obscure redirects or make the visible URL misleading.', 'Do not follow the link until the embedded destination is understood.'],
  query: ['Very Long Query String', 'Low', 8, 'The query string contains a large amount of data.', 'Long query data can hide tracking, redirect destinations, or confusing parameters.', 'Review parameter names and remove unnecessary tracking data when practical.'],
  shortener: ['Shortened Link', 'Medium', 16, 'The hostname belongs to a commonly used link-shortening service.', 'Short links hide the final destination. The service itself is not necessarily unsafe.', 'Expand or verify the destination with a trusted security service before opening it.']
}

function finding(key) {
  const [title, severity, weight, detected, why, recommendation] = rules[key]
  return { key, title, severity, weight, detected, why, recommendation }
}

function splitHostname(hostname) {
  const clean = hostname.replace(/^\[|\]$/g, '')
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(clean) || clean.includes(':') || clean === 'localhost') {
    return { domain: clean, subdomains: [] }
  }
  const parts = clean.split('.').filter(Boolean)
  const suffix = parts.slice(-2).join('.')
  const domainSize = TWO_PART_SUFFIXES.has(suffix) ? 3 : 2
  if (parts.length <= domainSize) return { domain: clean, subdomains: [] }
  return { domain: parts.slice(-domainSize).join('.'), subdomains: parts.slice(0, -domainSize) }
}

function display(value, fallback = 'None') { return value || fallback }

export function analyzeUrl(rawInput) {
  const input = rawInput.trim()
  if (!input) throw new Error('Enter a URL to analyze.')
  let normalized = input
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(normalized)) normalized = `https://${normalized}`
  let url
  try { url = new URL(normalized) } catch { throw new Error('That URL could not be parsed. Check the format and try again.') }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('LinkGuard analyzes HTTP and HTTPS web URLs only.')
  if (!url.hostname) throw new Error('The URL needs a valid hostname.')

  const hostname = url.hostname.toLowerCase()
  const { domain, subdomains } = splitHostname(hostname)
  const hits = []
  const add = (condition, key) => { if (condition) hits.push(finding(key)) }
  const ipV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) && hostname.split('.').every(n => +n <= 255)
  const ipV6 = hostname.includes(':')
  const specialCount = (normalized.match(/[@%?&=+_;,:]/g) || []).length
  const keywordMatches = (normalized.toLowerCase().match(/login|verify|secure|account|update|password|wallet|bonus|reward|urgent/g) || [])
  const uniqueKeywords = new Set(keywordMatches)
  const nestedValue = `${url.pathname}${url.search}`

  add(url.protocol === 'http:', 'http')
  add(normalized.length > 120, 'long')
  add(subdomains.length >= 3, 'subdomains')
  add(ipV4 || ipV6, 'ip')
  add(Boolean(url.username || url.password || /@/.test(input.split(/[/?#]/)[2] || '')), 'credentials')
  add(hostname.split('.').some(part => part.startsWith('xn--')), 'punycode')
  add(hostname.length > 50, 'hostlong')
  add(specialCount >= 10, 'special')
  add((hostname.match(/-/g) || []).length >= 3, 'hyphens')
  add(/%[0-9a-f]{2}/i.test(normalized), 'encoded')
  add(uniqueKeywords.size >= 2, 'keywords')
  add(Boolean(url.port && !['80', '443'].includes(url.port)), 'port')
  add(/https?(?:%3a|:)(?:%2f|\/){2}/i.test(nestedValue), 'nested')
  add(url.search.length > 100, 'query')
  add(SHORTENERS.has(hostname), 'shortener')

  const rawScore = hits.reduce((sum, item) => sum + item.weight, 0)
  const score = Math.min(100, rawScore)
  const level = score <= 24 ? 'Low Risk Indicators' : score <= 49 ? 'Some Risk Indicators' : score <= 74 ? 'Suspicious' : 'High Risk Indicators'
  const queryParameters = [...url.searchParams.entries()].map(([key, value]) => ({ key, value }))

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    input, normalized: url.href, timestamp: new Date().toISOString(), score, level, findings: hits,
    summary: { protocol: url.protocol.replace(':', '').toUpperCase(), domain, subdomains: subdomains.length ? subdomains.join('.') : 'None' },
    breakdown: {
      protocol: url.protocol.replace(':', ''), hostname, subdomain: subdomains.join('.') || 'None', domain,
      port: display(url.port, 'Default'), path: display(url.pathname === '/' ? '' : decodeSafe(url.pathname)),
      queryParameters, fragment: display(url.hash ? decodeSafe(url.hash.slice(1)) : '')
    }
  }
}

function decodeSafe(value) { try { return decodeURIComponent(value) } catch { return value } }

export const examples = [
  { label: 'Normal URL', value: 'https://www.example.com/resources/security-guide' },
  { label: 'Long URL', value: 'https://docs.example.com/resources/security/article?campaign=cyber-awareness&reference=synthetic-training-example&category=url-safety' },
  { label: 'IP-based URL', value: 'http://192.0.2.24/account/verify' },
  { label: 'Multiple subdomains', value: 'https://login.support.accounts.example.com/session' },
  { label: 'Encoded URL', value: 'https://example.com/account/%76%65%72%69%66%79?next=https%3A%2F%2Fexample.net' }
]

export { SHORTENERS, COMMON_TLDS }
