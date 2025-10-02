import type { IGetGaugeListParams } from './gaugeVoterService.api';

export enum GaugeVoterServiceKey {
    GAUGE_LIST = 'GAUGE_LIST',
}

export const gaugeVoterServiceKeys = {
    gauges: (params: IGetGaugeListParams) => [GaugeVoterServiceKey.GAUGE_LIST, params],
};