# Access control

An intended action becomes an authorized call through a sequence of execution paths and permission checks. Inspect an account’s permissions, limit each process’s scope, or transfer those scopes as governance needs change. Start with [Aragon OSx and the platform](../osx-and-the-platform.md#how-do-permissions-and-conditions-work) for how the app presents that authority, then read [permissions](../protocol-doc/core/permissions.md) and [conditions](../protocol-doc/common/permission-conditions.md) for the protocol mechanics.

- [Authorization and execution model](./authorization-and-execution.md) — the generic caller, target, authorization, and execution model, including how broad execution capability can collapse finer authority.
- [OSx authorization paths](./osx-authorization-paths.md) — a concrete reference for tracing plugin → DAO → target checks, permission tuples, ROOT administration, and the SPP callback route.
- [Permission Viewer](./permission-viewer.md) — the read-only app capability for inspecting an account's indexed OSx permission records in list and graph views.
- [Scoped authority](./scoped-authority.md) — the product rule for limiting each process at the account's execution boundary.
- [Gradual permission handover](./gradual-permission-handover.md) — a pattern for moving explicit action scopes independently as governance needs change.
