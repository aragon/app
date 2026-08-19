/**
 * POC constants of the MPC systems module. Only Sepolia is operational in the mock co-signer.
 */
export const MPC_SEPOLIA_CHAIN_ID = 11_155_111;

export const MPC_SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io';

export const MPC_LOGIN_PATH = '/mpc/login';
export const MPC_LIST_PATH = '/mpc';
export const MPC_CREATE_PATH = '/mpc/create';

/**
 * Minimum length of the signing passphrase (POC: never leaves the browser, cannot be recovered).
 */
export const MPC_PASSPHRASE_MIN_LENGTH = 8;

/**
 * Minimum length of the mock login password.
 */
export const MPC_PASSWORD_MIN_LENGTH = 8;

export const mpcSystemPath = (systemId: string) => `/mpc/${systemId}`;

export const mpcTransactionExplorerUrl = (txHash: string) =>
    `${MPC_SEPOLIA_EXPLORER_URL}/tx/${txHash}`;

export const mpcAddressExplorerUrl = (address: string) =>
    `${MPC_SEPOLIA_EXPLORER_URL}/address/${address}`;
