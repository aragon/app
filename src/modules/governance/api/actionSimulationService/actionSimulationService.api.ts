import type { Network } from '@/shared/api/daoService';
import type {
    IRequestUrlBodyParams,
    IRequestUrlParams,
} from '@/shared/api/httpService';

export interface ISimulateProposalActionsUrlParams {
    /**
     * Network to simulate the actions on.
     */
    network: Network;
    /**
     * Address of the governance plugin that calls `DAO.execute` and that the actions are therefore
     * simulated from.
     */
    pluginAddress: string;
}

export interface ISimulateActionsItem {
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

export interface ISimulateProposalActionsBody {
    /**
     * List of actions to simulate.
     */
    actions: ISimulateActionsItem[];
}

export interface ISimulateProposalActionsParams
    extends IRequestUrlBodyParams<
        ISimulateProposalActionsUrlParams,
        ISimulateProposalActionsBody
    > {}

export interface ISimulateDirectExecuteActionsBody {
    /**
     * Address of the connected wallet (EOA) that calls `DAO.execute` and that the actions are
     * therefore simulated from.
     */
    from: string;
    /**
     * List of actions to simulate.
     */
    actions: ISimulateActionsItem[];
}

export interface ISimulateDirectExecuteActionsUrlParams {
    /**
     * Network to simulate the actions on.
     */
    network: Network;
    /**
     * Address of the DAO the actions are executed on.
     */
    daoAddress: string;
}

export interface ISimulateDirectExecuteActionsParams
    extends IRequestUrlBodyParams<
        ISimulateDirectExecuteActionsUrlParams,
        ISimulateDirectExecuteActionsBody
    > {}

export interface ISimulateProposalUrlParams {
    /**
     * ID of the proposal to simulate.
     */
    proposalId: string;
}

export interface ISimulateProposalParams
    extends IRequestUrlParams<ISimulateProposalUrlParams> {}

export interface IGetLastSimulationUrlParams {
    /**
     * ID of the proposal to get last simulation for.
     */
    proposalId: string;
}

export interface IGetLastSimulationParams
    extends IRequestUrlParams<IGetLastSimulationUrlParams> {}
