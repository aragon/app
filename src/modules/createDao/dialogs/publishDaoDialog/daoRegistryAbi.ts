export const daoRegistryAbi = [
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'dao', internalType: 'address', type: 'address', indexed: true },
            { name: 'creator', internalType: 'address', type: 'address', indexed: true },
            { name: 'subdomain', internalType: 'string', type: 'string', indexed: false },
        ],
        name: 'DAORegistered',
    },
] as const;
