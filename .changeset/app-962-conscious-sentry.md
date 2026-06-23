---
"@aragon/app": patch
---

Make Sentry error reporting conscious. Route bot/scanner, expected-user, and backend/RPC noise out of the alert stream (tagged via `noise_class`, expected events demoted to `info`) while keeping everything searchable for investigation, and attach the connected wallet as the Sentry user. Render a clean not-found page for stale links to DAOs whose plugins were removed instead of reporting them. Also fixes two crashes: a null pagination page on the landing page and an undefined plugin list during DAO navigation.
