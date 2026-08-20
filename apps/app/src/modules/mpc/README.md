# MPC systems (POC)

Proof of concept of a new "system" type in the Aragon app: an **MPC system** is a 2-of-3 threshold key
(device share, server / co-signer share, recovery share) with signing policies, members and approvals,
sign requests (transactions, messages, EIP-712 typed data) and an activity log.

After login the account lands on its **workspaces** (`/mpc`): workspaces are created explicitly (an account
with none only sees the "Create workspace" option), have an **owner and members** (add / remove), group the
**MPC systems** (created inside a workspace; workspace members see them as implicit viewers) and hold the
**workspace transaction policies** — decision-tree flows authored in the visual **policy editor**
(`/mpc/workspaces/[workspaceId]/policies/new`, `.../policies/[policyId]`), formally verified by the **policy
engine** (the `mpc-poc` backend) and enforced by the co-signer on every transaction request of the workspace
systems: a transaction that does not comply cannot be created. A saved policy can be reused as a **policy
block** inside other policies of the workspace (inlined server-side before check / evaluation). Sign requests
may be created as **editable**: the requester or an owner can modify the payload while pending / approved —
the policies are re-evaluated and the approvals reset.

Everything lives under `apps/app/src/modules/mpc` plus the route handlers under `apps/app/src/app/api/mpc`
and the pages under `apps/app/src/app/mpc`. The feature is gated behind the `mpcSystems` feature flag
(enabled in `local`, `development` and `preview`; off in staging / production).

> **This is a POC. Nothing here is production ready.** The threshold cryptography is mocked and the whole
> private key exists in the browser while signing.

## What is real and what is mocked

| Piece | Status |
| --- | --- |
| Shamir 2-of-3 over the secp256k1 order (`utils/shamir`) | Real math (split / Lagrange combine), unit tested |
| Device share encryption (`utils/mpcCrypto`, `utils/deviceShareStorage`) | Real WebCrypto: PBKDF2-SHA256 (≥ 300k iterations) + AES-256-GCM, stored in IndexedDB (localStorage fallback) |
| Co-signer API (`server/*`, `app/api/mpc/**`) | Mock: Next.js route handlers, JSON file store (`apps/app/.mpc-poc/store.json`), scrypt passwords, HttpOnly cookie sessions, rate limiting, origin / header CSRF checks |
| Server share at rest | Real AES-256-GCM with `MPC_POC_SERVER_KEY` (dev fallback key with a console warning) |
| System policy (`server/mpcPolicy.ts`) | Real evaluation (chains, allowlist, per-tx / daily limits, approvals, contract calls, message signing) |
| Workspace policies (`server/mpcWorkspaces.ts`, `server/mpcWorkspacePolicyEvaluation.ts`, `server/mpcPolicyEngine.ts`) | Real: flows are checked (Rust analyzer + cvc5) and evaluated by the external policy engine (`mpc-poc` backend) over HTTP; the scanner fact is a stub (`safe`) |
| Signature verification + Sepolia broadcast (`server/mpcChain.ts`) | Real (viem `recover*Address`, public Sepolia RPC) |
| **Threshold signing** (`providers/mockShamirProvider.ts`) | **Mocked**: the key is reconstructed in the browser (device share + released server share) and signs with viem, then wiped |
| Login | Mocked (username / password against the mock co-signer) |
| TOTP second factor (`server/mpcTotp.ts`, `server/serverCrypto.ts`) | Real RFC 6238 (Google Authenticator compatible): secret encrypted at rest, ±1 step window, one-time step (replay guard), login-style rate limiting. Required on share release / reshare / recover and on approvals once the user enrolled |
| ERC-20 token rules (`server/mpcPolicy.ts` `tokenLimits`) | Real: `transfer(address,uint256)` calldata is decoded, the allowlist applies to the actual payee and per-token amount / approval thresholds are enforced |
| Dfns / Dynamic providers | Stubs throwing `NotImplemented` to show the substitution point |

Every mocked piece is labelled `POC` / `mock` in code comments and in the UI (`MpcMockBanner`, tags).

## Trust model of the mock

- **Generation**: in the browser (`viem.generatePrivateKey`) → Shamir 2-of-3 →
    - share A (device, index 1): AES-GCM encrypted with a key derived from the **signing passphrase**
      (PBKDF2, random salt), stored under the `systemId` in IndexedDB;
    - share B (server, index 2): sent over TLS to the co-signer, encrypted at rest with `MPC_POC_SERVER_KEY`;
    - share C (recovery, index 3): shown **once** (`aragon-mpc-recovery:v1:<systemId>:<epoch>:<index>:<hex>`,
      copy + `.txt` download), never stored by the server; the user confirms the backup.
