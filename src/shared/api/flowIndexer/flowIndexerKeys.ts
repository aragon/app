export enum FlowIndexerKey {
    DAO_DATA = 'FLOW_INDEXER_DAO_DATA',
}

export const flowIndexerKeys = {
    daoData: (params: {
        chainId: number;
        daoIds: string[];
        executionLimit: number;
    }) => [FlowIndexerKey.DAO_DATA, params] as const,
};
