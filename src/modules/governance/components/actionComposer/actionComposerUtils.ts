import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IAutocompleteInputGroup } from '@/shared/components/forms/autocompleteInput';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { addressUtils, IconType, type IProposalActionInputData } from '@aragon/gov-ui-kit';
import { keccak256, toBytes, zeroAddress } from 'viem';
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
}

export interface IGetCustomActionParams extends IGetActionBaseParams {
    /**
     * Smart contract ABIs to be processed.
     */
    abis: ISmartContractAbi[];
}

class ActionComposerUtils {
    getActionGroups = ({
        t,
        dao,
        abis,
        nativeGroups,
    }: IGetCustomActionParams & IGetNativeActionGroupsParams): IAutocompleteInputGroup[] => {
        return [
            this.getCustomActionGroups({ dao, t, abis }),
            this.getNativeActionGroups({ dao, t, nativeGroups }),
        ].flat();
    };

    getActionItems = ({
        t,
        dao,
        abis,
        nativeItems,
    }: IGetCustomActionParams & IGetNativeActionItemsParams): IActionComposerItem[] => {
        const customItems = this.getCustomActionItems({ t, abis });
        const completeNativeItems = this.getNativeActionItems({ t, dao, nativeItems });

        return [...customItems, ...completeNativeItems].map((item) => {
            if (item.defaultValue?.inputData == null || item.id === ProposalActionType.TRANSFER) {
                return item;
            }

            const fnSelector = this.createFunctionSelector(item.defaultValue.inputData);
            return {
                ...item,
                info: fnSelector,
            };
        });
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

    createFunctionSelector = (inputData: IProposalActionInputData): `0x${string}` => {
        const types = inputData.parameters.map((p) => p.type).join(',');
        const signature = `${inputData.function}(${types})`;
        const hash = keccak256(toBytes(signature));
        return hash.substring(0, 10) as `0x${string}`;
    };

    private getCustomActionGroups = ({ abis }: IGetCustomActionParams): IAutocompleteInputGroup[] =>
        abis.map((abi) => ({
            id: abi.address,
            name: abi.name,
            info: addressUtils.truncateAddress(abi.address),
            indexData: [abi.address],
        }));

    private getCustomActionItems = ({ abis, t }: IGetCustomActionParams): IActionComposerItem[] => {
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
            id: ActionGroupId.OSX,
            name: t(`app.governance.actionComposer.nativeGroup.${ActionGroupId.OSX}`),
            info: addressUtils.truncateAddress(dao?.address),
            indexData: [dao!.address],
        },
        ...nativeGroups,
    ];

    private getNativeActionItems = ({ t, dao, nativeItems }: IGetNativeActionItemsParams): IActionComposerItem[] => [
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
            groupId: ActionGroupId.OSX,
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
