import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { zeroAddress } from 'viem';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IAutocompleteInputGroup } from '@/shared/components/forms/autocompleteInput';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { type ActionViewCreateComponent, actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type IProposalAction, type IProposalActionUpdatePluginMetadata, ProposalActionType } from '../../api/governanceService';
import type { ISmartContractAbi, ISmartContractAbiFunction } from '../../api/smartContractService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IActionComposerPluginData } from '../../types';
import { proposalActionUtils } from '../../utils/proposalActionUtils';
import type { IActionComposerInputItem } from './actionComposerInput';
import {
    ActionItemId,
    type IGetActionItemsParams,
    type IGetAllowedActionBaseParams,
    type IGetAllowedActionItemsParams,
    type IGetCustomActionParams,
    type IGetDaoActionsParams,
    type IGetNativeActionGroupsParams,
    type IGetNativeActionItemsParams,
} from './actionComposerUtils.api';

class ActionComposerUtils {
    // The TransferActionLocked is a UI-only variant of the TransferAction which locks the token field to the one set as
    // the "to" attribute of the action. It is used to display the native transfer UI on ERC-20 transfer actions.
    transferActionLocked = 'TransferActionLocked';

    private readonly transferSelector = '0xa9059cbb';

    getDaoActions = ({ dao, permissions, t }: IGetDaoActionsParams) => {
        const pluginActions = this.getDaoPluginActions(dao);
        const permissionActions = this.getDaoPermissionActions({ permissions, t });

        return {
            items: [...pluginActions.pluginItems, ...permissionActions.items],
            groups: [...pluginActions.pluginGroups, ...permissionActions.groups],
        };
    };

    getDaoPluginActions = (dao?: IDao) => {
        const { plugins = [] } = dao ?? {};
        const pluginActions = plugins.map((plugin) => {
            const slotFunction = pluginRegistryUtils.getSlotFunction<IDaoPlugin, IActionComposerPluginData>({
                pluginId: plugin.interfaceType,
                slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            });

            return slotFunction?.(plugin);
        });

        const pluginItems = pluginActions.flatMap((data) => data?.items ?? []);
        const pluginGroups = pluginActions.flatMap((data) => data?.groups ?? []);
        const pluginComponents = pluginActions.reduce((acc, data) => ({ ...acc, ...data?.components }), {});

        return { pluginItems, pluginGroups, pluginComponents };
    };

    getDaoPermissionActions = ({ permissions, t }: Omit<IGetDaoActionsParams, 'dao'>) => {
        if (!permissions) {
            return {
                items: [],
                groups: [],
                components: {},
            };
        }

        const result = permissions.reduce(
            (acc, cur) => {
                const { items, group, components } = actionViewRegistry.getActionsForPermissionId(cur.permissionId, cur.whereAddress, t);
                return {
                    items: [...acc.items, ...items],
                    groups: group ? [...acc.groups, group] : acc.groups,
                    components: { ...acc.components, ...components },
                };
            },

            {
                items: [] as IActionComposerInputItem[],
                groups: [] as IAutocompleteInputGroup[],
                components: {} as Record<string, ActionViewCreateComponent>,
            } // Removed the extra closing brace
        );

        return result;
    };

    getAllowedActionGroups = ({ t, dao, allowedActions }: IGetAllowedActionBaseParams): IAutocompleteInputGroup[] => {
        const daoAddress = dao!.address;
        const [daoGroup] = this.getNativeActionGroups({ t, dao, nativeGroups: [] });

        const actionGroups: IAutocompleteInputGroup[] = allowedActions.map((action) =>
            addressUtils.isAddressEqual(action.target, daoAddress)
                ? daoGroup
                : this.buildCustomActionGroup({ name: action.decoded.contractName, address: action.target })
        );

        return actionGroups;
    };

    getAllowedActionItems = (params: IGetAllowedActionItemsParams): IActionComposerInputItem[] => {
        const { t, allowedActions } = params;
        const nativeActionItems = this.getNativeActionItems(params).map(this.infoToSelectorMapper);

        const actionItems: IActionComposerInputItem[] = allowedActions.map((action, actionIndex) => {
            const { selector, target, decoded } = action;

            // Return transfer item for native or erc-20 transfers
            if (selector === null || selector === this.transferSelector) {
                return this.buildTransferNativeAction(t, target);
            }

            // Use native item if available to enable proper basic view
            const nativeItem = nativeActionItems.find(
                (item) => addressUtils.isAddressEqual(item.groupId, target) && item.info === selector
            );

            if (nativeItem) {
                return nativeItem;
            }

            const item = this.buildDefaultCustomAction(
                { address: action.target, name: decoded.contractName },
                { name: decoded.functionName, parameters: decoded.inputs },
                actionIndex
            );

            item.info = selector;

            return item;
        });

        return actionItems;
    };

