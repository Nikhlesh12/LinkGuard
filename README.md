# LinkGuard – Suspicious URL Risk Analyzer

LinkGuard is a privacy-friendly, client-side cybersecurity portfolio project that helps users inspect a URL before they trust it. It creates a **URL Risk Assessment** from visible URL characteristics and explains each detected indicator. It does not visit the destination and does not claim to determine whether a site is malicious.

## Purpose

Links can be difficult to read, especially when they contain many subdomains, encoded values, nested destinations, or misleading syntax. LinkGuard turns a URL into understandable components and highlights patterns that deserve additional verification. It is designed to demonstrate practical, defensive cybersecurity thinking for a fresher cybersecurity candidate.

## Features

- Local analysis of HTTP and HTTPS URL strings
- Explainable risk score from 0–100
- Four carefully worded risk-indicator classifications
- 20 weighted checks, with no pretend machine-learning claims
- SOC-friendly defanged IOC input support (`hxxps://` and `[.]`)
- Multi-layer percent-decoding and embedded redirect inspection
- Executable/double-extension, brand-context, and high-entropy label checks
- Exact evidence and per-rule score contribution for every finding
- Stable local report fingerprint plus copy-summary and JSON export actions
- Expandable findings that explain what was found, why it matters, and what to do
- Visual breakdown of protocol, hostname, subdomain, domain, port, path, query parameters, and fragment
- Synthetic examples covering normal, long, IP-based, multi-subdomain, encoded, defanged IOC, redirect, download, and impersonation patterns
- Latest 10 assessments saved in `localStorage`
- View, delete, and clear-history controls
- Responsive interface and accessible labels/focus states
- No backend, account, database, paid API, or external AI API
- Static-site deployment support
- Cloudflare Pages security headers, restrictive permissions, and immutable asset caching

## Tech stack

- React
- Vite
- JavaScript
- Tailwind CSS
- Lucide React
- Browser `URL` and `URLSearchParams` APIs
- Browser `localStorage`

## Installation

Requirements: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Open the local address shown by Vite. To verify the production build:

```bash
npm run build
npm run preview
```

## Architecture

```text
src/
├── analyzer.js   Pure URL parsing, rule evaluation, scoring, and examples
├── App.jsx       React UI, assessment results, history, and interactions
├── index.css     Tailwind directives and small global visual utilities
└── main.jsx      React entry point
```

`analyzer.js` contains no React code and performs no network operations. Given an input string, it returns a serializable assessment object. The UI renders that object and optionally stores it in local browser storage. Keeping the analysis engine separate makes the rules easier to review, test, and extend.

## URL parsing explanation

If a user omits a scheme, LinkGuard adds `https://` for parsing. It accepts only HTTP and HTTPS web URLs. The browser's standard `URL` API then separates the input into:

- protocol
- username/password syntax
- hostname
- port
- pathname
- search/query string
- fragment

The hostname is further presented as a domain and subdomain labels for educational inspection. This project uses a small built-in list of common multi-part public suffixes for that display. It is not a complete Public Suffix List implementation.

## Risk-scoring explanation

LinkGuard evaluates 20 deterministic rules. Thresholds and weights are intentionally visible so an interviewer or reviewer can audit every result:

| Indicator | Weight |
| --- | ---: |
| Unencrypted HTTP | 14 |
| Unusually long URL | 8 |
| Excessive subdomains | 12 |
| Raw IP address hostname | 18 |
| Username/password-style syntax | 28 |
| Punycode hostname | 16 |
| Unusually long hostname | 8 |
| Many special characters | 10 |
| Excessive hyphens | 7 |
| Percent-encoded characters | 8 |
| Suspicious keyword combination | 14 |
| Unusual network port | 13 |
| Nested URL / redirect pattern | 26 |
| Very long query string | 8 |
| Known link-shortener hostname | 16 |
| Potentially executable file | 28 |
| Misleading double extension | 32 |
| Brand name outside official domain | 15 |
| Random-looking hostname label | 9 |
| Excessive query parameters | 7 |

Weights are added and capped at 100. The result is classified as:

- 0–24: Low Risk Indicators
- 25–49: Some Risk Indicators
- 50–74: Suspicious
- 75–100: High Risk Indicators

Every result states: **“This score is based on URL characteristics and does not guarantee that a website is safe or malicious.”** A rule match is a reason to inspect a link more carefully—not proof of harmful intent.

## Limitations

