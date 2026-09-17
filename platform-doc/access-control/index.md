# Access control

These pages explain how an intended action becomes an authorized call, how OSx implements the checks, how the app makes an account's permission configuration inspectable, how the product scopes the account's authority, and how those scopes can change over time. The protocol's [permission system](../protocol-doc/core/permissions.md) and [conditions](../protocol-doc/common/permission-conditions.md) remain the source for underlying mechanics.

- [Authorization and execution model](./authorization-and-execution.md) — the generic caller, target, authorization, and execution model, including how broad execution capability can collapse finer authority.
- [OSx authorization paths](./osx-authorization-paths.md) — a concrete reference for tracing plugin → DAO → target checks, permission tuples, ROOT administration, and the SPP callback route.
- [Permission Viewer](./permission-viewer.md) — the read-only app capability for inspecting an account's indexed OSx permission records in list and graph views.
- [Scoped authority](./scoped-authority.md) — the product rule for limiting each process at the account's execution boundary.
- [Gradual permission handover](./gradual-permission-handover.md) — a pattern for moving explicit action scopes independently as governance needs change.