    getActionGroups = (params: IGetCustomActionParams & IGetNativeActionGroupsParams): IAutocompleteInputGroup[] => {
        const { t, dao, abis, nativeGroups } = params;

        const completeNativeGroups = this.getNativeActionGroups({ dao, t, nativeGroups });
        const completeCustomGroups = abis.map(this.buildCustomActionGroup);

        const nativeGroupIds = new Set([...completeNativeGroups.map((group) => group.id), dao?.address].filter(Boolean));
        const filteredCustomGroups = completeCustomGroups.filter((customGroup) => !nativeGroupIds.has(customGroup.id));

        // NOTE: order of groups is not important here, as it's determined by the autocomplete input component based on items order.
        return [...filteredCustomGroups, ...completeNativeGroups];
    };

    getActionItems = (params: IGetActionItemsParams): IActionComposerInputItem[] => {
        const { t, dao, abis, nativeItems, excludeActionTypes } = params;

        // Show items in the following order:
        // 1. NO CONTRACT: first show actions not belonging to any group (i.e. add contract, transfer)
        // 2. CUSTOM ACTIONS: second, show imported custom contracts with its actions, but only contracts which are unique, i.e. there is no collision with some of the native contracts.
        // 3. NATIVE ACTIONS: finally, show native contracts with its actions, but merge them with custom actions if they have the same groupId (i.e. DAO address).
        const completeCustomItems = this.getCustomActionItems({ t, abis }).map(this.infoToSelectorMapper);
        const completeNativeItems = this.getNativeActionItems({ t, dao, nativeItems }).map(this.infoToSelectorMapper);

        const { nonGroupItems: nonGroupCustomItems, itemsByGroup: customItemsByGroup } = this.groupActionItems(completeCustomItems);
        const { nonGroupItems: nativeNonGroupItems, itemsByGroup: nativeItemsByGroup } = this.groupActionItems(completeNativeItems);

        const allNonGroupItems = [...nonGroupCustomItems, ...nativeNonGroupItems];
        const finalCustomItems = this.getFinalCustomItems(customItemsByGroup, nativeItemsByGroup);
        const finalNativeItems = this.getFinalNativeItems(nativeItemsByGroup, customItemsByGroup);

        const allItems = [...allNonGroupItems, ...finalCustomItems, ...finalNativeItems];

        if (excludeActionTypes?.length) {
            return allItems.filter(({ defaultValue }) => defaultValue?.type == null || !excludeActionTypes.includes(defaultValue.type));
        }

        return allItems;
    };

    getDefaultActionPluginMetadataItem = (
        plugin: IDaoPlugin,
        t: TranslationFunction,
        additionalMetadata?: Record<string, unknown>
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

    private readonly groupActionItems = (items: IActionComposerInputItem[]) =>
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
            { nonGroupItems: [], itemsByGroup: {} }
        );

