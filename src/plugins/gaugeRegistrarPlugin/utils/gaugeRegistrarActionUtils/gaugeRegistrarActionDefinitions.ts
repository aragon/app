import { type IDaoPlugin } from '@/shared/api/daoService';
import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import { GaugeRegistrarActionType } from '../../types/enum/gaugeRegistrarActionType';
import type { IGaugeRegistrarActionRegisterGauge } from '../../types/gaugeRegistrarActionRegisterGauge';
import type { IGaugeRegistrarActionUnregisterGauge } from '../../types/gaugeRegistrarActionUnregisterGauge';

export const defaultRegisterGauge = ({ address }: IDaoPlugin): IGaugeRegistrarActionRegisterGauge => ({
    type: GaugeRegistrarActionType.REGISTER_GAUGE,
    from: '',
    to: address,
    data: '0x',
    value: '0',
    gaugeDetails: null,
    inputData: {
        function: 'registerGauge',
        contract: PluginContractName.GAUGE_REGISTRAR,
        parameters: [
            { name: '_qiToken', type: 'address', value: '' },
            { name: '_incentive', type: 'uint8', value: '' },
            { name: '_rewardController', type: 'address', value: '' },
            { name: '_metadataURI', type: 'string', value: '' },
        ],
    },
});

export const defaultUnregisterGauge = ({ address }: IDaoPlugin): IGaugeRegistrarActionUnregisterGauge => ({
    type: GaugeRegistrarActionType.UNREGISTER_GAUGE,
    from: '',
    to: address,
    data: '0x',
    value: '0',
    inputData: {
        function: 'unregisterGauge',
        contract: PluginContractName.GAUGE_REGISTRAR,
        parameters: [
            { name: '_qiToken', type: 'address', value: '' },
            { name: '_incentive', type: 'uint8', value: '' },
            { name: '_rewardController', type: 'address', value: '' },
        ],
    },
});
