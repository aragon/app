import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlParams, IRequestUrlQueryParams } from '@/shared/api/httpService';
import type { Hex } from 'viem';

export interface IGetGaugePluginUrlParams {
    network: Network;
    daoAddress: Hex;
}

export interface IGetGaugePluginQueryParams {
    interfaceType: 'gauge';
}

export interface IGetGaugePluginParams
    extends IRequestUrlQueryParams<IGetGaugePluginUrlParams, IGetGaugePluginQueryParams> {}

export interface IGetGaugeListUrlParams {
    pluginAddress: Hex;
    network: Network;
}

export interface IGetGaugeListQueryParams extends IPaginatedRequest {}

export interface IGetGaugeListParams extends IRequestUrlQueryParams<IGetGaugeListUrlParams, IGetGaugeListQueryParams> {}

export interface IGetEpochMetricsUrlParams {
    pluginAddress: Hex;
    network: Network;
}

export interface IGetEpochMetricsParams extends IRequestUrlParams<IGetEpochMetricsUrlParams> {}
