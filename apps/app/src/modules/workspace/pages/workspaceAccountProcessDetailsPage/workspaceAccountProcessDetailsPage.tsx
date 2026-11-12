// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound, redirect } from 'next/navigation-original';
import { DaoProcessDetailsPage } from '@/modules/settings/pages/daoProcessDetailsPage/daoProcessDetailsPage';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountProcessPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceAccountProcessDetailsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountProcessPageParams>;
}

/**
 * Process of a DAO account, `/workspace/{workspaceId}/{accountId}/settings/{slug}`: the DAO's process page with the
 * route parameters adapted. A Safe has no processes and is redirected to its settings.
 */
export const WorkspaceAccountProcessDetailsPage: React.FC<
    IWorkspaceAccountProcessDetailsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId, slug } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    const accountType =
        await workspaceAccountInfoUtils.resolveAccountType(accountId);

    switch (accountType) {
        case WorkspaceAccountType.SAFE:
            return redirect(
                workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    accountId,
                    'settings',
                ),
            );
        case WorkspaceAccountType.DAO:
            return (
                <DaoProcessDetailsPage
                    params={Promise.resolve({
                        network,
                        addressOrEns: address,
                        slug,
                    })}
                />
            );
        default:
            return accountType satisfies never;
    }
};
