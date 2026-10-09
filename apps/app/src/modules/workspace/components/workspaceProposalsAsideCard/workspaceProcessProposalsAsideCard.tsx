'use client';

import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { Page } from '@/shared/components/page';
import { PluginType } from '@/shared/types';
import type { IWorkspaceProposalTab } from '../../hooks/useWorkspaceProposalTabs';

export interface IWorkspaceProcessProposalsAsideCardProps {
    /**
     * Process tab selected on the page, which names both the process and the account it is installed on.
     */
    tab: IWorkspaceProposalTab;
}

/**
 * Proposals aside card of a single process of a workspace account, rendering the same information as the DAO
 * proposals page does for a selected process.
 *
 * A process tab narrows the list to one process of one account, so the aside describes that process rather than the
 * selection it belongs to — the same swap `daoProposalsPageClient` makes between `ProposalListStats` and
 * `DaoPluginInfo`. It applies under either scope: a tab names one account whether or not the route does.
 */
export const WorkspaceProcessProposalsAsideCard: React.FC<
    IWorkspaceProcessProposalsAsideCardProps
> = (props) => {
    const { tab } = props;

    // Matches the DAO page, which titles the card with the process and its slug.
    const title = `${tab.label} (${tab.meta.slug.toUpperCase()})`;

    return (
        <Page.AsideCard title={title}>
            {/* A workspace account ID is already the DAO ID, so the component reads the DAO pages' own query. */}
            <DaoPluginInfo
                daoId={tab.accountId}
                plugin={tab.meta}
                type={PluginType.PROCESS}
            />
        </Page.AsideCard>
    );
};
