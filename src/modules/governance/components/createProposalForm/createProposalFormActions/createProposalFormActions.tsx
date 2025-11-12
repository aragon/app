import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import { ProposalActionType, type IProposalActionWithdrawToken } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    IconType,
    ProposalActions,
    type IProposalActionsItemDropdownItem,
    type ProposalActionComponent,
} from '@aragon/gov-ui-kit';
import { useCallback, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { proposalActionUtils } from '../../../utils/proposalActionUtils';
import { ActionComposer, actionComposerUtils } from '../../actionComposer';
import type { ICreateProposalFormData, IProposalActionData } from '../createProposalFormDefinitions';
import { ActionRegistration } from './proposalActions/actionRegistration';
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
    [ProposalActionType.TRANSFER]: ActionRegistration(TransferAssetAction),
    [actionComposerUtils.transferActionLocked]: ActionRegistration(TransferAssetAction),
    [ProposalActionType.METADATA_UPDATE]: ActionRegistration(UpdateDaoMetadataAction),
    [ProposalActionType.METADATA_PLUGIN_UPDATE]: ActionRegistration(UpdatePluginMetadataAction),
};

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = (props) => {
    const { daoId, pluginAddress } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const [processPlugin] = daoUtils.getDaoPlugins(dao, { pluginAddress })!;
    const hasConditionalPermissions = processPlugin.conditionAddress != null;

    const { t } = useTranslations();
    const [expandedActions, setExpandedActions] = useState<string[]>([]);
    const [, forceUpdate] = useState({});
    const { control, getValues, setValue } = useFormContext<ICreateProposalFormData>();

    const {
        fields: actions,
        append,
        remove,
        move,
    } = useFieldArray({
        control,
        name: 'actions',
    });

    const { data: allowedActionsData } = useAllowedActions(
        { urlParams: { network: dao!.network, pluginAddress }, queryParams: { pageSize: 50 } },
        { enabled: hasConditionalPermissions },
    );

    const allowedActions = allowedActionsData?.pages.flatMap((page) => page.data);

    /**
     * Handles moving an action up or down by manually swapping the data in the form state.
     * This approach avoids the known issues with react-hook-form's useFieldArray.move()
     * when dealing with deeply nested complex objects.
     */
    const handleMoveAction = useCallback(
        (index: number, newIndex: number) => {
            if (newIndex < 0 || newIndex >= actions.length) {
                return;
            }

            // Get the current actions array from form state
            const currentActions = getValues('actions');

            // Create a deep copy to avoid mutation
            const actionsCopy = structuredClone(currentActions);

            // Manually swap the actions
            const temp = actionsCopy[index];
            actionsCopy[index] = actionsCopy[newIndex];
            actionsCopy[newIndex] = temp;

            // Update the entire actions array at once
            setValue('actions', actionsCopy, {
                shouldValidate: false,
                shouldDirty: true,
                shouldTouch: false,
            });

            // Force a re-render to ensure components re-register their fields with the new indices
            forceUpdate({});
        },
        [actions.length, getValues, setValue, forceUpdate],
    );

    const handleRemoveAction = (action: IProposalActionData, index: number) => {
        remove(index);

        setExpandedActions((actionIds) => {
            // Expand the last remaining actions when only two actions are left, otherwise exclude the removed action ID
            const defaultNewIds = actionIds.filter((id) => id !== action.id);

            if (actions.length === 2) {
                const remainingActionId = actions[Math.abs(index - 1)]?.id;
                return remainingActionId ? [remainingActionId] : [];
            }

            return defaultNewIds;
        });
    };

    const handleAddAction = (newActions: IProposalActionData[]) => {
        // Expand all added actions containing an id
        const actionIds = newActions.map((action) => action.id).filter((id): id is string => id != null);
        setExpandedActions(actionIds);

        append(newActions);
    };

    const getActionDropdownItems = (index: number) => {
        const dropdownItems: Array<IProposalActionsItemDropdownItem<IProposalActionData> & { hidden: boolean }> = [
            {
                label: t('app.governance.createProposalForm.actions.editAction.up'),
                icon: IconType.CHEVRON_UP,
                onClick: (_, index) => handleMoveAction(index, index - 1),
                hidden: actions.length < 2 || index === 0,
            },
            {
                label: t('app.governance.createProposalForm.actions.editAction.down'),
                icon: IconType.CHEVRON_DOWN,
                onClick: (_, index) => handleMoveAction(index, index + 1),
                hidden: actions.length < 2 || index === actions.length - 1,
            },
            {
                label: t('app.governance.createProposalForm.actions.editAction.remove'),
                icon: IconType.CLOSE,
                onClick: handleRemoveAction,
                hidden: false,
            },
        ];

        return dropdownItems.filter((item) => !item.hidden);
    };

    const { pluginComponents } = actionComposerUtils.getDaoPluginActions(dao);

    const customActionComponents: Record<string, ProposalActionComponent<IProposalActionData>> = {
        ...coreCustomActionComponents,
        ...pluginComponents,
    };

    // Don't render action composer while it waits for allowed actions to be fetched
    const showActionComposer = !hasConditionalPermissions || allowedActions != null;

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActions.Root expandedActions={expandedActions} onExpandedActionsChange={setExpandedActions}>
                <ProposalActions.Container emptyStateDescription="">
                    {actions.map((field, index) => {
                        // The `field` object from `useFieldArray` can be stale during re-renders.
                        // To get the most up-to-date data, we read it directly from the form state.
                        const allActions = getValues('actions');
                        const currentActionData = allActions?.[index];

                        // If data for the current index doesn't exist, render nothing to prevent crashes.
                        // This can happen momentarily during a fast `remove` operation.
                        if (!currentActionData) {
                            return null;
                        }

                        // Combine the stable `id` from the field array with the fresh data from the form state.
                        const freshAction = { ...currentActionData, id: field.id };

                        // The `ProposalActions.Item` component unconditionally calls `BigInt(action.value)`.
                        if (freshAction.value == null) {
                            freshAction.value = '0';
                        }

                        // The custom `TransferAssetAction` component uses `action.amount`. We use a type
                        // assertion to ensure TypeScript knows this property exists for this action type.
                        if (
                            (freshAction.type === ProposalActionType.TRANSFER ||
                                freshAction.type === actionComposerUtils.transferActionLocked) &&
                            (freshAction as unknown as IProposalActionWithdrawToken).amount == null
                        ) {
                            (freshAction as unknown as IProposalActionWithdrawToken).amount = '0';
                        }

                        return (
                            <ProposalActions.Item<IProposalActionData>
                                key={field.id}
                                action={freshAction}
                                actionFunctionSelector={proposalActionUtils.actionToFunctionSelector(freshAction)}
                                value={field.id}
                                CustomComponent={customActionComponents[freshAction.type]}
                                dropdownItems={getActionDropdownItems(index)}
                                editMode={true}
                                formPrefix={`actions.${index.toString()}`}
                                chainId={networkDefinitions[dao!.network].id}
                            />
                        );
                    })}
                </ProposalActions.Container>
            </ProposalActions.Root>
            {showActionComposer && (
                <ActionComposer daoId={daoId} onAddAction={handleAddAction} allowedActions={allowedActions} />
            )}
        </div>
    );
};
