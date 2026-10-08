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
}

export interface IWorkspaceSelectAccountDialogProps
    extends IDialogComponentProps<IWorkspaceSelectAccountDialogParams> {}

/**
 * First step of creating a proposal in a workspace: which account of the workspace to create it for.
 *
 * The second step is the DAO-bound `SelectPluginDialog`, opened on top of this one by the caller, which decides
 * what an account leads to: a DAO leads to its processes, other account types will lead to their own flow.
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
    const { accounts, onAccountSelected } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { daos, isPending } = useWorkspaceDaos(accounts);

    const [selectedId, setSelectedId] = useState<string>();

    const selectedAccount = accounts.find(
        (account) => account.id === selectedId,
    );

    const handleConfirm = () => onAccountSelected(selectedAccount!);

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.workspace.workspaceSelectAccountDialog.description',
                )}
                onClose={close}
                title={t('app.workspace.workspaceSelectAccountDialog.title')}
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
                    {accounts.map((account) => (
                        <WorkspaceSelectAccountDialogItem
                            account={account}
                            dao={daos[account.id]}
                            isActive={account.id === selectedId}
                            key={account.id}
                            onClick={() => setSelectedId(account.id)}
                        />
                    ))}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.workspace.workspaceSelectAccountDialog.action.select',
                    ),
                    onClick: handleConfirm,
                    disabled: selectedAccount == null || isPending,
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
