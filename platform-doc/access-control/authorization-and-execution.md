---
type: concept
title: Authorization and execution model
tags: [access-control, semantics]
source: product-owner ACL one-pager and follow-up direction (2026-08-03) + product-owner authorization-model reviews (2026-08-04, see log.md) + product-owner access-control structure review (2026-08-05, see log.md) + Ethereum account and transaction documentation + OpenZeppelin Governor and access-control documentation + go-ethereum call-tracing documentation
---

# Authorization and execution model

Access control is the policy and set of guards that determine which callers may cause protected effects and who may change those rules. Authorization is one guard's decision about an attempted call. Execution turns an intended [action](../governance/action.md) into one or more calls, and each protected call boundary evaluates the caller and context it receives.

This page presents a compositional access-control model for Ethereum systems. Effective authority is the set of protected effects an actor, process, or account can cause through its available execution paths. Access-control administration changes the policy. [OSx authorization paths](./osx-authorization-paths.md) applies the model to Aragon OSx.

## From an intended action to an onchain call

An actor may call a contract directly, or a [governance process](../governance/process.md) may resolve actors' preferences into approved actions. An action specifies an intended call: its target address, native-token value, and calldata. Execution carries that action into the EVM as one or more calls.

Every call has a **caller** and a **target**. For an ordinary EVM `CALL`, the target sees the caller as `msg.sender`. These terms are relative to a call frame: when contract A calls contract B, A is the caller and B is the target; if B calls C, B is the next caller. A transaction starts from a signed account, while a contract account can make later calls only through its code.

A governor and an execution account can be the same contract or separate ones. The important question is always the same: which address makes the call that a protected target function receives? That address, rather than the actor who originally expressed a preference or submitted the transaction, is the input to ordinary caller-based authorization.

## What authorization decides

A guarded target can base its authorization decision on:

- the **caller** requesting the call;
- the **target** contract whose function is guarded;
- the function **selector**;
- the call data, when the rule needs to constrain arguments or a batch of calls; and
- the native-token **call value**, when value changes what the call is allowed to do.

The guard may also use relevant contract state, such as a time delay. If it denies the call, execution reverts at that boundary.

Access-control policy can be target-local or shared; this distinction describes where its configuration and decision logic live:

- **Target-local policy.** The target contract keeps an owner or roles and checks them in its own code. OpenZeppelin [`AccessControl`](https://docs.openzeppelin.com/contracts/5.x/access-control) supports role-based checks, but the role assignment and the function's required role belong to each target contract.
- **Shared policy.** One authority applies policy across protected functions or contracts. OpenZeppelin [`AccessManager`](https://docs.openzeppelin.com/contracts/5.x/access-control#access-management) provides this arrangement for `AccessManaged` targets. In OSx, each DAO applies its permission policy to its own guarded functions, and `DaoAuthorizable` contracts ask that DAO to decide their checks within the organization. Every protected function must consult the relevant authority.

## How authority composes across layers

Authority can first bundle at one target: if one role permits two functions, every caller with that role may use both.

Authority can also aggregate across targets. An account may hold ownership or roles for many target functions. Higher in the call stack, a governance process that directs the account can cause only the calls that its execution grant permits and downstream targets accept under the supplied calldata and value, the current authorization configuration, balances, and contract state. Downstream guards still run and see the account as caller.

If the execution grant permits arbitrary targets and calldata, the process can exercise through that route all downstream authority the account can exercise. Limiting the grant to selected calls can preserve distinctions between processes when the configured scope enforces them; [scoped authority](./scoped-authority.md) owns that product rule, and [gradual permission handover](./gradual-permission-handover.md) applies it over time.

## Administer access control

Grants, revocations, role assignments, and selector mappings are authorization configuration. An authorized administrator or governed account performs those configuration actions, and the resulting configuration changes who may call the protected functions. Changing that configuration does not upgrade a target contract's code.

The design task is to inspect who may change the access-control policy and which calls the configured execution paths let each process cause a target to accept. [OSx authorization paths](./osx-authorization-paths.md) applies that inspection to Aragon's contracts.
