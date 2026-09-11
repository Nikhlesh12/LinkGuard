export const MESSAGE_RULES = [
  { id: 'urgency', title: 'Urgency Pressure', severity: 'Medium', weight: 14, terms: ['urgent', 'immediately', 'act now', 'last warning', 'today', 'within 24 hours'], explanation: 'The message creates time pressure that may reduce careful decision-making.' },
  { id: 'threat', title: 'Threat Language', severity: 'High', weight: 18, terms: ['account blocked', 'account suspended', 'service disconnected', 'legal action', 'penalty', 'service stopped'], explanation: 'Threats of loss or punishment can be used to push a recipient into acting quickly.' },
  { id: 'credentials', title: 'Credential Request', severity: 'High', weight: 24, terms: ['password', 'otp', 'pin', 'cvv', 'login', 'verify account'], explanation: 'Requests involving authentication or payment secrets deserve independent verification.' },
  { id: 'payment', title: 'Payment Pressure', severity: 'High', weight: 22, terms: ['pay now', 'payment required', 'processing fee', 'fine', 'refund', 'payment link'], explanation: 'Unexpected payment instructions are a common fraud pattern, though the words can also appear in legitimate notices.' },
  { id: 'reward', title: 'Reward or Prize Claim', severity: 'Medium', weight: 17, terms: ['winner', 'lottery', 'cash reward', 'free gift', 'claim prize'], explanation: 'Unexpected rewards may be used to attract clicks, personal data, or advance fees.' },
  { id: 'impersonation', title: 'Authority or Service Context', severity: 'Medium', weight: 12, terms: ['bank', 'government', 'support team', 'customer care', 'courier', 'kyc', 'electricity', 'income tax'], explanation: 'References to trusted organizations can be legitimate, but should be verified through official channels.' },
  { id: 'riskyAction', title: 'Risky Action Request', severity: 'High', weight: 26, terms: ['download apk', 'install application', 'screen share', 'remote access', 'contact another number', 'message on whatsapp'], explanation: 'Installing software, sharing a screen, or switching channels can expose data or device access.' }
]

export const MESSAGE_DEMOS = [
  { title: 'Fake Delivery Message', text: 'Courier update: Your parcel is on hold. Pay now using https://delivery-update.example.com/fee to avoid return today.', badge: 'Educational Demo' },
  { title: 'Urgent KYC Message', text: 'Last warning from bank support team: verify account KYC within 24 hours or account suspended. Login at hxxps://secure-kyc[.]example[.]com', badge: 'Educational Demo' },
  { title: 'Prize Message', text: 'Congratulations winner! Claim prize and cash reward immediately. Contact another number on WhatsApp.', badge: 'Educational Demo' },
  { title: 'Normal Business Message', text: 'Hello, our project meeting is scheduled for Tuesday at 11 AM. Please review the agenda in the company workspace.', badge: 'Educational Demo' }
]
