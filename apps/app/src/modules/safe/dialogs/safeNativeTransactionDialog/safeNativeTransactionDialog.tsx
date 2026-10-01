'use client';

import { addressUtils, Dialog } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type Hex, isHex, zeroAddress } from 'viem';
import { getBytecode, getConnection } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { executeActionsDialogUtils } from '@/modules/governance/dialogs/executeActionsDialog/executeActionsDialogUtils';
import { SafeTransactionReviewContent } from '@/modules/safe/components/safeTransactionReviewContent';
import { readSafeTransactions } from '@/plugins/safeMultisigPlugin/hooks/useSafeDaoProposals';
import { safeDaoProposalUtils } from '@/plugins/safeMultisigPlugin/utils/safeDaoProposalUtils';
import { safeMultisigProposalUtils } from '@/plugins/safeMultisigPlugin/utils/safeMultisigProposalUtils';
import {
    type ISafeInfo,
    type ISafeMultisigTransaction,
    type ISafeTransactionData,
    SafeServiceError,
    SafeServiceKey,
    safeService,
    safeTransactionService,
} from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { SafeDialogId } from '../../constants/safeDialogId';
import type { ISafeNativeTransactionDialogProps } from './safeNativeTransactionDialog.api';

interface IPreparedTransaction {
    transaction: ISafeMultisigTransaction;
    safeInfo: ISafeInfo;
    actions: ITransactionRequest[];
}

type DialogState =
    | 'loading'
    | 'ready'
    | 'signing'
    | 'success'
    | 'uncertain'
    | 'error';

const getErrorMessage = (error: unknown): string =>
    error instanceof Error
        ? error.message
        : 'The Safe transaction could not be submitted.';

export interface IUncertainSafeWriteAttempt {
    isNew: boolean;
    owner: string;
    safeTxHash: string;
    signature: string;
}

const hasOwnerConfirmation = (
    transaction: ISafeMultisigTransaction,
    owner: string,
    expectedSignature?: string,
): boolean =>
    transaction.confirmations.some(
        (confirmation) =>
            addressUtils.isAddressEqual(confirmation.owner, owner) &&
            isHex(confirmation.signature) &&
            (confirmation.signatureType === 'CONTRACT_SIGNATURE' ||
                confirmation.signature.length === 132) &&
            (expectedSignature == null ||
                confirmation.signature.toLowerCase() ===
                    expectedSignature.toLowerCase()),
    );

export const matchesReviewedTransaction = (
    reviewedHash: string,
    currentHash: string,
): boolean => reviewedHash.toLowerCase() === currentHash.toLowerCase();

export const isUncertainSafeWriteReconciled = (params: {
    attempt: IUncertainSafeWriteAttempt;
    transaction: ISafeMultisigTransaction;
}): boolean => {
    const { attempt, transaction } = params;
    return (
        matchesReviewedTransaction(
            attempt.safeTxHash,
            transaction.safeTxHash,
        ) && hasOwnerConfirmation(transaction, attempt.owner, attempt.signature)
    );
};

const isDefinitiveWriteError = (error: unknown): boolean =>
    error instanceof SafeServiceError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 408 &&
    error.status !== 409;
const getSafeTransactionData = (
    transaction: ISafeMultisigTransaction,
): ISafeTransactionData => {
    const nonce = Number(transaction.nonce);
    if (!Number.isSafeInteger(nonce) || nonce < 0) {
        throw new Error('The Safe transaction nonce is invalid.');
    }

    return {
        to: transaction.to,
        value: transaction.value,
        data: transaction.data ?? '0x',
        operation: transaction.operation,
        safeTxGas: transaction.safeTxGas,
        baseGas: transaction.baseGas,
        gasPrice: transaction.gasPrice,
        gasToken: transaction.gasToken,
        refundReceiver: transaction.refundReceiver,
        nonce,
    };
};

export const SafeNativeTransactionDialog: React.FC<
    ISafeNativeTransactionDialogProps
