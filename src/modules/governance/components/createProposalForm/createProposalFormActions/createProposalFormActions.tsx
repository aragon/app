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
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
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
    const [highlightedActionIndex, setHighlightedActionIndex] = useState<number | null>(null);
    const [highlightTrigger, setHighlightTrigger] = useState(0);
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

            setHighlightedActionIndex(newIndex);
            setHighlightTrigger((prev) => prev + 1);
        },
        [actions, getValues, setValue],
    );

    const handleRemoveAction = (action: IProposalActionData, index: number) => {
        remove(index);
    };

    const handleAddAction = (newActions: IProposalActionData[]) => {
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

    const showActionComposer = !hasConditionalPermissions || allowedActions != null;

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActions.Root>
                <ProposalActions.Container emptyStateDescription="">
                    {actions.map((action, index) => (
                        <ProposalActions.Item<IProposalActionData>
                            key={action.id}
                            action={action as IProposalActionData}
                            actionFunctionSelector={proposalActionUtils.actionToFunctionSelector(
                                action as IProposalActionData,
                            )}
                            value={action.id}
                            CustomComponent={customActionComponents[action.type]}
                            dropdownItems={getActionDropdownItems(index)}
                            formPrefix={`actions.${index.toString()}`}
                            chainId={networkDefinitions[dao!.network].id}
                            editMode={true}
                        />
                    ))}
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
