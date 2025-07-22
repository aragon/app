import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IAutocompleteInputGroup, IAutocompleteInputItem } from '@/shared/components/forms/autocompleteInput';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { type AbiStateMutability, toFunctionSelector, zeroAddress } from 'viem';
import {
    type IProposalAction,
    type IProposalActionUpdatePluginMetadata,
    ProposalActionType,
} from '../../api/governanceService';
import type { ISmartContractAbi, ISmartContractAbiFunction } from '../../api/smartContractService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IActionComposerPluginData } from '../../types';
import type { IActionComposerInputItem, IActionComposerInputProps } from './actionComposerInput';

export enum ActionItemId {
    CUSTOM_ACTION = 'CUSTOM_ACTION',
    ADD_CONTRACT = 'ADD_CONTRACT',
    RAW_CALLDATA = 'RAW_CALLDATA',
}

export interface IGetActionBaseParams {
    /**
     * DAO to build the native action groups for.
     */
    dao?: IDao;
    /**
     * Translation function for group labels.
     */
    t: TranslationFunction;
}

export interface IGetNativeActionGroupsParams extends IGetActionBaseParams {
    /**
     * Additional action groups.
     */
    nativeGroups: IAutocompleteInputGroup[];
}

export interface IGetNativeActionItemsParams extends IGetActionBaseParams {
    /**
     * Additional action items.
     */
    nativeItems: IActionComposerInputItem[];
}

export interface IGetCustomActionParams extends IGetActionBaseParams {
    /**
     * Smart contract ABIs to be processed.
     */
    abis: ISmartContractAbi[];
}

interface IGetActionItemsParams
    extends IGetCustomActionParams,
        IGetNativeActionItemsParams,
        Pick<IActionComposerInputProps, 'excludeActionTypes'> {}

export interface IGetAllowedActionGroupsAndItemsParams
    extends IGetActionBaseParams,
        Pick<IActionComposerInputProps, 'allowedActions'> {}

class ActionComposerUtils {
    getPluginActionsFromDao = (dao?: IDao) => {
        const pluginActions =
            dao?.plugins.map((plugin) =>
                pluginRegistryUtils.getSlotFunction<IDaoPlugin, IActionComposerPluginData>({
                    pluginId: plugin.interfaceType,
                    slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
                })?.(plugin),
            ) ?? [];
        const pluginItems = pluginActions.flatMap((data) => data?.items ?? []);
        const pluginGroups = pluginActions.flatMap((data) => data?.groups ?? []);
        const pluginComponents = pluginActions.reduce((acc, data) => ({ ...acc, ...data?.components }), {});

        return {
            pluginItems,
            pluginGroups,
            pluginComponents,
        };
    };

    getAllowedActionGroupsAndItem = ({
        t,
        dao,
        allowedActions = [],
    }: IGetAllowedActionGroupsAndItemsParams): [IAutocompleteInputGroup[], IAutocompleteInputItem[]] => {
        const daoAddress = dao!.address;
        const [transferItem, metadataUpdateItem] = this.getNativeActionItems({ t, dao, nativeItems: [] }).map(
            this.infoToSelectorMapper,
        );
        const [daoGroup] = this.getNativeActionGroups({
            t,
            dao,
            nativeGroups: [],
        });

        const allowedSelectors = allowedActions.map((action) => action.selector);
        const abis = allowedActions.map((action) => action.targetAbi);

        const actionItems = abis.map((abi, abiIndex) => {
            if (!abi) {
                const item = this.buildDefaultCustomAction(
                    {
                        address: allowedActions[abiIndex].target,
                        name: t('app.governance.verifySmartContractDialog.unverified'),
                    },
                    { name: t('app.governance.verifySmartContractDialog.unverified'), parameters: [] },
                    0,
                );
                item.info = allowedActions[abiIndex].selector ?? undefined;
                return [item];
            }

            return abi.functions.map((abiFunction, index) => this.buildDefaultCustomAction(abi, abiFunction, index));
        });
        const actionItemsWithSelectors = actionItems.flat().map(this.infoToSelectorMapper);

        const completeAllowedItems = actionItemsWithSelectors
            .filter((item) => (item.info ? allowedSelectors.includes(item.info) : false))
            // use native item if matches (to enable proper basic view and icon)
            .map((item) => (item.info === metadataUpdateItem.info ? metadataUpdateItem : item));

        // `null` selector means native transfer
        if (allowedSelectors.includes(null)) {
            completeAllowedItems.unshift(transferItem);
        }

        // create groups contract address, DAO if matches dao address
        const filteredAbis = abis.filter((abi) => abi != null);
        const allowedGroups: IAutocompleteInputGroup[] = this.getCustomActionGroups({
            abis: filteredAbis,
            dao,
            t,
        });
        const completeAllowedGroups = allowedGroups.map((group) => (group.id === daoAddress ? daoGroup : group));

        return [completeAllowedGroups, completeAllowedItems];
    };

