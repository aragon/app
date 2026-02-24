import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { keccak256, toBytes, toFunctionSelector } from 'viem';
import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { CapitalDistributorCreateCampaignActionCreate } from './components/capitalDistributorCreateCampaignActionCreate';
import { CapitalDistributorEndCampaignActionCreate } from './components/capitalDistributorEndCampaignActionCreate';
import { CapitalDistributorPauseCampaignActionCreate } from './components/capitalDistributorPauseCampaignActionCreate';
import { CapitalDistributorResumeCampaignActionCreate } from './components/capitalDistributorResumeCampaignActionCreate';
import {
    createCampaignAbi,
    endCampaignAbi,
    pauseCampaignAbi,
    resumeCampaignAbi,
} from './constants/addressCapitalDistributorAbi';
import { CapitalDistributorActionType } from './types/enum/capitalDistributorActionType';

// 0xaa7457bb67ce23e5a36a01f18dee9f03618b4d0464388dbbf37e437572d72d8d
const campaignCreatorPermissionId = keccak256(
    toBytes('CAMPAIGN_MANAGER_PERMISSION'),
);

export const initCapitalDistributorActionViews = () => {
    actionViewRegistry
        .registerGroup({
            permissionId: campaignCreatorPermissionId,
            getGroup: ({ contractAddress, t }) => ({
                id: contractAddress,
                name: t('app.actions.capitalDistributor.composer.contractName'),
                info: addressUtils.truncateAddress(contractAddress),
                indexData: [contractAddress],
            }),
        })
        .register({
            actionType: CapitalDistributorActionType.CREATE_CAMPAIGN,
            permissionId: campaignCreatorPermissionId,
            functionSelector: toFunctionSelector(createCampaignAbi),
            componentCreate: CapitalDistributorCreateCampaignActionCreate,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${CapitalDistributorActionType.CREATE_CAMPAIGN}`,
                name: t(
                    'app.actions.capitalDistributor.composer.createCampaignActionName',
                ),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: CapitalDistributorActionType.CREATE_CAMPAIGN,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: createCampaignAbi.name,
                        contract: PluginContractName.CAPITAL_DISTRIBUTOR,
                        // @ts-expect-error - ABI inputs have readonly tuple types that don't match the expected mutable array
                        parameters: createCampaignAbi.inputs.map((param) => ({
                            ...param,
                            value: '',
                        })),
                    },
                },
            }),
        })
        .register({
            actionType: CapitalDistributorActionType.PAUSE_CAMPAIGN,
            permissionId: campaignCreatorPermissionId,
            functionSelector: toFunctionSelector(pauseCampaignAbi),
            componentCreate: CapitalDistributorPauseCampaignActionCreate,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${CapitalDistributorActionType.PAUSE_CAMPAIGN}`,
                name: t(
                    'app.actions.capitalDistributor.composer.pauseCampaignActionName',
                ),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: CapitalDistributorActionType.PAUSE_CAMPAIGN,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: pauseCampaignAbi.name,
                        contract: PluginContractName.CAPITAL_DISTRIBUTOR,
                        parameters: pauseCampaignAbi.inputs.map((param) => ({
                            ...param,
                            value: '',
                        })),
                    },
                },
            }),
        })
        .register({
            actionType: CapitalDistributorActionType.RESUME_CAMPAIGN,
            permissionId: campaignCreatorPermissionId,
            functionSelector: toFunctionSelector(resumeCampaignAbi),
            componentCreate: CapitalDistributorResumeCampaignActionCreate,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${CapitalDistributorActionType.RESUME_CAMPAIGN}`,
                name: t(
                    'app.actions.capitalDistributor.composer.resumeCampaignActionName',
                ),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: CapitalDistributorActionType.RESUME_CAMPAIGN,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: resumeCampaignAbi.name,
                        contract: PluginContractName.CAPITAL_DISTRIBUTOR,
                        parameters: resumeCampaignAbi.inputs.map((param) => ({
                            ...param,
                            value: '',
                        })),
                    },
                },
            }),
        })
        .register({
            actionType: CapitalDistributorActionType.END_CAMPAIGN,
            permissionId: campaignCreatorPermissionId,
            functionSelector: toFunctionSelector(endCampaignAbi),
            componentCreate: CapitalDistributorEndCampaignActionCreate,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${CapitalDistributorActionType.END_CAMPAIGN}`,
                name: t(
                    'app.actions.capitalDistributor.composer.endCampaignActionName',
                ),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: CapitalDistributorActionType.END_CAMPAIGN,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: endCampaignAbi.name,
                        contract: PluginContractName.CAPITAL_DISTRIBUTOR,
                        parameters: endCampaignAbi.inputs.map((param) => ({
                            ...param,
                            value: '',
                        })),
                    },
                },
            }),
        });
};
