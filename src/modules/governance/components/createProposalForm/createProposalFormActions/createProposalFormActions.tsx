import {
    type IProposalActionsArrayControls,
    type ProposalActionComponent,
    ProposalActions,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { setMetadataAbi } from '@/modules/governance/constants/setMetadataAbi';
import { useDao, useDaoPermissions } from '@/shared/api/daoService';
import { usePinFile, usePinJson } from '@/shared/api/ipfsService/mutations';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { proposalActionsImportExportUtils } from '../../../utils/proposalActionsImportExportUtils';
import { proposalActionUtils } from '../../../utils/proposalActionUtils';
import { ActionComposer, actionComposerUtils } from '../../actionComposer';
import type {
    ICreateProposalFormData,
    IProposalActionData,
} from '../createProposalFormDefinitions';
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

const coreCustomActionComponents: Record<
    string,
    ProposalActionComponent<IProposalActionData>
> = {
    [ProposalActionType.TRANSFER]: TransferAssetAction,
    [actionComposerUtils.transferActionLocked]: TransferAssetAction,
    [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
    [ProposalActionType.METADATA_PLUGIN_UPDATE]: UpdatePluginMetadataAction,
};

export const CreateProposalFormActions: React.FC<
    ICreateProposalFormActionsProps
> = (props) => {
    const { daoId, pluginAddress } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const [processPlugin] = daoUtils.getDaoPlugins(dao, { pluginAddress })!;
    const hasConditionalPermissions = processPlugin.conditionAddress != null;

    const { t } = useTranslations();
    const { chainId } = useDaoChain({ daoId });

    const { control, getValues, setValue } =
        useFormContext<ICreateProposalFormData>();

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

    const allowedActions = allowedActionsData?.pages.flatMap(
        (page) => page.data,
    );
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

    const { mutateAsync: pinJson } = usePinJson();
    const { mutateAsync: pinFile } = usePinFile();

    const handleRemoveAllActions = useCallback(() => {
        remove();
    }, [remove]);

    const handleDownloadActions = useCallback(async () => {
        const currentActions = getValues('actions') ?? [];

        // Pin and encode metadata actions for download
        for (let i = 0; i < currentActions.length; i++) {
            const action = currentActions[i];

            if (action.type === ProposalActionType.METADATA_UPDATE) {
                const actionWithMetadata = action as unknown as {
                    proposedMetadata: {
                        name: string;
                        description: string;
                        resources: unknown[];
                        avatar?: { file?: File; url?: string };
                    };
                };
                const { name, description, resources, avatar } =
                    actionWithMetadata.proposedMetadata;
                const proposedMetadata = {
                    name,
                    description,
                    links: resources,
                };

                let daoAvatar: string | undefined;

                if (avatar?.file != null) {
                    const avatarResult = await pinFile({ body: avatar.file });
                    daoAvatar = ipfsUtils.cidToUri(avatarResult.IpfsHash);
                } else if (avatar?.url) {
                    daoAvatar = ipfsUtils.srcToUri(avatar.url);
                }

                const metadata = daoAvatar
                    ? { ...proposedMetadata, avatar: daoAvatar }
                    : proposedMetadata;

                const ipfsResult = await pinJson({ body: metadata });
                const hexResult = transactionUtils.stringToMetadataHex(
                    ipfsResult.IpfsHash,
                );
                const data = encodeFunctionData({
                    abi: [setMetadataAbi],
                    args: [hexResult],
                });

                currentActions[i] = { ...action, data };
            } else if (
                action.type === ProposalActionType.METADATA_PLUGIN_UPDATE
            ) {
                const actionWithMetadata = action as unknown as {
                    proposedMetadata: {
                        name: string;
                        description: string;
                        resources: unknown[];
                        processKey?: string;
                    };
                    existingMetadata: unknown;
                };
                const { proposedMetadata, existingMetadata } =
                    actionWithMetadata;
                const { name, description, resources, processKey } =
                    proposedMetadata;

                const meta = action.meta as
                    | { isProcess?: boolean; isSubPlugin?: boolean }
                    | undefined;
                const isProcess = meta?.isProcess ?? false;
                const isSubPlugin = meta?.isSubPlugin ?? false;
                const displayProcessKey = isProcess && !isSubPlugin;

                const pluginMetadata: Record<string, unknown> = {
                    ...(existingMetadata as Record<string, unknown>),
                    name,
                    description,
                    links: resources,
                };

                if (displayProcessKey) {
                    pluginMetadata.processKey = processKey;
                }

                const ipfsResult = await pinJson({ body: pluginMetadata });
                const hexResult = transactionUtils.stringToMetadataHex(
                    ipfsResult.IpfsHash,
                );
                const data = encodeFunctionData({
                    abi: [setMetadataAbi],
                    args: [hexResult],
                });

                currentActions[i] = { ...action, data };
            }
        }

        proposalActionsImportExportUtils.downloadActionsAsJSON(
            currentActions,
            `dao-${daoId}-actions.json`,
        );
    }, [daoId, getValues, pinJson, pinFile]);

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

    const showActionComposer =
        !hasConditionalPermissions || allowedActions != null;
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
                    {actions.map((action, index) => (
                        <ProposalActions.Item<IProposalActionData>
                            action={action as IProposalActionData}
                            actionCount={actions.length}
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
                    allowedActions={allowedActions}
                    daoId={daoId}
                    daoPermissions={daoPermissions}
                    hasActions={hasActions}
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
