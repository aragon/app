---
"@aragon/app": patch
---

Load less CSS on every page. The design-token value sets for the debug panel's previews (colour Next and Dark, typography Next, spacing New, looser and compact) are now a separate stylesheet that is only linked while the debug panel is on and a preview is selected, and the spacing and typography utilities switch their desktop values once per scope (the application column's container query, the viewport media query elsewhere) instead of in every utility. The application CSS on the home page goes from 852 KB to 417 KB (70 KB to 47 KB gzipped); every page renders exactly as before.
