import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { toFunctionSelector } from 'viem';
import { GaugeRegistrarActionType } from '../../plugins/gaugeRegistrarPlugin/types/enum/gaugeRegistrarActionType';
import { PluginContractName } from '../../shared/api/daoService/domain/enum';
import { GaugeRegistrarRegisterGaugeAction } from './components/gaugeRegistrarRegisterGaugeAction';
import { GaugeRegistrarUnregisterGaugeAction } from './components/gaugeRegistrarUnegisterGaugeAction';
import { registerGaugeAbi, unregisterGaugeAbi } from './constants/gaugeRegistrarAbi';

const gaugeRegistrarPermissionId = 'ID_TEST';
// const gaugeRegistrarPermissionId = keccak256(toBytes('GAUGE_REGISTRAR_ROLE'));

export const initGaugeRegistrarActionViews = () => {
    actionViewRegistry
        .registerGroup({
            permissionId: gaugeRegistrarPermissionId,
            getGroup: ({ contractAddress, t }) => ({
                id: contractAddress,
                name: t('app.actions.gaugeRegistrar.contractName'),
                info: addressUtils.truncateAddress(contractAddress),
                indexData: [contractAddress],
            }),
        })
        .register({
            id: 'register-gauge',
            permissionId: gaugeRegistrarPermissionId,
            functionSelector: toFunctionSelector(registerGaugeAbi),
            component: GaugeRegistrarRegisterGaugeAction,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-RegisterGauge`,
                name: t('app.actions.gaugeRegistrar.registerActionName'),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: GaugeRegistrarActionType.REGISTER_GAUGE,
                    from: '',
                    to: contractAddress,
                    data: '0x',
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
            component: GaugeRegistrarUnregisterGaugeAction,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${GaugeRegistrarActionType.UNREGISTER_GAUGE}`,
                name: t('app.actions.gaugeRegistrar.unregisterActionName'),
                icon: IconType.SETTINGS,
                groupId: contractAddress,
                defaultValue: {
                    type: GaugeRegistrarActionType.UNREGISTER_GAUGE,
                    from: '',
                    to: contractAddress,
                    data: '0x',
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
