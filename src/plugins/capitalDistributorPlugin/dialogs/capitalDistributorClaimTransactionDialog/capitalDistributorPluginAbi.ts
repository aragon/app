export const capitalDistributorAbi = [
    {
        type: 'function',
        name: 'claimCampaignPayoutToAddress',
        stateMutability: 'nonpayable',
        inputs: [
            { name: '_campaignId', type: 'uint256' },
            { name: '_payoutAddress', type: 'address' },
            { name: '_strategyAuxData', type: 'bytes' },
            { name: '_encoderAuxData', type: 'bytes' },
        ],
        outputs: [],
    },
] as const;

export const merkleClaimDataAbi = [
    { name: 'merkleProof', type: 'bytes32[]' },
    { name: 'amount', type: 'uint256' },
] as const;
