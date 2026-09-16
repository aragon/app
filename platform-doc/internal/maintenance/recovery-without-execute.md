---
type: reference
title: Recovery without Execute verification
tags: [maintenance, accounts, access-control]
source: protocol-doc@800da8d9b347200dda8362e7b68cfe74c08c79a5 + aragon/osx@4100bcf0bc0cefecdedac2ca292f6b32b4796c49 + OpenZeppelin/openzeppelin-contracts-upgradeable@2d081f24cac1a867f6f73d512f2022e1fa987854 (2026-09-13, see log.md)
---

# Recovery without Execute verification

Evidence retained from the completed `verify-recovery-without-execute-permission` and `verify-admin-removal-alert` tasks. The bounded product consequence is in [Removing a governance process](../../governance/process-removal.md#removing-the-last-recognized-process); the existing [OSx authorization paths](../../access-control/osx-authorization-paths.md#root-administers-the-dao-permission-table) carry the caller distinction. This is a source verification, not a deployed-account diagnosis or a tested recovery procedure.

## Source boundary

The read-only protocol bundle at `800da8d9b347200dda8362e7b68cfe74c08c79a5` cites [OSx commit `4100bcf0bc0cefecdedac2ca292f6b32b4796c49`](https://github.com/aragon/osx/commit/4100bcf0bc0cefecdedac2ca292f6b32b4796c49), committed 2026-07-07, in its [repository register](../../protocol-doc/repositories.md). Retrieved the files at that exact revision. Its DAO and PermissionManager files also match the clean local checkout at `8b5e2cc7fe8a681cd03f1f9311adb9951ccba758`; that checkout's newer HEAD is not the evidence baseline. The pinned OSx tree locks `openzeppelin-contracts-upgradeable` to `2d081f24cac1a867f6f73d512f2022e1fa987854`.

Reused the [orientation coverage map](./osx-orientation/coverage-map.md) and the completed contextual-edit findings: composing permission actions, finding a verified ABI, and preparing installation do not establish execution eligibility. The removal page has owner-briefing provenance but no app revision of its own. The Admin pages cite app `122f1bd161b9d308b19ff509023429af8d118e72`; the newer contextual pass uses app `adad67873c8f9dd75e3ed340b70df3e985ae3557` and published `gov-ui-kit@2.11.4`. No UI equivalence is inferred between them. This pass changes no alert, direct-transaction, or wallet behavior claim and needs no new UI-kit evidence.

## Dispositions

| State or proposed route | Verified disposition | Evidence |
| --- | --- | --- |
| No process recognized by the app | Recognition says nothing conclusive about remaining Execute holders. An unknown plugin, another contract, or a wallet may still be authorized. A contract holder must also have a usable calling path. | [Plugin support](../../application/plugin-compatibility.md#how-the-app-supports-a-plugin); E1–E2. |
| No unrestricted Execute grant | Conditioned Execute still exists if its entry remains. Whether it admits a specific action or permission repair depends on its rule, the calling route, and downstream authorization. A currently false condition is not an absent grant; its result may depend on time or independently changeable external state. | [Conditions](../../protocol-doc/common/permission-conditions.md), [scoped authority](../../access-control/scoped-authority.md); E1–E2. |
| No Execute grant, independently usable ROOT | A caller can invoke the DAO's permission functions directly and grant Execute without first calling `DAO.execute`. ROOT must be on the DAO itself; an entry with a plugin as `where` does not authorize the DAO's permission manager. A ROOT condition must admit the repair calldata. | [ROOT administration](../../protocol-doc/core/permissions.md#root-the-permission-to-manage-permissions); E2. |
| ROOT or upgrade authority held only by the affected DAO | Self-held permission cannot initiate a new self-call. The standard route would first have to pass the missing Execute check. Nominal permission held by another contract is also insufficient if that contract can act only through this DAO's unavailable execution. | [Self-call context](../../protocol-doc/core/execution.md#the-execute-function); E1–E3. |
| No Execute or ROOT, independently usable DAO upgrade authority | `_authorizeUpgrade` checks `UPGRADE_DAO_PERMISSION_ID`, independently of Execute and ROOT. The permitted compatible replacement implementation can restore authority through new logic or migration. This recovery possibility is an inference from the authorized replacement and delegatecall path; no particular recovery implementation was deployed or tested. A condition that admits only an ordinary upgrade need not admit a repair. | [DAO upgrades](../../protocol-doc/core/dao.md#upgrades-across-versions); E1, E4–E5. |
| Default factory bootstrap | ROOT and upgrade authority are granted to the DAO itself. Factory ROOT and temporary setup-processor ROOT are revoked at the end of creation. Neither is a default independent rescuer. Custom grants must be inspected separately. | [DAO factory](../../protocol-doc/framework/dao-factory.md); E3. |
| No Execute and no independently usable repair authority | No fresh execution, permission-management, or upgrade call can restore execution through the inspected mechanisms. This is a bounded conclusion about these contracts and authority, not a universal claim about custom implementations, exploits, all asset movement, or every possible deployment. | E1–E5. |
| Reinitialize, prepare installation, or use GlobalExecutor | `initialize` cannot be repeated; `initializeFrom` does not grant ROOT or Execute. Preparation creates no permission on the existing DAO. GlobalExecutor lends execution in its caller's context and cannot supply the affected DAO's identity or permissions. | E1; [prepare/apply separation](../../protocol-doc/framework/plugin-setup-processor.md#why-prepare-and-apply-are-separate), [standalone executor](../../protocol-doc/core/execution.md#the-standalone-executor). |

## Exact code evidence

| ID | Source | Relevant check |
| --- | --- | --- |
| E1 | [DAO.sol](https://github.com/aragon/osx/blob/4100bcf0bc0cefecdedac2ca292f6b32b4796c49/src/core/dao/DAO.sol) | `initialize` at line 168; `initializeFrom` at 195; wildcard restrictions at 227; `_authorizeUpgrade` at 240; `execute` at 272, its Execute check at 280, and ordinary action calls at 296. |
| E2 | [PermissionManager.sol](https://github.com/aragon/osx/blob/4100bcf0bc0cefecdedac2ca292f6b32b4796c49/src/core/permission/PermissionManager.sol) | `grant` at 118, `grantWithCondition` at 133, `revoke` at 153 and both batch methods require ROOT. `isGranted` at 224 checks only the requested permission and evaluates its condition. `_auth` at 476 uses the DAO address, `msg.sender`, and full `msg.data`. |
| E3 | [DAOFactory.sol](https://github.com/aragon/osx/blob/4100bcf0bc0cefecdedac2ca292f6b32b4796c49/src/framework/dao/DAOFactory.sol) | Temporary processor ROOT revoked at 174; factory ROOT revoked at 192; `_setDAOPermissions` at 221 grants ROOT and upgrade permission to the DAO. |
| E4 | [UUPSUpgradeable.sol at the locked dependency](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/2d081f24cac1a867f6f73d512f2022e1fa987854/contracts/proxy/utils/UUPSUpgradeable.sol) | `upgradeTo` at 74 and `upgradeToAndCall` at 89 call `_authorizeUpgrade` through the active proxy. They do not call `DAO.execute`. |
| E5 | [ERC1967UpgradeUpgradeable.sol at the locked dependency](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/2d081f24cac1a867f6f73d512f2022e1fa987854/contracts/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol) | `_upgradeToAndCall` at 65 changes implementation and can delegatecall its setup logic; `_upgradeToAndCallUUPS` at 77 checks the replacement's UUPS compatibility. |
| E6 | [DAO.t.sol](https://github.com/aragon/osx/blob/4100bcf0bc0cefecdedac2ca292f6b32b4796c49/test/core/dao/DAO.t.sol) | Inspected unauthorized execution at 277, reinitialization rejection at 78, restricted wildcard cases at 762–817, and authorized self-call grant at 1162. These existing tests were read, not run, and do not constitute a recovery integration test. |

## Interpretation limits and handoff

The pinned [DAO prose about losing ROOT](../../protocol-doc/core/dao.md#where-root-ends-up) calls the permission table permanently frozen. That conclusion needs a fixed-implementation or unavailable-upgrade qualification: E4–E5 permit replacement logic under independently usable upgrade authority. The platform outcome preserves that qualification; the upstream submodule remains unchanged. Upstream mechanism corrections and a recovery implementation are outside this documentation task.

E1 checks Execute before entering the action loop, so an already-authorized batch can revoke its caller's Execute and restore authority later in the same batch if the subsequent actions remain authorized. That is distinct from starting recovery after the last grant has been removed and the transaction has completed. An unexecuted proposal must still pass authorization when it eventually calls `DAO.execute`.

The completed Admin-alert verification consumes these distinctions and records the current entry guards and critical pre-removal confirmation in log.md (2026-09-13). Neither the process count nor the alert establishes the absence of Execute, ROOT, or upgrade authority. No product-improvement candidate follows from this protocol verification alone.
