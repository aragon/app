export interface IAllowedAction {
    id: string;
    transactionHash: string;
    transactionIndex: number;
    logIndex: number;
    blockNumber: number;
    blockTimestamp?: number;
    network: string;
    pluginAddress: string;
    daoAddress: string;
    conditionAddress: string;
    selector: string | null; // null means native token
    target: string; // the contract address being called
    isAllowed: boolean;
    disallowed?: {
        status: boolean;
        transactionHash: string | null;
        blockNumber: number | null;
        blockTimestamp: number | null;
    };
}
