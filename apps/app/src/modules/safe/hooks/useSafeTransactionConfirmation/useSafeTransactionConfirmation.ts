'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getConnection } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { Network } from '@/shared/api/daoService';
import {
    type ISafeMultisigTransaction,
    safeServiceKeys,
    useConfirmSafeTransaction,
} from '@/shared/api/safeService';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { safeTransactionEnvelopeUtils } from '../../utils/safeTransactionEnvelopeUtils';

export interface IUseSafeTransactionConfirmationParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe holding the transaction.
     */
    safeAddress: string;
    /**
     * Chain the signature is produced for.
     */
    chainId: number;
}

export interface ISafeTransactionConfirmation {
    /**
     * Signs the reviewed transaction and submits the confirmation.
     */
    confirm: (transaction: ISafeMultisigTransaction) => Promise<void>;
    /**
     * Whether a confirmation is in flight.
     */
    isConfirming: boolean;
    /**
     * Whether the last attempt failed.
     */
    hasFailed: boolean;
}

const hasEip1193Request = (value: unknown): boolean =>
    value != null &&
    typeof value === 'object' &&
    'request' in value &&
    typeof value.request === 'function';

/**
 * Signs a queued Safe transaction and submits the owner's confirmation.
 *
 * Confirming is offchain and costs nothing; it does not execute. Execution has its own
 * prerequisites — nonce position, collected signatures, guards — and is not attempted here.
 */
export const useSafeTransactionConfirmation = (
    params: IUseSafeTransactionConfirmationParams,
): ISafeTransactionConfirmation => {
    const { network, safeAddress, chainId } = params;

    const queryClient = useQueryClient();
    const { address: connectedAddress } = useWalletAccount();
    const { mutateAsync: confirmTransaction } = useConfirmSafeTransaction();
    const [isConfirming, setIsConfirming] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    const confirm = async (transaction: ISafeMultisigTransaction) => {
        setIsConfirming(true);
        setHasFailed(false);

        try {
            const connection = getConnection(wagmiConfig);
            const provider = await connection.connector?.getProvider({
                chainId,
            });
            // The signer is the connected account, the same one the owner check reads: taking it
            // from the connection instead would let the two disagree.
            const signerAddress = connectedAddress;

            if (!hasEip1193Request(provider) || signerAddress == null) {
                throw new Error('Connected wallet does not expose a provider');
            }

            // Dynamic: the Protocol Kit is only needed once an owner acts, and statically importing
            // it pulls the whole SDK into the page bundle.
            const { default: Safe, EthSafeTransaction } = await import(
                '@safe-global/protocol-kit'
            );
            const protocolKit = await Safe.init({
                provider: provider as Parameters<
                    typeof Safe.init
                >[0]['provider'],
                signer: signerAddress,
                safeAddress,
            });

            const envelope =
                safeTransactionEnvelopeUtils.getEnvelope(transaction);
            const safeTransaction = new EthSafeTransaction({
                ...envelope,
                nonce: Number(envelope.nonce),
            });
            const safeTxHash =
                await protocolKit.getTransactionHash(safeTransaction);

            // The reviewed payload is the only thing authorised. A hash that no longer matches its
            // fields is a different transaction, whatever the service reports it as.
            if (
                safeTxHash.toLowerCase() !==
                transaction.safeTxHash.toLowerCase()
            ) {
                throw new Error(
                    'Queued Safe transaction hash does not match its transaction data',
                );
            }

            const signature = await protocolKit.signTypedData(safeTransaction);

            await confirmTransaction({
                urlParams: { network, safeTxHash },
                body: { signature: signature.data },
            });

            await queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safePendingTransactions({
                    urlParams: { network, address: safeAddress },
                }),
            });
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    safeAddress,
                    safeTxHash: transaction.safeTxHash,
                    operation: 'safe_confirm_transaction',
                },
            });
            setHasFailed(true);
        } finally {
            setIsConfirming(false);
        }
    };

    return { confirm, isConfirming, hasFailed };
};
