import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IAutocompleteInputGroup } from '@/shared/components/forms/autocompleteInput';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { type AbiStateMutability, toFunctionSelector, zeroAddress } from 'viem';
import {
    type IProposalAction,
    type IProposalActionUpdatePluginMetadata,
    ProposalActionType,
} from '../../api/governanceService';
import type { ISmartContractAbi, ISmartContractAbiFunction } from '../../api/smartContractService';
import type { IActionComposerItem } from './actionComposer.api';

export enum ActionItemId {
    CUSTOM_ACTION = 'CUSTOM_ACTION',
    ADD_CONTRACT = 'ADD_CONTRACT',
    RAW_CALLDATA = 'RAW_CALLDATA',
}

export enum ActionGroupId {
    OSX = 'OSX',
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
    nativeItems: IActionComposerItem[];
    /**
     * If true, transfer action will not be included.
     */
    isWithoutTransfer?: boolean;
}

export interface IGetCustomActionParams extends IGetActionBaseParams {
    /**
     * Smart contract ABIs to be processed.
     */
    abis: ISmartContractAbi[];
    /**
     * If true, RAW_CALLDATA action will not be included in custom groups.
     */
    isWithoutRawCalldata?: boolean;
}

class ActionComposerUtils {
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
        isWithoutTransfer,
        isWithoutRawCalldata,
    }: IGetCustomActionParams & IGetNativeActionItemsParams): IActionComposerItem[] => {
        // Show items in the following order:
        // 1. NO CONTRACT: first show actions not belonging to any group (i.e. add contract, transfer)
        // 2. CUSTOM ACTIONS: second, show imported custom contracts with its actions, but only contracts which are unique, i.e. there is no collision with some of the native contracts.
        // 3. NATIVE ACTIONS: finally, show native contracts with its actions, but merge them with custom actions if they have the same groupId (i.e. DAO address).
        const completeCustomItems = this.getCustomActionItems({ t, abis, isWithoutRawCalldata }).map(
            this.functionSelectorMapper,
        );
        const completeNativeItems = this.getNativeActionItems({ t, dao, nativeItems, isWithoutTransfer }).map(
            this.functionSelectorMapper,
        );

        const nonGroupItems: IActionComposerItem[] = [];
        const finalCustomItems: IActionComposerItem[] = [];
        const finalNativeItems: IActionComposerItem[] = [];
        const customItemsByGroup: Record<string, IActionComposerItem[]> = {};
        const nativeItemsByGroup: Record<string, IActionComposerItem[]> = {};

        const normalizeGroupId = (groupId: string) => (groupId === dao?.address ? ActionGroupId.OSX : groupId);

        for (const item of completeCustomItems) {
            if (item.groupId) {
                const normalizedGroupId = normalizeGroupId(item.groupId);

                customItemsByGroup[normalizedGroupId] ??= [];
                customItemsByGroup[normalizedGroupId].push(item);
            } else {
                nonGroupItems.push(item);
            }
        }

        for (const item of completeNativeItems) {
            if (item.groupId) {
                const groupId = item.groupId;
                nativeItemsByGroup[groupId] ??= [];
                nativeItemsByGroup[groupId].push(item);
            } else {
                nonGroupItems.push(item);
            }
        }

        // Filter out custom items that fall into some of the native groups
        Object.entries(customItemsByGroup).forEach(([groupId, items]) => {
            // ESLint gets type intent wrong here
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (nativeItemsByGroup[groupId] == null) {
                // If groupId collides with a native group, we need to handle those actions separately
                finalCustomItems.push(...items);
            }
        });

        // Now we can safely add native items, and merge custom items where applicable.
        Object.entries(nativeItemsByGroup).forEach(([groupId, items]) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (customItemsByGroup[groupId] == null) {
                // no custom items for this group, just add native items
                finalNativeItems.push(...items);
                return;
            }

            const customItems = customItemsByGroup[groupId].map((item) => {
                // Go through custom items and if there is a native item with the same function selector, use that instead!
                // info === fn_selector
                const nativeItem = items.find((nativeItem) => nativeItem.info && nativeItem.info === item.info);

                return nativeItem ?? { ...item, groupId: normalizeGroupId(groupId) };
            });

            finalNativeItems.push(...customItems);
        });

        return [...nonGroupItems, ...finalCustomItems, ...finalNativeItems];
    };

    getDefaultActionPluginMetadataItem = (
        plugin: IDaoPlugin,
        t: TranslationFunction,
        additionalMetadata?: Record<string, unknown>,
    ): IActionComposerItem => {
        const { address } = plugin;

        return {
            id: `${address}-${ProposalActionType.METADATA_PLUGIN_UPDATE}`,
            name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.METADATA_PLUGIN_UPDATE}`),
            icon: IconType.SETTINGS,
            groupId: address,
            defaultValue: this.buildDefaultActionPluginMetadata(plugin, additionalMetadata),
        };
    };

    private functionSelectorMapper = (item: IActionComposerItem) => {
        if (item.defaultValue?.inputData == null || item.id === ProposalActionType.TRANSFER) {
            return item;
        }

        const { inputData } = item.defaultValue;
        const fnSelector = toFunctionSelector({
            type: 'function',
            name: inputData.function,
            inputs: inputData.parameters,
            outputs: [],
            stateMutability: inputData.stateMutability as AbiStateMutability,
        });

        return {
            ...item,
            info: fnSelector,
        };
    };

    private getCustomActionGroups = ({ abis }: IGetCustomActionParams): IAutocompleteInputGroup[] =>
        abis.map((abi) => ({
            id: abi.address,
            name: abi.name,
            info: addressUtils.truncateAddress(abi.address),
            indexData: [abi.address],
        }));

    private getCustomActionItems = ({
        abis,
        isWithoutRawCalldata,
        t,
    }: IGetCustomActionParams): IActionComposerItem[] => {
        const customActionItems = abis.map((abi) => {
            const functionActions = abi.functions.map((abiFunction, index) =>
                this.buildDefaultCustomAction(abi, abiFunction, index),
            );

            if (isWithoutRawCalldata) {
                return functionActions;
            }

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
            id: ActionGroupId.OSX,
            name: t(`app.governance.actionComposer.nativeGroup.${ActionGroupId.OSX}`),
            info: addressUtils.truncateAddress(dao?.address),
            indexData: [dao!.address],
        },
        ...nativeGroups,
    ];

    private getNativeActionItems = ({
        t,
        dao,
        nativeItems,
        isWithoutTransfer,
    }: IGetNativeActionItemsParams): IActionComposerItem[] => {
        const extendedNativeItems = [
            {
                id: ProposalActionType.METADATA_UPDATE,
                name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.METADATA_UPDATE}`),
                icon: IconType.SETTINGS,
                groupId: ActionGroupId.OSX,
                defaultValue: this.buildDefaultActionMetadata(dao!),
            },
            ...nativeItems,
        ];

        if (isWithoutTransfer) {
            return extendedNativeItems;
        }

        return [
            {
                id: ProposalActionType.TRANSFER,
                name: t(`app.governance.actionComposer.nativeItem.${ProposalActionType.TRANSFER}`),
                icon: IconType.APP_TRANSACTIONS,
                defaultValue: this.buildDefaultActionTransfer(),
            },
            ...extendedNativeItems,
        ];
    };

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
        { address: contractAddress, name: contractName }: ISmartContractAbi,
        { name: functionName, stateMutability, parameters }: ISmartContractAbiFunction,
        index: number,
    ): IActionComposerItem => ({
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
    ): IActionComposerItem => ({
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
