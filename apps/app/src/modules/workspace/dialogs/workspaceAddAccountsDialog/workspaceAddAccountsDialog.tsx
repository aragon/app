'use client';

import { AlertCard, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IWorkspaceAccount,
    useAddWorkspaceAccount,
    useWorkspace,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { WorkspaceAccountSelect } from '../../components/workspaceAccountSelect';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceAddAccountsDialogParams {
    /**
     * ID of the workspace to add the accounts to.
     */
    workspaceId: string;
}

export interface IWorkspaceAddAccountsDialogProps
    extends IDialogComponentProps<IWorkspaceAddAccountsDialogParams> {}

export const WorkspaceAddAccountsDialog: React.FC<
    IWorkspaceAddAccountsDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'WorkspaceAddAccountsDialog: required parameters must be set.',
    );

    const { workspaceId } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const queryClient = useQueryClient();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });
    const { mutateAsync: addWorkspaceAccount } = useAddWorkspaceAccount();

    const [selected, setSelected] = useState<IWorkspaceAccount[]>([]);

    // The suggestions belong to the wallet, so another wallet starts from an empty selection.
    const { address } = useWalletAccount();
    const [selectionAddress, setSelectionAddress] = useState(address);
    if (selectionAddress !== address) {
        setSelectionAddress(address);
        setSelected([]);
    }
    const [isAdding, setIsAdding] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleClose = () => close(location.id);

    const handleAdd = async () => {
        setIsAdding(true);
        setHasError(false);

        try {
            // One at a time: each write reads the stored workspace, so the accounts add up.
            for (const account of selected) {
                await addWorkspaceAccount({
                    urlParams: { id: workspaceId },
                    body: { account },
                });
                // Leaves the selection once held, so a retry after a failure counts and adds only the rest.
                setSelected((current) =>
                    current.filter(
                        (selected) =>
                            !workspaceUtils.isSameNetworkAddress(
                                selected,
                                account,
                            ),
                    ),
                );
            }

            handleClose();
        } catch {
            setHasError(true);
        } finally {
            // Also after a partial failure, so the accounts already added show as held.
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workspaceServiceKeys.workspace({
                        urlParams: { id: workspaceId },
                    }),
                }),
                queryClient.invalidateQueries({
                    queryKey: workspaceServiceKeys.workspaceList(),
                }),
            ]);
            setIsAdding(false);
        }
    };

    const addLabel =
        selected.length === 0
            ? t('app.workspace.workspaceAddAccountsDialog.action.add')
            : selected.length === 1
              ? t('app.workspace.workspaceAddAccountsDialog.action.addOne')
              : t('app.workspace.workspaceAddAccountsDialog.action.addMany', {
                    count: selected.length,
                });

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.workspace.workspaceAddAccountsDialog.description',
                )}
                onClose={handleClose}
                title={t('app.workspace.workspaceAddAccountsDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-4 pb-4">
                {workspace != null && (
                    <WorkspaceAccountSelect
                        onChange={setSelected}
                        value={selected}
                        workspaceAccounts={workspace.accounts}
                    />
                )}
                {hasError && (
                    <AlertCard
                        message={t(
                            'app.workspace.workspaceAddAccountsDialog.error',
                        )}
                        variant="critical"
                    />
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: addLabel,
                    onClick: handleAdd,
                    disabled: selected.length === 0 || isAdding,
                    isLoading: isAdding,
                }}
                // TODO(APP-1499): create the account in place, returning here with it selected (PR 3).
                secondaryAction={{
                    label: t(
                        'app.workspace.workspaceAddAccountsDialog.action.createAccount',
                    ),
                    href: '/create/dao',
                    onClick: handleClose,
                }}
            />
        </>
    );
};
