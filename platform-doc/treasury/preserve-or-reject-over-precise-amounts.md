---
type: opportunity
title: Preserve or reject amounts the token cannot express
tags: [treasury, design, forms]
status: candidate
source: app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Preserve or reject amounts the token cannot express

Candidate: align the transfer amount field with the pattern library's normalization rule. [Input normalization](../design/input-normalization.md) counts an amount's precision among what a conversion may change, so an amount is preserved or refused, never guessed — while the transfer amount field rounds excess precision half-up and rewrites the field with no message ([create transaction](./create-transaction.md) states the current rule). The candidate outcome is a field that keeps the typed value when the token can express it and explains the token's decimal limit when it cannot.
