export const routerPluginSetupAbi = [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        name: 'decodeInstallationParams',
        inputs: [{ name: '_data', type: 'bytes', internalType: 'bytes' }],
        outputs: [
            { name: '_routerSource', type: 'address', internalType: 'contract IRouterSource' },
            { name: '_isStreamingSource', type: 'bool', internalType: 'bool' },
            { name: '_routerModel', type: 'address', internalType: 'contract IRouterModel' },
        ],
        stateMutability: 'pure',
    },
    {
        type: 'function',
        name: 'encodeInstallationParams',
        inputs: [
            { name: '_routerSource', type: 'address', internalType: 'contract IRouterSource' },
            { name: '_isStreamingSource', type: 'bool', internalType: 'bool' },
            { name: '_routerModel', type: 'address', internalType: 'contract IRouterModel' },
        ],
        outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
        stateMutability: 'pure',
    },
    {
        type: 'function',
        name: 'implementation',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'prepareInstallation',
        inputs: [
            { name: '_dao', type: 'address', internalType: 'address' },
            { name: '_installationParams', type: 'bytes', internalType: 'bytes' },
        ],
        outputs: [
            { name: 'plugin', type: 'address', internalType: 'address' },
            {
                name: 'preparedSetupData',
                type: 'tuple',
                internalType: 'struct IPluginSetup.PreparedSetupData',
                components: [
                    { name: 'helpers', type: 'address[]', internalType: 'address[]' },
                    {
                        name: 'permissions',
                        type: 'tuple[]',
                        internalType: 'struct PermissionLib.MultiTargetPermission[]',
                        components: [
                            { name: 'operation', type: 'uint8', internalType: 'enum PermissionLib.Operation' },
                            { name: 'where', type: 'address', internalType: 'address' },
                            { name: 'who', type: 'address', internalType: 'address' },
                            { name: 'condition', type: 'address', internalType: 'address' },
                            { name: 'permissionId', type: 'bytes32', internalType: 'bytes32' },
                        ],
                    },
                ],
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'prepareUninstallation',
        inputs: [
            { name: '_dao', type: 'address', internalType: 'address' },
            {
                name: '_payload',
                type: 'tuple',
                internalType: 'struct IPluginSetup.SetupPayload',
                components: [
                    { name: 'plugin', type: 'address', internalType: 'address' },
                    { name: 'currentHelpers', type: 'address[]', internalType: 'address[]' },
                    { name: 'data', type: 'bytes', internalType: 'bytes' },
                ],
            },
        ],
        outputs: [
            {
                name: 'permissions',
                type: 'tuple[]',
                internalType: 'struct PermissionLib.MultiTargetPermission[]',
                components: [
                    { name: 'operation', type: 'uint8', internalType: 'enum PermissionLib.Operation' },
                    { name: 'where', type: 'address', internalType: 'address' },
                    { name: 'who', type: 'address', internalType: 'address' },
                    { name: 'condition', type: 'address', internalType: 'address' },
                    { name: 'permissionId', type: 'bytes32', internalType: 'bytes32' },
                ],
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'prepareUpdate',
        inputs: [
            { name: '_dao', type: 'address', internalType: 'address' },
            { name: '_fromBuild', type: 'uint16', internalType: 'uint16' },
            {
                name: '_payload',
                type: 'tuple',
                internalType: 'struct IPluginSetup.SetupPayload',
                components: [
                    { name: 'plugin', type: 'address', internalType: 'address' },
                    { name: 'currentHelpers', type: 'address[]', internalType: 'address[]' },
                    { name: 'data', type: 'bytes', internalType: 'bytes' },
                ],
            },
        ],
        outputs: [
            { name: '', type: 'bytes', internalType: 'bytes' },
            {
                name: '',
                type: 'tuple',
                internalType: 'struct IPluginSetup.PreparedSetupData',
                components: [
                    { name: 'helpers', type: 'address[]', internalType: 'address[]' },
                    {
                        name: 'permissions',
                        type: 'tuple[]',
                        internalType: 'struct PermissionLib.MultiTargetPermission[]',
                        components: [
                            { name: 'operation', type: 'uint8', internalType: 'enum PermissionLib.Operation' },
                            { name: 'where', type: 'address', internalType: 'address' },
                            { name: 'who', type: 'address', internalType: 'address' },
                            { name: 'condition', type: 'address', internalType: 'address' },
                            { name: 'permissionId', type: 'bytes32', internalType: 'bytes32' },
                        ],
                    },
                ],
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'protocolVersion',
        inputs: [],
        outputs: [{ name: '', type: 'uint8[3]', internalType: 'uint8[3]' }],
        stateMutability: 'pure',
    },
    {
        type: 'function',
        name: 'supportsInterface',
        inputs: [{ name: '_interfaceId', type: 'bytes4', internalType: 'bytes4' }],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view',
    },
    { type: 'error', name: 'NonUpgradeablePlugin', inputs: [] },
] as const;
