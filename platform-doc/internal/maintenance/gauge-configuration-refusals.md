---
type: reference
title: Gauge configuration refusal comparison
tags: [maintenance, design, governance, validation]
source: app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published @aragon/gov-ui-kit@2.11.4 + ve-governance@408ad144cf33c016b9ef1a2a6118f394a7ff439c (2026-09-13, see log.md)
---

# Gauge configuration refusal comparison

Completed comparison for `verify-gauge-configuration-refusals`. The live Gauge surfaces are four shared Gauge Voter management forms and two BENQI-specific Gauge Registrar forms. There is no self-service Gauge setup dialog. Their distinct checks concern gauge selection and metadata; they introduce no additional support, participation, membership, or stage-timing bounds.

## Scope and evidence

- **App:** official release `@aragon/app@1.39.0`, published 2026-09-09, resolved to [adad67873c8f9dd75e3ed340b70df3e985ae3557](https://github.com/aragon/app/tree/adad67873c8f9dd75e3ed340b70df3e985ae3557). All app paths below are relative to `apps/app/src/` at this revision.
- **UI dependency:** published `@aragon/gov-ui-kit@2.11.4`, locked by that release. The downloaded package's SHA-512 matches the lockfile: `sha512-wgc9uXzNPONh4w/+0wI72C6LqOuJXOhAe/AbaQ2bb/1n8OipKcKff0S3Gy4a+OmmQ1QSX18FgXLqafA9GdIi+w==`. Inspected its distributed `AddressInput`, `addressUtils`, `InputNumber`, and numeric-mask implementation.
- **Contract comparison:** the previously referenced [AddressGaugeVoter.sol at ve-governance@408ad144cf33c016b9ef1a2a6118f394a7ff439c](https://github.com/aragon/ve-governance/blob/408ad144cf33c016b9ef1a2a6118f394a7ff439c/src/voting/AddressGaugeVoter.sol#L393), plus the read-only protocol pin `800da8d9b347200dda8362e7b68cfe74c08c79a5`. These establish source-level contract bounds, not the implementation deployed for every account.
- **Product scope:** reused the [classification findings](./product-knowledge-audit.md#verified-source-dispositions), [client register](./client-specific-integrations.md), and [scope exclusions](./product-scope-exclusions.md). BENQI registration remains client-specific. Capital Flow and Alchemix's excluded integration are outside this comparison. Voting allocation, locking, and delegation are participation flows, not configuration forms.

This is a source-path comparison, including field rules, selectors, shared inputs, and preparation callbacks. No production browser, wallet transaction, deployment comparison, or application test suite was run. UI limits, registered form rules, advisory notices, and contract rejection are recorded separately.

## Resolve the setup comparison

The older phrase “four governance-plugin setup dialogs” does not describe the current picker. The comparison explicitly covers Multisig, Token Voting, Lock to Vote, and Admin, with SPP stage configuration assessed separately so neither Admin nor the processor is silently mistaken for another selectable dialog.

| Surface | Current scope | Evidence |
| --- | --- | --- |
| Gauge Voter | Installed-instance page and management actions; deployment arranged with Aragon. No picker setup definition, setup fields, or nonzero repository address. | `plugins/gaugeVoterPlugin/index.ts` and `constants/gaugeVoterPlugin.ts`. |
| Multisig, Token Voting, Lock to Vote | The three plugins with selectable setup definitions and membership/governance slots, filtered by repository availability on the selected network. | Their `constants/*Plugin.ts` and `index.ts`; `modules/createDao/dialogs/setupBodyDialog/setupBodyDialogSelect/setupBodyDialogSelect.tsx`. |
| Admin | Bootstrap installation through account creation; no add-body setup definition or membership/governance dialog. No fourth set of setup refusals to compare. | `plugins/adminPlugin/index.ts`, `constants/adminPlugin.ts`; `modules/createDao/dialogs/publishDaoDialog/publishDaoDialogUtils.tsx`. |
| SPP | Advanced governance arranged through Aragon. Stage/body configuration code supplies the comparison below; its presence does not establish public self-service availability. | `plugins/sppPlugin/index.ts`, `constants/sppPlugin.ts`; `modules/createDao/components/createProcessForm/createProcessFormGovernance/`; `dialogs/setupStageSettingsDialog/`. |

## Gauge management forms

| Form | Required input or selection restriction | Coverage limit and comparison |
| --- | --- | --- |
| Create gauge | An accepted, syntactically valid gauge address; name required, at most 128 characters; description required, at most 480. | No zero-address or existing-gauge check in the form or preparation callback. These inputs pass address-format validation but the referenced contract rejects them. No governance-ratio or epoch-configuration fields. |
| Deactivate gauge | An existing gauge must be selected; the selector requests `status: active` from the gauge API and disables confirmation until selection. | No last-active-gauge refusal or fresh activation check in the preparation callback. The request filter is a selection restriction, not a guarantee about state at execution. |
| Reactivate gauge | An existing gauge must be selected; the selector requests `status: inactive`. | Same selection mechanics as deactivation. The contract independently rejects an unchanged activation state. |
| Update gauge metadata | A gauge must be selected; name and description use the same required/length rules as Create. Selection has no active/inactive filter. | Both active and inactive gauges can be selected. The update changes metadata for the selected address. |
| BENQI Register gauge | Accepted qiToken and reward-controller addresses; required Supply/Borrow selection, default Supply; the same name/description rules as Create. | Address-format validation does not inspect ERC-20, qiToken, or reward-controller behavior, or check whether the registration already exists. Supply/Borrow is a constrained choice; the field's rule itself is only `required`. |
| BENQI Unregister gauge | Select a registered gauge; confirmation is disabled without a selection. | The selector joins the registrar's `getAllRegisteredGaugeDetails` result with Gauge Voter data. The form requires a record, rather than independently checking the registration triple. |

All three metadata forms reuse `ResourcesInput` and `AvatarInput`: resources are optional, but each added resource needs a URL matching the shared pattern; its label is optional. An optional avatar uses shared upload/error validation with default limits of 1 MiB and 1024 pixels. These are shared input constraints, not additional governance invariants.

Both BENQI forms render `GaugeRegistrarActiveVotingAlert`, an unconditional informational notice with no epoch read or form error. It warns about execution during voting without preventing proposal creation. No new claim about the deployed registrar's contract checks is inferred from that notice.

**Source map:** `actions/gaugeVoter/components/gaugeVoter{CreateGauge,DeactivateGauge,ActivateGauge,UpdateGaugeMetadata}ActionCreate/` and its `dialogs/gaugeVoterSelectGaugeDialog/`; `actions/gaugeRegistrar/components/gaugeRegistrar{Register,Unregister}GaugeActionCreate/`, `components/gaugeRegistrarActiveVotingAlert/`, `dialogs/gaugeRegistrarSelectGaugeDialog/`, and `hooks/useGaugeRegistrarGauges/`. Create and metadata-update preparation pin the supplied metadata and encode the call; the lifecycle callbacks require selection and encode its address.

## Designer and plugin comparison

| Surface | Observed constraint | Difference from Gauge and evidence |
| --- | --- | --- |
| Process/body metadata | Name required, maximum 40 characters; description optional, maximum 480. A displayed process key is required, uppercase letters only, maximum five characters. | Gauge permits a longer name and requires a description. `createProcessFormMetadata.tsx` registers the length rules; `setupBodyDialogMetadata.tsx` separately supplies the same limits to its inputs without registering length validators. |
| Multisig membership and governance | The normal membership editor retains a final row, requires valid distinct addresses, and offers an approval control from one to the member count. Minority thresholds warn and remain available. | A cross-field member-count bound absent from Gauge. `multisigSetupMembership.tsx`, `AddressesInput`, `addressesListUtils`, `multisigSetupGovernance.tsx`. The update-settings action reuses the governance component with the fetched member count; it has a temporary fallback while that count loads. |
| Token Voting membership | Create requires a token name and symbol, valid distinct recipients, and positive per-recipient amounts; the last recipient cannot be removed through the normal control. Import requires a token accepted by the ERC-20 check; failed governance compatibility selects wrapping. | Gauge and BENQI address forms do not perform token-interface checks. `tokenSetupMembershipCreateToken*.tsx`, `tokenSetupMembershipImportToken.tsx`, and `useGovernanceToken*`. No claim of an independent minimum-length rule on the recipient array. |
| Token Voting governance | Support control: 1–99%; participation: 0–100%. Standalone duration must reach one hour; no total-duration maximum is registered. Early execution and vote replacement are mutually exclusive controls. | Gauge exposes none of these fields. `tokenSetupGovernance.tsx`, `SupportThresholdField`, `MinParticipationField`, `AdvancedDateInputDuration`. The protocol's 365-day ceiling remains an unguarded upper bound. |
| Lock to Vote | Requires an ERC-20 token; reuses support/participation fields and the standalone one-hour duration floor. Offers vote replacement. | Same numeric bounds and duration gap as Token Voting. `lockToVoteSetupMembership.tsx`, `useLockToVoteErc20Token.ts`, `lockToVoteSetupGovernance.tsx`. |
| Proposal-creation step | In restricted mode, requires an enabled eligible body or an available existing-condition entry. Any-wallet mode bypasses this no-source refusal. Selected token bodies require positive proposer power. | A configured-route check, not proof that any current holder meets the requirement. The token field has no supply-based upper bound. `createProcessFormProposalCreation.tsx`, `tokenProposalCreationSettings.tsx`. Existing-condition UI is conditional; this finding makes no broader availability claim. |
| Authorized actions | Rejects duplicate target/function-selector pairs. An empty specific-actions list passes. | A composition rule distinct from Gauge selection. `createProcessFormPermissions.tsx`. |
| SPP stage/body configuration | Approval and veto controls are bounded by the respective role's body count. External addresses are required and format-checked, and the form waits for Safe recognition; a non-Safe address is allowed. | `setupStageApprovalsField.tsx`, `setupBodyDialogExternalAddress.tsx`. Zero stage expiration and duplicate body addresses remain unguarded in the inspected configuration code; advanced setup remains team-arranged. |

`NumberProgressInput` registers `required` and `max`, while passing its lower bound to the UI kit's `InputNumber`. The locked numeric mask receives `min`/`max` with `autofix`, and step controls clamp to that range. This is evidence of the configured UI bounds, not a separate lower-bound form validator or proof against arbitrary injected form state. `AdvancedDateInputDuration` explicitly validates the total minimum when requested; days have no configured protocol maximum. Field validation reaches step progression through `useFormField` → React Hook Form and `WizardForm.handleSubmit`; the body dialog owns a separate form.

## Applied outcome and reuse

- [Gauge voting](../../governance/gauge-voting.md#management-form-validation) and [BENQI lending-market gauges](../../governance/benqi-lending-market-gauges.md#registering-and-removing-market-incentives) hold the management constraints and useful reader cautions.
- [Governance designer](../../governance/governance-designer.md) states the numeric controls, duration limit, bounded proposal-creation check, and external-address validation. It returns to draft because these are substantive corrections. [Proposal creation](../../governance/proposal-creation.md#the-supported-pattern-open-to-all-narrowed-by-conditions) carries the same configured-route limit.
- [Refuse unsatisfiable configuration](../design/invariant-validation.md) retains the intended design rule and concise instances without promising complete validation coverage or treating required metadata as a protocol invariant.
- Extended the existing candidate `pre-empt-protocol-rejected-configuration` with Gauge creation's zero/existing-address checks. Reconfirmed the existing duration, expiration, and duplicate-body gaps against this release; no duplicate opportunity or new owner question was created.
- The completed OSx contextual edits consumed this comparison for the [configuration cautions](../../osx-and-the-platform.md#which-configurations-remain-your-responsibility). A form passing validation does not prove protocol acceptance, a reachable electorate, execution authority, or appropriate governance choices.
