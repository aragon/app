import type { IGetGaugeListParams, IGetGaugePluginParams } from './gaugeVoterService.api';

export enum GaugeVoterServiceKey {
    GAUGE_PLUGIN = 'GAUGE_PLUGIN',
    GAUGES = 'GAUGES',
}

export const gaugeVoterServiceKeys = {
    gaugePlugin: (params: IGetGaugePluginParams) => [GaugeVoterServiceKey.GAUGE_PLUGIN, params],
    gauges: (params: IGetGaugeListParams) => [GaugeVoterServiceKey.GAUGES, params],
};