- LinkGuard analyzes URL text only. It does not inspect page content, certificates, downloads, DNS, redirects, hosting infrastructure, or reputation feeds.
- A low score does not mean a destination is safe. A newly registered or compromised site can have a simple-looking URL.
- A high score does not mean a destination is malicious. Legitimate services may use IP addresses, encoded values, long queries, non-standard ports, or link shorteners.
- Domain splitting uses a small local list rather than the full Public Suffix List.
- The locally maintained shortener list is intentionally small and informational.
- Internationalized domain names are flagged by their Punycode form but are not automatically considered harmful.
- Client-side history is device- and browser-specific and can be removed by clearing site data.

For higher-confidence decisions, combine URL inspection with trusted reputation services, organizational security controls, and independent verification.

## Privacy approach

All pasted URL analysis happens in the browser. The analyzer does not fetch, open, preflight, resolve, or navigate to the submitted URL. No pasted URL is transmitted to LinkGuard, a backend, an analytics service, or an AI API. History is limited to the latest 10 assessments and stored only in the browser's `localStorage`.

The application is built without externally hosted fonts, images, analytics, or runtime data dependencies. After deployment, the hosting provider necessarily serves the application files, but the URL being analyzed remains local to the browser.

## Deployment to Cloudflare Pages

1. Push the project to a Git repository.
2. In Cloudflare Pages, choose **Create a project** and connect the repository.
3. Use the **Vite** framework preset.
4. Set the build command to `npm run build`.
5. Set the build output directory to `dist`.
6. Use Node.js 18 or newer.
7. Deploy.

No environment variables, Functions, KV namespaces, databases, or redirects are required. The output is a static site. The included `public/_headers` file adds a restrictive Content Security Policy, disables unnecessary browser permissions, and caches fingerprinted assets.

## What I Learned

### URL anatomy

A URL is more than a domain. Protocol, credentials syntax, hostname labels, port, path, query parameters, and fragment all affect how a browser interprets a link. Separating these parts makes visual deception easier to notice.

### Phishing indicators

No single URL characteristic proves maliciousness. Defensive analysis works best by combining weak signals—such as an IP hostname, many subdomains, urgent keywords, or a nested URL—while explaining legitimate uses and avoiding absolute claims.

### JavaScript URL API

The browser's `URL` API provides safer and more consistent parsing than splitting strings manually. It also normalizes inputs and exposes structured values such as `hostname`, `port`, and `searchParams`.

### Rule-based risk scoring

An explainable rule engine makes each score traceable. Weights express relative concern, and the UI connects every score contribution to an actionable explanation. This is more honest for this problem than presenting an untrained or fake ML model.

### Client-side privacy

Keeping both parsing and persistence in the browser reduces unnecessary data exposure. It also makes the application inexpensive to host and easy to deploy as static files.

## Likely interview questions and short answers

1. **Why does LinkGuard not declare a URL malicious?**  
   URL structure provides indicators, not proof. Reliable verdicts need more context such as content, reputation, DNS, certificate, and behavioral analysis.

2. **Why use the JavaScript `URL` API?**  
   It follows browser parsing rules and safely exposes URL components without brittle string splitting.

3. **How is the score calculated?**  
   Each matched rule contributes a documented weight. The total is capped at 100 and mapped to one of four indicator levels.

4. **Why is HTTP an indicator but not automatically high risk?**  
   HTTP lacks transport encryption, but that alone does not prove malicious intent. It raises concern particularly when sensitive information is requested.

5. **Why can many subdomains be misleading?**  
   Users often read from left to right and may trust a brand word in a subdomain even though control is determined by the registered domain farther right.

6. **What is Punycode?**  
   It is an ASCII representation of internationalized domain labels. It has legitimate uses but can also represent characters that visually resemble others.

7. **What are the privacy benefits of this architecture?**  
   The entered URL never needs to leave the device, there are no user accounts, and history stays in local browser storage.

8. **What would you add in a production security platform?**  
   With explicit user consent, I could add reputation sources, full Public Suffix List handling, redirect analysis in an isolated service, certificate details, and automated tests—while clearly separating those signals from this local assessment.

9. **Can attackers evade these rules?**  
   Yes. A harmful link can look structurally ordinary, and legitimate links can match several rules. That is why the interface states the limitations and encourages independent verification.

10. **Why keep the analyzer separate from the React UI?**  
    Separation makes the security logic auditable, reusable, serializable, and easier to test without rendering components.

## Responsible-use note

LinkGuard is a defensive educational utility. It does not probe, exploit, crawl, or interact with target websites.
