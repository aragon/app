import { erc721Abi, type Hex } from 'viem';
import { useReadContract } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export interface IUseTokenCheckNftAllowanceParams {
    /**
     * Address being approved to transfer the NFT.
     */
    spender: string;
    /**
     * Address of the NFT contract.
     */
    nft: string;
    /**
     * The ID of the NFT to check approval for.
     */
    nftId: bigint;
    /**
     * Network where the NFT is deployed.
     */
    network: Network;
    /**
     * Flag to indicate if the query is enabled.
     */
    enabled?: boolean;
}

export const useTokenCheckNftAllowance = (
    props: IUseTokenCheckNftAllowanceParams,
) => {
    const { spender, nft, nftId, network, enabled } = props;

    const { id: chainId } = networkDefinitions[network];
    const { data: approvedAddress } = useReadContract({
        abi: erc721Abi,
        address: nft as Hex,
        functionName: 'getApproved',
        args: [nftId],
        query: { enabled },
        chainId,
    });

    const needsApproval = approvedAddress !== spender;

    return { needsApproval };
};
