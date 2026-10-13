---
"@aragon/app": patch
---

Serve the proposal details page inside a workspace, at `/workspace/{workspaceId}/{accountId}/proposals/{proposalSlug}`, and point the rows of both workspace proposals lists at it. The page is the DAO proposal details page reused unchanged behind the account gate, with only the route parameters adapted, as the account members page already does; its metadata is reused too. The links *inside* the page still resolve to the DAO routes, which is deliberate until the rest of the workspace migration lands and a wholistic routing pass is done.
