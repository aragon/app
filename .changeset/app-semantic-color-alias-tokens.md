---
"@aragon/app": patch
"@aragon/assistant-chat": patch
---

Move 79 of the app's and the assistant chat's remaining conflicting colour classes to the GovKit's component-level alias tokens, so the colour-theme preview follows the design tokens there too; most visibly, the page background of the sidebar layout now follows the theme (DAO pages were light under light text in Dark). The default look is unchanged. The colour lint becomes an error in nine more folders that reached zero findings.
