import type { Network } from '@/shared/api/daoService';
import type { Hex } from 'viem';

export interface IUseGaugePluginParams {
    network: Network;
    daoAddress: Hex;
    enabled?: boolean;
}
