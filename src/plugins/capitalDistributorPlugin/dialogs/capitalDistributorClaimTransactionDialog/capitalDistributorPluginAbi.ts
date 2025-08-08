export const capitalDistributorAbi = [
    {
        type: 'function',
        name: 'claimCampaignPayout',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'campaignId', type: 'uint256' },
            { name: 'recipient', type: 'address' },
            { name: 'auxData', type: 'bytes' },
        ],
        outputs: [],
    },
] as const;

export const merkleClaimDataAbi = [
    { name: 'merkleProof', type: 'bytes32[]' },
    { name: 'amount', type: 'uint256' },
] as const;
