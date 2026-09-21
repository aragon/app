---
"@aragon/assistant": patch
---

Percent-encode the filename sent to the malware scanner: a name with any character above U+00FF (a Japanese or Cyrillic screenshot name, an emoji) made the scan request throw before any network call and permanently blocked the attachment behind a retriable "scan unavailable" error. A request the service fails to construct is now logged instead of being reported as a scanner outage.
