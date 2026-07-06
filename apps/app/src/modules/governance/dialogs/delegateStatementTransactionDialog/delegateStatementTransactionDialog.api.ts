import type { Network } from '@/shared/api/daoService';

export interface IDelegateStatementTransactionDialogParams {
    /**
     * The connected wallet's primary ENS name. The setText call targets this name's
     * resolver on Ethereum mainnet.
     */
    ensName: string;
    /**
     * Network where the governance token lives. Determines the EIP-3770 shortname
     * embedded in the ENS text-record key.
     */
    network: Network;
    /**
     * Address of the governance token. Embedded in the ENS text-record key.
     */
    tokenAddress: string;
    /**
     * Markdown content of the delegate statement, captured by the form dialog.
     */
    content: string;
}
