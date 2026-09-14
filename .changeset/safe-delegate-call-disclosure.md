---
'@aragon/app': patch
---

Name an unrecognised delegate-call target in the Safe transaction review dialog. A delegate call executes in the Safe's own context and can change its owners, threshold or code, so a target that is not a canonical MultiSend is called out before signing - for every call at every depth of a batch, with no network read involved.
