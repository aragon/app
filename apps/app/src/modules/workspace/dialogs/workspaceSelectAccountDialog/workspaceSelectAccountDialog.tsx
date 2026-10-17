import { Dialog, invariant, Spinner } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { WorkspaceSelectAccountDialogItem } from './workspaceSelectAccountDialogItem';

export interface IWorkspaceSelectAccountDialogParams {
    /**
     * Accounts of the workspace to choose from.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Callback called once an account has been selected. The dialog stays open, so that the step opened on top of
     * it can send the user back here.
     */
    onAccountSelected: (account: IWorkspaceAccount) => void;
    /**
     * Flow the dialog is the first step of. Used to customize labels.
     * @default 'proposal'
     */
    variant?: 'proposal' | 'transaction';
    /**
     * IDs of the accounts that are listed but cannot be selected, because the connected wallet may not act on them.
     * They are dimmed and sorted last rather than hidden, so that the workspace reads the same whoever is
     * connected.
     */
    disabledAccountIds?: string[];
}

export interface IWorkspaceSelectAccountDialogProps
    extends IDialogComponentProps<IWorkspaceSelectAccountDialogParams> {}

/**
 * First step of creating a proposal or a transaction in a workspace: which account of the workspace to create it
 * for.
 *
 * What an account leads to is the caller's decision: a proposal stacks the DAO-bound `SelectPluginDialog` on top of
 * this one to pick a process, whereas a transaction has no second step and navigates straight to the create flow of
 * the account.
 *
 * The DAOs are only read to name and picture the rows, from the cache the workspace pages already filled.
 */
export const WorkspaceSelectAccountDialog: React.FC<
    IWorkspaceSelectAccountDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'WorkspaceSelectAccountDialog: params must be set for the dialog to work correctly',
    );
    const {
        accounts,
        onAccountSelected,
        variant = 'proposal',
        disabledAccountIds,
    } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { daos, isPending } = useWorkspaceDaos(accounts);

    const [selectedId, setSelectedId] = useState<string>();

    const isAccountDisabled = (account: IWorkspaceAccount) =>
        disabledAccountIds?.includes(account.id) ?? false;

    // Show the accounts that cannot be selected at the bottom, as the process selection does.
    const sortedAccounts = [...accounts].sort(
        (a, b) => Number(isAccountDisabled(a)) - Number(isAccountDisabled(b)),
    );

    const selectedAccount = accounts.find(
        (account) => account.id === selectedId,
    );
    const isSelectionValid =
        selectedAccount != null && !isAccountDisabled(selectedAccount);

    const handleConfirm = () => {
        if (!isSelectionValid) {
            return;
        }

        onAccountSelected(selectedAccount);
    };

    return (
        <>
            <Dialog.Header
                description={t(
                    `app.workspace.workspaceSelectAccountDialog.${variant}.description`,
                )}
                onClose={close}
                title={t(
                    `app.workspace.workspaceSelectAccountDialog.${variant}.title`,
                )}
            />
            <Dialog.Content>
                {isPending && (
                    <div className="py-4">
                        <Spinner size="lg" />
                    </div>
                )}
                <div
                    className={classNames('flex flex-col gap-2 py-2', {
                        hidden: isPending,
                    })}
                >
                    {sortedAccounts.map((account) => {
                        const isDisabled = isAccountDisabled(account);

                        return (
                            <WorkspaceSelectAccountDialogItem
                                account={account}
                                dao={daos[account.id]}
                                isActive={account.id === selectedId}
                                isDisabled={isDisabled}
                                key={account.id}
                                onClick={() => setSelectedId(account.id)}
                                showNotEligibleHelpText={isDisabled}
                            />
                        );
                    })}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.workspace.workspaceSelectAccountDialog.action.select',
                    ),
                    onClick: handleConfirm,
                    disabled: !isSelectionValid || isPending,
                }}
                secondaryAction={{
                    label: t(
                        'app.workspace.workspaceSelectAccountDialog.action.cancel',
                    ),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
