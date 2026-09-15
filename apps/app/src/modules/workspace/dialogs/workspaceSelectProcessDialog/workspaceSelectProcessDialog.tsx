import { Dialog, invariant, Spinner } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { SelectPluginDialogProcessListItem } from '@/modules/governance/dialogs/selectPluginDialog';
import { useDaoOverrides } from '@/shared/api/cmsService';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';

export interface IWorkspaceSelectProcessTarget {
    /**
     * DAO the process belongs to.
     */
    dao: IDao;
    /**
     * Process to create the proposal in.
     */
    plugin: IDaoPlugin;
}

export interface IWorkspaceSelectProcessDialogParams {
    /**
     * Accounts of the workspace. Non-DAO accounts are ignored, they run no governance process.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Callback called once a process has been selected.
     */
    onProcessSelected: (target: IWorkspaceSelectProcessTarget) => void;
}

export interface IWorkspaceSelectProcessDialogProps
    extends IDialogComponentProps<IWorkspaceSelectProcessDialogParams> {}

/**
 * Lets the user pick which process of which DAO of the workspace to create a proposal in.
 *
 * It is the workspace counterpart of `SelectPluginDialog`, which is bound to a single DAO by its `useDao` and
 * `useDaoPlugins` calls. The rows are that dialog's own `SelectPluginDialogProcessListItem`, which takes its DAO as
 * a prop and runs its own eligibility simulation, so the per-row behaviour is shared rather than reimplemented.
 *
 * No per-DAO hook is needed: the DAOs arrive from `useWorkspaceDaos`, the CMS overrides arrive as one map keyed by
 * DAO ID, and both the plugin lookup and the visibility filter are pure functions.
 */
export const WorkspaceSelectProcessDialog: React.FC<
    IWorkspaceSelectProcessDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'WorkspaceSelectProcessDialog: params must be set for the dialog to work correctly',
    );
    const { accounts, onProcessSelected } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { daos } = useWorkspaceDaos(accounts);
    const { data: daoOverrides } = useDaoOverrides();

    const [selectedId, setSelectedId] = useState<string>();
    const [eligibility, setEligibility] = useState<Record<string, boolean>>({});

    const targets = Object.values(daos).flatMap((dao) => {
        const processPlugins =
            daoUtils.getDaoPlugins(dao, {
                type: PluginType.PROCESS,
                includeSubPlugins: false,
                includeLinkedAccounts: true,
            }) ?? [];
        const visiblePlugins = daoVisibilityUtils.filterHiddenPlugins(
            processPlugins,
            daoOverrides?.[dao.id],
        );

        return visiblePlugins.map((plugin) => ({
            // The plugin address is only unique within its DAO, a workspace can hold the same process twice.
            id: `${dao.id}-${plugin.address}`,
            dao,
            plugin,
        }));
    });

    const handleEligibilityResult = useCallback(
        (id: string, isEligible: boolean) =>
            setEligibility((current) =>
                current[id] === isEligible
                    ? current
                    : { ...current, [id]: isEligible },
            ),
        [],
    );

    const allResultsReady = targets.every(
        (target) => eligibility[target.id] != null,
    );

    // Show not eligible at the bottom, as the DAO dialog does.
    const sortedTargets = allResultsReady
        ? [...targets].sort(
              (a, b) => Number(eligibility[b.id]) - Number(eligibility[a.id]),
          )
        : targets;

    const selectedTarget = targets.find((target) => target.id === selectedId);

    const handleConfirm = () => {
        close();
        onProcessSelected({
            dao: selectedTarget!.dao,
            plugin: selectedTarget!.plugin,
        });
    };

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.workspace.workspaceSelectProcessDialog.description',
                )}
                onClose={close}
                title={t('app.workspace.workspaceSelectProcessDialog.title')}
            />
            <Dialog.Content>
                {!allResultsReady && (
                    <div className="py-4">
                        <Spinner size="lg" />
                    </div>
                )}
                <div
                    className={classNames('flex flex-col gap-2 py-2', {
                        hidden: !allResultsReady,
                    })}
                >
                    {sortedTargets.map((target) => (
                        <SelectPluginDialogProcessListItem
                            dao={target.dao}
                            isActive={target.id === selectedId}
                            isMultiDaoContext={true}
                            key={target.id}
                            onClick={() => setSelectedId(target.id)}
                            onEligibilityResult={handleEligibilityResult}
                            pluginId={target.id}
                            process={target.plugin}
                        />
                    ))}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.workspace.workspaceSelectProcessDialog.action.select',
                    ),
                    onClick: handleConfirm,
                    disabled: selectedTarget == null || !allResultsReady,
                }}
                secondaryAction={{
                    label: t(
                        'app.workspace.workspaceSelectProcessDialog.action.cancel',
                    ),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
