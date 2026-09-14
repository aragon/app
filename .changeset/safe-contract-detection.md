---
'@aragon/app': patch
---

Decide whether an address is a Safe by reading its owners and threshold rather than by matching its contract name. The previous check substring-matched the ABI name against "Safe", so `SafeMath` or any similarly named contract could be attached as a governance body, while a genuine Safe whose ABI lookup failed was refused.
