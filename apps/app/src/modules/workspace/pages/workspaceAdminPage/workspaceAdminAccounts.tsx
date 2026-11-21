'use client';

import { AlertCard, CardEmptyState, IconType } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    useRemoveWorkspaceAccount,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { WorkspaceAccountItem } from '../../components/workspaceAccountItem';
import { useWorkspaceAddAccountsDialog } from '../../hooks/useWorkspaceAddAccountsDialog';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';

export interface IWorkspaceAdminAccountsProps {
    /**
     * Workspace to display the accounts of.
     */
    workspace: IWorkspace;
}

export const WorkspaceAdminAccounts: React.FC<IWorkspaceAdminAccountsProps> = (
    props,
) => {
    const { workspace } = props;
    const { id, accounts } = workspace;

    const { t } = useTranslations();
    const queryClient = useQueryClient();

    const { daos } = useWorkspaceDaos(accounts);
    const { mutateAsync: removeWorkspaceAccount } = useRemoveWorkspaceAccount();
    const [hasRemoveError, setHasRemoveError] = useState(false);

    const handleRemove = async (account: IWorkspaceAccount) => {
        setHasRemoveError(false);

        try {
            await removeWorkspaceAccount({
                urlParams: { id },
                body: { accountId: account.id },
            });
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workspaceServiceKeys.workspace({
                        urlParams: { id },
                    }),
                }),
                queryClient.invalidateQueries({
                    queryKey: workspaceServiceKeys.workspaceList(),
                }),
            ]);
        } catch {
            setHasRemoveError(true);
        }
    };

    const handleAddAccounts = useWorkspaceAddAccountsDialog(id);

    return (
        <Page.MainSection
            action={{
                label: t('app.workspace.workspaceAdminPage.accounts.add'),
                iconLeft: IconType.PLUS,
                variant: 'secondary',
                onClick: handleAddAccounts,
            }}
            className="gap-3"
            inset={false}
            title={t('app.workspace.workspaceAdminPage.accounts.title')}
        >
            {hasRemoveError && (
                <AlertCard
                    message={t(
                        'app.workspace.workspaceAdminPage.accounts.removeError',
                    )}
                    variant="critical"
                />
            )}
            {accounts.length === 0 ? (
                <CardEmptyState
                    description={t(
                        'app.workspace.workspaceAdminPage.accounts.empty.description',
                    )}
                    heading={t(
                        'app.workspace.workspaceAdminPage.accounts.empty.heading',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'WALLET' }}
                />
            ) : (
                <div className="flex flex-col gap-3">
                    {accounts.map((account) => (
                        <WorkspaceAccountItem
                            account={account}
                            dao={daos[account.id]}
                            key={account.id}
                            onRemove={() => handleRemove(account)}
                            workspaceId={id}
                        />
                    ))}
                </div>
            )}
        </Page.MainSection>
    );
};
