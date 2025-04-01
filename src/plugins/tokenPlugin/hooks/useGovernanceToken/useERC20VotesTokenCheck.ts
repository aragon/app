import type { IUseTokenParams } from '@/plugins/tokenPlugin/hooks/useToken';
import type { Hash } from 'viem';
import { useReadContracts } from 'wagmi';
import { erc20VotesAbi } from './erc20VotesAbi';

export interface IUseERC20VotesTokenCheckParams extends IUseTokenParams {
    /**
     * Flag to enable or disable the query.
     * @default true
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
export const useERC20VotesTokenCheck = (params: IUseERC20VotesTokenCheckParams) => {
    const { address, chainId, enabled = true } = params;

    const {
        data: governanceCheckResult,
        isError: isGovernanceCheckError,
        isLoading: isGovernanceCheckLoading,
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
        ],
    });

    const {
        data: delegationCheckResult,
        isError: isDelegationCheckError,
        isLoading: isDelegationCheckLoading,
    } = useReadContracts({
        query: {
            enabled,
        },
        contracts: [
            {
                chainId,
                address,
                abi: erc20VotesAbi,
                functionName: 'delegates',
                args: [testAddress],
            },
        ],
    });

    const isLoading = isGovernanceCheckLoading || isDelegationCheckLoading;
    // since allowFailure flag is set by default, isError is not true when some of the function calls fail, but only in
    // the case of invalid input
    const isError = isGovernanceCheckError || isDelegationCheckError;

    return {
        isLoading,
        isError,
        isGovernanceCompatible: governanceCheckResult?.every((result) => result.status === 'success'),
        isDelegationCompatible: delegationCheckResult?.every((result) => result.status === 'success'),
    };
};
