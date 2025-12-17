import { type IProposalActionsArrayControls, type ProposalActionComponent, ProposalActions } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { useDao, useDaoPermissions } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import { proposalActionUtils } from '../../../utils/proposalActionUtils';
import { ActionComposer, actionComposerUtils } from '../../actionComposer';
import type { ICreateProposalFormData, IProposalActionData } from '../createProposalFormDefinitions';
import { TransferAssetAction } from './proposalActions/transferAssetAction';
import { UpdateDaoMetadataAction } from './proposalActions/updateDaoMetadataAction';
import { UpdatePluginMetadataAction } from './proposalActions/updatePluginMetadataAction';

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

const coreCustomActionComponents: Record<string, ProposalActionComponent<IProposalActionData>> = {
    [ProposalActionType.TRANSFER]: TransferAssetAction,
    [actionComposerUtils.transferActionLocked]: TransferAssetAction,
    [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
    [ProposalActionType.METADATA_PLUGIN_UPDATE]: UpdatePluginMetadataAction,
};

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = (props) => {
    const { daoId, pluginAddress } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const [processPlugin] = daoUtils.getDaoPlugins(dao, { pluginAddress })!;
    const hasConditionalPermissions = processPlugin.conditionAddress != null;

    const { t } = useTranslations();
    const { chainId } = useDaoChain({ daoId });

    const { control, getValues, setValue } = useFormContext<ICreateProposalFormData>();

    const {
        fields: actions,
        append,
        remove,
    } = useFieldArray({
        control,
        name: 'actions',
    });

    const { data: allowedActionsData } = useAllowedActions(
        {
            urlParams: { network: dao!.network, pluginAddress },
            queryParams: { pageSize: 50 },
        },
        { enabled: hasConditionalPermissions }
    );
    const {
        data: daoPermissionsData,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useDaoPermissions({
        urlParams: { network: dao!.network, daoAddress: dao!.address },
        queryParams: { pageSize: 50 },
    });

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const allowedActions = allowedActionsData?.pages.flatMap((page) => page.data);
    const daoPermissions = daoPermissionsData?.pages.flatMap((page) => page.data);

    /**
     * Note: We don't use useFieldArray.swap() or .move() because they create empty slots
     * when dealing with complex nested objects, causing data loss and crashes. Instead,
     * we use structuredClone to create a deep copy, manually swap elements, and update
     * the entire array at once.
     */
    const handleMoveAction = useCallback(
        (index: number, newIndex: number) => {
            if (newIndex < 0 || newIndex >= actions.length) {
                return;
            }

            const currentActions = getValues('actions');
            const actionsCopy = structuredClone(currentActions);

            const temp = actionsCopy[index];
            actionsCopy[index] = actionsCopy[newIndex];
            actionsCopy[newIndex] = temp;

            setValue('actions', actionsCopy, {
                shouldValidate: false,
                shouldDirty: true,
                shouldTouch: false,
            });
        },
        [actions, getValues, setValue]
    );

    const handleRemoveAction = (index: number) => {
        remove(index);
    };

    const handleAddAction = (newActions: IProposalActionData[]) => {
        append(newActions);
    };

    const getArrayControls = (index: number): IProposalActionsArrayControls<IProposalActionData> => ({
        moveUp: {
            label: t('app.governance.createProposalForm.actions.editAction.up'),
            onClick: (index) => handleMoveAction(index, index - 1),
            disabled: actions.length < 2 || index === 0,
        },
        moveDown: {
            label: t('app.governance.createProposalForm.actions.editAction.down'),
            onClick: (index) => handleMoveAction(index, index + 1),
            disabled: actions.length < 2 || index === actions.length - 1,
        },
        remove: {
            label: t('app.governance.createProposalForm.actions.editAction.remove'),
            onClick: handleRemoveAction,
            disabled: false,
        },
    });

    const { pluginComponents } = actionComposerUtils.getDaoPluginActions(dao);
    const { components: permissionActionComponents } = actionComposerUtils.getDaoPermissionActions({
        t,
        permissions: daoPermissions,
    });

    const customActionComponents: Record<string, ProposalActionComponent<IProposalActionData>> = {
        ...coreCustomActionComponents,
        ...pluginComponents,
        ...permissionActionComponents,
    };

    const showActionComposer = !hasConditionalPermissions || allowedActions != null;

    const expandedActions = actions.map((action) => action.id);
    const noOpActionsChange = useCallback(() => {
        // No-op: expansion is controlled via expandedActions array
    }, []);

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActions.Root editMode={true} expandedActions={expandedActions} onExpandedActionsChange={noOpActionsChange}>
                <ProposalActions.Container emptyStateDescription="">
                    {actions.map((action, index) => (
                        <ProposalActions.Item<IProposalActionData>
                            action={action as IProposalActionData}
                            actionCount={actions.length}
                            actionFunctionSelector={proposalActionUtils.actionToFunctionSelector(action as IProposalActionData)}
                            arrayControls={getArrayControls(index)}
                            CustomComponent={customActionComponents[action.type]}
                            chainId={chainId}
                            editMode={true}
                            formPrefix={`actions.${index.toString()}`}
                            key={action.id}
                            value={action.id}
                        />
                    ))}
                </ProposalActions.Container>
            </ProposalActions.Root>
            {showActionComposer ? (
                <ActionComposer
                    allowedActions={allowedActions}
                    daoId={daoId}
                    daoPermissions={daoPermissions}
                    onAddAction={handleAddAction}
                />
            ) : (
                <p className="text-primary-400">{t('app.governance.createProposalForm.actions.loading')}</p>
            )}
        </div>
    );
};
