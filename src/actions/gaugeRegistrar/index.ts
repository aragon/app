import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { toFunctionSelector } from 'viem';
import { GaugeRegistrarActionType } from '../../plugins/gaugeRegistrarPlugin/types/enum/gaugeRegistrarActionType';
import { PluginContractName } from '../../shared/api/daoService/domain/enum';
import { GaugeRegistrarRegisterGaugeAction } from './components/gaugeRegistrarRegisterGaugeAction';
import { GaugeRegistrarRegisterGaugeActionReadOnly } from './components/gaugeRegistrarRegisterGaugeActionReadOnly';
import { GaugeRegistrarUnregisterGaugeAction } from './components/gaugeRegistrarUnegisterGaugeAction';
import { GaugeRegistrarUnegisterGaugeActionReadOnly } from './components/gaugeRegistrarUnegisterGaugeActionReadOnly/gaugeRegistrarUnegisterGaugeActionReadOnly';
import { registerGaugeAbi, unregisterGaugeAbi } from './constants/gaugeRegistrarAbi';

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
            // functionSelector: '0xFnSelector',
            textSignature: 'registerGauge(address,uint8,address,bytes)',
            component: { [GaugeRegistrarActionType.REGISTER_GAUGE]: GaugeRegistrarRegisterGaugeAction },
            componentReadOnly: GaugeRegistrarRegisterGaugeActionReadOnly,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-RegisterGauge`,
                name: t('app.actions.gaugeRegistrar.composer.registerActionName'),
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
            // functionSelector: toFunctionSelector(unregisterGaugeAbi),
            functionSelector: '0xFnSelector',
            component: { [GaugeRegistrarActionType.UNREGISTER_GAUGE]: GaugeRegistrarUnregisterGaugeAction },
            componentReadOnly: GaugeRegistrarUnegisterGaugeActionReadOnly,
            getItem: ({ contractAddress, t }) => ({
                id: `${contractAddress}-${GaugeRegistrarActionType.UNREGISTER_GAUGE}`,
                name: t('app.actions.gaugeRegistrar.composer.unregisterActionName'),
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
