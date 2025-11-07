import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { keccak256, toBytes, toFunctionSelector } from 'viem';
import { GaugeRegistrarRegisterGaugeActionCreate } from './components/gaugeRegistrarRegisterGaugeActionCreate';
import { GaugeRegistrarRegisterGaugeActionDetails } from './components/gaugeRegistrarRegisterGaugeActionDetails';
import { GaugeRegistrarUnregisterGaugeActionCreate } from './components/gaugeRegistrarUnregisterGaugeActionCreate';
import { GaugeRegistrarUnregisterGaugeActionDetails } from './components/gaugeRegistrarUnregisterGaugeActionDetails';
import { registerGaugeAbi, unregisterGaugeAbi } from './constants/gaugeRegistrarAbi';
import { GaugeRegistrarActionType } from './types/enum/gaugeRegistrarActionType';

const gaugeRegistrarPermissionId = keccak256(toBytes('GAUGE_REGISTRAR_ROLE'));

export const initGaugeRegistrarActionViews = () => {
    actionViewRegistry
        .registerGroup({
            permissionId: gaugeRegistrarPermissionId,
            getGroup: ({ contractAddress, t }) => ({
                id: contractAddress,
                name: t('app.actions.gaugeRegistrar.composer.contractName'),
                info: addressUtils.truncateAddress(contractAddress),
                indexData: [contractAddress],
            }),
        })
        .register({
            actionType: GaugeRegistrarActionType.REGISTER_GAUGE,
            permissionId: gaugeRegistrarPermissionId,
            functionSelector: toFunctionSelector(registerGaugeAbi),
            componentCreate: GaugeRegistrarRegisterGaugeActionCreate,
            componentDetails: GaugeRegistrarRegisterGaugeActionDetails,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${GaugeRegistrarActionType.REGISTER_GAUGE}`,
                name: t('app.actions.gaugeRegistrar.composer.registerActionName'),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: GaugeRegistrarActionType.REGISTER_GAUGE,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: registerGaugeAbi.name,
                        contract: PluginContractName.GAUGE_REGISTRAR,
                        parameters: registerGaugeAbi.inputs.map((param) => ({ ...param, value: '' })),
                    },
                },
            }),
        })
        .register({
            actionType: GaugeRegistrarActionType.UNREGISTER_GAUGE,
            permissionId: gaugeRegistrarPermissionId,
            functionSelector: toFunctionSelector(unregisterGaugeAbi),
            componentCreate: GaugeRegistrarUnregisterGaugeActionCreate,
            componentDetails: GaugeRegistrarUnregisterGaugeActionDetails,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${GaugeRegistrarActionType.UNREGISTER_GAUGE}`,
                name: t('app.actions.gaugeRegistrar.composer.unregisterActionName'),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: GaugeRegistrarActionType.UNREGISTER_GAUGE,
                    from: '',
                    to: contractAddress,
                    data: '',
                    value: '0',
                    inputData: {
                        function: unregisterGaugeAbi.name,
                        contract: PluginContractName.GAUGE_REGISTRAR,
                        parameters: unregisterGaugeAbi.inputs.map((param) => ({ ...param, value: '' })),
                    },
                },
            }),
        });
};