- **Signing**: a member creates a request → the server authenticates the session, evaluates the policy and
  may require approvals from other members → once `approved`, the requester (or an owner) asks
  `POST /server-share {purpose:'sign', requestId}`; the server releases share B bound to that request
  (status `released`, activity `share_released`) → the browser decrypts share A with the passphrase,
  recombines, signs (`signTransaction` / `signMessage` / `signTypedData`), wipes the key and sends the
  signature to `POST /requests/[id]/complete`, which verifies the signer address and, for transactions,
  broadcasts on Sepolia and stores the hash.
- **Reshare** (owner): share A + released share B → reconstruct → new polynomial → new share B (epoch + 1)
  uploaded, new share A stored, new share C shown once. The previous server share is invalidated.
- **Recovery** (owner, lost browser): share C + released share B → reconstruct → re-split as a reshare with a
  new passphrase.
- **Export** (owner): passphrase + share C → private key shown once; the export is logged in the activity.
  The server never releases share B for export (`purpose: 'export'` is rejected).
- Aragon (server) can **never** sign alone: it holds 1 of 3 shares. Honest limitation: the browser sees the
  full key during signing; a real TSS provider avoids this.
- **Consequence for the policy**: in the mock, every release of share B (any approved request, reshare,
  recovery) hands the full key to the browser holding share A, so a released request can be used to sign
  anything offline. Approvals are therefore the only real barrier: use `requireApprovalAboveWei` /
  `requireApprovalForMessages` + `approvalsRequired` on multi-member systems. Pending / approved requests
  reserve their value against the daily limit; abandoned `released` requests can be rejected to free it.
- The reconstructed key is always checked against `system.address` before a reshare / recovery uploads a new
  share B or an export shows the key (a wrong recovery share can never overwrite a good server share).

## Two-factor authentication (TOTP)

Registration flows into a mandatory enrollment step (`components/mpcTotpEnrollment`): the co-signer generates
a base32 secret (`POST /auth/totp/setup`), the client renders it as a QR code (`react-qr-code`) plus the
secret for manual entry, and the first authenticator code activates it (`POST /auth/totp/verify`). Once
enrolled (`user.totpEnabled`), the code is required to **release the server share** (sign / reshare / recover)
and to **approve requests** — entered in the sign / approve dialogs through the 6-box `MpcOtpInput`.

Semantics (`server/mpcTotp.ts`): RFC 6238 over HMAC-SHA1, 30s steps, ±1 step drift window; each accepted step
is persisted (`lastUsedStep`) so a code is single-use — right after enrolling, the next 30s code is the first
usable one; failures share the login rate limiting (5 wrong codes lock for 15 minutes). The secret is
AES-256-GCM encrypted at rest with `MPC_POC_SERVER_KEY`. Users that never enrolled pass through (the UI
enforces enrollment at registration; pre-existing accounts enroll on their next login).

## Demo (`/mpc/demo`)

A guided one-screen, mobile-first flow: one MPC account, one policy
(“up to 0.5 WETH to one recipient, above 0.1 WETH a second member approves”), one transfer confirmed with a
real authenticator. The page reuses the module building blocks (system policy with `tokenLimits`, sign /
approve dialogs) — nothing demo-specific exists on the server.

Runbook:

1. `pnpm --filter @aragon/app dev`, open `/mpc/demo` → register (scan the QR with Google Authenticator).
2. Create a workspace and an MPC system (the page links to the existing flows), fund the address: Sepolia ETH
   from a faucet for gas, then wrap some into WETH (`deposit()` on the WETH contract, e.g. via Etherscan).
3. On `/mpc/demo`, apply the demo policy (owner only): enter the recipient wallet → the system policy gets the
   recipient allowlist + the WETH token limit. Token address in `constants/mpcConstants.ts`
   (`MPC_DEMO_TOKEN`, canonical Sepolia WETH).
4. Happy path: enter an amount ≤ 0.1 WETH → Sign transfer → policy passes → passphrase + authenticator code →
   broadcast → Etherscan link (and the incoming transfer on the recipient wallet).