    getActionGroups = ({
        t,
        dao,
        abis,
        nativeGroups,
    }: IGetCustomActionParams & IGetNativeActionGroupsParams): IAutocompleteInputGroup[] => {
        const completeNativeGroups = this.getNativeActionGroups({ dao, t, nativeGroups });
        const completeCustomGroups = this.getCustomActionGroups({ dao, t, abis });

        const nativeGroupIds = new Set(
            [...completeNativeGroups.map((group) => group.id), dao?.address].filter(Boolean),
        );
        const filteredCustomGroups = completeCustomGroups.filter((customGroup) => !nativeGroupIds.has(customGroup.id));

        // NOTE: order of groups is not important here, as it's determined by the autocomplete input component based on items order.
        return [...filteredCustomGroups, ...completeNativeGroups];
    };

    getActionItems = ({
        t,
        dao,
        abis,
        nativeItems,
        excludeActionTypes,
    }: IGetActionItemsParams): IActionComposerInputItem[] => {
        // Show items in the following order:
        // 1. NO CONTRACT: first show actions not belonging to any group (i.e. add contract, transfer)
        // 2. CUSTOM ACTIONS: second, show imported custom contracts with its actions, but only contracts which are unique, i.e. there is no collision with some of the native contracts.
        // 3. NATIVE ACTIONS: finally, show native contracts with its actions, but merge them with custom actions if they have the same groupId (i.e. DAO address).
        const completeCustomItems = this.getCustomActionItems({ t, abis }).map(this.infoToSelectorMapper);
        const completeNativeItems = this.getNativeActionItems({ t, dao, nativeItems }).map(this.infoToSelectorMapper);

        const { nonGroupItems: nonGroupCustomItems, itemsByGroup: customItemsByGroup } =
            this.groupActionItems(completeCustomItems);
        const { nonGroupItems: nativeNonGroupItems, itemsByGroup: nativeItemsByGroup } =
            this.groupActionItems(completeNativeItems);

        const allNonGroupItems = [...nonGroupCustomItems, ...nativeNonGroupItems];
        const finalCustomItems = this.getFinalCustomItems(customItemsByGroup, nativeItemsByGroup);
        const finalNativeItems = this.getFinalNativeItems(nativeItemsByGroup, customItemsByGroup);

        const allItems = [...allNonGroupItems, ...finalCustomItems, ...finalNativeItems];

        if (excludeActionTypes?.length) {
            return allItems.filter((item) => {
                if (item.defaultValue?.type && excludeActionTypes.includes(item.defaultValue.type)) {
                    return false;
                }

                return true;
            });
        }

        return allItems;
    };

