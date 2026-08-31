/**
 * POC constants of the MPC systems module. Only Sepolia is operational in the mock co-signer.
 */
export const MPC_SEPOLIA_CHAIN_ID = 11_155_111;

export const MPC_SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io';

export const MPC_LOGIN_PATH = '/mpc/login';
/**
 * Landing page: the workspaces the account can access. The workspace is the top-level entity and holds the
 * accounts (DAO, Safe, MPC), the transaction policies and the members.
 */
export const MPC_LIST_PATH = '/mpc';

/**
 * Token of the demo policy: WETH9 on Sepolia (the contract Uniswap uses; wrap Sepolia ETH via its deposit
 * function or a Uniswap swap).
 */
export const MPC_DEMO_TOKEN = {
    address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    symbol: 'WETH',
    decimals: 18,
} as const;

/**
 * Demo policy: transfers up to 0.5 WETH to the configured recipient; above 0.1 WETH a second member approves.
 */
export const MPC_DEMO_TOKEN_MAX_UNITS = '500000000000000000';
export const MPC_DEMO_TOKEN_APPROVAL_ABOVE_UNITS = '100000000000000000';

/**
 * Minimum length of the mock login password.
 */
export const MPC_PASSWORD_MIN_LENGTH = 8;

/**
 * Landing page of an MPC account: the guided transaction creator (one policy, one transfer, authenticator
 * confirmation). Management flows (shares, members, requests, activity) live under /manage.
 */
export const mpcSystemPath = (systemId: string) => `/mpc/${systemId}`;

export const mpcSystemManagePath = (systemId: string) =>
    `/mpc/${systemId}/manage`;

export type MpcWorkspaceTab = 'accounts' | 'policies' | 'members';

export const mpcWorkspacePath = (workspaceId: string, tab?: MpcWorkspaceTab) =>
    tab != null && tab !== 'accounts'
        ? `/mpc/workspaces/${workspaceId}?tab=${tab}`
        : `/mpc/workspaces/${workspaceId}`;

export const mpcCreateSystemPath = (workspaceId: string) =>
    `/mpc/workspaces/${workspaceId}/systems/new`;

export const mpcPolicyNewPath = (workspaceId: string) =>
    `/mpc/workspaces/${workspaceId}/policies/new`;

export const mpcPolicyPath = (workspaceId: string, policyId: string) =>
    `/mpc/workspaces/${workspaceId}/policies/${policyId}`;

export const mpcTransactionExplorerUrl = (txHash: string) =>
    `${MPC_SEPOLIA_EXPLORER_URL}/tx/${txHash}`;

export const mpcAddressExplorerUrl = (address: string) =>
    `${MPC_SEPOLIA_EXPLORER_URL}/address/${address}`;
