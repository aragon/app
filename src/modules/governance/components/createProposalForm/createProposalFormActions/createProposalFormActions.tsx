import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    IconType,
    type IProposalActionsItemDropdownItem,
    type ProposalActionComponent,
    ProposalActions,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
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

const coreCustomActionComponents = {
    [ProposalActionType.TRANSFER]: TransferAssetAction,
    [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
    [ProposalActionType.METADATA_PLUGIN_UPDATE]: UpdatePluginMetadataAction,
} as unknown as Record<string, ProposalActionComponent<IProposalActionData>>;

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = (props) => {
    const { daoId, pluginAddress } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const [processPlugin] = daoUtils.getDaoPlugins(dao, { pluginAddress })!;
    const hasConditionalPermissions = processPlugin.conditionAddress != null;

    const { t } = useTranslations();
    const [expandedActions, setExpandedActions] = useState<string[]>([]);

    const {
        append: addAction,
        remove: removeAction,
        move: moveAction,
        fields: actions,
    } = useFieldArray<ICreateProposalFormData, 'actions'>({
        name: 'actions',
    });

    // Needed to control the entire field array (see Controlled Field Array on useFieldArray)
    const watchFieldArray = useWatch<Record<string, ICreateProposalFormData['actions']>>({ name: 'actions' });
    const controlledActions = actions.map((field, index) => ({ ...field, ...watchFieldArray[index] }));

    // When moving actions up or down, the value field of the decoded parameters does not get unregistered, causing
    // actions to have redundant parameters (coming from the action before/after) with a value but no type or name.
    const processedActions = controlledActions.map(({ inputData, ...field }) => ({
        ...field,
        inputData: inputData
            ? { ...inputData, parameters: inputData.parameters.filter(({ type }) => (type as unknown) != null) }
            : null,
    }));

    const handleMoveAction = (index: number, newIndex: number) => moveAction(index, newIndex);

    const handleRemoveAction = (action: IProposalActionData, index: number) => {
        removeAction(index);
        setExpandedActions((actionIds) => {
            // Expand the last remaining actions when only two actions are left, otherwise exclude the removed action ID
            const defaultNewIds = actionIds.filter((id) => id !== action.id);
            const newExpandedActions =
                controlledActions.length === 2 ? [controlledActions[Math.abs(index - 1)].id] : defaultNewIds;

            return newExpandedActions;
        });
    };

    const handleAddAction = (actions: IProposalActionData[]) => {
        // Expand all added actions containing an id
        setExpandedActions(actions.map((action) => action.id).filter((id) => id != null));
        addAction(actions);
    };

    const getActionDropdownItems = (index: number) => {
        const dropdownItems: Array<IProposalActionsItemDropdownItem<IProposalActionData> & { hidden: boolean }> = [
            {
                label: t('app.governance.createProposalForm.actions.editAction.up'),
                icon: IconType.CHEVRON_UP,
                onClick: (_, index) => handleMoveAction(index, index - 1),
                hidden: controlledActions.length < 2 || index === 0,
            },
            {
                label: t('app.governance.createProposalForm.actions.editAction.down'),
                icon: IconType.CHEVRON_DOWN,
                onClick: (_, index) => handleMoveAction(index, index + 1),
                hidden: controlledActions.length < 2 || index === controlledActions.length - 1,
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

    const { pluginItems, pluginGroups, pluginComponents } = actionComposerUtils.getPluginActionsFromDao(dao);

    const customActionComponents: Record<string, ProposalActionComponent<IProposalActionData>> = {
        ...coreCustomActionComponents,
        ...pluginComponents,
    };

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActions.Root expandedActions={expandedActions} onExpandedActionsChange={setExpandedActions}>
                <ProposalActions.Container emptyStateDescription="">
                    {processedActions.map((action, index) => (
                        <ProposalActions.Item<IProposalActionData>
                            key={action.id}
                            action={action}
                            value={action.id}
                            CustomComponent={customActionComponents[action.type]}
                            dropdownItems={getActionDropdownItems(index)}
                            editMode={true}
                            formPrefix={`actions.${index.toString()}`}
                            chainId={networkDefinitions[dao!.network].id}
                        />
                    ))}
                </ProposalActions.Container>
            </ProposalActions.Root>
            <ActionComposer
                daoId={daoId}
                onAddAction={handleAddAction}
                nativeGroups={pluginGroups}
                nativeItems={pluginItems}
                conditionedProcessAddress={hasConditionalPermissions ? pluginAddress : undefined}
            />
        </div>
    );
};
