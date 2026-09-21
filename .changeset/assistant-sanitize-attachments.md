---
"@aragon/assistant": minor
---

Rebuild every confirmed attachment in-process before it is queued for the ticket: images are decoded and re-encoded without metadata, PDFs are parsed (object streams included) and rejected when they carry scripts, actions, attached files, rich media, XFA forms or encryption, and the rebuilt bytes replace the upload under a fresh blob. No file leaves our infrastructure.
