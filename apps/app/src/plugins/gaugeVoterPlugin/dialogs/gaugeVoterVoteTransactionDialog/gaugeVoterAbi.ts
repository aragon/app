export const gaugeVoterAbi = [
    {
        type: 'function',
        name: 'vote',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: '_votes',
                type: 'tuple[]',
                components: [
                    { name: 'weight', type: 'uint256' },
                    { name: 'gauge', type: 'address' },
                ],
            },
        ],
        outputs: [],
    },
] as const;
