export const sppPluginAbi = [
    {
        type: 'function',
        name: 'createProposal',
        inputs: [
            { name: '_metadata', type: 'bytes' },
            {
                name: '_actions',
                type: 'tuple[]',
                components: [
                    { name: 'to', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'data', type: 'bytes' },
                ],
            },
            { name: '_allowFailureMap', type: 'uint128' },
            { name: '_startDate', type: 'uint64' },
            { name: '_proposalParams', type: 'bytes[][]' },
        ],
    },
    {
        type: 'function',
        name: 'updateStages',
        inputs: [
            {
                name: '_stages',
                type: 'tuple[]',
                components: [
                    {
                        name: 'bodies',
                        type: 'tuple[]',
                        components: [
                            { name: 'addr', type: 'address' },
                            { name: 'isManual', type: 'bool' },
                            { name: 'tryAdvance', type: 'bool' },
                            { name: 'resultType', type: 'uint8' },
                        ],
                    },
                    { name: 'maxAdvance', type: 'uint64' },
                    { name: 'minAdvance', type: 'uint64' },
                    { name: 'voteDuration', type: 'uint64' },
                    { name: 'approvalThreshold', type: 'uint16' },
                    { name: 'vetoThreshold', type: 'uint16' },
                    { name: 'cancelable', type: 'bool' },
                    { name: 'editable', type: 'bool' },
                ],
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'updateRules',
        inputs: [
            {
                name: '_rules',
                type: 'tuple[]',
                components: [
                    { name: 'id', type: 'uint8' },
                    { name: 'op', type: 'uint8' },
                    { name: 'value', type: 'uint240' },
                    { name: 'permissionId', type: 'bytes32' },
                ],
            },
        ],
    },
] as const;
