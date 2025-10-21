import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { toFunctionSelector } from 'viem';
import { GaugeRegistrarRegisterGaugeAction } from '../../plugins/gaugeRegistrarPlugin/components/gaugeRegistrarRegisterGaugeAction/gaugeRegistrarRegisterGaugeAction';
import { GaugeRegistrarUnregisterGaugeAction } from '../../plugins/gaugeRegistrarPlugin/components/gaugeRegistrarUnegisterGaugeAction';
import { GaugeRegistrarActionType } from '../../plugins/gaugeRegistrarPlugin/types/enum/gaugeRegistrarActionType';
import { PluginContractName } from '../../shared/api/daoService/domain/enum';

const gaugeRegistrarPermissionId = 'ID_TEST';
// const gaugeRegistrarPermissionId = keccak256(toBytes('GAUGE_REGISTRAR_ROLE'));

const registerGaugeAbi = {
    type: 'function',
    name: 'registerGauge',
    inputs: [
        { name: '_qiToken', type: 'address' },
        { name: '_incentive', type: 'uint8' },
        { name: '_rewardController', type: 'address' },
        { name: '_metadataURI', type: 'string' },
    ],
    outputs: [{ internalType: 'address', name: 'gaugeAddress', type: 'address' }],
    stateMutability: 'nonpayable',
} as const;

const unregisterGaugeAbi = {
    type: 'function',
    name: 'unregisterGauge',
    inputs: [
        { internalType: 'address', name: '_qiToken', type: 'address' },
        { internalType: 'enum Incentive', name: '_incentive', type: 'uint8' },
        { internalType: 'address', name: '_rewardController', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
} as const;

export const initGaugeRegistrarActionViews = () => {
    actionViewRegistry
        .register({
            id: 'register-gauge',
            permissionId: gaugeRegistrarPermissionId,
            functionSelector: toFunctionSelector(registerGaugeAbi),
            component: GaugeRegistrarRegisterGaugeAction,
            getItem: ({ contractAddress }) => ({
                id: `${contractAddress}-RegisterGauge`,
                name: 'Register Gauge',
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
            getItem: ({ contractAddress }) => ({
                id: `${contractAddress}-UnregisterGauge`,
                name: 'Unregister Gauge',
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
        })
        .registerGroup({
            permissionId: gaugeRegistrarPermissionId,
            getGroup: ({ address, t }) => ({
                id: address,
                name: t('app.actions.gaugeRegistrar.contractName'),
                info: addressUtils.truncateAddress(address),
                indexData: [address],
            }),
        });
};
