'use client';

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
 * of the account (`WorkspaceAccountStateCard`) in the page frame.
 */
export const WorkspaceAccountGateError: React.FC<
    IWorkspaceAccountGateErrorProps
> = (props) => {
    const { accountState } = props;

    return (
        <Page.Container>
            <Page.Content>
                <Page.Main>
                    <WorkspaceAccountStateCard accountState={accountState} />
                </Page.Main>
            </Page.Content>
        </Page.Container>
    );
};
