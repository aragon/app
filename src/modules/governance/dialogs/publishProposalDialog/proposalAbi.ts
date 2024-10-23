export const proposalAbi = [
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'proposalId',
                internalType: 'uint256',
                type: 'uint256',
                indexed: true,
            },
            {
                name: 'creator',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'startDate',
                internalType: 'uint64',
                type: 'uint64',
                indexed: false,
            },
            { name: 'endDate', internalType: 'uint64', type: 'uint64', indexed: false },
            { name: 'metadata', internalType: 'bytes', type: 'bytes', indexed: false },
            {
                name: 'actions',
                internalType: 'struct IDAO.Action[]',
                type: 'tuple[]',
                components: [
                    { name: 'to', internalType: 'address', type: 'address' },
                    { name: 'value', internalType: 'uint256', type: 'uint256' },
                    { name: 'data', internalType: 'bytes', type: 'bytes' },
                ],
                indexed: false,
            },
            {
                name: 'allowFailureMap',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'ProposalCreated',
    },
] as const;
