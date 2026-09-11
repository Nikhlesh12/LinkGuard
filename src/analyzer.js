const SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'shorturl.at'])
const TWO_PART_SUFFIXES = new Set(['co.uk', 'org.uk', 'ac.uk', 'com.au', 'net.au', 'co.in', 'firm.in', 'com.br', 'co.jp', 'co.nz'])
const RISKY_EXTENSIONS = new Set(['exe', 'scr', 'msi', 'bat', 'cmd', 'com', 'ps1', 'jar', 'apk', 'dmg', 'iso'])
const BRAND_DOMAINS = {
  google: ['google.com'], microsoft: ['microsoft.com', 'live.com', 'office.com'], apple: ['apple.com', 'icloud.com'],
  paypal: ['paypal.com'], amazon: ['amazon.com', 'amazon.in'], netflix: ['netflix.com'], facebook: ['facebook.com'],
  instagram: ['instagram.com'], whatsapp: ['whatsapp.com'], github: ['github.com'], dropbox: ['dropbox.com']
}

const rules = {
  http: ['Unencrypted HTTP', 'Medium', 14, 'The URL uses HTTP rather than HTTPS.', 'Information sent over HTTP is not encrypted in transit.', 'Avoid entering personal information and look for the official HTTPS address.'],
  long: ['Unusually Long URL', 'Low', 8, 'The URL is unusually long.', 'Long URLs can make important destination details harder to inspect.', 'Review the hostname and key path segments before proceeding.'],
  subdomains: ['Excessive Subdomains', 'Medium', 12, 'The hostname contains many subdomain levels.', 'Trusted-looking words can be placed in subdomains while the registered domain appears farther right.', 'Read the registered domain from right to left and verify its spelling.'],
  ip: ['IP Address Used as Hostname', 'Medium', 18, 'The destination is written as an IP address.', 'Most legitimate public services use recognizable domain names. An IP-based URL can deserve additional verification.', 'Confirm the address through an independent, trusted source.'],
  credentials: ['Credentials in URL', 'High', 28, 'The URL contains username or password-style syntax before the hostname.', 'Browsers may visually de-emphasize this section, making the true destination easy to misread.', 'Do not enter credentials; verify the destination through the organization’s official site.'],
  punycode: ['Punycode Hostname', 'Medium', 16, 'The hostname includes an xn-- internationalized-domain label.', 'Punycode is legitimate, but can encode characters that resemble a different brand or domain.', 'Inspect the decoded domain carefully and navigate from a trusted bookmark if unsure.'],
  hostlong: ['Unusually Long Hostname', 'Low', 8, 'The hostname is longer than commonly expected.', 'Length can make subtle misspellings and the registered domain harder to notice.', 'Check the domain name carefully before trusting the page.'],
  special: ['Many Special Characters', 'Medium', 10, 'The URL contains an unusually high number of separators or symbols.', 'Dense punctuation can make a destination harder to read and may conceal nested values.', 'Pause and inspect each URL component, especially the hostname.'],
  hyphens: ['Excessive Hyphens', 'Low', 7, 'The hostname contains several hyphens.', 'Many hyphens can be used to imitate familiar brand naming patterns.', 'Compare the domain with the organization’s official domain.'],
  encoded: ['Encoded Characters', 'Low', 8, 'The URL includes percent-encoded characters.', 'Encoding is common, but can make the displayed path or query harder to understand.', 'Review the decoded preview before opening the link.'],
  keywords: ['Suspicious Keyword Combination', 'Medium', 14, 'Multiple urgency or account-related terms appear in the URL.', 'Phishing links often combine words such as verify, login, secure, update, or reward to create urgency.', 'Open the service independently instead of using the link.'],
  port: ['Unusual Network Port', 'Medium', 13, 'The URL specifies a non-standard port.', 'Public websites normally use standard web ports; another port may indicate an unusual service.', 'Verify that the port is expected for this organization or service.'],
  nested: ['Embedded Destination / Redirect Pattern', 'High', 26, 'Another web address appears inside the path or query.', 'An embedded destination can obscure a redirect target or make the visible URL misleading.', 'Inspect the embedded host and reach the service independently if uncertain.'],
  query: ['Very Long Query String', 'Low', 8, 'The query string contains a large amount of data.', 'Long query data can hide tracking, redirect destinations, or confusing parameters.', 'Review parameter names and remove unnecessary tracking data when practical.'],
  shortener: ['Shortened Link', 'Medium', 16, 'The hostname belongs to a commonly used link-shortening service.', 'Short links hide the final destination. The service itself is not necessarily unsafe.', 'Expand or verify the destination with a trusted security service before opening it.'],
  riskyFile: ['Potentially Executable File', 'High', 28, 'The path ends with a file type that can execute code or install software.', 'Unexpected executable downloads are commonly used to deliver unwanted or harmful software.', 'Do not download it unless the source and file integrity are independently verified.'],
  doubleExtension: ['Misleading Double Extension', 'High', 32, 'The filename uses a document or image extension before an executable extension.', 'A double extension can make a program look like a harmless document when extensions are hidden.', 'Do not run the file; confirm its real type and source using trusted security controls.'],
  brandContext: ['Brand Name Outside Official Domain', 'Medium', 15, 'A recognizable service name appears, but the registered domain does not match that service.', 'Brand words in subdomains or paths can create false familiarity. This can also occur legitimately in articles or integrations.', 'Navigate to the brand using its known official address and verify the request there.'],
  randomLabel: ['Random-Looking Host Label', 'Low', 9, 'A long hostname label has high character randomness.', 'Random-looking labels are used legitimately, but can reduce readability and occur in disposable infrastructure.', 'Treat the signal as context and verify the registered domain independently.'],
  manyParams: ['Excessive Query Parameters', 'Low', 7, 'The URL contains many separate query parameters.', 'Many parameters can make redirects and important values difficult to audit visually.', 'Inspect parameter names, especially values named redirect, next, target, or destination.'],
  manyDigits: ['High Number of Digits', 'Low', 7, 'The hostname and path contain an unusually high number of digits.', 'Dense numeric strings can reduce readability and sometimes appear in generated or disposable links.', 'Use this as supporting context and verify the registered domain.'],
  misleadingPath: ['Misleading Path Terminology', 'Medium', 12, 'The path combines multiple account or security-related terms.', 'A trustworthy-looking path does not change who controls the registered domain.', 'Focus on the registered domain rather than words placed after the first slash.']
}

