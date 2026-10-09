'use client';

import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { Page } from '@/shared/components/page';
import { PluginType } from '@/shared/types';
import type { IWorkspaceMemberTab } from '../../hooks/useWorkspaceMemberTabs';

export interface IWorkspaceBodyMembersAsideCardProps {
    /**
     * Body tab selected on the page, which names both the body and the account it is installed on.
     */
    tab: IWorkspaceMemberTab;
}

/**
 * Members aside card of a single body of a workspace account, rendering the same information as the DAO members
 * page does for a selected body.
 *
 * A body tab narrows the list to one body of one account, so the aside describes that body rather than the
 * selection it belongs to — the swap `daoMembersPageClient` makes, and the counterpart of
 * `WorkspaceProcessProposalsAsideCard` on the proposals page.
 *
 * The DAO members page also renders a `GOVERNANCE_MEMBER_PANEL` slot component below the card. It is left out here
 * on purpose: those panels are plugin-specific and assume the DAO page's own context, which an aggregated
 * workspace page does not provide.
 */
export const WorkspaceBodyMembersAsideCard: React.FC<
    IWorkspaceBodyMembersAsideCardProps
> = (props) => {
    const { tab } = props;

    return (
        <Page.AsideCard title={tab.label}>
            {/* A workspace account ID is already the DAO ID, so the component reads the DAO pages' own query. */}
            <DaoPluginInfo
                daoId={tab.accountId}
                plugin={tab.meta}
                type={PluginType.BODY}
            />
        </Page.AsideCard>
    );
};
