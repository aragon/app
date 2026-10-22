// The DaoDashboardPage RSC is NOT exported here on purpose since it imports
// `server-only` modules. This barrel is imported by client components.
export {
    DaoDashboardPageClient,
    daoDashboardPageMembersFilterParam,
    daoDashboardPageProposalsFilterParam,
    type IDaoDashboardPageClientProps,
} from './daoDashboardPageClient';
