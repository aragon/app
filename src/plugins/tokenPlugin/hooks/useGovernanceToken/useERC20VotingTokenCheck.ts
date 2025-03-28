import type { Hash } from 'viem';
import { useReadContracts } from 'wagmi';
import { erc20VotesAbi } from './erc20VotingAbi';

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

interface IUseERC20VotingTokenCheckQueryParams {
    /**
     * Flag to enable or disable the query.
     */
    enabled?: boolean;
}

// A random address for testing vote functions
const testAddress = '0x0000000000000000000000000000000000000001' as Hash;

/**
 * Just an internal hook, not to be used outside useGovernanceToken.
 *
 * Checks governance compatibility according to the following logic https://github.com/aragon/token-voting-plugin/blob/develop/packages/contracts/src/TokenVotingSetup.sol
 */
export const useERC20VotingTokenCheck = (
    params: IUseERC20VotingTokenCheckParams,
    queryParams: IUseERC20VotingTokenCheckQueryParams = {},
) => {
    const { address, chainId } = params;
    const { enabled = true } = queryParams;

    const {
        data: contractResults,
        isError,
        isLoading,
    } = useReadContracts({
        query: {
            enabled,
        },
        contracts: [
            {
                chainId,
                address,
                abi: erc20VotesAbi,
                functionName: 'getPastTotalSupply',
                args: [BigInt(0)],
            },
            {
                chainId,
                address,
                abi: erc20VotesAbi,
                functionName: 'getVotes',
                args: [testAddress],
            },
            {
                chainId,
                address,
                abi: erc20VotesAbi,
                functionName: 'getPastVotes',
                args: [testAddress, BigInt(0)],
            },
            {
                chainId,
                address,
                abi: erc20VotesAbi,
                functionName: 'delegates',
                args: [testAddress],
            },
        ],
    });

    const governanceCheckResults = contractResults ? contractResults.slice(0, 3) : [];
    const delegationCheckResults = contractResults ? [contractResults[3]] : [];

    return {
        isGovernanceCompatible: governanceCheckResults.every((result) => result.status === 'success'),
        isDelegationCompatible: delegationCheckResults.every((result) => result.status === 'success'),
        isLoading,
        isError,
    };
};
