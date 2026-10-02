# Private, cross-device workspaces — research

Research note on how to take the workspace registry from the `localStorage` mock described in
[`createWorkspace.md`](./createWorkspace.md) to something private, usable from more than one device, and
shareable. No code is proposed here beyond sketches; the point is to lay out the option space, the trade-offs and
a recommended path so the implementation ticket can be written against a decision rather than a guess.

## The ask

1. **Private, but usable across devices.** A workspace is not public; it must still follow the user to their
   phone and their laptop.
2. **The user is identified by the connected wallet.** No email, no password.
3. **Entering a workspace creates a workspace session**, and that session survives the user connecting a
   *different* wallet — they stay inside the workspace.
4. **A workspace can be shared with someone else.**

Requirement 3 is the load-bearing one and the least standard. It says the wallet is an *authentication event*, not
a *continuous condition*: you prove who you are once, you get a session, and afterwards the live wallet connection
is a separate concern. Everything below is organised around keeping those two things apart.

Requirement 1 is the one that needs pinning down before anyone builds: "private" has three different meanings and
they cost wildly different amounts. See [What "private" means](#what-private-means).

## Where we are today

| Concern | Today |
| --- | --- |
| Storage | `localStorage['aragon-workspaces']`, a `Record<string, IWorkspace>`, merged over `workspaceMocks` |
| Identity | `workspace.owner` is the connected address at creation time, written by the client, never checked |
| Privacy | Private by accident — the data never leaves the browser |
| Cross-device | Impossible |
| Sharing | Impossible |
| Sessions | None. `useConnectedWalletGuard` gates the create flow on a live connection |
| Server rendering | Disabled for workspace pages — the registry is unreadable during an RSC render |

Two existing pieces are worth knowing about because they shape the options:

- **`/api/backend/[...url]` is a real proxy.** `proxyBackendUtils` forwards the browser request to
  `ARAGON_BACKEND_URL`, strips hop-by-hop headers and injects `X-API-Key` server-side. It is the natural place to
  exchange a browser cookie for an upstream credential — the browser would never hold a bearer token. Note it
  currently forwards `cookie` upstream verbatim (it is not in `hopByHopHeaders`), which is fine today and would
  need a deliberate decision once a session cookie exists.
- **wagmi is configured with `cookieStorage`.** That cookie is client-controlled connection state for SSR. It is
  not, and must never be treated as, authentication.

## Four independent questions

Most "approaches" to this problem are a pick from four orthogonal columns. Choosing per column and then checking
the combination is more useful than comparing five pre-baked stacks.

1. **Where does the workspace live?** (storage)
2. **How do we know who you are?** (authentication)
3. **What keeps you inside a workspace?** (session)
4. **How does someone else get in?** (sharing)

### Q1 — Storage

| Option | Private | Cross-device | Shareable | Cost |
| --- | --- | --- | --- | --- |
| **S1** `localStorage` (today) | by isolation | ✗ | ✗ | none |
| **S2** Aragon backend (`app-backend`) | by access control | ✓ | ✓ | backend team work |
| **S3** App-owned store behind Next route handlers (Vercel Postgres/KV, Neon, Supabase) | by access control | ✓ | ✓ | app takes on state |
| **S4** Managed BaaS with its own auth (Supabase, Firebase) | by access control | ✓ | ✓ | new vendor + second auth surface |
| **S5** Encrypted blob on a dumb store (backend/IPFS/S3) | by encryption | ✓ (with key) | key-sharing only | high (key management) |
| **S6** On-chain registry | ✗ (public by construction) | ✓ | ✓ | gas + public |

S6 is out on requirement 1 unless combined with S5, at which point the chain is an expensive pointer store.
S1 stays worth keeping as an anonymous/offline mode, not as the answer.

The real choice is **S2 vs S3**: same architecture, different owner. S2 is where this belongs long-term — the
workspace *query* endpoints (`POST /v2/workspaces/query/*`) already live there, and a registry next to them lets
the server resolve a workspace's accounts itself instead of the client posting them on every request. S3 is the
escape hatch if the backend roadmap can't take it, and route handlers already exist as precedent (`/api/backend`,
`/api/rpc`, `/api/domain`).

### Q2 — Authentication

