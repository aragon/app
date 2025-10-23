import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { toFunctionSelector } from 'viem';
import { gaugeRegistrarRegisterGaugeActionCreate } from './components/gaugeRegistrarRegisterGaugeActionCreate';
import { GaugeRegistrarRegisterGaugeActionDetails } from './components/gaugeRegistrarRegisterGaugeActionDetails';
import { GaugeRegistrarUnregisterGaugeActionCreate } from './components/gaugeRegistrarUnregisterGaugeActionCreate';
import { GaugeRegistrarUnregisterGaugeActionDetails } from './components/gaugeRegistrarUnregisterGaugeActionDetails';
import { registerGaugeAbi, unregisterGaugeAbi } from './constants/gaugeRegistrarAbi';
import { GaugeRegistrarActionType } from './types/enum/gaugeRegistrarActionType';

const gaugeRegistrarPermissionId = 'ID_TEST';
// const gaugeRegistrarPermissionId = keccak256(toBytes('GAUGE_REGISTRAR_ROLE'));

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
            id: 'register-gauge',
            permissionId: gaugeRegistrarPermissionId,
            functionSelector: toFunctionSelector(registerGaugeAbi),
            // textSignature: 'registerGauge(address,uint8,address,bytes)',
            // textSignature: 'setMetadata(bytes)',
            componentCreate: { [GaugeRegistrarActionType.REGISTER_GAUGE]: gaugeRegistrarRegisterGaugeActionCreate },
            componentDetails: GaugeRegistrarRegisterGaugeActionDetails,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-RegisterGauge`,
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
            id: 'unregister-gauge',
            permissionId: gaugeRegistrarPermissionId,
            functionSelector: toFunctionSelector(unregisterGaugeAbi),
            // textSignature: 'setMetadata(bytes)',
            componentCreate: { [GaugeRegistrarActionType.UNREGISTER_GAUGE]: GaugeRegistrarUnregisterGaugeActionCreate },
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
