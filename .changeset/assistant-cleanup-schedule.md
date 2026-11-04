---
"@aragon/assistant": patch
---

Drop the Vercel Cron Job for the abandoned-blob sweep: the assistant-cleanup.yml workflow now calls `/internal/cleanup` daily on dev and production.
