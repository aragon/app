/**
 * Minimal ABI of the Safe `MultiSend` helper, needed to unpack a batch back into its inner calls.
 *
 * MultiSend is a Safe utility contract rather than part of the Aragon stack, and `safe-deployments`
 * ships canonical, eip155 and zksync variants per version — so a batch is always detected by its
 * selector, never by the address it was deployed at.
 */
export const safeMultiSendAbi = [
    {
        type: 'function',
        name: 'multiSend',
        inputs: [{ name: 'transactions', type: 'bytes' }],
        outputs: [],
        stateMutability: 'payable',
    },
] as const;

/**
 * Selector of `multiSend(bytes)`.
 */
export const safeMultiSendSelector = '0x8d80ff0a';
