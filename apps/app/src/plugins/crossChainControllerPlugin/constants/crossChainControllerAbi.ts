/**
 * ABI of the `forwardMessage` entry point of the cross-chain controller, used to encode the action calldata.
 */
export const forwardMessageAbi = {
    type: 'function',
    inputs: [
        {
            name: '_destinationChainId',
            internalType: 'uint256',
            type: 'uint256',
        },
        { name: '_gasLimit', internalType: 'uint256', type: 'uint256' },
        { name: '_message', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'forwardMessage',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
} as const;

/**
 * ABI parameters of the `_message` payload of `forwardMessage`. The payload is the ABI encoding of the OSx `Action[]`
 * the destination controller hands to its executor, therefore it is used both to encode the nested actions on the
 * create view and to decode them back on the details view.
 */
export const forwardMessageActionsAbi = [
    {
        name: 'actions',
        type: 'tuple[]',
        components: [
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ],
    },
] as const;
