export const BV_DAOS = {
    testAndr: {
        name: 'Test andr',
        network: 'ethereum-sepolia',
        address: '0x85998Ccd0a630a1074dd83e49A60bb29eF9f66F8',
        plugin: 'multisig',
    },
} as const;

/** DAO under test for the multisig treasury withdrawal BV suite. */
export type BvMultisigTreasuryDao = (typeof BV_DAOS)['testAndr'];
