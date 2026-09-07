import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlBodyParams } from '@/shared/api/httpService';

export interface IEstimateGasLimitUrlParams {
    /**
     * Network of the DAO, i.e. the origin chain the message is forwarded from.
     */
    network: Network;
    /**
     * Address of the cross-chain controller on the origin chain. The backend reads its
     * `chainToAdapter` config to resolve the lane, so the adapters are never taken from the client.
     */
    controllerAddress: string;
}

export interface IEstimateGasLimitActionItem {
    /**
     * Address the action calls on the destination chain.
     */
    to: string;
    /**
     * Value the action sends, as a decimal string.
     */
    value: string;
    /**
     * Calldata of the action.
     */
    data: string;
}

export interface IEstimateGasLimitBody {
    /**
     * Standard chain id the message is forwarded to.
     */
    destinationChainId: number;
    /**
     * Actions the destination executor runs as a single batch.
     */
    actions: IEstimateGasLimitActionItem[];
}

export interface IEstimateGasLimitParams
    extends IRequestUrlBodyParams<
        IEstimateGasLimitUrlParams,
        IEstimateGasLimitBody
    > {}
