export const pluginSetupProcessorAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_dao', type: 'address' },
            {
                name: '_params',
                type: 'tuple',
                components: [
                    {
                        name: 'pluginSetupRef',
                        type: 'tuple',
                        components: [
                            {
                                name: 'versionTag',
                                type: 'tuple',
                                components: [
                                    { name: 'release', type: 'uint8' },
                                    { name: 'build', type: 'uint16' },
                                ],
                            },
                            { name: 'pluginSetupRepo', type: 'address' },
                        ],
                    },
                    { name: 'data', type: 'bytes' },
                ],
            },
        ],
        name: 'prepareInstallation',
        outputs: [
            { name: 'plugin', type: 'address' },
            {
                name: 'preparedSetupData',
                type: 'tuple',
                components: [
                    { name: 'helpers', type: 'address[]' },
                    {
                        name: 'permissions',
                        type: 'tuple[]',
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'where', type: 'address' },
                            { name: 'who', type: 'address' },
                            { name: 'condition', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                ],
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_dao', type: 'address' },
            {
                name: '_params',
                type: 'tuple',
                components: [
                    {
                        name: 'pluginSetupRef',
                        type: 'tuple',
                        components: [
                            {
                                name: 'versionTag',
                                type: 'tuple',
                                components: [
                                    { name: 'release', type: 'uint8' },
                                    { name: 'build', type: 'uint16' },
                                ],
                            },
                            { name: 'pluginSetupRepo', type: 'address' },
                        ],
                    },
                    {
                        name: 'setupPayload',
                        type: 'tuple',
                        components: [
                            { name: 'plugin', type: 'address' },
                            { name: 'currentHelpers', type: 'address[]' },
                            { name: 'data', type: 'bytes' },
                        ],
                    },
                ],
            },
        ],
        name: 'prepareUninstallation',
        outputs: [
            {
                name: 'permissions',
                type: 'tuple[]',
                components: [
                    { name: 'operation', type: 'uint8' },
                    { name: 'where', type: 'address' },
                    { name: 'who', type: 'address' },
                    { name: 'condition', type: 'address' },
                    { name: 'permissionId', type: 'bytes32' },
                ],
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_dao', type: 'address' },
            {
                name: '_params',
                type: 'tuple',
                components: [
                    {
                        name: 'pluginSetupRef',
                        type: 'tuple',
                        components: [
                            {
                                name: 'versionTag',
                                type: 'tuple',
                                components: [
                                    { name: 'release', type: 'uint8' },
                                    { name: 'build', type: 'uint16' },
                                ],
                            },
                            { name: 'pluginSetupRepo', type: 'address' },
                        ],
                    },
                    { name: 'plugin', type: 'address' },
                    {
                        name: 'permissions',
                        type: 'tuple[]',
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'where', type: 'address' },
                            { name: 'who', type: 'address' },
                            { name: 'condition', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                    { name: 'helpersHash', type: 'bytes32' },
                ],
            },
        ],
        name: 'applyInstallation',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_dao', type: 'address' },
            {
                name: '_params',
                type: 'tuple',
                components: [
                    { name: 'plugin', type: 'address' },
                    {
                        name: 'pluginSetupRef',
                        type: 'tuple',
                        components: [
                            {
                                name: 'versionTag',
                                type: 'tuple',
                                components: [
                                    { name: 'release', type: 'uint8' },
                                    { name: 'build', type: 'uint16' },
                                ],
                            },
                            { name: 'pluginSetupRepo', type: 'address' },
                        ],
                    },
                    {
                        name: 'permissions',
                        type: 'tuple[]',
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'where', type: 'address' },
                            { name: 'who', type: 'address' },
                            { name: 'condition', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                ],
            },
        ],
        name: 'applyUninstallation',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'sender', type: 'address', indexed: true },
            { name: 'dao', type: 'address', indexed: true },
            { name: 'preparedSetupId', type: 'bytes32', indexed: false },
            { name: 'pluginSetupRepo', type: 'address', indexed: true },
            {
                name: 'versionTag',
                type: 'tuple',
                components: [
                    { name: 'release', type: 'uint8' },
                    { name: 'build', type: 'uint16' },
                ],
                indexed: false,
            },
            { name: 'data', type: 'bytes', indexed: false },
            { name: 'plugin', type: 'address', indexed: false },
            {
                name: 'preparedSetupData',
                type: 'tuple',
                components: [
                    { name: 'helpers', type: 'address[]' },
                    {
                        name: 'permissions',
                        type: 'tuple[]',
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'where', type: 'address' },
                            { name: 'who', type: 'address' },
                            { name: 'condition', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                ],
                indexed: false,
            },
        ],
        name: 'InstallationPrepared',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'sender', type: 'address', indexed: true },
            { name: 'dao', type: 'address', indexed: true },
            { name: 'preparedSetupId', type: 'bytes32', indexed: false },
            { name: 'pluginSetupRepo', type: 'address', indexed: true },
            {
                name: 'versionTag',
                type: 'tuple',
                components: [
                    { name: 'release', type: 'uint8' },
                    { name: 'build', type: 'uint16' },
                ],
                indexed: false,
            },
            {
                name: 'setupPayload',
                type: 'tuple',
                components: [
                    { name: 'plugin', type: 'address' },
                    { name: 'currentHelpers', type: 'address[]' },
                    { name: 'data', type: 'bytes' },
                ],
                indexed: false,
            },
            {
                name: 'permissions',
                type: 'tuple[]',
                components: [
                    { name: 'operation', type: 'uint8' },
                    { name: 'where', type: 'address' },
                    { name: 'who', type: 'address' },
                    { name: 'condition', type: 'address' },
                    { name: 'permissionId', type: 'bytes32' },
                ],
                indexed: false,
            },
        ],
        name: 'UninstallationPrepared',
    },
    {
        type: 'function',
        inputs: [
            { name: '_dao', type: 'address' },
            {
                name: '_params',
                type: 'tuple',
                components: [
                    { name: 'plugin', type: 'address' },
                    {
                        name: 'pluginSetupRef',
                        type: 'tuple',
                        components: [
                            {
                                name: 'versionTag',
                                type: 'tuple',
                                components: [
                                    { name: 'release', type: 'uint8' },
                                    { name: 'build', type: 'uint16' },
                                ],
                            },
                            { name: 'pluginSetupRepo', type: 'address' },
                        ],
                    },
                    { name: 'initData', type: 'bytes' },
                    {
                        name: 'permissions',
                        type: 'tuple[]',
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'where', type: 'address' },
                            { name: 'who', type: 'address' },
                            { name: 'condition', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                    { name: 'helpersHash', type: 'bytes32' },
                ],
            },
        ],
        name: 'applyUpdate',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'sender', type: 'address', indexed: true },
            { name: 'dao', type: 'address', indexed: true },
            { name: 'preparedSetupId', type: 'bytes32', indexed: false },
            { name: 'pluginSetupRepo', type: 'address', indexed: true },
            {
                name: 'versionTag',
                type: 'tuple',
                components: [
                    { name: 'release', type: 'uint8' },
                    { name: 'build', type: 'uint16' },
                ],
                indexed: false,
            },
            {
                name: 'setupPayload',
                type: 'tuple',
                components: [
                    { name: 'plugin', type: 'address' },
                    { name: 'currentHelpers', type: 'address[]' },
                    { name: 'data', type: 'bytes' },
                ],
                indexed: false,
            },
            {
                name: 'preparedSetupData',
                type: 'tuple',
                components: [
                    { name: 'helpers', type: 'address[]' },
                    {
                        name: 'permissions',
                        type: 'tuple[]',
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'where', type: 'address' },
                            { name: 'who', type: 'address' },
                            { name: 'condition', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                    },
                ],
                indexed: false,
            },
            { name: 'initData', type: 'bytes', indexed: false },
        ],
        name: 'UpdatePrepared',
    },
] as const;
