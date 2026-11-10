'use client';

import { addressUtils, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAddress, type Hex } from 'viem';
import { getBytecode } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { proposalActionPreparationUtils } from '@/modules/governance/utils/proposalActionPreparationUtils';
import {
    type ISafeInfo,
    type ISafeMultisigTransaction,
    SafeServiceError,
    SafeServiceKey,
    safeService,
    safeTransactionService,
} from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { SafeTransactionReviewContent } from '../../components/safeTransactionReviewContent';
import { SafeDialogId } from '../../constants/safeDialogId';
import { isUserRejectionError } from '../../hooks/useSafeTransactionExecution';
import {
    type SafeProtocolKit,
    SafeProtocolKitError,
    safeProtocolKitUtils,
} from '../../utils/safeProtocolKitUtils';
import { safeTransactionEnvelopeUtils } from '../../utils/safeTransactionEnvelopeUtils';
import { safeTransactionLookupUtils } from '../../utils/safeTransactionLookupUtils';
import { safeTransactionUtils } from '../../utils/safeTransactionUtils';
import type { ISafeCreateTransactionDialogProps } from './safeCreateTransactionDialog.api';

const translationKey = 'app.safe.safeCreateTransactionDialog';

/**
 * Transaction built from the actions, and the Safe state it was built on.
 */
interface IPreparedTransaction {
    /**
     * Transaction the owner reviews and signs, at the next free nonce of the Safe.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * State of the Safe when the transaction was built.
     */
    safeInfo: ISafeInfo;
}

/**
 * Proposal whose submission to the Safe transaction service returned no definitive answer.
 */
interface IUncertainProposal {
    /**
     * Owner that signed and proposed the transaction.
     */
    owner: string;
    /**
     * Signature submitted with the proposal.
     */
    signature: string;
}

type DialogState =
    | 'loading'
    | 'ready'
    | 'signing'
    | 'success'
    | 'uncertain'
    | 'error';

const getErrorMessage = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

const isSameHash = (a: string, b: string): boolean =>
    a.toLowerCase() === b.toLowerCase();

/**
 * Builds a transaction from the given actions, lets the owner review the exact Safe transaction, then signs it and
 * proposes it to the Safe transaction service, where it queues for the other owners' approvals. One action is a plain
 * call; several are batched into one delegate call to MultiSendCallOnly. Every check runs again against fresh Safe state
 * right before the wallet is asked to sign.
 */