| Option | What it is | Verdict |
| --- | --- | --- |
| **A1** Client asserts its address | What we do now (`workspace.owner`) | Not authentication. Anyone can claim any address |
| **A2** SIWE (EIP-4361) → server session | Server issues a nonce, wallet signs a structured message, server verifies and sets a session | **Recommended.** Standard, one prompt, well-understood |
| **A3** Sign every mutating request | No server session state | Fails requirement 3 — the wallet must stay connected, and prompts get spammy |
| **A4** Signature mints a session *keypair* | One wallet signature authorises a locally generated key for N days (Ceramic's `did-session`/CACAO does exactly this) | Good prior art for requirement 3; more machinery than A2 needs unless the storage layer is decentralised |

A2 details that are easy to get wrong:

- Server-issued **nonce**, single-use, short TTL — otherwise signatures replay.
- Bind `domain` and `uri` in the message and check them on verify, so a signature harvested by another site is
  useless here.
- **Smart accounts must work.** Aragon users hold DAOs and Safes; an owner may well be a Safe. Verification needs
  EIP-1271 (`isValidSignature`) and ideally ERC-6492 for counterfactual accounts. viem's `verifyMessage` on a
  public client covers both, so this is a solved problem as long as it isn't verified with `ecrecover` by hand.

### Q3 — The workspace session

This is requirement 3, and it deserves its own section: [The workspace session model](#the-workspace-session-model).

### Q4 — Sharing

| Option | Flow | Notes |
| --- | --- | --- |
| **H1** Invite by address | Owner adds `0xB` with a role; `0xB` sees it after signing in | Simplest, no secret in flight, no delivery channel (they must be told out-of-band) |
| **H2** Invite link (capability token) | Owner mints `/workspace/{id}/join?invite=<token>`; server stores role, max uses, expiry; recipient signs in and redeems | Best UX. Token in a URL leaks via history/referrer — make it single-use, short-lived, and bound to the redeemer on first use |
| **H3** Unlisted/public read link | A visibility flag; anyone with the URL reads | Cheap, useful for showcase workspaces, orthogonal to H1/H2 |
| **H4** Share the decryption key | Only applies to the E2E option | Revocation means re-keying and re-encrypting; wrapping a key to a recipient address is unsolved in practice (`eth_getEncryptionPublicKey` is MetaMask-only and deprecated) |

Roles: `OWNER` / `ADMIN` / `MEMBER` / `VIEWER` is the usual shape. v1 can ship with owner + viewer and still
model the enum properly, because widening roles later is a migration and adding the column later is a bigger one.

## What "private" means

Three meanings, in ascending cost. Pick one explicitly before building.

1. **Unlisted** — not discoverable, but anyone with the link/id can read. Almost free.
2. **Access-controlled** — the server enforces membership. The server can read the data. This is what "private"
   means in every SaaS product. Moderate cost.
3. **End-to-end encrypted** — the server stores ciphertext and cannot read it. High cost.

**Recommendation: (2).** Three reasons, the last one specific to this codebase:

- Cross-device E2E needs a device-linking ceremony (per-device keypair + key wrapping, QR pairing) or a key
  derived deterministically from a signature. The derivation trick works on MetaMask-style EOAs (RFC 6979
  deterministic ECDSA) and **breaks on exactly the accounts Aragon users have** — Safes and other smart accounts
  produce EIP-1271 signatures that are not reproducible key material, and some hardware/WalletConnect wallets
  don't round-trip identically either.
- Escrowing the key server-side "encrypted at rest" is theatre: if the server can hand you the key after you
  authenticate, the server can read your data. That is option (2) with extra steps.
- **The aggregation endpoints already see the data.** `POST /v2/workspaces/query/assets` and
  `query/accounts` take the account list in the request body. Encrypting the registry hides the workspace's
  account list from the server at rest while the client posts that same list to the same server on every page
  load. The privacy gain is close to zero until the whole query surface is rethought.

Worth saying out loud: a workspace's contents are addresses of DAOs and Safes, all of which are public on-chain
entities. What is actually private is the *association* — "these accounts are one org's portfolio" — plus the
names and notes the owner attaches. That is worth protecting with access control; it is not worth a key-management
project.

## The workspace session model

### The idea

Split two things the app currently conflates:

- **Authentication** — "you have proven you control `0xA`". A one-time event. Produces an **account session**.
- **Connection** — "a wallet is attached to this tab right now". Live UI state from wagmi/AppKit. Governs what can
  be *signed*.

A **workspace session** is minted on top of the account session when the user enters a workspace and the server
confirms membership. From that moment it is a credential of its own, bound to `(workspaceId, memberAddress)` —
not to the wagmi connection. Disconnecting or switching wallets does not invalidate it, because nothing about the
proof that `0xA` is a member stopped being true.

### Entry sequence

```
1. User opens /workspace/{id}
2. No account session?  -> GET  /auth/nonce
                         -> wallet signs the EIP-4361 message
                         -> POST /auth/verify        -> Set-Cookie: account session (httpOnly)
3. POST /workspaces/{id}/session
     server: is <account> a member of <id>?
       yes -> Set-Cookie: workspace session { workspaceId, actor, role, exp }
       no  -> 403, offer the invite/join path
4. User disconnects, or connects 0xB
     -> workspace session untouched; the user stays in the workspace
     -> wallet-dependent actions (proposals, transactions) now sign as 0xB
```

### Token shape

Prefer an **opaque session id with a server-side record** over a self-contained JWT. Sharing implies revocation —
removing a member must actually lock them out — and a stateless JWT can only be revoked by keeping the very
denylist that the statelessness was meant to avoid. Cookie attributes: `httpOnly`, `Secure`, `SameSite=Lax`, path
`/`. With `SameSite=Lax`, state-changing `POST`s still need CSRF protection (double-submit token is enough).

If the cookie rides through `/api/backend`, the proxy should exchange it for the upstream credential rather than
forwarding it — the browser holds a cookie, the backend sees a bearer token, and the two namespaces never mix.

### What each layer governs

| | Account session | Workspace session | Connected wallet |
| --- | --- | --- | --- |
| Who you are | ✓ | inherited (`actor`) | — |
| Which workspace you're in | — | ✓ | — |
| Read workspace data | — | ✓ | — |
| Edit the workspace (rename, add accounts, invite) | — | ✓ (role-gated) | — |
| Sign a transaction / create a proposal | — | — | ✓ |

### Consequences worth designing for

- **The "acting as" split must be visible.** Browsing Acme Workspace as `0xA` while `0xB` is connected is
  legitimate and confusing. A persistent chip in the workspace navigation naming the session actor, and a clear
  signer identity in transaction flows, is not polish — it's what stops someone signing with the wrong account.
- **Don't auto-escalate.** If the user connects `0xB` and `0xB` happens to be an admin of the workspace, the
  session actor stays `0xA` until they explicitly switch identity (which re-authenticates). Silent privilege
  changes on wallet switch are a bug generator.
- **This deliberately breaks the `requiresWallet` reflex.** Per `AGENTS.md`, dialogs that need the connected
  address are flagged `requiresWallet: true` so `DialogRoot` unmounts them on disconnect. That convention is right
  for `TransactionDialog` and wrong for anything workspace-session-scoped — a workspace page must not blank out
  when the wallet disconnects. The two must not be wired to the same signal.
- **Session lifetime.** A workspace session that outlives revoked membership is the main authorisation hole.
  Short-ish TTL (hours, sliding) plus server-side invalidation on member removal. An explicit "leave workspace" /
  sign-out is needed for shared devices, since the whole point of the feature is that closing the wallet doesn't
  close the session.
- **Multi-device is free.** A session cookie is per-browser; a second device authenticates once and gets its own.

## Coherent combinations

| | Storage | Auth | Session | Sharing | Ships when |
| --- | --- | --- | --- | --- | --- |
| **1. Backend registry** *(recommended)* | S2 | SIWE | server cookie | address + invite link | backend capacity |
| **2. App-owned registry** | S3 | SIWE in route handlers | encrypted cookie (`jose`/`iron-session`) | same | now, without backend dependency |
| **3. Local-first + encrypted sync** | S1 + S5 | signature-derived key | key in browser | share the key | — |
| **4. Capability URLs only** | S2/S3 | none | none | the URL *is* the credential | very fast, very weak |
| **5. Protocol-native** | Ceramic/ComposeDB + Lit ACLs | DID + CACAO session | `did-session` | ACL conditions | research project |

- **1 vs 2** is an ownership question, not an architecture one. The client contract is identical, which is the
  point — pick either and the app code doesn't change.
- **3** fails the smart-account case and buys privacy the query endpoints give straight back (see
  [What "private" means](#what-private-means)).
- **4** is worth keeping in the back pocket as the *unlisted* visibility level on top of 1/2, not as the model.
- **5** is genuinely interesting for an org that wants workspaces to be portable across front-ends, and
  `did-session` is the best existing implementation of requirement 3. It is a much larger bet than this ticket.

## Recommendation

**Approach 1, staged, with the client contract landing before the server does.**

| Stage | What lands | Where |
| --- | --- | --- |
| **0** | Today's `localStorage` registry, anonymous, flag-gated | shipped |
| **1** | Split `workspaceService` into a storage-agnostic interface with a `local` driver; introduce the session concept client-side (context, `actor`, "acting as" UI) against the local driver | this repo, no backend dependency |
| **2** | Backend registry + SIWE + membership; swap in the `remote` driver; migrate/claim local workspaces | backend + this repo |
| **3** | Invite links, roles, revocation, unlisted visibility | backend + this repo |

Stage 1 is the valuable move: it forces the session semantics to be designed and reviewed while the cost of
changing them is zero, and it means stage 2 is a driver swap rather than a rewrite of every workspace page. It
also matches how `workspaceService` was deliberately shaped — "swapping the mock for a real request is a
single-method change".

## Impact on this codebase

Concrete things the current code will hit, in rough order of how much they'll hurt:

- **Workspace ids collide the moment the namespace is shared.** `workspaceUtils.buildWorkspaceId` slugifies the
  name and dedupes against *the local registry only*. Two users both naming a workspace "Treasury" both get
  `treasury`. A shared backend needs either a server-assigned opaque id (with `slug` kept as a display field) or a
  per-owner path (`/workspace/{owner}/{slug}`). Changing this after URLs are in the wild is a redirect project —
  decide at stage 1.
- **`IWorkspace` grows an access model.** `owner: string` becomes members + roles + visibility:

  ```ts
  interface IWorkspace {
      id: string;                  // server-assigned, opaque
      slug: string;                // display/URL, unique per owner
      visibility: WorkspaceVisibility;  // PRIVATE | UNLISTED | PUBLIC
      // …existing metadata, accounts, targets
  }

  interface IWorkspaceMember {
      address: string;
      role: WorkspaceRole;         // OWNER | ADMIN | MEMBER | VIEWER
      addedAt: string;
      addedBy: string;
  }
  ```

- **Endpoint surface to agree with the backend:**

  ```
  GET    /v2/auth/nonce
  POST   /v2/auth/verify                      -> account session
  POST   /v2/auth/logout
  GET    /v2/workspaces                       -> workspaces I can see
  POST   /v2/workspaces
  GET    /v2/workspaces/{id}
  POST   /v2/workspaces/{id}/session          -> workspace session
  POST   /v2/workspaces/{id}/invites          -> invite token
  POST   /v2/workspaces/invites/{token}/redeem
  DELETE /v2/workspaces/{id}/members/{address}
  ```

- **Server prefetching comes back.** `createWorkspace.md` disables it because `localStorage` is unreadable during
  an RSC render, and says to restore the normal pattern when a real registry lands. With a cookie session that
  works — `cookies()` from `next/headers` is available in RSC, so the layout can `fetchQuery` the workspace and
  `prefetchQuery` its accounts again, as branch 1096 originally did.
- **`workspaceMocks` has to go, or become a per-user seed.** Merging a hardcoded map over authenticated data will
  show every user a workspace they don't own.
- **Migration of existing local workspaces.** On first sign-in, offer to claim them: ids are reassigned, `owner`
  becomes the authenticated address. Needs a one-time prompt and a "keep local" opt-out, plus a decision on
  whether the local copy is deleted or left as a stale shadow (delete it — two registries with the same ids is
  how you get "my edit disappeared" bug reports).
- **The proxy gets an auth responsibility.** `proxyBackendUtils` currently forwards `cookie` upstream and injects
  `X-API-Key`. Decide explicitly: exchange the session cookie for an upstream credential and stop forwarding app
  cookies, or forward and let the backend read them.
- **Feature flag.** The `workspaces` flag stays off in production regardless; a second flag for the sync layer
  lets stage 2 be tested without exposing half a registry.

## Open questions for the team

1. Which meaning of **private** are we committing to? (The answer above assumes access-controlled.)
2. **Backend or app-owned registry** — does `app-backend` have room for a workspaces + auth surface this quarter?
3. Is there an existing/planned **Aragon-wide identity**? A workspace session is the first login this app has
   ever had; if account-level auth is coming anyway, workspaces should sit on it rather than invent a parallel one.
4. **Session TTL and revocation semantics** — how long does a workspace session live, and does removing a member
   kill their live session immediately?
5. **Invite delivery** — link only (out-of-band sharing), or is there appetite for a channel (XMTP, email)?
6. **Opaque ids vs per-owner slugs** in the URL — decide before any workspace URL is shared.
