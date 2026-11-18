import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

export interface ISafeTransactionDialogParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe the transaction belongs to.
     */
    safeAddress: string;
    /**
     * Hash of the queued Safe transaction to confirm or execute. The dialog reads the transaction itself, so it never
     * acts on a stale copy held by the caller.
     */
    safeTxHash: string;
    /**
     * Called once the transaction has been confirmed or executed, for the caller to refresh the queries it owns.
     */
    onSafeStateChange?: () => void;
}

export interface ISafeTransactionDialogProps
    extends IDialogComponentProps<ISafeTransactionDialogParams> {}