export const SafeCreateTransactionDialog: React.FC<
    ISafeCreateTransactionDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null && location.params.actions.length > 0,
        'SafeCreateTransactionDialog: required parameters must be set.',
    );

    const { network, safeAddress, actions, prepareActions, onCreated } =
        location.params;

    const { close, updateOptions } = useDialogContext();
    const { t } = useTranslations();
    const { address: walletAddress } = useWalletAccount();
    const queryClient = useQueryClient();
    const { requiredChainId, withNetworkSwitch } = useNetworkSwitch({
        network,
    });
    const { check: checkWalletConnection, result: isWalletConnected } =
        useConnectedWalletGuard();

    const [state, setState] = useState<DialogState>('loading');
    const [prepared, setPrepared] = useState<IPreparedTransaction>();
    const [error, setError] = useState<string>();
    const [isReviewGateBlocked, setIsReviewGateBlocked] = useState(true);
    const [uncertainProposal, setUncertainProposal] =
        useState<IUncertainProposal>();
    const uncertainProposalRef = useRef<IUncertainProposal>(undefined);
    // Once created, or possibly created, the transaction is never built again: a rebuild would take the next nonce
    // and offer to create a second transaction for the same actions.
    const isCreatedRef = useRef(false);

    // The actions are read once: the dialog builds the transaction they describe when it opens, and never again from
    // a changed caller value.
    const actionsRef = useRef({ actions, prepareActions });

    const updateUncertainProposal = useCallback(
        (proposal?: IUncertainProposal) => {
            uncertainProposalRef.current = proposal;
            setUncertainProposal(proposal);
        },
        [],
    );

    const fail = useCallback(
        (reason: unknown) => {
            setError(getErrorMessage(reason, t(`${translationKey}.failed`)));
            setState('error');
        },
        [t],
    );

    /**
     * Builds the Safe transaction at the next free nonce, with a protocol kit that only reads: the owner reviews it
     * before connecting or signing anything.
     */
    const prepare = useCallback(async (): Promise<IPreparedTransaction> => {
        const urlParams = { network, address: safeAddress };
        const [safeInfo, { nextNonce }, preparedActions] = await Promise.all([
            safeService.getSafeInfo({ urlParams }),
            safeService.getSafeNextNonce({ urlParams }),
            proposalActionPreparationUtils.prepareActions(actionsRef.current),
        ]);

        const nonce = Number(nextNonce);

        if (!Number.isSafeInteger(nonce) || nonce < 0) {
            throw new Error(t(`${translationKey}.invalidNonce`));
        }

        const protocolKit = await safeProtocolKitUtils.initReadOnly({
            chainId: requiredChainId,
            safeAddress,
        });
        // Several actions become one delegate call to MultiSendCallOnly, which cannot delegate any further. A single
        // action is the transaction itself, so its target reaches the service verbatim, and the service refuses an
        // address that is not checksummed (e.g. one imported from a JSON file) after the owner has signed. Casing does
        // not change the Safe transaction hash.
        const safeTransaction = await protocolKit.createTransaction({
            transactions: preparedActions.map(({ to, value, data }) => ({
                to: getAddress(to),
                value: value.toString(),
                data,
            })),
            onlyCalls: true,
            options: { nonce },
        });
        const safeTxHash =
            await protocolKit.getTransactionHash(safeTransaction);

        return {
            safeInfo,
            transaction: {
                ...safeTransaction.data,
                operation: safeTransaction.data.operation === 1 ? 1 : 0,
                nonce: String(nonce),
                safeTxHash,
                from: null,
                confirmations: [],
                confirmationsRequired: safeInfo.threshold,
                signatures: null,
                isExecuted: false,
                isSuccessful: null,
                submissionDate: new Date().toISOString(),
            },
        };
    }, [network, requiredChainId, safeAddress, t]);

    useEffect(() => {
        if (isCreatedRef.current || uncertainProposalRef.current != null) {
            return;
        }

        let isCancelled = false;

        setState('loading');
        setError(undefined);
        setIsReviewGateBlocked(true);

        prepare()
            .then((value) => {
                if (!isCancelled) {
                    setPrepared(value);
                    setState('ready');
                }
            })
            .catch((reason: unknown) => {
                if (!isCancelled) {
                    fail(reason);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [fail, prepare]);

    const getProtocolKit = useCallback(
        async (owner: string) => {
            try {
                return await safeProtocolKitUtils.initForOwner({
                    owner,
                    chainId: requiredChainId,
                    safeAddress,
                });
            } catch (reason: unknown) {
                if (reason instanceof SafeProtocolKitError) {
                    throw new Error(t(`${translationKey}.${reason.reason}`), {
                        cause: reason,
                    });
                }

                throw reason;
            }
        },
        [requiredChainId, safeAddress, t],
    );

    /**
     * Rebuilds the protocol-kit transaction from the reviewed fields and checks it hashes to the reviewed transaction:
     * signing fields that hash to anything else would authorise something that was never reviewed.
     */
    const buildSafeTransaction = useCallback(
        async (
            protocolKit: SafeProtocolKit,
            transaction: ISafeMultisigTransaction,
        ) => {
            const { EthSafeTransaction } = await import(
                '@safe-global/protocol-kit'
            );
            const envelope =
                safeTransactionEnvelopeUtils.getEnvelope(transaction);
            const safeTransaction = new EthSafeTransaction({
                ...envelope,
                nonce: Number(envelope.nonce),
            });
            const computedHash =
                await protocolKit.getTransactionHash(safeTransaction);

            if (!isSameHash(computedHash, transaction.safeTxHash)) {
                throw new Error(t(`${translationKey}.hashMismatch`));
            }

            return safeTransaction;
        },
        [t],
    );

    /**
     * Whether the service holds the transaction with the exact signature submitted: only that proves the uncertain
     * proposal landed.
     */
    const reconcileProposal = useCallback(
        async (proposal: IUncertainProposal) => {
            if (prepared == null) {
                return false;
            }

            const transaction =
                await safeTransactionLookupUtils.findTransaction({
                    network,
                    address: safeAddress,
                    safeTxHash: prepared.transaction.safeTxHash,
                });

            return (
                transaction?.confirmations.some(
                    (confirmation) =>
                        addressUtils.isAddressEqual(
                            confirmation.owner,
                            proposal.owner,
                        ) &&
                        isSameHash(confirmation.signature, proposal.signature),
                ) === true
            );
        },
        [network, prepared, safeAddress],
    );

    const finishCreation = useCallback(() => {
        isCreatedRef.current = true;
        updateUncertainProposal(undefined);

        const keys = [
            SafeServiceKey.SAFE_INFO,
            SafeServiceKey.SAFE_PENDING_TRANSACTIONS,
        ];
        void Promise.all(
            keys.map((key) =>
                queryClient.invalidateQueries({ queryKey: [key] }),
            ),
        ).catch(() => undefined);

        setState('success');
    }, [queryClient, updateUncertainProposal]);

    /**
     * Builds the transaction again on the Safe's current queue, for the owner to review before signing: a transaction
     * queued or executed since the review took the nonce the reviewed one was built on.
     */
    const rebuildOnCurrentQueue = useCallback(async () => {
        const value = await prepare();

        setIsReviewGateBlocked(true);
        setPrepared(value);
        setError(t(`${translationKey}.queueChanged`));
        setState('ready');
    }, [prepare, t]);

    const handleCreate = useCallback(async () => {
        if (prepared == null || walletAddress == null || isReviewGateBlocked) {
            return;
        }

        const { transaction, safeInfo } = prepared;

        setError(undefined);
        setState('signing');

        try {
            const protocolKit = await getProtocolKit(walletAddress);
            const [owners, threshold, currentNonce, { nextNonce }] =
                await Promise.all([
                    protocolKit.getOwners(),
                    protocolKit.getThreshold(),
                    protocolKit.getNonce(),
                    safeService.getSafeNextNonce({
                        urlParams: { network, address: safeAddress },
                    }),
                ]);

            if (
                !owners.some((owner) =>
                    addressUtils.isAddressEqual(owner, walletAddress),
                )
            ) {
                throw new Error(t(`${translationKey}.notOwner`));
            }

            if (
                !safeTransactionUtils.hasValidThreshold({ threshold, owners })
            ) {
                throw new Error(t(`${translationKey}.invalidThreshold`));
            }

            // Safes older than v1.3.0 cannot verify the signature of a contract owner.
            if (
                !safeTransactionUtils.supportsEip1271Signatures(
                    safeInfo.version,
                )
            ) {
                const ownerBytecode = await getBytecode(wagmiConfig, {
                    address: walletAddress as Hex,
                    chainId: requiredChainId,
                });

                if (ownerBytecode != null) {
                    throw new Error(
                        t(`${translationKey}.unsupportedContractOwner`),
                    );
                }
            }

            const reviewedNonce = BigInt(transaction.nonce);

            if (
                BigInt(nextNonce) !== reviewedNonce ||
                BigInt(currentNonce) > reviewedNonce
            ) {
                await rebuildOnCurrentQueue();
                return;
            }

            const safeTransaction = await buildSafeTransaction(
                protocolKit,
                transaction,
            );
            const signature = await protocolKit.signTypedData(safeTransaction);

            // The wallet signs with whichever account is active, so a switch during the prompt yields a signature of
            // another account, which the service would then refuse or reconciliation look for under the wrong owner.
            if (
                safeProtocolKitUtils.getOwnerConnection(
                    walletAddress,
                    requiredChainId,
                ) == null
            ) {
                throw new Error(t(`${translationKey}.walletRequired`));
            }

            const proposal: IUncertainProposal = {
                owner: walletAddress,
                signature: signature.data,
            };

            try {
                await safeTransactionService.proposeSafeTransaction({
                    urlParams: { network, address: safeAddress },
                    body: {
                        safeTransactionData: safeTransaction.data,
                        safeTxHash: transaction.safeTxHash,
                        senderAddress: walletAddress,
                        senderSignature: signature.data,
                        origin: 'Aragon',
                    },
                });
            } catch (writeError: unknown) {
                if (SafeServiceError.isDefinitiveWriteError(writeError)) {
                    throw writeError;
                }

                updateUncertainProposal(proposal);
                setState('uncertain');

                if (await reconcileProposal(proposal)) {
                    finishCreation();
                    return;
                }

                setError(t(`${translationKey}.uncertain`));
                return;
            }

            finishCreation();
        } catch (reason: unknown) {
            // A proposal that may have reached the service stays re-checkable rather than becoming a plain error.
            if (uncertainProposalRef.current != null) {
                setError(
                    getErrorMessage(reason, t(`${translationKey}.uncertain`)),
                );
                setState('uncertain');
                return;
            }

            // A signature rejected in the wallet sent nothing, so the dialog goes back to its action.
            if (isUserRejectionError(reason)) {
                setError(t(`${translationKey}.signatureRejected`));
                setState('ready');
                return;
            }

            fail(reason);
        }
    }, [
        buildSafeTransaction,
        fail,
        finishCreation,
        getProtocolKit,
        isReviewGateBlocked,
        network,
        prepared,
        rebuildOnCurrentQueue,
        reconcileProposal,
        requiredChainId,
        safeAddress,
        t,
        updateUncertainProposal,
        walletAddress,
    ]);

    const handleRecheckProposal = () => {
        if (uncertainProposal == null) {
            return;
        }

        setError(undefined);
        setState('signing');

        reconcileProposal(uncertainProposal)
            .then((isAccepted) => {
                if (!isAccepted) {
                    setError(t(`${translationKey}.uncertain`));
                    setState('uncertain');
                    return;
                }

                finishCreation();
            })
            .catch((reason: unknown) => {
                setError(
                    getErrorMessage(reason, t(`${translationKey}.uncertain`)),
                );
                setState('uncertain');
            });
    };

    const handleReadyAction = () => {
        if (!isWalletConnected) {
            checkWalletConnection();
            return;
        }

        // A rejected switch is reported while the dialog stays ready, so the action can be retried.
        withNetworkSwitch(
            () => void handleCreate(),
            (switchError: unknown) =>
                setError(
                    isUserRejectionError(switchError)
                        ? t(`${translationKey}.networkSwitchRejected`)
                        : getErrorMessage(
                              switchError,
                              t(`${translationKey}.walletRequired`),
                          ),
                ),
        );
    };

    const isDismissBlocked = state === 'signing';

    // Leaving a created transaction hands over to the caller, so the same actions are not submitted twice.
    const handleDismiss = useCallback(() => {
        if (isDismissBlocked) {
            return;
        }

        close(SafeDialogId.CREATE_TRANSACTION);

        if (state === 'success') {
            onCreated?.();
        }
    }, [close, isDismissBlocked, onCreated, state]);

    useEffect(() => {
        updateOptions({ disableOutsideClick: true, onClose: handleDismiss });
    }, [handleDismiss, updateOptions]);

    const primaryAction =
        state === 'ready'
            ? {
                  label: t(`${translationKey}.actions.create`),
                  disabled: prepared == null || isReviewGateBlocked,
                  onClick: handleReadyAction,
              }
            : state === 'success'
              ? {
                    label: t(`${translationKey}.actions.done`),
                    onClick: handleDismiss,
                }
              : state === 'uncertain'
                ? {
                      label: t(`${translationKey}.actions.recheck`),
                      onClick: handleRecheckProposal,
                  }
                : state === 'error'
                  ? {
                        label: t(`${translationKey}.actions.close`),
                        onClick: handleDismiss,
                    }
                  : undefined;

    // A Safe with a threshold of one can execute the transaction right away, from the transactions list.
    const successKey =
        prepared?.safeInfo.threshold === 1
            ? 'createdReadyToExecute'
            : 'created';

    const statusMessage =
        state === 'loading'
            ? t(`${translationKey}.loading`)
            : state === 'signing'
              ? t(`${translationKey}.signing`)
              : state === 'success'
                ? t(`${translationKey}.${successKey}`)
                : undefined;

    return (
        <>
            <Dialog.Header
                onClose={handleDismiss}
                title={t(`${translationKey}.title`)}
            />
            <Dialog.Content
                className="flex flex-col gap-3 pb-4 md:pb-6"
                description={t(`${translationKey}.description`)}
            >
                {statusMessage != null && (
                    <p className="text-neutral-500">{statusMessage}</p>
                )}
                {error != null && <p className="text-critical-700">{error}</p>}
                {prepared != null && (
                    <SafeTransactionReviewContent
                        // Remounted on a rebuilt transaction, so its verdict is reported again for the new payload.
                        key={prepared.transaction.safeTxHash}
                        network={network}
                        onGateChange={setIsReviewGateBlocked}
                        safeAddress={safeAddress}
                        safeVersion={prepared.safeInfo.version}
                        transaction={prepared.transaction}
                    />
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={primaryAction}
                secondaryAction={{
                    label: t('app.shared.transactionDialog.footer.cancel'),
                    onClick: handleDismiss,
                    disabled: isDismissBlocked,
                }}
            />
        </>
    );
};
