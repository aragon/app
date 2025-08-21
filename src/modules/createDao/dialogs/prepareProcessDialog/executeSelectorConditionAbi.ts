export const executeSelectorConditionAbi = [
    {
        type: 'event',
        name: 'ExecuteSelectorConditionDeployed',
        anonymous: false,
        inputs: [{ indexed: false, name: 'newContract', type: 'address' }],
    },
] as const;
