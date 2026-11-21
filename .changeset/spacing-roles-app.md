---
"@aragon/app": minor
---

Add a "Spacing (GovKit preview)" select to the developer debug panel that previews the GovKit spacing roles (New, New looser, New compact) independently of the colour theme and the typography; a stored choice is ignored unless the debug panel flag is on. Seven call sites that passed spacing classes to converted kit components now render exactly as before.
