export const pluginSetupProcessorAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_dao', internalType: 'address', type: 'address' },
            {
                name: '_params',
                internalType: 'struct PluginSetupProcessor.PrepareInstallationParams',
                type: 'tuple',
                components: [
                    {
                        name: 'pluginSetupRef',
                        internalType: 'struct PluginSetupRef',
                        type: 'tuple',
                        components: [
                            {
                                name: 'versionTag',
                                internalType: 'struct PluginRepo.Tag',
                                type: 'tuple',
                                components: [
                                    { name: 'release', internalType: 'uint8', type: 'uint8' },
                                    { name: 'build', internalType: 'uint16', type: 'uint16' },
                                ],
                            },
                            {
                                name: 'pluginSetupRepo',
                                internalType: 'contract PluginRepo',
                                type: 'address',
                            },
                        ],
                    },
                    { name: 'data', internalType: 'bytes', type: 'bytes' },
                ],
            },
        ],
        name: 'prepareInstallation',
        outputs: [
            { name: 'plugin', internalType: 'address', type: 'address' },
            {
                name: 'preparedSetupData',
                internalType: 'struct IPluginSetup.PreparedSetupData',
                type: 'tuple',
                components: [
                    { name: 'helpers', internalType: 'address[]', type: 'address[]' },
                    {
                        name: 'permissions',
                        internalType: 'struct PermissionLib.MultiTargetPermission[]',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'operation',
                                internalType: 'enum PermissionLib.Operation',
                                type: 'uint8',
                            },
                            { name: 'where', internalType: 'address', type: 'address' },
                            { name: 'who', internalType: 'address', type: 'address' },
                            { name: 'condition', internalType: 'address', type: 'address' },
                            { name: 'permissionId', internalType: 'bytes32', type: 'bytes32' },
                        ],
                    },
                ],
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'sender', internalType: 'address', type: 'address', indexed: true },
            { name: 'dao', internalType: 'address', type: 'address', indexed: true },
            {
                name: 'preparedSetupId',
                internalType: 'bytes32',
                type: 'bytes32',
                indexed: false,
            },
            {
                name: 'pluginSetupRepo',
                internalType: 'contract PluginRepo',
                type: 'address',
                indexed: true,
            },
            {
                name: 'versionTag',
                internalType: 'struct PluginRepo.Tag',
                type: 'tuple',
                components: [
                    { name: 'release', internalType: 'uint8', type: 'uint8' },
                    { name: 'build', internalType: 'uint16', type: 'uint16' },
                ],
                indexed: false,
            },
            { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
            {
                name: 'plugin',
                internalType: 'address',
                type: 'address',
                indexed: false,
            },
            {
                name: 'preparedSetupData',
                internalType: 'struct IPluginSetup.PreparedSetupData',
                type: 'tuple',
                components: [
                    { name: 'helpers', internalType: 'address[]', type: 'address[]' },
                    {
                        name: 'permissions',
                        internalType: 'struct PermissionLib.MultiTargetPermission[]',
                        type: 'tuple[]',
                        components: [
                            {
                                name: 'operation',
                                internalType: 'enum PermissionLib.Operation',
                                type: 'uint8',
                            },
                            { name: 'where', internalType: 'address', type: 'address' },
                            { name: 'who', internalType: 'address', type: 'address' },
                            { name: 'condition', internalType: 'address', type: 'address' },
                            { name: 'permissionId', internalType: 'bytes32', type: 'bytes32' },
                        ],
                    },
                ],
                indexed: false,
            },
        ],
        name: 'InstallationPrepared',
    },
] as const;
