import type { IUseTokenParams } from '@/plugins/tokenPlugin/hooks/useToken';
import { useMemo } from 'react';
import type { Hash } from 'viem';
import { useReadContracts } from 'wagmi';
import { erc20VotesAbi } from './erc20VotesAbi';

export interface IUseERC20VotesTokenCheckParams extends IUseTokenParams {
    query?: {
        /**
         * Flag to enable or disable the query.
         * @default true
         */
        enabled?: boolean;
    };
}

// A random address for testing vote functions
const testAddress = '0x0000000000000000000000000000000000000001' as Hash;

/**
 * Just an internal hook, not to be used outside useGovernanceToken.
 *
 * Checks governance compatibility according to the following logic https://github.com/aragon/token-voting-plugin/blob/develop/packages/contracts/src/TokenVotingSetup.sol
 */
export const useERC20VotesTokenCheck = (params: IUseERC20VotesTokenCheckParams) => {
    const { address, chainId, query = {} } = params;
    const { enabled = true } = query;

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

    const isGovernanceCompatible = useMemo(() => {
        if (!contractResults) {
            return false;
        }
        return contractResults.slice(0, 3).every((result) => result.status === 'success');
    }, [contractResults]);

    const isDelegationCompatible = useMemo(() => {
        if (!contractResults) {
            return false;
        }
        return contractResults[3].status === 'success';
    }, [contractResults]);

    return {
        isGovernanceCompatible,
        isDelegationCompatible,
        isLoading,
        isError,
    };
};
