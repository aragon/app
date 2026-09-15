import { Dialog, invariant, Spinner } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { useDaoOverrides } from '@/shared/api/cmsService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
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
 * DAO accounts running no visible process are listed but not selectable, as their second step would be empty. The
 * plugins are read from the DAOs, which `useWorkspaceDaos` reads from the cache the workspace pages already filled,
 * so knowing this costs no request.
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
    const { data: daoOverrides } = useDaoOverrides();

    const [selectedId, setSelectedId] = useState<string>();

    const options = accounts.map((account) => {
        const dao = daos[account.id];

        const processPlugins =
            daoUtils.getDaoPlugins(dao, {
                type: PluginType.PROCESS,
                includeSubPlugins: false,
                includeLinkedAccounts: true,
            }) ?? [];
        const visiblePlugins = daoVisibilityUtils.filterHiddenPlugins(
            processPlugins,
            daoOverrides?.[account.id],
        );

        // Only DAO accounts run governance processes. Any other account type is its own process, therefore it is
        // always selectable and the caller skips the process step for it.
        const isSelectable =
            account.type !== WorkspaceAccountType.DAO ||
            visiblePlugins.length > 0;

        return { account, dao, isSelectable };
    });

    const selectedAccount = options.find(
        (option) => option.account.id === selectedId,
    )?.account;

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
                    {options.map(({ account, dao, isSelectable }) => (
                        <WorkspaceSelectAccountDialogItem
                            account={account}
                            dao={dao}
                            isActive={account.id === selectedId}
                            isDisabled={!isSelectable}
                            key={account.id}
                            onClick={() => setSelectedId(account.id)}
                            showNoProcessesHelpText={!isSelectable}
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
