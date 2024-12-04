import type { IDao } from '@/shared/api/daoService';
import type { IAutocompleteInputGroup } from '@/shared/components/forms/autocompleteInput';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { zeroAddress } from 'viem';
import { type IProposalAction, ProposalActionType } from '../../api/governanceService';
import type { ISmartContractAbi } from '../../api/smartContractService';
import type { IActionComposerItem, IPluginActionComposerData } from './actionComposer.api';

export enum ActionGroupId {
    OSX = 'OSX',
}

export interface IGetNativeActionGroupsParams {
    /**
     * DAO to build the native action groups for.
     */
    dao?: IDao;
    /**
     * Translation function for group labels.
     */
    t: TranslationFunction;
    /**
     * Additional plugin-specific action groups.
     */
    pluginGroups: IPluginActionComposerData['groups'];
}

export interface IGetNativeActionItemsParams {
    /**
     * DAO to build the native action groups for.
     */
    dao?: IDao;
    /**
     * Translation function for group labels.
     */
    t: TranslationFunction;
    /**
     * Additional plugin-specific action items.
     */
    pluginItems: IPluginActionComposerData['items'];
}

class ActionComposerUtils {
    getCustomActionGroups = (abis: ISmartContractAbi[]): IAutocompleteInputGroup[] =>
        abis.map((abi, index) => ({
            id: index.toString(),
            name: abi.name,
            info: addressUtils.truncateAddress('0x123'), // todo
            indexData: ['0x123'], // todo
        }));

    getCustomActionItems = (abis: ISmartContractAbi[]): Array<IActionComposerItem<undefined, ProposalActionType>> =>
        abis
            .flatMap((abi) => abi.functions)
            .map((abiFunction, index) => ({
                id: index.toString(),
                name: abiFunction.name,
                icon: IconType.MINUS,
                defaultValue: {
                    type: 'custom' as ProposalActionType,
                    to: '',
                    from: '',
                    data: '0x',
                    value: '0',
                    inputData: {
                        function: abiFunction.name,
                        contract: '',
                        parameters: abiFunction.parameters.map((parameter) => ({ ...parameter, value: '' })),
                    },
                },
            }));

    getNativeActionGroups = ({ t, dao, pluginGroups }: IGetNativeActionGroupsParams): IAutocompleteInputGroup[] => [
        {
            id: ActionGroupId.OSX,
            name: t(`app.governance.actionComposer.group.${ActionGroupId.OSX}`),
            info: addressUtils.truncateAddress(dao?.address),
            indexData: [dao!.address],
        },
        ...pluginGroups,
    ];

    getNativeActionItems = ({
        t,
        dao,
        pluginItems,
    }: IGetNativeActionItemsParams): Array<IActionComposerItem<undefined, ProposalActionType>> => [
        {
            id: ProposalActionType.TRANSFER,
            name: t(`app.governance.actionComposer.action.${ProposalActionType.TRANSFER}`),
            icon: IconType.APP_TRANSACTIONS,
            defaultValue: this.buildDefaultActionTransfer(),
        },
        {
            id: ProposalActionType.METADATA_UPDATE,
            name: t(`app.governance.actionComposer.action.${ProposalActionType.METADATA_UPDATE}`),
            icon: IconType.SETTINGS,
            groupId: ActionGroupId.OSX,
            defaultValue: this.buildDefaultActionMetadata(dao!),
        },
        ...pluginItems,
    ];

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
