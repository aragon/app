---
'@aragon/app': patch
---

Fix profile updates, profile renames and delegate statements for ENS names after the ENSv2 launch: records are written to the resolver that stores them (ENSv1 or ENSv2), and names without a writable resolver show an error instead of sending a reverting transaction.
