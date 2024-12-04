import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlParams } from '@/shared/api/httpService';

export interface IGetAbiUrlParams {
    /**
     * Network of the smart contract.
     */
    network: Network;
    /**
     * Address of the the smart contract.
     */
    address: string;
}

export interface IGetAbiParams extends IRequestUrlParams<IGetAbiUrlParams> {}
