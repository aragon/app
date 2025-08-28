import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlBodyParams, IRequestUrlParams } from '@/shared/api/httpService';

export interface ISimulateActionsUrlParams {
    /**
     * Network to simulate the actions on.
     */
    network: Network;
}

export interface ISimulateActionsItem {
    /**
     * Address to simulate the transaction from.
     */
    from: string;
    /**
     * Address to simulate the transaction to.
     */
    to: string;
    /**
     * Transaction data to simulate.
     */
    data: string;
    /**
     * Value to send with the transaction.
     */
    value: string;
}

export type ISimulateActionsBody = ISimulateActionsItem[];

export interface ISimulateActionsParams
    extends IRequestUrlBodyParams<ISimulateActionsUrlParams, ISimulateActionsBody> {}

export interface ISimulateProposalUrlParams {
    /**
     * ID of the proposal to simulate.
     */
    proposalId: string;
}

export interface ISimulateProposalParams extends IRequestUrlParams<ISimulateProposalUrlParams> {}

export interface IGetLastSimulationUrlParams {
    /**
     * ID of the proposal to get last simulation for.
     */
    proposalId: string;
}

export interface IGetLastSimulationParams extends IRequestUrlParams<IGetLastSimulationUrlParams> {}
