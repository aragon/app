---
"@aragon/app": patch
---

Stop refusing chain reads from browsers that fail the BotID check, deliver server-side Sentry events before the function is suspended, count BotID detections as a metric, record a session replay for every error that is not classified as noise, trace browser requests more often and stop tracing uptime probes.
