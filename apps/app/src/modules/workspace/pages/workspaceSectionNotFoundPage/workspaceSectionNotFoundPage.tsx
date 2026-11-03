// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';

/**
 * Any section that does not exist under a workspace scope — a typo, or a section not built yet.
 *
 * Matching the URL here rather than letting it match no route at all is what keeps the 404 inside the workspace:
 * an unmatched URL is handled by the root not-found boundary, which renders under the root layout alone and
 * therefore without the workspace navigation. Raised from here it reaches `workspace/[workspaceId]/not-found.tsx`,
 * which renders inside the workspace layout. A real section page wins over this catch-all, being more specific.
 *
 * Both workspace scopes need their own catch-all route — the aggregated `all` segment is a static one holding real
 * pages, so a miss below it never falls through to the account-scoped catch-all — and both re-export this page, so
 * the two behave identically by construction.
 */
export const WorkspaceSectionNotFoundPage = () => notFound();
