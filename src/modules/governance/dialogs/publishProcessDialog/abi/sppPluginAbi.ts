export const sppPluginAbi = [
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
] as const;
