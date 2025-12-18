import type { Hash } from 'viem';
import { useReadContracts } from 'wagmi';
import type { IUseTokenParams } from '@/shared/hooks/useToken';

// Address used for testing vote functions
const testAddress = '0x0000000000000000000000000000000000000001' as Hash;

const erc20VotesAbi = [
    {
        type: 'function',
        name: 'getPastTotalSupply',
        inputs: [{ name: 'blockNumber', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'getVotes',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'getPastVotes',
        inputs: [
            { name: 'account', type: 'address' },
            { name: 'blockNumber', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const;

export interface IUseGovernanceTokenVotesCheckParams extends IUseTokenParams {}

/**
 * Checks the governance compatibility of the token by following the logic implemented at smart-contract level
 * (See https://github.com/aragon/token-voting-plugin/blob/develop/packages/contracts/src/TokenVotingSetup.sol)
 */
export const useGovernanceTokenVotesCheck = (params: IUseGovernanceTokenVotesCheckParams) => {
    const { address, chainId, enabled = true } = params;

    const { data, isError, isLoading } = useReadContracts({
        allowFailure: true,
        query: { enabled },
        contracts: [
            { chainId, address, abi: erc20VotesAbi, functionName: 'getPastTotalSupply', args: [BigInt(0)] },
            { chainId, address, abi: erc20VotesAbi, functionName: 'getVotes', args: [testAddress] },
            { chainId, address, abi: erc20VotesAbi, functionName: 'getPastVotes', args: [testAddress, BigInt(0)] },
        ],
    });

    const votesCheck = data?.every((result) => result.status === 'success');

    return { isLoading, isError, data: votesCheck };
};
