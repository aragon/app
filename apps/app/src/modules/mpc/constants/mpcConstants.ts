/**
 * POC constants of the MPC systems module. Only Sepolia is operational in the mock co-signer.
 */
export const MPC_SEPOLIA_CHAIN_ID = 11_155_111;

export const MPC_SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io';

export const MPC_LOGIN_PATH = '/mpc/login';
/**
 * Landing page: the workspaces the account can access.
 */
export const MPC_LIST_PATH = '/mpc';
/**
 * Guided demo: one policy, one transfer, authenticator confirmation.
 */
export const MPC_DEMO_PATH = '/mpc/demo';

/**
 * Token of the demo policy: canonical WETH on Sepolia (wrap Sepolia ETH via the contract's deposit function).
 */
export const MPC_DEMO_TOKEN = {
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    symbol: 'WETH',
    decimals: 18,
} as const;

/**
 * Demo policy: transfers up to 0.5 WETH to the configured recipient; above 0.1 WETH a second member approves.
 */
export const MPC_DEMO_TOKEN_MAX_UNITS = '500000000000000000';
export const MPC_DEMO_TOKEN_APPROVAL_ABOVE_UNITS = '100000000000000000';

/**
 * Minimum length of the signing passphrase (POC: never leaves the browser, cannot be recovered).
 */
export const MPC_PASSPHRASE_MIN_LENGTH = 8;

/**
 * Minimum length of the mock login password.
 */
export const MPC_PASSWORD_MIN_LENGTH = 8;

export const mpcSystemPath = (systemId: string) => `/mpc/${systemId}`;

export type MpcWorkspaceTab = 'systems' | 'policies' | 'members';

export const mpcWorkspacePath = (workspaceId: string, tab?: MpcWorkspaceTab) =>
    tab != null && tab !== 'systems'
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