export const RULE_COUNT = Object.keys(rules).length

function finding(key, evidence) {
  const [title, severity, weight, detected, why, recommendation] = rules[key]
  return { key, title, severity, weight, detected, evidence, why, recommendation }
}

function isIp(hostname) {
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) && hostname.split('.').every(n => Number(n) <= 255)
  return ipv4 || hostname.includes(':')
}

function splitHostname(hostname) {
  const clean = hostname.replace(/^\[|\]$/g, '')
  if (isIp(clean) || clean === 'localhost') return { domain: clean, subdomains: [] }
  const parts = clean.split('.').filter(Boolean)
  const suffix = parts.slice(-2).join('.')
  const domainSize = TWO_PART_SUFFIXES.has(suffix) ? 3 : 2
  if (parts.length <= domainSize) return { domain: clean, subdomains: [] }
  return { domain: parts.slice(-domainSize).join('.'), subdomains: parts.slice(0, -domainSize) }
}

function entropy(text) {
  if (!text) return 0
  const counts = [...text].reduce((map, char) => map.set(char, (map.get(char) || 0) + 1), new Map())
  return [...counts.values()].reduce((sum, count) => { const p = count / text.length; return sum - p * Math.log2(p) }, 0)
}

function decodeLayers(value, maxLayers = 2) {
  let output = value, layers = 0
  while (layers < maxLayers) {
    try { const decoded = decodeURIComponent(output); if (decoded === output) break; output = decoded; layers += 1 } catch { break }
  }
  return { value: output, layers }
}

function refang(input) {
  let value = input.trim().replace(/^[`'\"]|[`'\"]$/g, '')
  const original = value
  value = value.replace(/^hxxps:/i, 'https:').replace(/^hxxp:/i, 'http:')
  value = value.replace(/\[\.\]|\(\.\)|\{\.\}/g, '.')
  return { value, wasDefanged: value !== original }
}

function fingerprint(value) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619) }
  return `LG-${(hash >>> 0).toString(16).padStart(8, '0').toUpperCase()}`
}

function display(value, fallback = 'None') { return value || fallback }
function decodeSafe(value) { return decodeLayers(value).value }

