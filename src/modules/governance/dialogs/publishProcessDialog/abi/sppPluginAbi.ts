export const sppPluginAbi = [
    {
        type: 'function',
        name: 'updateStages',
        inputs: [
            {
                name: '_stages',
                type: 'tuple[]',
                internalType: 'struct StagedProposalProcessor.Stage[]',
                components: [
                    {
                        name: 'plugins',
                        type: 'tuple[]',
                        internalType: 'struct StagedProposalProcessor.Plugin[]',
                        components: [
                            {
                                name: 'pluginAddress',
                                type: 'address',
                                internalType: 'address',
                            },
                            {
                                name: 'isManual',
                                type: 'bool',
                                internalType: 'bool',
                            },
                            {
                                name: 'allowedBody',
                                type: 'address',
                                internalType: 'address',
                            },
                            {
                                name: 'resultType',
                                type: 'uint8',
                                internalType: 'enum StagedProposalProcessor.ResultType',
                            },
                        ],
                    },
                    {
                        name: 'maxAdvance',
                        type: 'uint64',
                        internalType: 'uint64',
                    },
                    {
                        name: 'minAdvance',
                        type: 'uint64',
                        internalType: 'uint64',
                    },
                    {
                        name: 'voteDuration',
                        type: 'uint64',
                        internalType: 'uint64',
                    },
                    {
                        name: 'approvalThreshold',
                        type: 'uint16',
                        internalType: 'uint16',
                    },
                    {
                        name: 'vetoThreshold',
                        type: 'uint16',
                        internalType: 'uint16',
                    },
                ],
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;
