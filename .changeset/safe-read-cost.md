---
"@aragon/app": patch
---

Cut Safe transaction service usage by sharing one cached upstream read across concurrent viewers of a Safe body, halving the poll cadence, keeping Safe reads in the query cache longer, and backing the poll off instead of hammering an exhausted quota — and surface an exhausted quota as a temporary state rather than a generic failure