    /**
     * Returns custom items with groupId that are not present in the native groups.
     * This is used to ensure that custom items are not duplicated in the final list of items.
     * @param customItemsByGroup
     * @param nativeItemsByGroup
     */
    private readonly getFinalCustomItems = (
        customItemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>,
        nativeItemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>
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
    private readonly getFinalNativeItems = (
        nativeItemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>,
        customItemsByGroup: Partial<Record<string, IActionComposerInputItem[]>>
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

    private readonly infoToSelectorMapper = (item: IActionComposerInputItem) => ({
        ...item,
        info: this.getFunctionSelector(item),
    });

    private readonly getFunctionSelector = (item: IActionComposerInputItem) => {
        const { defaultValue, id, info } = item;

        if (defaultValue?.inputData == null || id === ProposalActionType.TRANSFER) {
            return;
        }

        return info ?? proposalActionUtils.actionToFunctionSelector(defaultValue);
    };

    private readonly buildCustomActionGroup = ({ address, name }: Pick<ISmartContractAbi, 'address' | 'name'>) => ({
        id: address,
        name,
        info: addressUtils.truncateAddress(address),
        indexData: [address],
    });

    private readonly getCustomActionItems = ({ abis, t }: IGetCustomActionParams): IActionComposerInputItem[] => {
        const customActionItems = abis.map((abi) => {
            const functionActions = abi.functions.map((abiFunction, index) => this.buildDefaultCustomAction(abi, abiFunction, index));

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

    private readonly getNativeActionGroups = (params: IGetNativeActionGroupsParams): IAutocompleteInputGroup[] => {
        const { t, dao, nativeGroups } = params;

        return [
            {
                id: dao!.address,
                name: t('app.governance.actionComposer.nativeGroup.DAO'),
                info: addressUtils.truncateAddress(dao?.address),
                indexData: [dao!.address],
            },
            ...nativeGroups,
        ];
    };

    private readonly getNativeActionItems = (params: IGetNativeActionItemsParams): IActionComposerInputItem[] => {
        const { t, dao, nativeItems } = params;

        const transferAction = this.buildTransferNativeAction(t);
        const metadataUpdateAction = {
            id: ProposalActionType.METADATA_UPDATE,
            name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.METADATA_UPDATE}`),
            icon: IconType.SETTINGS,
            groupId: dao!.address,
            defaultValue: this.buildDefaultActionMetadata(dao!),
        };

        return [transferAction, metadataUpdateAction, ...nativeItems];
    };

    private readonly buildTransferNativeAction = (t: TranslationFunction, token?: string) => ({
        id: ProposalActionType.TRANSFER,
        name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.TRANSFER}`),
        icon: IconType.APP_TRANSACTIONS,
        defaultValue: this.buildDefaultActionTransfer(token),
        groupId: token,
        info: token != null ? this.transferSelector : undefined,
    });

    private readonly buildDefaultActionPluginMetadata = (
        plugin: IDaoPlugin,
        additionalMetadata?: Record<string, unknown>
    ): IProposalActionUpdatePluginMetadata => {
        const { name, processKey, description, links: resources } = plugin;
        const existingMetadata = { name, processKey, description, resources, ...additionalMetadata };

        return {
            type: ProposalActionType.METADATA_PLUGIN_UPDATE,
            from: '',
            to: plugin.address,
            data: '',
            value: '0',
            existingMetadata,
            proposedMetadata: existingMetadata,
            inputData: {
                function: 'setMetadata',
                contract: plugin.interfaceType,
                parameters: [{ name: '_metadata', type: 'bytes', notice: 'The IPFS hash of the new metadata object', value: '' }],
            },
        };
    };

    private readonly buildDefaultCustomAction = (
        { address: contractAddress, name: contractName }: Pick<ISmartContractAbi, 'address' | 'name'>,
        { name: functionName, stateMutability, parameters }: ISmartContractAbiFunction,
        index: number
    ): IActionComposerInputItem => ({
        id: `${contractAddress}-${functionName}-${index.toString()}`,
        name: functionName,
        icon: IconType.SLASH,
        groupId: contractAddress,
        defaultValue: {
            type: ActionItemId.CUSTOM_ACTION,
            to: contractAddress,
            from: '',
            data: '',
            value: '0',
            inputData: {
                function: functionName,
                contract: contractName,
                stateMutability,
                parameters: parameters.map((parameter) => ({ ...parameter, value: undefined })),
            },
        },
    });

    private readonly buildDefaultRawCalldataAction = (
        { address, name }: ISmartContractAbi,
        t: TranslationFunction
    ): IActionComposerInputItem => ({
        id: `${address}-${ActionItemId.RAW_CALLDATA}`,
        name: t(`app.governance.actionComposer.customItem.${ActionItemId.RAW_CALLDATA}`),
        icon: IconType.BLOCKCHAIN_SMARTCONTRACT,
        groupId: address,
        defaultValue: {
            type: ActionItemId.RAW_CALLDATA,
            to: address,
            from: '',
            data: '',
            value: '0',
            inputData: {
                function: t('app.governance.actionComposer.rawCalldataFunction'),
                contract: name,
                parameters: [],
            },
        },
    });

    private readonly buildDefaultActionTransfer = (token?: string): IProposalAction => ({
        type: token != null ? this.transferActionLocked : ProposalActionType.TRANSFER,
        from: '',
        to: token ?? zeroAddress,
        data: '0x',
        value: '0',
        inputData: { function: 'transfer', contract: 'Ether', parameters: [] },
    });

    private readonly buildDefaultActionMetadata = (dao: IDao) => {
        const { avatar, address, name, description, links: resources } = dao;
        const existingMetadata = { avatar: { url: ipfsUtils.cidToSrc(avatar) }, name, description, resources };

        return {
            type: ProposalActionType.METADATA_UPDATE,
            to: address,
            from: '',
            data: '',
            value: '0',
            existingMetadata,
            proposedMetadata: existingMetadata,
            inputData: {
                function: 'setMetadata',
                contract: 'DAO',
                parameters: [{ name: '_metadata', type: 'bytes', value: '', notice: 'The IPFS hash of the new metadata object' }],
            },
        };
    };
}

export const actionComposerUtils = new ActionComposerUtils();
