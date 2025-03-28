import { Hash } from 'viem';
import { useReadContracts } from 'wagmi';

export interface IUseGovernanceTokenParams {
    /**
     * Address of the token contract.
     */
    address: Hash;
    /**
     * Chain ID of the token contract.
     */
    chainId: number;
}

// ERC20Votes ABI with the methods we need to check in JSON format
const ERC20VotesABI = [
    {
        name: 'getPastTotalSupply',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            {
                name: 'blockNumber',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        name: 'getVotes',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        name: 'getPastVotes',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
            {
                name: 'blockNumber',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
] as const;

export const useGovernanceToken = (params: IUseGovernanceTokenParams) => {
    const { address, chainId } = params;

    // Generate a random address for testing vote functions
    // Using a deterministic address here so it doesn't change on every render
    const testAddress = '0x0000000000000000000000000000000000000001' as Hash;

    // Group all contract calls
    const {
        data: contractResults,
        error,
        isLoading,
    } = useReadContracts({
        query: {
            enabled: true,
        },
        // allowFailure: false,
        contracts: [
            {
                chainId,
                address,
                abi: ERC20VotesABI,
                functionName: 'getPastTotalSupply',
                args: [BigInt(0)],
            },
            {
                chainId,
                address,
                abi: ERC20VotesABI,
                functionName: 'getVotes',
                args: [testAddress],
            },
            {
                chainId,
                address,
                abi: ERC20VotesABI,
                functionName: 'getPastVotes',
                args: [testAddress, BigInt(0)],
            },
        ],
    });

    return {
        isERC20VotesCompatible: contractResults?.every((result) => result.status === 'success'),
        isLoading,
        error,
    };
};
