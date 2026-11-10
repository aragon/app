import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
// biome-ignore lint/style/noRestrictedImports: server component cannot use the gov-ui-kit client shim; called with { strict: false } below.
import { isAddress } from 'viem';
import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface ILayoutWizardCreateWorkspaceTransactionProps {
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspaceAccountPageParams>;
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

/**
 * Wizard layout of the create-transaction flow of a workspace account, exiting to the transactions of that account.
 * Checks the `workspaces` flag itself, so with the flag off the route is a plain 404 rather than a 404 inside the
 * wizard. A segment that is not an account ID is a 404 too: a transaction is always created on one account.
 */
export const LayoutWizardCreateWorkspaceTransaction: React.FC<
    ILayoutWizardCreateWorkspaceTransactionProps
> = async (props) => {
    const { params, children } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId } = await params;

    // Validated like `LayoutWorkspaceAccount` does, with viem rather than `workspaceUtils.resolveAccountScope`: the
    // kit's `addressUtils` it relies on is re-exported from a client module, so it cannot run in a server component.
    const { network, address } = daoUtils.parseDaoId(accountId);

    if (
        !networkUtils.isValidNetwork(network) ||
        !isAddress(address, { strict: false })
    ) {
        notFound();
    }

    const exitPath = workspaceUtils.getAccountScopeUrl(
        workspaceId,
        accountId,
        'transactions',
    );

    return (
        <LayoutWizard
            exitPath={exitPath}
            name="app.workspace.layoutWizardCreateWorkspaceTransaction.name"
        >
            {children}
        </LayoutWizard>
    );
};
