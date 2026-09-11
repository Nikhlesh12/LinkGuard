# LinkGuard — Scam & Phishing Signal Analyzer

LinkGuard is a privacy-focused digital trust tool that helps users inspect suspicious links, QR codes, and messages before they act. It uses transparent browser-side rules to highlight risk signals, explain why they matter, and suggest safer next steps.

> **LinkGuard provides explainable risk indicators and educational guidance. It does not guarantee whether a link, QR code or message is safe or malicious.**

## Project Overview

This portfolio project demonstrates defensive cybersecurity thinking at a fresher/intermediate level. Instead of presenting an unsupported “malicious” verdict, LinkGuard separates evidence from conclusions. Every point in an assessment comes from a visible rule and every finding uses cautious language.

The application is a static React site. It has no authentication, database, backend, threat feed, paid API, or external AI service.

## Problem Statement

Scam attempts can arrive as links, QR images, SMS, WhatsApp messages, or email. Users often see urgency and familiar brand language before they inspect the actual requested action. LinkGuard creates one investigation workflow for these inputs and explains common patterns without executing or automatically opening suspicious content.

## Features

- Unified Link, QR Code, and Message investigation workspace
- 0–100 deterministic risk signal score
- Four assessment bands: Few, Some, Suspicious, and Strong Risk Signals
- Evidence, severity, explanation, possible pattern/intent, and contextual recommendations
- Educational demos using fictional/reserved destinations
- Scam Signal Library at `/learn`
- Privacy architecture page at `/privacy`
- Latest 10 checks stored as minimal local metadata
- View, delete, and clear-all history controls
- JSON report export
- Responsive, keyboard-accessible light interface

## Link Analysis

The URL engine uses the standard JavaScript `URL` API and explainable checks for HTTP, raw IP hostnames, URL length, subdomains, hostname length, user-information syntax, Punycode, hyphens, unusual ports, encoding, long queries, embedded destinations, shorteners, credential/payment keywords, digit density, misleading path terms, punctuation, executable downloads, double extensions, brand context, query count, and random-looking host labels.

It accepts regular links and common defanged IOC notation such as `hxxps://example[.]com`. Refanging is performed only to parse the text. The destination is never visited.

## QR Analysis

- Drag-and-drop or device upload
- Browser-side image decoding with `jsQR`
- URL, text, email, phone, and Wi-Fi content classification
- Safe decoded-content preview
- Automatic URL rule analysis when decoded content is a link
- Combined QR and link report
- A locally generated educational QR demo

LinkGuard never opens a decoded URL, calls a number, sends an email, or connects to Wi-Fi.

## Message Analysis

Message text is evaluated locally against word-boundary-aware rules for:

- urgency and threat language
- credential or OTP requests
- payment pressure
- rewards and prizes
- impersonation context
- risky requests such as APK installation, screen sharing, or remote access

Links are extracted from messages and can be handed to the URL analyzer using **Analyze This Link**. Possible categories include Credential Phishing, Payment Scam, Fake KYC / Verification, Fake Delivery Message, Prize / Reward Scam, Impersonation Attempt, and Tech Support Scam. These are explicitly presented as possible patterns, not verdicts.

## Rule-Based Detection

Detection logic is separate from React presentation:

- `src/analyzer.js` contains URL parsing and URL rules.
- `src/data/messageRules.js` contains message indicators and weights.
- `src/features/message-analysis/analyzeMessage.js` performs message evaluation.
- `src/features/qr-analysis/decodeQr.js` performs local QR decoding and classification.
- `src/utils/scoring.js` owns shared score calculation and labels.

No random values, machine-learning models, or pretend confidence percentages are used.

## Risk Scoring

Matched rule weights are added and capped at 100:

| Score | Assessment |
| --- | --- |
| 0–24 | Few Risk Signals |
| 25–49 | Some Risk Signals |
| 50–74 | Suspicious Signals |
| 75–100 | Strong Risk Signals |

The score describes configured signals in the supplied text or image. A simple-looking malicious URL can receive a low score, and a legitimate complex URL can receive a high score.

## Privacy Architecture

- URL strings are parsed without fetching the destination.
- QR images are decoded in browser memory and are not intentionally uploaded.
- Message analysis occurs in browser memory.
- Full messages are not stored in history.
- QR image data is not stored in history.
- History contains only analysis type, timestamp, score, label, and domain/short description.
- No external fonts, analytics, AI APIs, account system, or application backend are used.
- Cloudflare Pages headers disable unnecessary connections and browser permissions.

## Tech Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- Lucide React
- React Router
- jsQR
- qrcode (local educational QR generation)
- Browser URL, Canvas, File, Blob, and localStorage APIs

## Installation

Node.js 18+ and npm are required.

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run build
npm run preview
```

## Deployment

The project is optimized for Cloudflare Pages:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none

Cloudflare Pages treats this SPA as a client-routed application when no top-level `404.html` exists. The included `public/_headers` file adds a restrictive Content Security Policy and security headers.

## Project Structure

```text
src/
├── components/
│   ├── HistoryDrawer.jsx
│   ├── InvestigationWorkspace.jsx
│   ├── Layout.jsx
│   └── ResultPanel.jsx
├── data/
│   └── messageRules.js
├── features/
│   ├── link-analysis/analyzeUrl.js
│   ├── message-analysis/analyzeMessage.js
│   └── qr-analysis/decodeQr.js
├── hooks/
│   └── useAnalysisHistory.js
├── pages/
│   ├── HomePage.jsx
│   ├── LearnPage.jsx
│   └── PrivacyPage.jsx
├── utils/
│   └── scoring.js
├── analyzer.js
├── App.jsx
├── index.css
└── main.jsx
docs/
└── interview-guide.md
```

## Limitations

- LinkGuard does not inspect remote page content, redirects, DNS, certificates, files, sender identity, or reputation.
- Domain splitting uses a small local multi-part suffix list rather than the complete Public Suffix List.
- Keyword rules can produce false positives and can miss unfamiliar or multilingual phrasing.
- QR decoding quality depends on image resolution, lighting, crop, and supported encoding.
- A low score never proves safety; a high score never proves malicious intent.
- localStorage history is browser- and device-specific.

## Interview Preparation

See [`docs/interview-guide.md`](docs/interview-guide.md) for 15 beginner-friendly questions and answers about phishing, QR risks, URL anatomy, rule-based scoring, privacy, false positives, architecture, and future improvements.
