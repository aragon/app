import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { keccak256, toBytes, toFunctionSelector } from 'viem';
import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { CapitalDistributorCreateCampaignActionCreate } from './components/capitalDistributorCreateCampaignActionCreate';
import { CapitalDistributorCreateCampaignActionDetails } from './components/capitalDistributorCreateCampaignActionDetails';
import { createCampaignAbi } from './constants/addressCapitalDistributorAbi';
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
            componentDetails: CapitalDistributorCreateCampaignActionDetails,
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
        });
};
