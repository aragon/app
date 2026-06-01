import { addressUtils, type ProposalActionComponent } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { useDao, useDaoPermissions } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { IProposalCreateAction } from '../../../dialogs/publishProposalDialog';
import { useProposalActionsField } from '../../../hooks/useProposalActionsField';
import { proposalActionPreparationUtils } from '../../../utils/proposalActionPreparationUtils';
import { proposalActionsImportExportUtils } from '../../../utils/proposalActionsImportExportUtils';
import { ActionComposer, actionComposerUtils } from '../../actionComposer';
import { ProposalActionsEditList } from '../../proposalActionsEditList';
import type {
    ICreateProposalFormData,
    IProposalActionData,
} from '../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../createProposalFormProvider';
import { coreCustomActionComponents } from './coreCustomActionComponents';

export interface ICreateProposalFormActionsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
}

export const CreateProposalFormActions: React.FC<
    ICreateProposalFormActionsProps
> = (props) => {
    const { daoId, pluginAddress } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const [processPlugin] = daoUtils.getDaoPlugins(dao, {
        pluginAddress,
        includeLinkedAccounts: true,
    })!;
    const hasConditionalPermissions = processPlugin.conditionAddress != null;

    // Resolve the target DAO from the plugin.
    // If the plugin has a daoAddress (linked account targeting), use it; otherwise target the parent DAO.
    const targetDaoAddress = processPlugin.daoAddress ?? dao!.address;
    const isParentTarget = addressUtils.isAddressEqual(
        targetDaoAddress,
        dao!.address,
    );
    const targetDaoId = isParentTarget
        ? daoId
        : `${dao!.network}-${targetDaoAddress}`;

    // Fetch the target DAO so that the ActionComposer has it available.
    // When targeting the parent DAO this resolves instantly from cache.
    const { data: targetDao } = useDao({ urlParams: { id: targetDaoId } });

    const { t } = useTranslations();
    const { chainId } = useDaoChain({ daoId });

    const { getValues } = useFormContext<ICreateProposalFormData>();

    const { prepareActions } = useCreateProposalFormContext();

    const {
        actions,
        actionsMerged,
        handleAddAction,
        handleRemoveAllActions,
        getArrayControls,
    } = useProposalActionsField();

    const { data: allowedActionsData } = useAllowedActions(
        {
            urlParams: { network: dao!.network, pluginAddress },
            queryParams: { pageSize: 50 },
        },
        { enabled: hasConditionalPermissions },
    );
    const {
        data: daoPermissionsData,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useDaoPermissions({
        urlParams: { network: dao!.network, daoAddress: targetDaoAddress },
        queryParams: { pageSize: 50 },
    });

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const allowedActions = allowedActionsData?.pages.flatMap(
        (page) => page.data,
    );
    const daoPermissions = daoPermissionsData?.pages.flatMap(
        (page) => page.data,
    );

    const [isDownloadPinning, setIsDownloadPinning] = useState(false);
    const [hasDownloadPinErrors, setHasDownloadPinErrors] = useState(false);

    const handleDownloadActions = useCallback(async () => {
        setIsDownloadPinning(true);
        setHasDownloadPinErrors(false);

        try {
            const currentActions = getValues('actions') ?? [];

            // Prepare actions using registered prepare functions
            const preparedActions =
                await proposalActionPreparationUtils.prepareActions({
                    actions: currentActions as IProposalCreateAction[],
                    prepareActions,
                });

            proposalActionsImportExportUtils.downloadActionsAsJSON(
                preparedActions as unknown as IProposalAction[],
                `dao-${daoId}-actions.json`,
            );
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    daoId,
                    message:
                        'Failed to pin or download proposal actions for DAO',
                },
            });
            setHasDownloadPinErrors(true);
        } finally {
            setIsDownloadPinning(false);
        }
    }, [daoId, getValues, prepareActions]);

    const { pluginComponents } = actionComposerUtils.getDaoPluginActions(dao);
    const { components: permissionActionComponents } =
        actionComposerUtils.getDaoPermissionActions({
            t,
            permissions: daoPermissions,
        });

    const customActionComponents: Record<
        string,
        ProposalActionComponent<IProposalActionData>
    > = {
        ...coreCustomActionComponents,
        ...pluginComponents,
        ...permissionActionComponents,
    };

    const showActionComposer =
        (!hasConditionalPermissions || allowedActions != null) &&
        targetDao != null;
    const hasActions = actions.length > 0;

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActionsEditList
                actionsMerged={actionsMerged}
                chainId={chainId}
                customActionComponents={customActionComponents}
                getArrayControls={getArrayControls}
            />
            {showActionComposer ? (
                <ActionComposer
                    allowedActions={allowedActions}
                    daoId={targetDaoId}
                    daoPermissions={daoPermissions}
                    hasActions={hasActions}
                    hasPinErrors={hasDownloadPinErrors}
                    isPinning={isDownloadPinning}
                    onAddAction={handleAddAction}
                    onDownloadActions={handleDownloadActions}
                    onRemoveAllActions={handleRemoveAllActions}
                />
            ) : (
                <p className="text-primary-400">
                    {t('app.governance.createProposalForm.actions.loading')}
                </p>
            )}
        </div>
    );
};
