import { Hash } from 'viem';
import { useReadContracts } from 'wagmi';

export interface IUseERC20VotingTokenCheckParams {
    /**
     * Address of the token contract.
     */
    address: Hash;
    /**
     * Chain ID of the token contract.
     */
    chainId: number;
}

// ERC20Votes ABI with the methods we need to check compatibility, aligned with https://github.com/aragon/token-voting-plugin/blob/develop/packages/contracts/src/TokenVotingSetup.sol
const ERC20VotesABI = [
    {
        type: 'function',
        name: 'getPastTotalSupply',
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
        type: 'function',
        name: 'getVotes',
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
        type: 'function',
        name: 'getPastVotes',
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
    {
        type: 'function',
        name: 'delegates',
        stateMutability: 'view',
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
    },
] as const;

// A random address for testing vote functions
const testAddress = '0x0000000000000000000000000000000000000001' as Hash;

/**
 * Just an internal hook, not to be used outside useGovernanceToken.
 */
export const useERC20VotingTokenCheck = (params: IUseERC20VotingTokenCheckParams) => {
    const { address, chainId } = params;

    const {
        data: contractResults,
        error,
        isLoading,
    } = useReadContracts({
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
            {
                chainId,
                address,
                abi: ERC20VotesABI,
                functionName: 'delegates',
                args: [testAddress],
            },
        ],
    });

    console.log('contractResults', contractResults);
    const governanceCheckResults = contractResults ? contractResults.slice(0, 3) : [];
    const delegationCheckResults = contractResults ? [contractResults[3]] : [];

    return {
        isGovernanceCompatible: governanceCheckResults.every((result) => result.status === 'success'),
        isDelegationCompatible: delegationCheckResults.every((result) => result.status === 'success'),
        isLoading,
        error,
    };
};
