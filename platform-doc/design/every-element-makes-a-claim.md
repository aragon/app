---
type: pattern
title: Every element makes a claim
tags: [design, interaction, content, cross-cutting]
status: draft
source: product-owner briefing (2026-07-29, see log.md)
---

# Every element makes a claim

Every visible interface element tells the user that something **exists**, **matters in this context**, or **can be acted on**. A control, notice, label, navigation item, empty state, or explanation must therefore earn the user's attention: it supports the current goal, answers a reasonable question, or explains a mismatch between expectation and reality. Otherwise, omit it or defer it until it becomes relevant.

This is semantic minimalism, not minimalism as an aesthetic. Apply Occam's razor to the user's mental model: show the smallest set of concepts that lets the user understand the current state and choose a next action. Removing necessary orientation is not minimalism; exposing every capability the system happens to contain is not transparency.

Absent content makes a claim too: an empty collection and a failed load say different things about the product, and the [datalist page](./datalist-page.md) states the distinct states that keep those claims honest.

## The test

Before adding an element, answer:

1. **What user question does it answer here?** Valid questions include "What can I do?", "What happened?", "Why can I not do something I reasonably expected?", and "What should I do next?"
2. **Why would the user expect this concept in this context?** The expectation may come from the user's goal, the object's lifecycle, an earlier action, a product promise, or a familiar interaction convention. "The system supports it" is not a user expectation.
3. **Can the intended user understand it without knowing another mode or the internal architecture?** If not, translate it into product meaning, disclose it only where it has a referent, or omit it.
4. **Does knowing it now change a decision, enable an action, or resolve likely confusion?** If not, it is attention cost without user value.

The shorthand:

> If the user expectation an element serves cannot be named, the element has not earned its place.

## Architecture is not user meaning

Architecture determines what the product can do, but it does not determine what the interface should say. The interface is not an inventory of system capabilities or an explanation of how they were implemented. This is the UI consequence of [product semantics being their own model](../principles.md): a clean correspondence with a mechanism is useful when it exists, but the interface is not required to mirror it.

This does not weaken [honest abstraction](../principles/honest-abstraction.md). Transparency means exposing the model, state, and consequences a user needs to make an informed decision; it does not mean exposing every implementation distinction. An irrelevant internal noun makes the interface harder to understand without making the product more honest.

- Do not advertise a capability or limitation merely because an alternative exists in another mode.
- Do not introduce a hidden or internal concept to explain why it is absent.
- When an implementation constraint affects an outcome the user reasonably expects, explain the outcome and the next step in product language, not the mechanism behind it.
- Progressively disclose a concept when the user's chosen goal or context makes it understandable and actionable, not simply because the system supports it.

For example, the basic governance flow does not mention the advanced designer's implementation-facing **existing conditions** mechanism; outside that internal configuration context, the term has no user referent ([proposal creation](../governance/proposal-creation.md)).

## Availability is communication

An unavailable control is not automatically an exception to this rule. Sometimes showing it resolves a real expectation mismatch; sometimes showing it creates the expectation only to frustrate it. The choice among hiding, disabling, guarding, and warning is defined by [control availability](./control-availability.md).
