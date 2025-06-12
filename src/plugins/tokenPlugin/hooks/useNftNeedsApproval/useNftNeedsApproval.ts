import { erc721Abi, type Hex } from 'viem';
import { useReadContract } from 'wagmi';

export interface IUseCheckAllowanceProps {
    /**
     * The address being approved to get the NFT.
     */
    spender: Hex;
    /**
     * The address of the NFT contract.
     */
    tokenAddress: Hex;
    /**
     * The ID of the token to check approval for.
     */
    tokenId: bigint;
    /**
     * The chain ID where the token is deployed.
     */
    chainId: number;
    /**
     * Flag to indicate if the query should be enabled.
     */
    enabled?: boolean;
}

export const useNftNeedsApproval = (props: IUseCheckAllowanceProps) => {
    const { spender, tokenAddress, tokenId, chainId, enabled } = props;

    const { data: approvedAddress } = useReadContract({
        abi: erc721Abi,
        address: tokenAddress,
        functionName: 'getApproved',
        args: [tokenId],
        query: { enabled },
        chainId,
    });
    const needsApproval = approvedAddress !== spender;

    return needsApproval;
};