> = (props) => {
    const { params } = props.location;
    const { close } = useDialogContext();
    const { t } = useTranslations();
    const { address: walletAddress } = useWalletAccount();
    const queryClient = useQueryClient();

    if (params == null) {
        throw new Error('SafeNativeTransactionDialog: params not set');
    }

    const {
        actions: inputActions,
        daoAddress,
        network,
        prepareActions,
        safeAddress,
        transaction: inputTransaction,
    } = params;
    const { requiredChainId, withNetworkSwitch } = useNetworkSwitch({
        network,
    });
    const { check: checkWalletConnection, result: isWalletConnected } =
        useConnectedWalletGuard();
    const [state, setState] = useState<DialogState>('loading');
    const [prepared, setPrepared] = useState<IPreparedTransaction>();
    const [error, setError] = useState<string>();
    const [reviewGateBlocked, setReviewGateBlocked] = useState(true);
    const uncertainAttemptRef = useRef<IUncertainSafeWriteAttempt | undefined>(
        undefined,
    );
    const [uncertainAttempt, setUncertainAttemptState] =
        useState<IUncertainSafeWriteAttempt>();
    const setUncertainAttempt = useCallback(
        (attempt?: IUncertainSafeWriteAttempt) => {
            uncertainAttemptRef.current = attempt;
            setUncertainAttemptState(attempt);
        },
        [],
    );
    const getProtocolKit = useCallback(
        async (owner: string) => {
            const connection = getConnection(wagmiConfig);
            if (
                connection.status !== 'connected' ||
                connection.address == null ||
                !addressUtils.isAddressEqual(connection.address, owner) ||
                connection.chainId !== requiredChainId ||
                typeof connection.connector?.getProvider !== 'function'
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.walletRequired'),
                );
            }
            const provider = await connection.connector.getProvider({
                chainId: requiredChainId,
            });
            if (
                provider == null ||
                typeof provider !== 'object' ||
                !('request' in provider) ||
                typeof provider.request !== 'function'
            ) {
                throw new Error(
                    t(
                        'app.safe.safeNativeTransactionDialog.providerUnavailable',
                    ),
                );
            }

            const { default: Safe } = await import('@safe-global/protocol-kit');
            const request = provider.request;
            return Safe.init({
                provider: {
                    request: async (args) => await request.call(provider, args),
                },
                signer: owner,
                safeAddress,
            });
        },
        [requiredChainId, safeAddress, t],
    );

    const buildNewTransaction = useCallback(
        async (info: ISafeInfo): Promise<IPreparedTransaction> => {
            if (inputActions == null || inputActions.length === 0) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.noActions'),
                );
            }

            const nextNonce = await safeService.getSafeNextNonce({
                urlParams: { network, address: safeAddress },
            });
            const preparedActions =
                await executeActionsDialogUtils.prepareActions({
                    actions: inputActions,
                    prepareActions,
                });
            const executeTransaction = transactionUtils.buildExecuteTransaction(
                preparedActions.map((action) => ({
                    to: action.to as Hex,
                    value: BigInt(action.value),
                    data: action.data as Hex,
                })),
                daoAddress as Hex,
            );
            const nonce = Number(nextNonce.nextNonce);
            if (!Number.isSafeInteger(nonce)) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.invalidNonce'),
                );
            }

            if (info.version == null) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.invalidPayload'),
                );
            }
            const { calculateSafeTransactionHash } = await import(
                '@safe-global/protocol-kit'
            );
            const envelope = {
                to: executeTransaction.to,
                value: executeTransaction.value.toString(),
                data: executeTransaction.data,
                operation: 0 as const,
                safeTxGas: '0',
                baseGas: '0',
                gasPrice: '0',
                gasToken: zeroAddress,
                refundReceiver: zeroAddress,
                nonce,
            };
            const safeTxHash = calculateSafeTransactionHash(
                safeAddress,
                envelope,
                info.version,
                BigInt(requiredChainId),
            ) as Hex;
            const transaction: ISafeMultisigTransaction = {
                ...envelope,
                nonce: String(nonce),
                safeTxHash,
                from: zeroAddress,
                data: envelope.data,
                confirmations: [],
                confirmationsRequired: info.threshold,
                signatures: null,
                isExecuted: false,
                isSuccessful: null,
                submissionDate: new Date().toISOString(),
            };

            return {
                transaction,
                safeInfo: info,
                actions: preparedActions.map((action) => ({
                    to: action.to as Hex,
                    value: BigInt(action.value),
                    data: action.data as Hex,
                })),
            };
        },
        [
            daoAddress,
            inputActions,
            network,
            prepareActions,
            requiredChainId,
            safeAddress,
            t,
        ],
    );

    const prepare = useCallback(async () => {
        const info = await safeService.getSafeInfo({
            urlParams: { network, address: safeAddress },
        });

        if (inputTransaction != null) {
            const actions = safeDaoProposalUtils.findDaoExecuteActions({
                transaction: inputTransaction,
                daoAddress,
            });
            if (actions == null) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.invalidPayload'),
                );
            }
            return { transaction: inputTransaction, safeInfo: info, actions };
        }

        return buildNewTransaction(info);
    }, [
        buildNewTransaction,
        daoAddress,
        inputTransaction,
        network,
        safeAddress,
        t,
    ]);

    useEffect(() => {
        if (uncertainAttemptRef.current != null) {
            return;
        }
        let cancelled = false;
        setState('loading');
        setError(undefined);
        setReviewGateBlocked(true);
        void prepare()
            .then((value) => {
                if (cancelled || uncertainAttemptRef.current != null) {
                    return;
                }
                setPrepared(value);
                setState('ready');
            })
            .catch((reason: unknown) => {
                if (cancelled || uncertainAttemptRef.current != null) {
                    return;
                }
                setError(getErrorMessage(reason));
                setState('error');
            });
        return () => {
            cancelled = true;
        };
    }, [prepare]);

    const reconcile = useCallback(
        async (attempt: IUncertainSafeWriteAttempt) => {
            const transactions = await readSafeTransactions({
                network,
                safeAddress,
            });
            const exact = transactions.find(({ safeTxHash }) =>
                matchesReviewedTransaction(attempt.safeTxHash, safeTxHash),
            );
            return (
                exact != null &&
                isUncertainSafeWriteReconciled({
                    attempt,
                    transaction: exact,
                })
            );
        },
        [network, safeAddress],
    );
    const invalidateSafeQueries = useCallback(() => {
        void Promise.all([
            queryClient.invalidateQueries({
                queryKey: [SafeServiceKey.SAFE_DAO_PROPOSALS],
            }),
            queryClient.invalidateQueries({
                queryKey: [SafeServiceKey.SAFE_TRANSACTION_ACTIONS],
            }),
        ]).catch(() => undefined);
    }, [queryClient]);
    const handleSign = useCallback(async () => {
        if (prepared == null || walletAddress == null || reviewGateBlocked) {
            return;
        }
        setError(undefined);
        setState('signing');
        try {
            const info = await safeService.getSafeInfo({
                urlParams: { network, address: safeAddress },
            });
            const protocolKit = await getProtocolKit(walletAddress);
            const owners = await protocolKit.getOwners();
            if (
                !owners.some((owner) =>
                    addressUtils.isAddressEqual(owner, walletAddress),
                )
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.notOwner'),
                );
            }
            if (
                !safeMultisigProposalUtils.supportsEip1271Signatures(
                    info.version,
                )
            ) {
                const ownerBytecode = await getBytecode(wagmiConfig, {
                    address: walletAddress as Hex,
                    chainId: requiredChainId,
                });
                if (ownerBytecode != null) {
                    throw new Error(
                        t(
                            'app.safe.safeProposalTransactionDialog.unsupportedContractOwner',
                        ),
                    );
                }
            }

            let currentTransaction: IPreparedTransaction;
            if (inputTransaction == null) {
                currentTransaction = await buildNewTransaction(info);
            } else {
                const exact = (
                    await readSafeTransactions({
                        network,
                        safeAddress,
                    })
                ).find(
                    ({ safeTxHash }) =>
                        safeTxHash.toLowerCase() ===
                        inputTransaction.safeTxHash.toLowerCase(),
                );
                if (exact == null) {
                    throw new Error(
                        t(
                            'app.safe.safeNativeTransactionDialog.transactionUnavailable',
                        ),
                    );
                }
                const actions = safeDaoProposalUtils.findDaoExecuteActions({
                    transaction: exact,
                    daoAddress,
                });
                if (actions == null) {
                    throw new Error(
                        t(
                            'app.safe.safeNativeTransactionDialog.invalidPayload',
                        ),
                    );
                }
                currentTransaction = {
                    transaction: exact,
                    safeInfo: info,
                    actions,
                };
            }
            if (
                !matchesReviewedTransaction(
                    prepared.transaction.safeTxHash,
                    currentTransaction.transaction.safeTxHash,
                )
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.hashMismatch'),
                );
            }
            const latestNonce = await safeService.getSafeNextNonce({
                urlParams: { network, address: safeAddress },
            });
            if (
                !currentTransaction.transaction.isExecuted &&
                BigInt(latestNonce.currentNonce) >
                    BigInt(currentTransaction.transaction.nonce)
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.nonceConsumed'),
                );
            }
            if (
                inputTransaction == null &&
                BigInt(latestNonce.nextNonce) !==
                    BigInt(currentTransaction.transaction.nonce)
            ) {
                throw new Error(
                    t(
                        'app.safe.safeNativeTransactionDialog.transactionUnavailable',
                    ),
                );
            }
            const threshold = await protocolKit.getThreshold();
            if (threshold < 1 || threshold > owners.length) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.invalidThreshold'),
                );
            }
            if (
                !currentTransaction.transaction.isExecuted &&
                BigInt(currentTransaction.transaction.nonce) <
                    BigInt(info.nonce)
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.nonceConsumed'),
                );
            }
            const safeTransactionData = getSafeTransactionData(
                currentTransaction.transaction,
            );
            const { EthSafeTransaction } = await import(
                '@safe-global/protocol-kit'
            );
            const safeTransaction = new EthSafeTransaction({
                ...safeTransactionData,
            });
            const safeTxHash = (await protocolKit.getTransactionHash(
                safeTransaction,
            )) as Hex;
            if (
                safeTxHash.toLowerCase() !==
                currentTransaction.transaction.safeTxHash.toLowerCase()
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.hashMismatch'),
                );
            }
            if (currentTransaction.transaction.isExecuted) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.alreadyExecuted'),
                );
            }
            if (
                inputTransaction != null &&
                hasOwnerConfirmation(
                    currentTransaction.transaction,
                    walletAddress,
                )
            ) {
                setState('success');
                return;
            }

            const signature = await protocolKit.signTypedData(safeTransaction);
            const connection = getConnection(wagmiConfig);
            if (
                connection.status !== 'connected' ||
                connection.address == null ||
                !addressUtils.isAddressEqual(
                    connection.address,
                    walletAddress,
                ) ||
                connection.chainId !== requiredChainId
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.walletRequired'),
                );
            }
            const attempt: IUncertainSafeWriteAttempt = {
                isNew: inputTransaction == null,
                owner: walletAddress,
                safeTxHash,
                signature: signature.data,
            };
            setUncertainAttempt(attempt);
            setState('signing');
            try {
                if (inputTransaction == null) {
                    await safeTransactionService.proposeSafeTransaction({
                        urlParams: { network, address: safeAddress },
                        body: {
                            safeTransactionData,
                            safeTxHash,
                            senderAddress: walletAddress,
                            senderSignature: signature.data,
                            origin: 'Aragon',
                        },
                    });
                } else {
                    await safeTransactionService.confirmSafeTransaction({
                        urlParams: { network, safeTxHash },
                        body: { signature: signature.data },
                    });
                }
            } catch (writeError) {
                if (isDefinitiveWriteError(writeError)) {
                    setUncertainAttempt(undefined);
                    throw writeError;
                }
                setState('uncertain');
                try {
                    if (await reconcile(attempt)) {
                        invalidateSafeQueries();
                        setUncertainAttempt(undefined);
                        setState('success');
                        return;
                    }
                } catch (reconciliationError: unknown) {
                    setError(getErrorMessage(reconciliationError));
                    return;
                }
                setError(getErrorMessage(writeError));
                return;
            }
            invalidateSafeQueries();
            setUncertainAttempt(undefined);
            setState('success');
        } catch (reason: unknown) {
            setError(getErrorMessage(reason));
            setState('error');
        }
    }, [
        buildNewTransaction,
        daoAddress,
        getProtocolKit,
        inputTransaction,
        network,
        prepared,
        reconcile,
        invalidateSafeQueries,
        requiredChainId,
        reviewGateBlocked,
        safeAddress,
        setUncertainAttempt,
        t,
        walletAddress,
    ]);

    const title = t('app.safe.safeNativeTransactionDialog.title');
    const primaryAction =
        state === 'ready'
            ? {
                  label: t('app.safe.safeNativeTransactionDialog.actions.sign'),
                  disabled:
                      prepared == null ||
                      reviewGateBlocked ||
                      prepared.transaction.isExecuted,
                  onClick: () => {
                      if (!isWalletConnected) {
                          checkWalletConnection();
                          return;
                      }
                      withNetworkSwitch(() => {
                          void handleSign();
                      });
                  },
              }
            : state === 'success'
              ? {
                    label: t(
                        'app.safe.safeNativeTransactionDialog.actions.done',
                    ),
                    onClick: () => close(SafeDialogId.NATIVE_TRANSACTION),
                }
              : state === 'uncertain'
                ? {
                      label: t(
                          'app.safe.safeNativeTransactionDialog.actions.recheck',
                      ),
                      onClick: () => {
                          if (uncertainAttempt == null) {
                              return;
                          }
                          setError(undefined);
                          setState('signing');
                          void reconcile(uncertainAttempt)
                              .then((accepted) => {
                                  if (accepted) {
                                      invalidateSafeQueries();
                                      setUncertainAttempt(undefined);
                                  }
                                  setState(accepted ? 'success' : 'uncertain');
                              })
                              .catch((reason: unknown) => {
                                  setError(getErrorMessage(reason));
                                  setState('uncertain');
                              });
                      },
                  }
                : state === 'error'
                  ? {
                        label: t(
                            'app.safe.safeNativeTransactionDialog.actions.close',
                        ),
                        onClick: () => close(SafeDialogId.NATIVE_TRANSACTION),
                    }
                  : undefined;

    return (
        <>
            <Dialog.Header title={title} />
            <Dialog.Content
                className="max-h-[70vh] overflow-y-auto"
                description={t(
                    'app.safe.safeNativeTransactionDialog.description',
                )}
            >
                {state === 'loading' && (
                    <p>{t('app.safe.safeNativeTransactionDialog.loading')}</p>
                )}
                {error != null && <p className="text-critical">{error}</p>}
                {state === 'uncertain' && (
                    <p>{t('app.safe.safeNativeTransactionDialog.uncertain')}</p>
                )}
                {prepared != null && (
                    <SafeTransactionReviewContent
                        network={network}
                        onGateChange={setReviewGateBlocked}
                        safeAddress={safeAddress}
                        safeVersion={prepared.safeInfo.version}
                        transaction={prepared.transaction}
                    />
                )}
            </Dialog.Content>
            <Dialog.Footer primaryAction={primaryAction} />
        </>
    );
};

export type {
    ISafeNativeTransactionDialogParams,
    ISafeNativeTransactionDialogProps,
} from './safeNativeTransactionDialog.api';
