import {
    type IProposalActionsArrayControls,
    type ProposalActionComponent,
    ProposalActions,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { useDao, useDaoPermissions } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { proposalActionUtils } from '../../utils/proposalActionUtils';
import { ActionComposer, actionComposerUtils } from '../actionComposer';
import type {
    ICreateProposalFormData,
    IProposalActionData,
} from '../createProposalForm';
import { TransferAssetAction } from '../createProposalForm/createProposalFormActions/proposalActions/transferAssetAction';
import { UpdateDaoMetadataAction } from '../createProposalForm/createProposalFormActions/proposalActions/updateDaoMetadataAction';
import { UpdatePluginMetadataAction } from '../createProposalForm/createProposalFormActions/proposalActions/updatePluginMetadataAction';

export interface ICreateExecuteActionsFormActionsProps {
    /**
     * ID of the DAO to execute actions on.
     */
    daoId: string;
}

const coreCustomActionComponents: Record<
    string,
    ProposalActionComponent<IProposalActionData>
> = {
    [ProposalActionType.TRANSFER]: TransferAssetAction,
    [actionComposerUtils.transferActionLocked]: TransferAssetAction,
    [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
    [ProposalActionType.METADATA_PLUGIN_UPDATE]: UpdatePluginMetadataAction,
};

export const CreateExecuteActionsFormActions: React.FC<
    ICreateExecuteActionsFormActionsProps
> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { chainId } = useDaoChain({ daoId });

    const { control, getValues, setValue } =
        useFormContext<ICreateProposalFormData>();

    const {
        fields: actions,
        append,
        remove,
    } = useFieldArray({ control, name: 'actions' });

    // We need to watch because action views can update data, and it's not reflected otherwise!
    // We merge it with `actions` because of `id` and other internal props which are missing in watched action.
    const watchActions = useWatch<
        Record<string, ICreateProposalFormData['actions']>
    >({ name: 'actions' });
    // Skip stale watch data when lengths diverge after remove() to avoid index corruption.
    const stableWatchActions =
        watchActions?.length === actions.length ? watchActions : undefined;
    const actionsMerged = actions.map((field, index) => ({
        ...field,
        ...stableWatchActions?.[index],
        id: field.id,
    }));

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

    const daoPermissions = daoPermissionsData?.pages.flatMap(
        (page) => page.data,
    );

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
        [actions, getValues, setValue],
    );

    const handleRemoveAction = (index: number) => {
        remove(index);
    };

    const handleAddAction = (newActions: IProposalActionData[]) => {
        append(newActions);
    };

    const handleRemoveAllActions = useCallback(() => {
        remove();
    }, [remove]);

    const getArrayControls = (
        index: number,
    ): IProposalActionsArrayControls<IProposalActionData> => ({
        moveUp: {
            label: t('app.governance.createProposalForm.actions.editAction.up'),
            onClick: (index) => handleMoveAction(index, index - 1),
            disabled: actions.length < 2 || index === 0,
        },
        moveDown: {
            label: t(
                'app.governance.createProposalForm.actions.editAction.down',
            ),
            onClick: (index) => handleMoveAction(index, index + 1),
            disabled: actions.length < 2 || index === actions.length - 1,
        },
        remove: {
            label: t(
                'app.governance.createProposalForm.actions.editAction.remove',
            ),
            onClick: handleRemoveAction,
            disabled: false,
        },
    });

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

    const showActionComposer = dao != null;
    const hasActions = actions.length > 0;

    const expandedActions = actions.map((action) => action.id);
    const noOpActionsChange = useCallback(() => undefined, []);

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActions.Root
                editMode={true}
                expandedActions={expandedActions}
                onExpandedActionsChange={noOpActionsChange}
            >
                <ProposalActions.Container emptyStateDescription="">
                    {actionsMerged.map((action, index) => (
                        <ProposalActions.Item<IProposalActionData>
                            action={action as IProposalActionData}
                            actionCount={actionsMerged.length}
                            actionFunctionSelector={proposalActionUtils.actionToFunctionSelector(
                                action as IProposalActionData,
                            )}
                            arrayControls={getArrayControls(index)}
                            CustomComponent={
                                customActionComponents[action.type]
                            }
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
                    daoId={daoId}
                    daoPermissions={daoPermissions}
                    hasActions={hasActions}
                    onAddAction={handleAddAction}
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
