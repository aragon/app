---
"@aragon/app": minor
---

Rename the transaction dialog's "Cancel" button to "Close" to reflect that the transaction keeps being tracked in the background. Warn before publishing a proposal when another proposal creation for the same DAO and plugin is still in flight, so editing the form after closing the dialog no longer risks creating two proposals.
