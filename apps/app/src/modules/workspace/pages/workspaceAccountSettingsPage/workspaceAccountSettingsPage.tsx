// Imported from the page file (not the module barrel): the RSC pulls in server-only code that must stay out of the
// barrel's client graph.

// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { DaoSettingsPage } from '@/modules/settings/pages/daoSettingsPage/daoSettingsPage';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';

export interface IWorkspaceAccountSettingsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Settings of one DAO account of a workspace, served by rendering the DAO settings page as is — like
 * `WorkspaceAccountMembersPage` does with the members page: an account ID is a DAO ID, so the only adaptation is the
 * shape of the route parameters.
 *
 * Settings exist for a DAO alone: the navigation hides the link for the aggregated scope and for a Safe, and
 * `WorkspaceAccountGate` fails the route for any account whose DAO record cannot be read.
 */
export const WorkspaceAccountSettingsPage: React.FC<
    IWorkspaceAccountSettingsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { accountId } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    return (
        <WorkspaceAccountGate accountId={accountId}>
            <DaoSettingsPage
                params={Promise.resolve({ network, addressOrEns: address })}
            />
        </WorkspaceAccountGate>
    );
};
