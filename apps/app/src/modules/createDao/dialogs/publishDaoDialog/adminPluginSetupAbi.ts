export const adminPluginSetupAbi = [
    { name: 'admin', type: 'address' },
    {
        name: 'targetConfig',
        type: 'tuple',
        components: [
            { name: 'target', type: 'address' },
            { name: 'operation', type: 'uint8' },
        ],
    },
] as const;
