# MPC systems (POC)

Proof of concept of a new "system" type in the Aragon app: an **MPC system** is a 2-of-3 threshold key
(device share, server / co-signer share, recovery share) with signing policies, members and approvals,
sign requests (transactions, messages, EIP-712 typed data) and an activity log.

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
| Policy engine (`server/mpcPolicy.ts`) | Real evaluation (chains, allowlist, per-tx / daily limits, approvals, contract calls, message signing) |
| Signature verification + Sepolia broadcast (`server/mpcChain.ts`) | Real (viem `recover*Address`, public Sepolia RPC) |
| **Threshold signing** (`providers/mockShamirProvider.ts`) | **Mocked**: the key is reconstructed in the browser (device share + released server share) and signs with viem, then wiped |
| Login | Mocked (username / password against the mock co-signer) |
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

## Running locally

```bash
pnpm --filter @aragon/app dev
```

Open <http://localhost:3000/mpc> (the `mpcSystems` flag is on in `local`). Register a POC account on
`/mpc/login`, create a system (`/mpc/create`, 4-step wizard: details → signing passphrase → key ceremony
with downloadable recovery share → initial policy), fund the address on Sepolia and create / sign requests
from `/mpc/[systemId]`.

The mock store persists in `apps/app/.mpc-poc/store.json` (git-ignored). Delete the file to reset.

### Environment variables (`apps/app/.env.example`)

| Variable | Description |
| --- | --- |
| `MPC_POC_SERVER_KEY` | 32-byte hex key used to encrypt server shares at rest. Falls back to a fixed dev key with a warning when missing. |
| `MPC_POC_RPC_URL` | Sepolia RPC used for balance / nonce / gas / broadcast (default `https://ethereum-sepolia-rpc.publicnode.com`). |
| `MPC_POC_ALLOW_REGISTER` | Controls `POST /api/mpc/auth/register`: enabled by default outside production, in production only when set to `true`; `false` disables it everywhere. |
| `MPC_POC_STORE_PATH` | Custom path of the JSON store. |

## Endpoints (`/api/mpc`)

All responses are JSON with `Cache-Control: no-store` and answer 404 when the `mpcSystems` feature flag is
disabled. Every mutation requires the session cookie
(`aragon_mpc_session`, HttpOnly, SameSite=Strict), a same-origin `Origin` / `Referer` and the header
`x-mpc-client: aragon-app`. Errors: `{ error: { code, message } }` with codes `unauthorized`, `forbidden`,
`not_found`, `validation_error`, `rate_limited`, `conflict`, `policy_denied`, `chain_error`, `internal`.

| Method | Route | Who |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/logout` · GET `/auth/session` | anonymous / session |
| GET, POST | `/systems` | session |
| GET, PATCH, DELETE | `/systems/[systemId]` | member / owner |
| POST | `/systems/[systemId]/key` (register key after the ceremony), `/key/acknowledge-recovery` | creator / owner |
| POST | `/systems/[systemId]/server-share` `{purpose: sign\|reshare\|recover, requestId?}` (`export` rejected) | requester or owner (sign), owner (others) |
| POST | `/systems/[systemId]/reshare` `{serverShare, mode: reshare\|recover}` | owner |
| GET, POST | `/systems/[systemId]/members` · DELETE `/members/[userId]` | member / owner |
| PUT | `/systems/[systemId]/policy` | owner |
| GET, POST | `/systems/[systemId]/requests` | member / owner + approver |
| POST | `/systems/[systemId]/requests/[requestId]/approve` · `/reject` · `/prepare` · `/complete` | see `server/mpcRequestHandlers.ts` |
| GET | `/systems/[systemId]/activity`, `/balance` · POST `/simulate` | member |
| POST | `/systems/[systemId]/export-authorization` | owner |

Shared request / response types: `api/mpcService/domain/*` (imported by both the client service and the
server). Client: `api/mpcService` (`mpcService`, react-query hooks `useMpc*`).

## Client structure

- `pages/`: `mpcListPage` (`/mpc`), `mpcLoginPage` (`/mpc/login`), `mpcCreatePage` (`/mpc/create` wizard),
  `mpcSystemPage` (`/mpc/[systemId]`: header, share status, tabs Requests | Policy | Members | Activity | Settings).
- `dialogs/`: `mpcNewRequestDialog`, `mpcSignRequestDialog`, `mpcApproveRequestDialog`, `mpcReshareDialog`,
  `mpcRecoverDialog`, `mpcExportKeyDialog`, `mpcAddMemberDialog`, `mpcEditPolicyDialog`
  (registered in `constants/mpcDialogsDefinitions.ts` → `providersDialogs.ts`).
- `components/`: banner, system card, share status, request list / item / summary, policy form / summary,
  members and activity lists, login form, recovery share card, navigation and layout.
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
- Member removal and system deletion use `window.confirm` (POC), no dedicated dialogs.
- No e2e tests; unit tests cover shamir, mpcCrypto, policy, auth, store, handlers, provider and a few
  components (`mpcRequestItem`, `mpcShareStatus`, `mpcLoginForm`).
