import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { useDao, useDaoPermissions } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    IconType,
    ProposalActions,
    type IProposalActionsItemDropdownItem,
    type ProposalActionComponent,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
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
    const previousActionsLengthRef = useRef<number>(0);
    const isSwappingRef = useRef<boolean>(false);
    const { control, getValues, setValue } = useFormContext<ICreateProposalFormData>();

    const {
        fields: actions,
        append,
        remove,
        swap,
    } = useFieldArray({
        control,
        name: 'actions',
    });

    const { data: allowedActionsData } = useAllowedActions(
        { urlParams: { network: dao!.network, pluginAddress }, queryParams: { pageSize: 50 } },
        { enabled: hasConditionalPermissions },
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

    // Initialize expanded actions with all existing action IDs on mount only
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current && actions.length > 0) {
            console.log('=== Initializing expanded actions ===');
            console.log(
                'actions (fields):',
                actions.map((field) => ({ fieldId: field.id })),
            );
            const formActions = getValues('actions') as IProposalActionData[] | undefined;
            console.log(
                'form actions data:',
                formActions?.map((action) => ({ type: action.type, actionId: action.id })),
            );

            const actionIds = actions.map((action) => action.id).filter((id): id is string => id != null);
            console.log('actionIds to expand:', actionIds);
            setExpandedActions(actionIds);
            hasInitialized.current = true;
        }
    }, [actions, getValues]);

    // Watch for new actions being added and expand them automatically
    useEffect(() => {
        const currentLength = actions.length;
        const previousLength = previousActionsLengthRef.current;

        // Only process if actions were added (not removed or moved)
        if (currentLength > previousLength && previousLength > 0) {
            console.log('=== Actions added detected in useEffect ===');
            console.log('Previous length:', previousLength, 'Current length:', currentLength);

            // Get the newly added field IDs
            const newFieldIds = actions.slice(previousLength).map((field) => field.id);
            console.log('New field IDs to expand:', newFieldIds);

            setExpandedActions((prev) => {
                // Only add IDs that aren't already in the list to prevent duplicates
                const newIds = newFieldIds.filter((id) => !prev.includes(id));
                const updated = [...prev, ...newIds];
                console.log('Expanding actions from', prev, 'to', updated);
                return updated;
            });
        }

        // Update the ref for next time
        previousActionsLengthRef.current = currentLength;
    }, [actions]);

    const allowedActions = allowedActionsData?.pages.flatMap((page) => page.data);
    const daoPermissions = daoPermissionsData?.pages.flatMap((page) => page.data);

    /**
     * Handles moving an action up or down by manually swapping the data in the form state.
     * We use manual swap instead of useFieldArray.swap() because swap() creates empty slots
     * with complex nested objects.
     */
    const handleMoveAction = useCallback(
        (index: number, newIndex: number) => {
            console.log('=== handleMoveAction called ===');
            console.log('Moving from index', index, 'to', newIndex);

            if (newIndex < 0 || newIndex >= actions.length) {
                return;
            }

            console.log(
                'Field IDs before swap:',
                actions.map((f) => f.id),
            );
            console.log('expandedActions before swap:', expandedActions);

            // Prevent the length-watching useEffect from triggering during move
            // by keeping the ref in sync (since length doesn't change during swap)
            previousActionsLengthRef.current = actions.length;

            // Capture the currently expanded actions before swap
            const currentlyExpanded = [...expandedActions];

            // Get the current actions array from form state
            const currentActions = getValues('actions');

            // Create a deep copy to avoid mutation
            const actionsCopy = structuredClone(currentActions);

            // Manually swap the actions
            const temp = actionsCopy[index];
            actionsCopy[index] = actionsCopy[newIndex];
            actionsCopy[newIndex] = temp;

            // Update the entire actions array at once
            // Note: This will cause a re-render, but field IDs remain the same
            setValue('actions', actionsCopy, {
                shouldValidate: false,
                shouldDirty: true,
                shouldTouch: false,
            });

            // Force re-expansion after the accordion collapses due to the data swap
            setTimeout(() => {
                console.log('Re-expanding after swap to:', currentlyExpanded);
                setExpandedActions(currentlyExpanded);
            }, 50);

            console.log('Swap completed');
        },
        [actions, expandedActions, getValues, setValue],
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
        console.log('=== handleAddAction called ===');
        console.log(
            'newActions passed in:',
            newActions.map((a) => ({ type: a.type, actionId: a.id })),
        );
        console.log(
            'actions (fields) before append:',
            actions.map((f) => ({ fieldId: f.id })),
        );

        // Append the new actions - the useEffect watching actions will handle expansion
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
    const { components: permissionActionComponents } = actionComposerUtils.getDaoPermissionActions({
        t,
        permissions: daoPermissions,
    });

    const customActionComponents: Record<string, ProposalActionComponent<IProposalActionData>> = {
        ...coreCustomActionComponents,
        ...pluginComponents,
        ...permissionActionComponents,
    };

    // Don't render action composer while it waits for allowed actions to be fetched
    const showActionComposer = !hasConditionalPermissions || allowedActions != null;

    const handleExpandedActionsChange = useCallback((newExpanded: string[]) => {
        console.log('expandedActions changing to', newExpanded);
        setExpandedActions(newExpanded);
    }, []);

    console.log('=== Rendering with expandedActions:', expandedActions);

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActions.Root
                expandedActions={expandedActions}
                onExpandedActionsChange={handleExpandedActionsChange}
            >
                <ProposalActions.Container emptyStateDescription="">
                    {actions.map((field, index) => {
                        const allActions = getValues('actions') as IProposalActionData[] | undefined;
                        const currentActionData = allActions?.[index];

                        if (!currentActionData) {
                            console.error('Missing action data at index', index, 'field.id:', field.id);
                            console.error('allActions:', allActions);
                            console.error('actions.length:', actions.length);
                            return null;
                        }
                        const actionValue = currentActionData.value as string | undefined;
                        const freshAction: IProposalActionData = {
                            ...currentActionData,
                            id: field.id,
                            value: actionValue ?? '0',
                        };
                        if (
                            freshAction.type === ProposalActionType.TRANSFER ||
                            freshAction.type === actionComposerUtils.transferActionLocked
                        ) {
                            // Cast to include the amount property used by TransferAssetAction
                            const actionWithAmount = freshAction as IProposalActionData & { amount?: string };
                            Object.assign(freshAction, {
                                amount: actionWithAmount.amount ?? '0',
                            });
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
            {showActionComposer ? (
                <ActionComposer
                    daoId={daoId}
                    onAddAction={handleAddAction}
                    allowedActions={allowedActions}
                    daoPermissions={daoPermissions}
                />
            ) : (
                <p className="text-primary-400">{t('app.governance.createProposalForm.actions.loading')}</p>
            )}
        </div>
    );
};
