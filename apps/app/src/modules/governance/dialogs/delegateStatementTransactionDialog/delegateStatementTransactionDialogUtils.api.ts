import type { Hex } from 'viem';
import type { Network } from '@/shared/api/daoService';

export interface IBuildDelegateStatementTransactionParams {
    /** Address of the resolved ENS Public Resolver (target of the tx). */
    resolverAddress: Hex;
    /** ENS name being updated; converted to a node hash for setText. */
    ensName: string;
    /** Network of the governance token (drives the key prefix). */
    network: Network;
    /** Token contract address — embedded in the ENS text-record key. */
    tokenAddress: string;
    /** IPFS CID of the pinned delegate-statement JSON. */
    cid: string;
}
