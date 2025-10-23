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

export interface IGetGaugeListParams extends IRequestUrlParams<IGetGaugeListUrlParams> {}