export function analyzeUrl(rawInput) {
  if (typeof rawInput !== 'string') throw new Error('Enter a URL to analyze.')
  const trimmed = rawInput.trim()
  if (!trimmed) throw new Error('Enter a URL to analyze.')
  if (trimmed.length > 4096) throw new Error('For safe local inspection, enter a URL shorter than 4,096 characters.')
  if(/[\u0000-\u001F\u007F]/.test(trimmed)) throw new Error('The URL contains unsupported control characters.')

  const { value: refanged, wasDefanged } = refang(trimmed)
  let normalized = refanged
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(normalized)) normalized = `https://${normalized}`
  let url
  try { url = new URL(normalized) } catch { throw new Error('That URL could not be parsed. Check the hostname and format, then try again.') }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('LinkGuard analyzes HTTP and HTTPS web URLs only.')
  if (!url.hostname) throw new Error('The URL needs a valid hostname.')

  const hostname = url.hostname.toLowerCase()
  const { domain, subdomains } = splitHostname(hostname)
  const hits = []
  const add = (condition, key, evidence) => { if (condition) hits.push(finding(key, evidence)) }
  const specialCount = (normalized.match(/[@%?&=+_;,:]/g) || []).length
  const keywords = [...new Set((normalized.toLowerCase().match(/login|verify|secure|account|update|password|wallet|bonus|reward|urgent|signin|confirm/g) || []))]
  const decodedTarget = decodeLayers(`${url.pathname}${url.search}`, 2)
  const nestedMatches = decodedTarget.value.match(/https?:\/\/[^\s&]+/gi) || []
  const pathFile = decodeSafe(url.pathname).split('/').pop() || ''
  const extension = pathFile.includes('.') ? pathFile.split('.').pop().toLowerCase() : ''
  const doubleExtension = /\.(pdf|docx?|xlsx?|jpe?g|png|gif|txt|zip)\.(exe|scr|msi|bat|cmd|com|ps1|jar|apk)$/i.test(pathFile)
  const brandMatch = Object.entries(BRAND_DOMAINS).find(([brand, official]) => {
    const appears = hostname.includes(brand) || url.pathname.toLowerCase().includes(brand)
    return appears && !official.some(allowed => domain === allowed || domain.endsWith(`.${allowed}`))
  })
  const randomLabel = hostname.split('.').find(label => label.length >= 16 && entropy(label) >= 3.6 && /[a-z]/.test(label) && /\d/.test(label))
  const redirectKeys = [...url.searchParams.keys()].filter(key => /^(url|uri|redirect|redirect_url|redirect_uri|next|target|dest|destination|continue|return|returnto|return_url)$/i.test(key))
  const digitCount = ((hostname + url.pathname).match(/\d/g) || []).length
  const pathTerms = [...new Set((url.pathname.toLowerCase().match(/login|verify|secure|account|signin|password|payment|wallet/g) || []))]

  add(url.protocol === 'http:', 'http', `Protocol: ${url.protocol.replace(':', '').toUpperCase()}`)
  add(normalized.length > 120, 'long', `Length: ${normalized.length} characters (threshold: 120)`)
  add(subdomains.length >= 3, 'subdomains', `${subdomains.length} subdomain labels: ${subdomains.join(' › ')}`)
  add(isIp(hostname), 'ip', `Hostname: ${hostname}`)
  add(Boolean(url.username || url.password || /@/.test(refanged.split(/[/?#]/)[2] || '')), 'credentials', `User-info section detected before ${hostname}`)
  add(hostname.split('.').some(part => part.startsWith('xn--')), 'punycode', `Encoded hostname: ${hostname}`)
  add(hostname.length > 50, 'hostlong', `Hostname length: ${hostname.length} characters (threshold: 50)`)
  add(specialCount >= 10, 'special', `${specialCount} special characters counted (threshold: 10)`)
  add((hostname.match(/-/g) || []).length >= 3, 'hyphens', `${(hostname.match(/-/g) || []).length} hyphens in hostname`)
  add(/%[0-9a-f]{2}/i.test(normalized), 'encoded', `${decodedTarget.layers} decoding layer(s); preview: ${decodedTarget.value.slice(0, 140)}`)
  add(keywords.length >= 2, 'keywords', `Matched terms: ${keywords.join(', ')}`)
  add(Boolean(url.port && !['80', '443'].includes(url.port)), 'port', `Explicit port: ${url.port}`)
  add(nestedMatches.length > 0, 'nested', nestedMatches.length ? `Embedded target: ${nestedMatches[0].slice(0, 140)}${redirectKeys.length ? ` · Redirect key: ${redirectKeys[0]}` : ''}` : '')
  add(url.search.length > 100, 'query', `Query length: ${url.search.length - 1} characters (threshold: 100)`)
  add(SHORTENERS.has(hostname), 'shortener', `Shortener host: ${hostname}`)
  add(RISKY_EXTENSIONS.has(extension), 'riskyFile', `Filename: ${pathFile}`)
  add(doubleExtension, 'doubleExtension', `Filename: ${pathFile}`)
  add(Boolean(brandMatch), 'brandContext', brandMatch ? `Brand term: ${brandMatch[0]} · Registered domain: ${domain}` : '')
  add(Boolean(randomLabel), 'randomLabel', randomLabel ? `Label: ${randomLabel} · Entropy: ${entropy(randomLabel).toFixed(2)} bits/character` : '')
  add([...url.searchParams].length >= 8, 'manyParams', `${[...url.searchParams].length} query parameters (threshold: 8)`)
  add(digitCount >= 8, 'manyDigits', `${digitCount} digits in hostname and path (threshold: 8)`)
  add(pathTerms.length >= 2, 'misleadingPath', `Path terms: ${pathTerms.join(', ')} · Registered domain: ${domain}`)

  const scoredHits = doubleExtension ? hits.filter(item => item.key !== 'riskyFile') : hits
  const rawScore = scoredHits.reduce((sum, item) => sum + item.weight, 0)
  const score = Math.min(100, rawScore)
  const level = score <= 24 ? 'Low Risk Indicators' : score <= 49 ? 'Some Risk Indicators' : score <= 74 ? 'Suspicious' : 'High Risk Indicators'
  const queryParameters = [...url.searchParams.entries()].map(([key, value]) => ({ key, value: decodeSafe(value) }))
  const signals = [
    { label: 'Transport', value: url.protocol === 'https:' ? 'HTTPS requested' : 'HTTP only', state: url.protocol === 'https:' ? 'positive' : 'warning' },
    { label: 'User-info syntax', value: url.username || url.password ? 'Present' : 'Not detected', state: url.username || url.password ? 'warning' : 'positive' },
    { label: 'Port profile', value: url.port && !['80', '443'].includes(url.port) ? `Unusual (${url.port})` : 'Standard/default', state: url.port && !['80', '443'].includes(url.port) ? 'warning' : 'positive' },
    { label: 'Destination visibility', value: SHORTENERS.has(hostname) || nestedMatches.length ? 'Obscured' : 'Directly visible', state: SHORTENERS.has(hostname) || nestedMatches.length ? 'warning' : 'positive' }
  ]

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    reportId: fingerprint(url.href), analyzerVersion: '2.0', input: trimmed, normalized: url.href, wasDefanged,
    timestamp: new Date().toISOString(), score, rawScore, level, findings: scoredHits, signals,
    summary: { protocol: url.protocol.replace(':', '').toUpperCase(), domain, subdomains: subdomains.length ? subdomains.join('.') : 'None' },
    breakdown: {
      protocol: url.protocol.replace(':', ''), hostname, subdomain: subdomains.join('.') || 'None', domain,
      port: display(url.port, 'Default'), path: display(url.pathname === '/' ? '' : decodeSafe(url.pathname)),
      queryParameters, fragment: display(url.hash ? decodeSafe(url.hash.slice(1)) : ''),
      decodedPreview: decodedTarget.layers ? decodedTarget.value : 'No encoded layers detected'
    }
  }
}

export const examples = [
  { label: 'Normal URL', type: 'Baseline', value: 'https://www.example.com/resources/security-guide' },
  { label: 'Long URL', type: 'Readability', value: 'https://docs.example.com/resources/security/article?campaign=cyber-awareness&reference=synthetic-training-example&category=url-safety' },
  { label: 'IP-based URL', type: 'Infrastructure', value: 'http://192.0.2.24:8080/account/verify' },
  { label: 'Multiple subdomains', type: 'Domain anatomy', value: 'https://login.support.accounts.example.com/session/verify' },
  { label: 'Encoded URL', type: 'Encoding', value: 'https://example.com/account/%76%65%72%69%66%79' },
  { label: 'Defanged IOC', type: 'Analyst workflow', value: 'hxxps://login[.]support[.]accounts[.]example[.]com/verify' },
  { label: 'Embedded redirect', type: 'Obfuscation', value: 'https://example.com/auth?next=https%3A%2F%2Fexample.net%2Fsignin' },
  { label: 'Double extension', type: 'Download', value: 'https://downloads.example.com/invoice.pdf.exe' },
  { label: 'Brand context', type: 'Impersonation', value: 'https://paypal-login-secure.example.com/account/confirm' }
]