5. Two members: add a second member (approver) to the system; a transfer above 0.1 WETH stays
   “Waiting for approval” → log in as the approver (their own authenticator!) → Review and approve + code →
   log back in as the requester → Sign with authenticator. One on-chain signature in the end — approvals and
   the second factor live off-chain, the address stays a plain EOA.
6. Negatives: amount > 0.5 WETH or an edited recipient → `403 policy_denied`, nothing is created; wrong code →
   the share is not released; the same code twice → rejected (replay guard); 5 wrong codes → 15 min lockout.
7. Reset: delete `apps/app/.mpc-poc/store.json` (and the browser IndexedDB for the device shares).

## Running locally

```bash
pnpm --filter @aragon/app dev
```

Open <http://localhost:3000/mpc> (the `mpcSystems` flag is on in `local`). Register a POC account on
`/mpc/login` — you land in your default workspace — create a system (`/mpc/create`, 4-step wizard: details →
signing passphrase → key ceremony with downloadable recovery share → initial policy), fund the address on
Sepolia and create / sign requests from `/mpc/[systemId]`.

The **policy editor** and the enforcement of workspace policies need the **policy engine** (the `mpc-poc`
repository, `backend/`): it serves the block catalog, runs the formal check (`flow-check` + cvc5) and evaluates
a flow against a transaction. Start it next to the app:

```bash
cd ../mpc-poc/backend && pnpm install && pnpm dev   # port 3311; needs rules-engine/analyzer built (cargo) + cvc5
```

and point the app at it with `MPC_POLICY_ENGINE_URL` (default `http://localhost:3311`). Without it the editor
page shows "Policy engine not reachable", and transaction requests of a workspace with **active** policies are
refused with `policy_engine_error` (fail-closed); workspaces without active policies are not affected.

The mock store persists in `apps/app/.mpc-poc/store.json` (git-ignored). Delete the file to reset.

### Environment variables (`apps/app/.env.example`)

| Variable | Description |
| --- | --- |
| `MPC_POC_SERVER_KEY` | 32-byte hex key used to encrypt server shares at rest. Falls back to a fixed dev key with a warning when missing. |
| `MPC_POC_RPC_URL` | Sepolia RPC used for balance / nonce / gas / broadcast (default `https://ethereum-sepolia-rpc.publicnode.com`). |
| `MPC_POC_ALLOW_REGISTER` | Controls `POST /api/mpc/auth/register`: enabled by default outside production, in production only when set to `true`; `false` disables it everywhere. |
| `MPC_POC_STORE_PATH` | Custom path of the JSON store. |
| `MPC_POLICY_ENGINE_URL` | Base URL of the policy engine (`mpc-poc` backend). Default `http://localhost:3311`. Server-side only: the browser never talks to the engine. |

## Endpoints (`/api/mpc`)

All responses are JSON with `Cache-Control: no-store` and answer 404 when the `mpcSystems` feature flag is
disabled. Every mutation requires the session cookie
(`aragon_mpc_session`, HttpOnly, SameSite=Strict), a same-origin `Origin` / `Referer` and the header
`x-mpc-client: aragon-app`. Errors: `{ error: { code, message } }` with codes `unauthorized`, `forbidden`,
`not_found`, `validation_error`, `rate_limited`, `conflict`, `policy_denied`, `chain_error`, `internal`.

