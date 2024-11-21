export const sppPluginSetupAbi = [
    { name: 'pluginMetadata', type: 'bytes' },
    {
        name: 'stages',
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
        ],
    },
    {
        name: 'rules',
        type: 'tuple[]',
        components: [
            {
                name: 'id',
                type: 'uint8',
            },
            {
                name: 'op',
                type: 'uint8',
            },
            {
                name: 'value',
                type: 'uint240',
            },
            {
                name: 'permissionId',
                type: 'bytes32',
            },
        ],
    },
    {
        name: 'targetConfig',
        type: 'tuple',
        components: [
            { name: 'target', type: 'address' },
            { name: 'operation', type: 'uint8' },
        ],
    },
] as const;
