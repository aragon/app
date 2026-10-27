'use client';

import { useRouter } from 'next/navigation';
import { Page } from '@/shared/components/page';
import type { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import { WorkspaceAccountStateCard } from '../workspaceAccountStateCard';

export interface IWorkspaceAccountGateErrorProps {
    /**
     * What the accounts API says the account is, undefined when it could not tell.
     */
    accountState?: WorkspaceAccountState;
}

/**
 * Page rendered by `WorkspaceAccountGate` in place of the page when the DAO of the account cannot be read: the state
 * of the account (`WorkspaceAccountStateCard`) in the page frame. A client component of its own because the card
 * needs the router and translations, which are only available client side.
 */
export const WorkspaceAccountGateError: React.FC<
    IWorkspaceAccountGateErrorProps
> = (props) => {
    const { accountState } = props;

    const router = useRouter();

    return (
        <Page.Container>
            <Page.Content>
                <Page.Main>
                    {/* Re-runs the gate on the server, which is where its lookup happens. */}
                    <WorkspaceAccountStateCard
                        accountState={accountState}
                        onRetry={router.refresh}
                    />
                </Page.Main>
            </Page.Content>
        </Page.Container>
    );
};
