import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { keccak256, toBytes, toFunctionSelector } from 'viem';
import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { GaugeVoterActivateGaugeActionCreate } from './components/gaugeVoterActivateGaugeActionCreate';
import { GaugeVoterActivateGaugeActionDetails } from './components/gaugeVoterActivateGaugeActionDetails';
import { GaugeVoterCreateGaugeActionCreate } from './components/gaugeVoterCreateGaugeActionCreate';
import { GaugeVoterCreateGaugeActionDetails } from './components/gaugeVoterCreateGaugeActionDetails';
import { GaugeVoterDeactivateGaugeActionCreate } from './components/gaugeVoterDeactivateGaugeActionCreate';
import { GaugeVoterDeactivateGaugeActionDetails } from './components/gaugeVoterDeactivateGaugeActionDetails';
import { GaugeVoterUpdateGaugeMetadataActionCreate } from './components/gaugeVoterUpdateGaugeMetadataActionCreate';
import { GaugeVoterUpdateGaugeMetadataActionDetails } from './components/gaugeVoterUpdateGaugeMetadataActionDetails';
import {
    activateGaugeAbi,
    createGaugeAbi,
    deactivateGaugeAbi,
    updateGaugeMetadataAbi,
} from './constants/addressGaugeVoterAbi';
import { GaugeVoterActionType } from './types/enum/gaugeVoterActionType';

const gaugeAdminPermissionId = keccak256(toBytes('GAUGE_ADMIN'));

export const initGaugeVoterActionViews = () => {
    actionViewRegistry
        .registerGroup({
            permissionId: gaugeAdminPermissionId,
            getGroup: ({ contractAddress, t }) => ({
                id: contractAddress,
                name: t('app.actions.gaugeVoter.composer.contractName'),
                info: addressUtils.truncateAddress(contractAddress),
                indexData: [contractAddress],
            }),
        })
        .register({
            actionType: GaugeVoterActionType.CREATE_GAUGE,
            permissionId: gaugeAdminPermissionId,
            functionSelector: toFunctionSelector(createGaugeAbi),
            componentCreate: GaugeVoterCreateGaugeActionCreate,
            componentDetails: GaugeVoterCreateGaugeActionDetails,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${GaugeVoterActionType.CREATE_GAUGE}`,
                name: t(
                    'app.actions.gaugeVoter.composer.createGaugeActionName',
                ),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: GaugeVoterActionType.CREATE_GAUGE,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: createGaugeAbi.name,
                        contract: PluginContractName.GAUGE_VOTER,
                        parameters: createGaugeAbi.inputs.map((param) => ({
                            ...param,
                            value: '',
                        })),
                    },
                },
            }),
        })
        .register({
            actionType: GaugeVoterActionType.DEACTIVATE_GAUGE,
            permissionId: gaugeAdminPermissionId,
            functionSelector: toFunctionSelector(deactivateGaugeAbi),
            componentCreate: GaugeVoterDeactivateGaugeActionCreate,
            componentDetails: GaugeVoterDeactivateGaugeActionDetails,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${GaugeVoterActionType.DEACTIVATE_GAUGE}`,
                name: t(
                    'app.actions.gaugeVoter.composer.deactivateGaugeActionName',
                ),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: GaugeVoterActionType.DEACTIVATE_GAUGE,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: deactivateGaugeAbi.name,
                        contract: PluginContractName.GAUGE_VOTER,
                        parameters: deactivateGaugeAbi.inputs.map((param) => ({
                            ...param,
                            value: '',
                        })),
                    },
                },
            }),
        })
        .register({
            actionType: GaugeVoterActionType.ACTIVATE_GAUGE,
            permissionId: gaugeAdminPermissionId,
            functionSelector: toFunctionSelector(activateGaugeAbi),
            componentCreate: GaugeVoterActivateGaugeActionCreate,
            componentDetails: GaugeVoterActivateGaugeActionDetails,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${GaugeVoterActionType.ACTIVATE_GAUGE}`,
                name: t(
                    'app.actions.gaugeVoter.composer.activateGaugeActionName',
                ),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: GaugeVoterActionType.ACTIVATE_GAUGE,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: activateGaugeAbi.name,
                        contract: PluginContractName.GAUGE_VOTER,
                        parameters: activateGaugeAbi.inputs.map((param) => ({
                            ...param,
                            value: '',
                        })),
                    },
                },
            }),
        })
        .register({
            actionType: GaugeVoterActionType.UPDATE_GAUGE_METADATA,
            permissionId: gaugeAdminPermissionId,
            functionSelector: toFunctionSelector(updateGaugeMetadataAbi),
            componentCreate: GaugeVoterUpdateGaugeMetadataActionCreate,
            componentDetails: GaugeVoterUpdateGaugeMetadataActionDetails,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${GaugeVoterActionType.UPDATE_GAUGE_METADATA}`,
                name: t(
                    'app.actions.gaugeVoter.composer.updateGaugeMetadataActionName',
                ),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: GaugeVoterActionType.UPDATE_GAUGE_METADATA,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: updateGaugeMetadataAbi.name,
                        contract: PluginContractName.GAUGE_VOTER,
                        parameters: updateGaugeMetadataAbi.inputs.map(
                            (param) => ({ ...param, value: '' }),
                        ),
                    },
                },
            }),
        });
};
