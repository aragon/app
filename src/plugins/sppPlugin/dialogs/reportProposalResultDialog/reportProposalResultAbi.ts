export const reportProposalResultAbi = [
    {
        type: 'function',
        name: 'reportProposalResult',
        inputs: [
            {
                name: '_proposalId',
                type: 'uint256',
            },
            {
                name: '_stageId',
                type: 'uint16',
            },
            {
                name: '_resultType',
                type: 'uint8',
            },
            {
                name: '_tryAdvance',
                type: 'bool',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
];
