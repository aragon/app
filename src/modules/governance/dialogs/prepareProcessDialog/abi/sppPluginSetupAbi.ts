export const sppPluginSetupAbi = [
    {
        name: 'stages',
        type: 'tuple[]',
        components: [
            {
                name: 'plugins',
                type: 'tuple[]',
                components: [
                    { name: 'pluginAddress', type: 'address' },
                    { name: 'isManual', type: 'bool' },
                    { name: 'allowedBody', type: 'address' },
                    { name: 'resultType', type: 'uint8' },
                ],
            },
            { name: 'maxAdvance', type: 'uint64' },
            { name: 'minAdvance', type: 'uint64' },
            { name: 'voteDuration', type: 'uint64' },
            { name: 'approvalThreshold', type: 'uint16' },
            { name: 'vetoThreshold', type: 'uint16' },
        ],
    },
    { name: 'pluginMetadata', type: 'bytes' },
    {
        name: 'targetConfig',
        type: 'tuple',
        components: [
            { name: 'target', type: 'address' },
            { name: 'operation', type: 'uint8' },
        ],
    },
] as const;
