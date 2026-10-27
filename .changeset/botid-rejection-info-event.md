---
"@aragon/app": patch
---

Log the BotID rejection as an informational Sentry event (info level, `noise_class: expected`) so it feeds the "BotID rejections" metric monitor without raising issue alerts.
