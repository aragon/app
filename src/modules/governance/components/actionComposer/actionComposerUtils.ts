import type { IDao } from '@/shared/api/daoService';
import type { IAutocompleteInputGroup } from '@/shared/components/forms/autocompleteInput';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { zeroAddress } from 'viem';
import { type IProposalAction, ProposalActionType } from '../../api/governanceService';
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
    getCustomActionGroups = ({ abis }: IGetCustomActionParams): IAutocompleteInputGroup[] =>
        abis.map((abi) => ({
            id: abi.address,
            name: abi.name,
            info: addressUtils.truncateAddress(abi.address),
            indexData: [abi.address],
        }));

    getCustomActionItems = ({ abis, t }: IGetCustomActionParams): IActionComposerItem[] => {
        const customActionItems = abis.map((abi) => {
            const { address: contractAddress, functions } = abi;

            const functionActions = functions.map((abiFunction, index) =>
                this.buildDefaultCustomAction(abi, abiFunction, index),
            );

            const rawCalldataAction = this.buildDefaultRawCalldataAction(contractAddress, t);

            return [...functionActions, rawCalldataAction];
        });

        return [
            {
                id: ActionItemId.ADD_CONTRACT,
                name: t(`app.governance.actionComposer.customItem.${ActionItemId.ADD_CONTRACT}`),
                icon: IconType.PLUS,
            },
            ...customActionItems.flat(),
        ];
    };

    getNativeActionGroups = ({ t, dao, nativeGroups }: IGetNativeActionGroupsParams): IAutocompleteInputGroup[] => [
        {
            id: ActionGroupId.OSX,
            name: t(`app.governance.actionComposer.nativeGroup.${ActionGroupId.OSX}`),
            info: addressUtils.truncateAddress(dao?.address),
            indexData: [dao!.address],
        },
        ...nativeGroups,
    ];

    getNativeActionItems = ({ t, dao, nativeItems }: IGetNativeActionItemsParams): IActionComposerItem[] => [
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

    private buildDefaultRawCalldataAction = (address: string, t: TranslationFunction): IActionComposerItem => ({
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
            inputData: null,
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
        const existingMetadata = { logo: avatar ?? undefined, name, description, resources };

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
