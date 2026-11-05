// Imported from the page file (not the module barrel): the RSC pulls in server-only code that must stay out of the
// barrel's client graph.

// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { DaoSettingsPage } from '@/modules/settings/pages/daoSettingsPage/daoSettingsPage';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountInfoType } from '../../api/workspaceQueryService';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import { WorkspaceSafeSettingsPageClient } from './workspaceSafeSettingsPageClient';

export interface IWorkspaceAccountSettingsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Settings of one account of a workspace, a DAO or a Safe. The aggregated scope has none: the navigation hides the
 * link there (`workspaceUtils.isSectionServed`).
 *
 * The Safe branch comes first, before `WorkspaceAccountGate`, because the gate fails the route for anything whose DAO
 * record cannot be read, a Safe included — as on `WorkspaceAccountMembersPage`. The account type comes from the
 * workspace accounts API; a failed lookup falls back to the DAO branch, where the gate settles it.
 *
 * The DAO branch renders the DAO settings page as is: an account ID is a DAO ID, so the only adaptation is the shape
 * of the route parameters.
 *
 * See "Safe support by route" in `docs/projectDocs/createWorkspace.md`.
 */
export const WorkspaceAccountSettingsPage: React.FC<
    IWorkspaceAccountSettingsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    const accountInfo = await workspaceAccountInfoUtils.getAccountInfo({
        network,
        address,
    });

    if (accountInfo?.type === WorkspaceAccountInfoType.SAFE) {
        return (
            <Page.Container>
                <Page.Content>
                    <WorkspaceSafeSettingsPageClient
                        address={address}
                        network={network}
                        workspaceId={workspaceId}
                    />
                </Page.Content>
            </Page.Container>
        );
    }

    return (
        <WorkspaceAccountGate accountId={accountId}>
            <DaoSettingsPage
                params={Promise.resolve({ network, addressOrEns: address })}
            />
        </WorkspaceAccountGate>
    );
};