| Method | Route | Who |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/logout` · GET `/auth/session` | anonymous / session |
| POST | `/auth/totp/setup` (new pending secret + otpauth URI) · `/auth/totp/verify` `{totpCode}` (activates it) | session |
| GET, POST | `/systems` | session |
| GET, PATCH, DELETE | `/systems/[systemId]` | member / owner |
| POST | `/systems/[systemId]/key` (register key after the ceremony), `/key/acknowledge-recovery` | creator / owner |
| POST | `/systems/[systemId]/server-share` `{purpose: sign\|reshare\|recover, requestId?, totpCode?}` (`export` rejected; the 6-digit code is mandatory once the caller enrolled TOTP) | requester or owner (sign), owner (others) |
| POST | `/systems/[systemId]/reshare` `{serverShare, mode: reshare\|recover}` | owner |
| GET, POST | `/systems/[systemId]/members` · DELETE `/members/[userId]` | member / owner |
| PUT | `/systems/[systemId]/policy` | owner |
| GET, POST | `/systems/[systemId]/requests` | member / owner + approver |
| POST | `/systems/[systemId]/requests/[requestId]/approve` `{totpCode?}` (mandatory once the approver enrolled TOTP) · `/reject` · `/prepare` · `/complete` | see `server/mpcRequestHandlers.ts` |
| GET | `/systems/[systemId]/activity`, `/balance` · POST `/simulate` | member |
| POST | `/systems/[systemId]/export-authorization` | owner |
| GET | `/workspaces` · `/workspaces/[workspaceId]` | session (owner, or member of a workspace system) |
| GET, POST | `/workspaces/[workspaceId]/policies` | read: owner / system member · create: owner |
| GET, PUT, DELETE | `/workspaces/[workspaceId]/policies/[policyId]` | read: owner / member / system member · edit: owner |
| GET | `/workspaces/[workspaceId]/systems` | workspace owner / member |
| GET, POST | `/workspaces/[workspaceId]/members` · DELETE `/members/[userId]` | read: member · manage: owner |
| PUT | `/systems/[systemId]/requests/[requestId]` (modify an editable request: re-evaluates the policies, resets approvals; 403 `policy_denied` when the new payload does not comply, 409 when the request is not editable / not pending) | requester or owner |
| POST | `/workspaces/[workspaceId]/policies/check` (formal check) · `/simulate` (evaluate one sample transaction) | owner / system member — proxied to the policy engine |
| GET | `/policy-catalog` (effective block catalog + example flows, from the engine) | session |

Errors specific to policies: `policy_check_failed` (422: the flow is not consistent — dead branches or
collisions — and was not saved), `policy_engine_error` (502/503: engine unreachable or failing),
`policy_denied` (403: a request that does not comply with the policies is refused, nothing is created).

Shared request / response types: `api/mpcService/domain/*` (imported by both the client service and the
server). Client: `api/mpcService` (`mpcService`, react-query hooks `useMpc*`).

## Workspaces and transaction policies

- **Workspace**: created explicitly (`POST /workspaces`); the creator becomes the owner and can add / remove
  members by username (`/workspaces/[id]/members`). Systems are created inside a workspace
  (`workspaceId` in the create-system params); workspace members see them with the implicit `viewer` role.
  Legacy stores are migrated on load (pre-workspace systems join a `ws_<userId>` legacy workspace; workspaces
  without a members list get one with their owner). The owner manages the policies; workspace members and
  members of any workspace system can read them (their transactions are evaluated against them).
- **Policy** (`IMpcWorkspacePolicy`): `{ name, flow, enabled, lastCheck }` where `flow` is the engine flow
  format (one trigger, conditions with `true`/`false` branches, action leaves `approve | escalate | deny |
  notify`). `POST`/`PUT` run the engine check first and **refuse** inconsistent flows (`policy_check_failed`),
  so every stored policy carries a passing `lastCheck`; warnings (gaps falling into the default deny) are
  allowed. `enabled` toggles enforcement without re-checking.
- **Editor** (`components/mpcPolicyEditor`, ported from the standalone `mpc-poc` frontend): React Flow canvas
  (`@xyflow/react` + dagre layout), palette fed by `GET /policy-catalog` plus a **"Your policies"** section
  (the other saved policies of the workspace as draggable policy blocks), inspector, **Simulate** (engine
  `/simulate` with a sample transaction), **Check** (engine `/check`, issues highlighted on the canvas with
  counterexamples) and **Save** (enabled only after a passing check of the current flow). The editor never
  embeds engine logic: catalog, check and evaluation all come from the engine through the co-signer API.
- **Policy blocks** (`server/mpcPolicyReferences.ts`): a leaf node `template: "policy_ref"`, params
  `{ policyId }`, delegates the branch decision to another policy of the workspace. The co-signer inlines the
  referenced tree (node ids prefixed `<blockId>::`) before `/check`, `/simulate` and enforcement, and maps the
  results back to the block id; self-references and cycles are refused (`?policyId=` on check/simulate names
  the policy being edited), a referenced policy cannot be deleted while used, nesting is capped at 8 levels.
- **Enforcement** (`createRequest` in `server/mpcSignRequests.ts`): for transaction requests the co-signer
  builds the engine context from the payload (`amount_wei`, `action_*`, `dest_whitelisted` = destination on
  the system recipient allowlist, `dest_seen_before` = the system already signed/broadcast to it,
  `timestamp` = now, `scanner` = `safe` stub), evaluates every **enabled** policy of the system workspace and
  merges the verdicts (`mergeWorkspacePolicyVerdicts`): any `deny` denies, `escalate` requires approvals (the
  largest `extra_approvals` wins and is combined with the system policy), `approve` / `notify` allow. The
  system policy is evaluated as before and both decisions are merged (`mergePolicyDecisions`). The dry run
  (Review step of the new-request dialog) returns the decision with the per-policy verdicts
  (`policyDecision.workspacePolicies`); the real creation of a denied request answers **403
  `policy_denied`** and nothing is persisted (a `request_rejected` activity entry is logged). Message / typed
  data requests are not covered by the flows.

## Client structure

- `pages/`: `mpcWorkspacePage` (`/mpc`: default workspace, tabs Systems | Policies), `mpcPolicyEditorPage`
  (`/mpc/policies/new`, `/mpc/policies/[policyId]`), `mpcLoginPage` (`/mpc/login`, includes the TOTP
  enrollment step), `mpcCreatePage` (`/mpc/create` wizard), `mpcSystemPage` (`/mpc/[systemId]`: header, share
  status, tabs Requests | Policy (system policy + workspace policies) | Members | Activity | Settings),
  `mpcDemoPage` (`/mpc/demo`: the guided demo above).
- `dialogs/`: `mpcNewRequestDialog`, `mpcSignRequestDialog`, `mpcApproveRequestDialog`, `mpcReshareDialog`,
  `mpcRecoverDialog`, `mpcExportKeyDialog`, `mpcAddMemberDialog`, `mpcEditPolicyDialog`
  (registered in `constants/mpcDialogsDefinitions.ts` → `providersDialogs.ts`).
- `components/`: banner, system card, share status, request list / item / summary, policy form / summary,
  members and activity lists, login form, recovery share card, navigation and layout, `mpcPolicyEditor`
  (canvas, palette, inspector, simulate / check panels, scoped CSS), `mpcWorkspacePolicyList` (policy cards
  with the enforcement toggle), `mpcWorkspacePolicyVerdicts` (per-policy decisions of a request).
- `providers/`: `IMpcProviderAdapter` + `mockShamirProvider`, `dfnsProvider` / `dynamicProvider` stubs,
  `mpcProviderRegistry`. `hooks/useMpcProvider` resolves the adapter from `system.providerId`.

## Replacing the provider with a real TSS SDK

The UI only talks to `IMpcProviderAdapter` (`providers/mpcProvider.api.ts`):
`createKey`, `sign`, `reshare`, `recover`, `exportKey`, `hasDeviceShare`. To plug Dfns, Dynamic or any TSS SDK:

1. Implement the interface in `providers/<name>Provider.ts` (the stubs show the shape). `createKey` should run
   the DKG with the provider and register the public key / address on the co-signer through the
   `registerServerShare` callback (or an equivalent endpoint); `sign` should run the interactive signing
   protocol instead of receiving a raw server share.
2. Register it in `providers/mpcProviderRegistry.ts` under its `MpcProviderId`.
3. Adapt the co-signer: `POST /server-share` should become the server-side signing participation (the mock
   releases the raw share, a real TSS never does) and `POST /requests/[id]/complete` keeps verifying the
   signature and broadcasting.
4. Set `isMock: false` so the POC banners can be hidden.

## Limitations

- Threshold signing is mocked: the full private key is reconstructed in the browser during signing,
  reshare, recovery and export.
- Only Sepolia (chain id 11155111) can prepare / broadcast transactions; other chain ids are declarative.
- The co-signer stores everything in a local JSON file, keeps sessions in memory-backed storage and uses a
  dev encryption key when `MPC_POC_SERVER_KEY` is missing.
- Mock login (username / password) is not linked to wallets or Aragon profiles.
- Leaving the create wizard after the ceremony step keeps an `initializing` / unconfirmed system on the
  co-signer; delete it from the settings tab.
- Member removal, system deletion and policy deletion use `window.confirm` (POC), no dedicated dialogs.
- Workspace policies: the `escalate` waiting period (`delay_seconds`) is reported in the decision but not
  enforced by the co-signer; the `security_scan` fact is a stub (`safe`); the engine must be reachable for
  workspaces with active policies. Facts materialized at enforcement: `chain_id`, `daily_spent_wei` (same
  reservation rules as the system daily limit), `dest_whitelisted` (system recipient allowlist),
  `dest_seen_before`, `has_calldata` (derived from the calldata).
- No e2e tests; unit tests cover shamir, mpcCrypto, policy, auth, store, handlers, workspaces / policy
  evaluation (engine mocked), provider and a few components (`mpcRequestItem`, `mpcShareStatus`,
  `mpcLoginForm`).
