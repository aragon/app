/**
 * Shape of the responses returned by the capital-flow-indexer (Envio/Hasura).
 * Mirrors `schema.graphql` in `capital-flow-indexer/`.
 *
 * Raw token amounts are returned as strings by Hasura (BigInt-safe); callers must parse
 * them to BigInt before doing arithmetic, or to number after normalising by `token.decimals`.
 */

export interface IEnvioToken {
    id: string;
    address: string;
    symbol: string;
    decimals: number;
}

export type EnvioTransferDecodedFrom =
    | 'transfer'
    | 'transferFrom'
    | 'native'
    | 'swapIn'
    | 'unknown';

export interface IEnvioExecutionTransfer {
    id: string;
    amount: string;
    to: string;
    decodedFrom: EnvioTransferDecodedFrom;
    actionIndex: number;
    token: IEnvioToken;
}

export type EnvioExecutionKind = 'DISPATCH' | 'CLAIM';

export interface IEnvioPolicyExecution {
    id: string;
    kind: EnvioExecutionKind;
    blockNumber: string;
    blockTimestamp: string;
    txHash: string;
    logIndex: number;
    transferCount: number;
    decodedTransferCount: number;
    transfers: IEnvioExecutionTransfer[];
}

export type EnvioPolicyEventKind =
    | 'INSTALLED'
    | 'INITIALIZED'
    | 'UNINSTALLED'
    | 'SETTINGS_UPDATED'
    | 'FAILSAFE_UPDATED'
    | 'STRATEGY_FAILED';

export interface IEnvioPolicyEvent {
    id: string;
    kind: EnvioPolicyEventKind;
    blockTimestamp: string;
    txHash: string;
    description: string;
    contextJson?: string | null;
}

export type EnvioPolicyStatus = 'NEVER_RUN' | 'RUNNING' | 'UNINSTALLED';

/**
 * Matches `IPolicyStrategyType` on the backend + `REPO_TO_STRATEGY` on the indexer.
 */
export type EnvioStrategyType =
    | 'router'
    | 'burnRouter'
    | 'claimer'
    | 'multiDispatch'
    | 'multiRouter'
    | 'multiClaimer'
    | 'uniswapRouter'
    | 'cowSwapRouter';

export interface IEnvioDao {
    id: string;
    address: string;
    chainId: string;
}

export interface IEnvioPolicy {
    id: string;
    pluginAddress: string;
    strategyType: EnvioStrategyType;
    pluginId?: string | null;
    pluginSetupRepo: string;
    status: EnvioPolicyStatus;
    installedAt: string;
    installTxHash: string;
    installBlockNumber: string;
    totalDispatches: string;
    lastDispatchAt?: string | null;
    dao: IEnvioDao;
    lastExecution?: IEnvioPolicyExecution | null;
    executions: IEnvioPolicyExecution[];
    events: IEnvioPolicyEvent[];
}

export interface IEnvioRecipientAggregate {
    id: string;
    recipient: string;
    totalAmount: string;
    transferCount: number;
    firstAt: string;
    lastAt: string;
    token: IEnvioToken;
    policy: {
        id: string;
        pluginAddress: string;
        strategyType: EnvioStrategyType;
    };
    dao: Pick<IEnvioDao, 'id' | 'address'>;
}

export interface IFlowDaoDataResponse {
    Policy: IEnvioPolicy[];
    RecipientAggregate: IEnvioRecipientAggregate[];
}
