'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAddress } from 'viem';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { proposalActionPreparationUtils } from '@/modules/governance/utils/proposalActionPreparationUtils';
import {
    type ISafeInfo,
    type ISafeMultisigTransaction,
    SafeServiceKey,
    safeService,
    safeTransactionService,
} from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { SafeTransactionReviewContent } from '../../components/safeTransactionReviewContent';
import { SafeDialogId } from '../../constants/safeDialogId';
import {
    SafeSignatureSubmission,
    useSafeOwnerSigning,
} from '../../hooks/useSafeOwnerSigning';
import { isUserRejectionError } from '../../hooks/useSafeTransactionExecution';
import {
    type SafeProtocolKit,
    safeProtocolKitUtils,
} from '../../utils/safeProtocolKitUtils';
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
    const {
        getProtocolKit,
        readOwnerAuthority,
        assertCanSign,
        buildSafeTransaction,
        signAndSubmit,
        recheck,
        hasUncertainSignature,
    } = useSafeOwnerSigning({ network, safeAddress });

    const [state, setState] = useState<DialogState>('loading');
    const [prepared, setPrepared] = useState<IPreparedTransaction>();
    const [error, setError] = useState<string>();
    const [isReviewGateBlocked, setIsReviewGateBlocked] = useState(true);
    // Once created, or possibly created, the transaction is never built again: a rebuild would take the next nonce
    // and offer to create a second transaction for the same actions.
    const isCreatedRef = useRef(false);

    // The actions are read once: the dialog builds the transaction they describe when it opens, and never again from
    // a changed caller value.
    const actionsRef = useRef({ actions, prepareActions });

    const fail = useCallback(
        (reason: unknown) => {
            setError(getErrorMessage(reason, t(`${translationKey}.failed`)));
            setState('error');
        },
        [t],
    );

    /**
     * Builds the Safe transaction at the next free nonce, never below `minNonce`, with a protocol kit that only reads:
     * the owner reviews it before connecting or signing anything.
     */
    const prepare = useCallback(
        async (minNonce?: bigint): Promise<IPreparedTransaction> => {
            const urlParams = { network, address: safeAddress };
            const [safeInfo, { nextNonce }, preparedActions] =
                await Promise.all([
                    safeService.getSafeInfo({ urlParams }),
                    safeService.getSafeNextNonce({ urlParams }),
                    proposalActionPreparationUtils.prepareActions(
                        actionsRef.current,
                    ),
                ]);

            const nonce = Number(nextNonce);

            if (!Number.isSafeInteger(nonce) || nonce < 0) {
                throw new Error(t(`${translationKey}.invalidNonce`));
            }

            const flooredNonce =
                minNonce != null && minNonce > BigInt(nonce)
                    ? Number(minNonce)
                    : nonce;

            let protocolKit: SafeProtocolKit;

            try {
                protocolKit = await safeProtocolKitUtils.initReadOnly({
                    chainId: requiredChainId,
                    safeAddress,
                });
            } catch (reason: unknown) {
                // Not the wallet's provider: the app itself cannot read the Safe's network.
                throw new Error(t(`${translationKey}.networkUnavailable`), {
                    cause: reason,
                });
            }
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
                options: { nonce: flooredNonce },
            });
            const safeTxHash =
                await protocolKit.getTransactionHash(safeTransaction);

            return {
                safeInfo,
                transaction: {
                    ...safeTransaction.data,
                    operation: safeTransaction.data.operation === 1 ? 1 : 0,
                    nonce: String(flooredNonce),
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
        },
        [network, requiredChainId, safeAddress, t],
    );

    useEffect(() => {
        if (isCreatedRef.current || hasUncertainSignature()) {
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
    }, [fail, hasUncertainSignature, prepare]);

    const finishCreation = useCallback(() => {
        isCreatedRef.current = true;

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
    }, [queryClient]);

    /**
     * Builds the transaction again on the Safe's current queue, for the owner to review before signing: a transaction
     * queued or executed since the review took the nonce the reviewed one was built on. The nonce is floored at the one
     * the queue and the chain expect, as the service's next nonce can lag behind the chain.
     */
    const rebuildOnCurrentQueue = useCallback(
        async (expectedNonce: bigint, reviewedHash: string) => {
            const value = await prepare(expectedNonce);

            // The review content only reports its verdict again for a new payload (it is keyed by hash), so the gate is
            // closed only when the payload actually changed; otherwise the action would stay disabled for good.
            if (!isSameHash(value.transaction.safeTxHash, reviewedHash)) {
                setIsReviewGateBlocked(true);
            }

            setPrepared(value);
            setError(t(`${translationKey}.queueChanged`));
            setState('ready');
        },
        [prepare, t],
    );

    const handleCreate = useCallback(async () => {
        if (prepared == null || walletAddress == null || isReviewGateBlocked) {
            return;
        }

        const { transaction, safeInfo } = prepared;

        setError(undefined);
        setState('signing');

        try {
            const protocolKit = await getProtocolKit(walletAddress);
            const [{ currentNonce }, { nextNonce }] = await Promise.all([
                readOwnerAuthority({ protocolKit, owner: walletAddress }),
                safeService.getSafeNextNonce({
                    urlParams: { network, address: safeAddress },
                }),
                assertCanSign({
                    owner: walletAddress,
                    safeVersion: safeInfo.version,
                }),
            ]);

            // The nonce the transaction must take now: past everything queued, and never one the chain already used.
            const expectedNonce =
                BigInt(currentNonce) > BigInt(nextNonce)
                    ? BigInt(currentNonce)
                    : BigInt(nextNonce);

            if (expectedNonce !== BigInt(transaction.nonce)) {
                await rebuildOnCurrentQueue(
                    expectedNonce,
                    transaction.safeTxHash,
                );
                return;
            }

            const safeTransaction = await buildSafeTransaction({
                protocolKit,
                transaction,
                expectedSafeTxHash: transaction.safeTxHash,
            });
            const submission = await signAndSubmit({
                protocolKit,
                owner: walletAddress,
                safeTransaction,
                safeTxHash: transaction.safeTxHash,
                submit: (signature) =>
                    safeTransactionService.proposeSafeTransaction({
                        urlParams: { network, address: safeAddress },
                        body: {
                            safeTransactionData: safeTransaction.data,
                            safeTxHash: transaction.safeTxHash,
                            senderAddress: walletAddress,
                            senderSignature: signature,
                            origin: 'Aragon',
                        },
                    }),
            });

            if (submission === SafeSignatureSubmission.UNCERTAIN) {
                setError(t(`${translationKey}.uncertain`));
                setState('uncertain');
                return;
            }

            finishCreation();
        } catch (reason: unknown) {
            // A proposal that may have reached the service stays re-checkable rather than becoming a plain error.
            if (hasUncertainSignature()) {
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
        assertCanSign,
        buildSafeTransaction,
        fail,
        finishCreation,
        getProtocolKit,
        hasUncertainSignature,
        isReviewGateBlocked,
        network,
        prepared,
        readOwnerAuthority,
        rebuildOnCurrentQueue,
        safeAddress,
        signAndSubmit,
        t,
        walletAddress,
    ]);

    const handleRecheckProposal = () => {
        setError(undefined);
        setState('signing');

        recheck()
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
