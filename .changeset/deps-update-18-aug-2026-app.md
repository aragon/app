---
"@aragon/app": patch
"@aragon/assistant-chat": patch
---

Update dependencies (React 19.2.8, Sentry 10.70, viem 2.55.13, wagmi 3.7.6, Reown AppKit 1.8.23, Next.js 16.3) and fix the transfer-asset proposal action crashing when the amount field is cleared — viem now rejects empty strings in parseUnits
