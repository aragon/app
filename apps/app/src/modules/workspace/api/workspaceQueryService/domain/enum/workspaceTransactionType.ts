/**
 * Kind of row returned by the workspace transactions endpoint. Values match the backend response.
 */
export enum WorkspaceTransactionType {
    NATIVE = 'native',
    ERC20 = 'erc20',
    ERC721 = 'erc721',
    EXECUTION = 'execution',
}
