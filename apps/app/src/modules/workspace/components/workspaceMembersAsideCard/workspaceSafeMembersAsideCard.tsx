'use client';

import { SafeSettingsDetails } from '@/modules/safe/components/safeSettingsDetails';
import { Page } from '@/shared/components/page';
import type { IWorkspaceAccount } from '../../api/workspaceService';

export interface IWorkspaceSafeMembersAsideCardProps {
    /**
     * Safe account selected on the page.
     */
    account: IWorkspaceAccount;
    /**
     * Title of the card, being the label of the account's tab.
     */
    label: string;
}

/**
 * Members aside card of a Safe workspace account, showing the same Safe settings rows (address, threshold, nonce)
 * as the DAO members page does for a Safe body.
 */
export const WorkspaceSafeMembersAsideCard: React.FC<
    IWorkspaceSafeMembersAsideCardProps
> = (props) => {
    const { account, label } = props;

    return (
        <Page.AsideCard title={label}>
            <SafeSettingsDetails
                address={account.address}
                network={account.network}
            />
        </Page.AsideCard>
    );
};
