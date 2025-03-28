import type { Hash } from 'viem';
import { useERC20VotingTokenCheck } from './useERC20VotingTokenCheck';

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

/**
 * Just an internal hook, not to be used outside useGovernanceToken.
 */
export const useGovernanceToken = (params: IUseGovernanceTokenParams) => {
    return useERC20VotingTokenCheck(params);
};
