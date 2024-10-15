export const daoFactoryAbi = [
    {
        type: 'function',
        inputs: [
            {
                name: '_daoSettings',
                internalType: 'struct DAOFactory.DAOSettings',
                type: 'tuple',
                components: [
                    { name: 'trustedForwarder', internalType: 'address', type: 'address' },
                    { name: 'daoURI', internalType: 'string', type: 'string' },
                    { name: 'subdomain', internalType: 'string', type: 'string' },
                    { name: 'metadata', internalType: 'bytes', type: 'bytes' },
                ],
            },
            {
                name: '_pluginSettings',
                internalType: 'struct DAOFactory.PluginSettings[]',
                type: 'tuple[]',
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
        name: 'createDao',
        outputs: [{ name: 'createdDao', internalType: 'contract DAO', type: 'address' }],
        stateMutability: 'nonpayable',
    },
] as const;