    getDefaultActionPluginMetadataItem = (
        plugin: IDaoPlugin,
        t: TranslationFunction,
        additionalMetadata?: Record<string, unknown>,
    ): IActionComposerInputItem => {
        const { address } = plugin;

        return {
            id: `${address}-${ProposalActionType.METADATA_PLUGIN_UPDATE}`,
            name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.METADATA_PLUGIN_UPDATE}`),
            icon: IconType.SETTINGS,
            groupId: address,
            defaultValue: this.buildDefaultActionPluginMetadata(plugin, additionalMetadata),
        };
    };

    private groupActionItems = (items: IActionComposerInputItem[]) =>
        items.reduce<{
            nonGroupItems: IActionComposerInputItem[];
            itemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>;
        }>(
            (acc, item) => {
                const { groupId } = item;

                if (groupId) {
                    (acc.itemsByGroup[groupId] ??= []).push(item);
                } else {
                    acc.nonGroupItems.push(item);
                }

                return acc;
            },
            { nonGroupItems: [], itemsByGroup: {} },
        );

    /**
     * Returns custom items with groupId that are not present in the native groups.
     * This is used to ensure that custom items are not duplicated in the final list of items.
     * @param customItemsByGroup
     * @param nativeItemsByGroup
     */
    private getFinalCustomItems = (
        customItemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>,
        nativeItemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>,
    ) =>
        Object.entries(customItemsByGroup).reduce<IActionComposerInputItem[]>((acc, [groupId, items]) => {
            if (nativeItemsByGroup[groupId] == null) {
                acc.push(...items!);
            }
            return acc;
        }, []);

    /**
     * Returns all native items, but merges custom items with the same groupId by:
     *   - keeping the native item if it exists, and
     *   - keeping the order of custom items.
     * @param nativeItemsByGroup
     * @param customItemsByGroup
     */
    private getFinalNativeItems = (
        nativeItemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>,
        customItemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>,
    ) =>
        Object.entries(nativeItemsByGroup).reduce<IActionComposerInputItem[]>((acc, [groupId, items]) => {
            const customItemsForGroup = customItemsByGroup[groupId];

            if (customItemsForGroup) {
                const customItems = customItemsForGroup.map((item) => {
                    // Go through custom items and if there is a native item with the same function selector, use that instead!
                    // info === fn_selector
                    const nativeItem = items?.find((nativeItem) => nativeItem.info && nativeItem.info === item.info);
                    return nativeItem ?? item;
                });
                acc.push(...customItems);
            } else {
                // no custom items for this group, just add native items
                acc.push(...items!);
            }
            return acc;
        }, []);

    private infoToSelectorMapper = (item: IActionComposerInputItem) => ({
        ...item,
        info: this.getFunctionSelector(item),
    });

    private getFunctionSelector = (item: IActionComposerInputItem) => {
        if (item.defaultValue?.inputData == null || item.id === ProposalActionType.TRANSFER) {
            return undefined;
        }

        if (item.info) {
            return item.info;
        }

        const { inputData } = item.defaultValue;

        return toFunctionSelector({
            type: 'function',
            name: inputData.function,
            inputs: inputData.parameters,
            outputs: [],
            stateMutability: inputData.stateMutability as AbiStateMutability,
        });
    };

    private getCustomActionGroups = ({ abis }: IGetCustomActionParams): IAutocompleteInputGroup[] =>
        abis.map((abi) => ({
            id: abi.address,
            name: abi.name,
            info: addressUtils.truncateAddress(abi.address),
            indexData: [abi.address],
        }));

    private getCustomActionItems = ({ abis, t }: IGetCustomActionParams): IActionComposerInputItem[] => {
        const customActionItems = abis.map((abi) => {
            const functionActions = abi.functions.map((abiFunction, index) =>
                this.buildDefaultCustomAction(abi, abiFunction, index),
            );

            const rawCalldataAction = this.buildDefaultRawCalldataAction(abi, t);

            return [...functionActions, rawCalldataAction];
        });

        return [
            {
                id: ActionItemId.ADD_CONTRACT,
                name: t(`app.governance.actionComposer.customItem.${ActionItemId.ADD_CONTRACT}`),
                icon: IconType.PLUS,
                alwaysVisible: true,
            },
            ...customActionItems.flat(),
        ];
    };

    private getNativeActionGroups = ({
        t,
        dao,
        nativeGroups,
    }: IGetNativeActionGroupsParams): IAutocompleteInputGroup[] => [
        {
            id: dao!.address,
            name: t(`app.governance.actionComposer.nativeGroup.DAO`),
            info: addressUtils.truncateAddress(dao?.address),
            indexData: [dao!.address],
        },
        ...nativeGroups,
    ];

    private getNativeActionItems = ({
        t,
        dao,
        nativeItems,
    }: IGetNativeActionItemsParams): IActionComposerInputItem[] => [
        {
            id: ProposalActionType.TRANSFER,
            name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.TRANSFER}`),
            icon: IconType.APP_TRANSACTIONS,
            defaultValue: this.buildDefaultActionTransfer(),
        },
        {
            id: ProposalActionType.METADATA_UPDATE,
            name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.METADATA_UPDATE}`),
            icon: IconType.SETTINGS,
            groupId: dao!.address,
            defaultValue: this.buildDefaultActionMetadata(dao!),
        },
        ...nativeItems,
    ];

    private buildDefaultActionPluginMetadata = (
        plugin: IDaoPlugin,
        additionalMetadata?: Record<string, unknown>,
    ): IProposalActionUpdatePluginMetadata => {
        const { name, processKey, description, links: resources } = plugin;
        const existingMetadata = { name, processKey, description, resources, ...additionalMetadata };

        return {
            type: ProposalActionType.METADATA_PLUGIN_UPDATE,
            from: '',
            to: plugin.address,
            data: '0x',
            value: '0',
            existingMetadata,
            proposedMetadata: existingMetadata,
            inputData: {
                function: 'setMetadata',
                contract: plugin.subdomain,
                parameters: [
                    {
                        name: '_metadata',
                        type: 'bytes',
                        notice: 'The IPFS hash of the new metadata object',
                        value: '',
                    },
                ],
            },
        };
    };

    private buildDefaultCustomAction = (
        { address: contractAddress, name: contractName }: Pick<ISmartContractAbi, 'address' | 'name'>,
        { name: functionName, stateMutability, parameters }: ISmartContractAbiFunction,
        index: number,
    ): IActionComposerInputItem => ({
        id: `${contractAddress}-${functionName}-${index.toString()}`,
        name: functionName,
        icon: IconType.SLASH,
        groupId: contractAddress,
        defaultValue: {
            type: ActionItemId.CUSTOM_ACTION,
            to: contractAddress,
            from: '',
            data: '0x',
            value: '0',
            inputData: {
                function: functionName,
                contract: contractName,
                stateMutability,
                parameters: parameters.map((parameter) => ({ ...parameter, value: undefined })),
            },
        },
    });

    private buildDefaultRawCalldataAction = (
        { address, name }: ISmartContractAbi,
        t: TranslationFunction,
    ): IActionComposerInputItem => ({
        id: `${address}-${ActionItemId.RAW_CALLDATA}`,
        name: t(`app.governance.actionComposer.customItem.${ActionItemId.RAW_CALLDATA}`),
        icon: IconType.BLOCKCHAIN_SMARTCONTRACT,
        groupId: address,
        defaultValue: {
            type: ActionItemId.RAW_CALLDATA,
            to: address,
            from: '',
            data: '0x',
            value: '0',
            inputData: {
                function: t(`app.governance.actionComposer.rawCalldataFunction`),
                contract: name,
                parameters: [],
            },
        },
    });

    private buildDefaultActionTransfer = (): IProposalAction => ({
        type: ProposalActionType.TRANSFER,
        from: '',
        to: zeroAddress,
        data: '0x',
        value: '0',
        inputData: { function: 'transfer', contract: 'Ether', parameters: [] },
    });

    private buildDefaultActionMetadata = (dao: IDao) => {
        const { avatar, address, name, description, links: resources } = dao;
        const existingMetadata = { avatar: { url: ipfsUtils.cidToSrc(avatar) }, name, description, resources };

        return {
            type: ProposalActionType.METADATA_UPDATE,
            to: address,
            from: '',
            data: '0x',
            value: '0',
            existingMetadata,
            proposedMetadata: existingMetadata,
            inputData: {
                function: 'setMetadata',
                contract: 'DAO',
                parameters: [
                    { name: '_metadata', type: 'bytes', value: '', notice: 'The IPFS hash of the new metadata object' },
                ],
            },
        };
    };
}

export const actionComposerUtils = new ActionComposerUtils();
