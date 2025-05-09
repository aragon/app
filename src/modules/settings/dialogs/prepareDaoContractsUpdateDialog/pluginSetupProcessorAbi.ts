export const pluginSetupProcessorAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_dao', internalType: 'address', type: 'address' },
            {
                name: '_params',
                internalType: 'struct PluginSetupProcessor.PrepareUpdateParams',
                type: 'tuple',
                components: [
                    {
                        name: 'currentVersionTag',
                        internalType: 'struct PluginRepo.Tag',
                        type: 'tuple',
                        components: [
                            { name: 'release', internalType: 'uint8', type: 'uint8' },
                            { name: 'build', internalType: 'uint16', type: 'uint16' },
                        ],
                    },
                    {
                        name: 'newVersionTag',
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
                    {
                        name: 'setupPayload',
                        internalType: 'struct IPluginSetup.SetupPayload',
                        type: 'tuple',
                        components: [
                            { name: 'plugin', internalType: 'address', type: 'address' },
                            {
                                name: 'currentHelpers',
                                internalType: 'address[]',
                                type: 'address[]',
                            },
                            { name: 'data', internalType: 'bytes', type: 'bytes' },
                        ],
                    },
                ],
            },
        ],
        name: 'prepareUpdate',
        outputs: [
            { name: 'initData', internalType: 'bytes', type: 'bytes' },
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
] as const;
