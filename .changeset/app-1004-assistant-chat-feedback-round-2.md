---
"@aragon/assistant-chat": minor
"@aragon/app": patch
---

Iterate the support assistant on the second round of design feedback: the header and composer controls (new chat, collapse, back, add attachment) become gov-ui-kit buttons and drop their tooltips, the "Email support" escape hatch follows the app's plain link style — no underline, an external-link icon, opening in a new tab — and typing in a fresh chat no longer bounces the layout: the suggestion chips retire through visibility instead of unmounting. The ticket card gains a bottom margin so text following it in the same message no longer sits against its edge, and nothing links to Linear anymore — the success card and the past-requests view quote the ticket reference instead of linking out to a workspace the user has no access to.
