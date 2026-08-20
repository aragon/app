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
