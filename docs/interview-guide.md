# LinkGuard Interview Guide

## 1. What is phishing?

Phishing is a social-engineering technique that uses deceptive messages or pages to persuade someone to reveal information, transfer money, install software, or take another risky action.

## 2. What is a scam indicator?

It is an observable signal—such as urgency, an unexpected payment request, or a hidden destination—that deserves verification. One indicator alone is not proof of a scam.

## 3. What are the important parts of a URL?

The protocol, optional user-information syntax, hostname, port, path, query parameters, and fragment. The registered domain inside the hostname is especially important for identifying who controls a destination.

## 4. Why can multiple subdomains be misleading?

An attacker can place familiar words on the left side of a hostname. Control is determined by the registered domain farther to the right, not by a brand word in a subdomain.

## 5. What is Punycode?

Punycode represents internationalized domain labels using ASCII and begins with `xn--`. It has legitimate uses, but can encode characters that resemble letters from another domain.

## 6. Why are shortened URLs flagged?

A shortener hides the final destination until a redirect occurs. The service is not automatically unsafe, but the user has less information available before opening it.

## 7. What is QR phishing?

QR phishing uses a QR code to conceal a destination or instruction. A user may scan it without first seeing the hostname, so safely decoding and previewing the content is useful.

## 8. How does browser-side QR processing work here?

The selected image is decoded into pixels in browser memory. `jsQR` reads those pixels locally. If the result is a URL, LinkGuard passes the text to the existing URL rule engine without visiting it.

## 9. Why use rule-based detection?

Rules make every finding explainable. Each score contribution can be traced to visible evidence, which is appropriate for education and honest about the system’s limitations.

## 10. How is risk scoring calculated?

Each detected rule has a fixed weight. LinkGuard adds the weights, caps the result at 100, and maps it to four descriptive signal bands. There is no randomness or fake ML probability.

## 11. What is a false positive?

A false positive occurs when a legitimate message or URL matches a risk rule. For example, a real courier message may contain the word “payment.” LinkGuard reduces harm by using non-definitive language and showing evidence.

## 12. Why use `localStorage`?

It provides small, browser-local persistence without a server or account. LinkGuard stores only metadata—never full message text or QR image data—and limits history to 10 items.

## 13. What privacy choices were made?

Analysis runs locally, URLs are never fetched, uploaded QR images are not sent to an application server, full messages are not persisted, and the app uses no analytics, external AI API, or database.

## 14. How is the project organized?

Pages handle routes, components handle presentation, feature folders contain link/message/QR logic, data files contain message rules and demos, a scoring utility owns common score labels, and a hook manages minimal history.

## 15. What are the main limitations and future improvements?

The project cannot inspect page content, redirects, reputation, certificates, or sender identity. Future work could add a complete Public Suffix List, unit and accessibility tests, more QR formats, multilingual message rules, and optional consent-based reputation checks.
