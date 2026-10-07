'use client';

import { addressUtils, Dialog } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Hex, isHex, toEventSelector, zeroAddress } from 'viem';
import { getBytecode, getConnection } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { executeActionsDialogUtils } from '@/modules/governance/dialogs/executeActionsDialog/executeActionsDialogUtils';
import { SafeTransactionReviewContent } from '@/modules/safe/components/safeTransactionReviewContent';
import {
    type ISafeExecutionOutcomeReport,
    SafeExecutionPendingError,
    SafeExecutionResult,
    SafeExecutionSubmissionError,
    useSafeTransactionExecution,
} from '@/modules/safe/hooks/useSafeTransactionExecution';
import { SafeExecutionOutcome } from '@/modules/safe/utils/safeExecutionOutcomeUtils';
import {
    readSafeTransactions,
    rememberAcceptedSafeDaoProposal,
} from '@/plugins/safeMultisigPlugin/hooks/useSafeDaoProposals';
import { safeDaoProposalUtils } from '@/plugins/safeMultisigPlugin/utils/safeDaoProposalUtils';
import {
    SafeApprovalReadiness,
    safeMultisigProposalUtils,
} from '@/plugins/safeMultisigPlugin/utils/safeMultisigProposalUtils';
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
import {
    buildIntentId,
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { SafeDialogId } from '../../constants';
import type { ISafeNativeTransactionDialogProps } from './safeNativeTransactionDialog.api';

interface IPreparedTransaction {
    transaction: ISafeMultisigTransaction;
    safeInfo: ISafeInfo;
    actions: ITransactionRequest[];
    canExecute: boolean;
}

type DialogState =
    | 'loading'
    | 'ready'
    | 'signing'
    | 'executing'
    | 'executionPending'
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

const daoExecutedTopic = toEventSelector(
    'Executed(address,bytes32,(address,uint256,bytes)[],uint256,uint256,bytes[])',
);

const canExecuteTransaction = (
    transaction: ISafeMultisigTransaction,
    safeInfo: ISafeInfo,
): boolean =>
    safeMultisigProposalUtils.getApprovalReadiness({
        currentNonce: safeInfo.nonce,
        owners: safeInfo.owners,
        threshold: safeInfo.threshold,
        transaction,
    }) === SafeApprovalReadiness.READY_TO_EXECUTE;

export const SafeNativeTransactionDialog: React.FC<
    ISafeNativeTransactionDialogProps
> = (props) => {
    const { params } = props.location;
    const { close, updateOptions } = useDialogContext();
    const { t } = useTranslations();
    const { address: walletAddress } = useWalletAccount();
    const queryClient = useQueryClient();
    const { execute, resume } = useSafeTransactionExecution();

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
    const inputSafeTxHash = inputTransaction?.safeTxHash;
    const executionIntentId = useMemo(
        () =>
            inputSafeTxHash == null
                ? undefined
                : buildIntentId({
                      type: 'safe-native-execution',
                      network,
                      daoAddress,
                      safeAddress,
                      safeTxHash: inputSafeTxHash,
                  }),
        [daoAddress, inputSafeTxHash, network, safeAddress],
    );
    const { check: checkWalletConnection, result: isWalletConnected } =
        useConnectedWalletGuard();
    const [state, setState] = useState<DialogState>('loading');
    const [prepared, setPrepared] = useState<IPreparedTransaction>();
    const [error, setError] = useState<string>();
    const [executionSucceeded, setExecutionSucceeded] = useState(false);
    const [executionPending, setExecutionPending] = useState(false);
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
                canExecute: false,
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
            return {
                transaction: inputTransaction,
                safeInfo: info,
                actions,
                canExecute: canExecuteTransaction(inputTransaction, info),
            };
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
        setExecutionSucceeded(false);
        const pendingExecution =
            executionIntentId == null
                ? undefined
                : pendingTransactionManager.get(executionIntentId);
        if (
            pendingExecution?.status === PendingTransactionStatus.FAILED &&
            executionIntentId != null
        ) {
            pendingTransactionManager.clear(executionIntentId);
        }
        setExecutionPending(
            pendingExecution?.status === PendingTransactionStatus.PENDING ||
                pendingExecution?.status === PendingTransactionStatus.SUBMITTED,
        );
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
    }, [executionIntentId, prepare]);

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
    const handoffAcceptedProposal = useCallback(
        (attempt: IUncertainSafeWriteAttempt) => {
            if (!attempt.isNew || prepared == null) {
                return;
            }
            rememberAcceptedSafeDaoProposal({
                network,
                safeAddress,
                daoAddress,
                transaction: prepared.transaction,
                owner: attempt.owner,
                signature: attempt.signature,
            });
        },
        [daoAddress, network, prepared, safeAddress],
    );
    const verifyDaoExecution = useCallback(
        (receipt: {
            logs: readonly {
                address: string;
                topics: readonly string[];
            }[];
        }) =>
            receipt.logs.some(
                (log) =>
                    addressUtils.isAddressEqual(log.address, daoAddress) &&
                    log.topics[0] === daoExecutedTopic,
            ),
        [daoAddress],
    );
    const markExecutionPending = useCallback(() => {
        setExecutionPending(true);
        setError(t('app.safe.safeNativeTransactionDialog.uncertain'));
        setState('executionPending');
    }, [t]);
    const registerExecutionSubmitted = useCallback(
        (hash: Hex) => {
            if (executionIntentId == null || prepared == null) {
                return;
            }
            pendingTransactionManager.registerSubmitted(
                executionIntentId,
                { hash, chainId: requiredChainId },
                {
                    type: 'safe-native-execution',
                    scope: executionIntentId,
                    recovery: {
                        safeAddress,
                        chainId: requiredChainId,
                        safeTxHash: prepared.transaction.safeTxHash,
                    },
                },
            );
            setExecutionPending(true);
        },
        [executionIntentId, prepared, requiredChainId, safeAddress],
    );
    const registerExecutionUncertain = useCallback(() => {
        if (executionIntentId == null || prepared == null) {
            return;
        }
        pendingTransactionManager.registerSubmissionUncertain(
            executionIntentId,
            { chainId: requiredChainId },
            {
                type: 'safe-native-execution',
                scope: executionIntentId,
                recovery: {
                    safeAddress,
                    chainId: requiredChainId,
                    safeTxHash: prepared.transaction.safeTxHash,
                },
            },
        );
    }, [executionIntentId, prepared, requiredChainId, safeAddress]);
    const finishExecution = useCallback(
        (result: ISafeExecutionOutcomeReport) => {
            if (
                result.result === SafeExecutionResult.FAILED &&
                result.outcome === SafeExecutionOutcome.UNMATCHED
            ) {
                markExecutionPending();
                return;
            }
            if (executionIntentId != null) {
                pendingTransactionManager.clear(executionIntentId);
            }
            setExecutionPending(false);
            if (result.result === SafeExecutionResult.EXECUTED) {
                invalidateSafeQueries();
                setExecutionSucceeded(true);
                setState('success');
                return;
            }
            setError(
                t(
                    result.result === SafeExecutionResult.AUTHORITY_CHANGED
                        ? 'app.safe.safeNativeTransactionDialog.executionUnavailable'
                        : 'app.safe.safeNativeTransactionDialog.executionFailed',
                ),
            );
            setState('error');
        },
        [executionIntentId, invalidateSafeQueries, markExecutionPending, t],
    );
    const handleExecute = useCallback(async () => {
        if (prepared == null || reviewGateBlocked) {
            return;
        }

        const pendingExecution =
            executionIntentId == null
                ? undefined
                : pendingTransactionManager.get(executionIntentId);
        const resumeExecution = async (hash: Hex): Promise<void> => {
            const result = await resume({
                hash,
                safeTxHash: prepared.transaction.safeTxHash,
                safeAddress,
                chainId: requiredChainId,
                verifyEffect: verifyDaoExecution,
            });
            finishExecution(result);
        };

        if (
            pendingExecution?.status === PendingTransactionStatus.SUBMITTED &&
            pendingExecution.hash != null
        ) {
            setError(undefined);
            setState('executing');
            try {
                await resumeExecution(pendingExecution.hash);
            } catch (reason: unknown) {
                if (reason instanceof SafeExecutionPendingError) {
                    markExecutionPending();
                    return;
                }
                setError(getErrorMessage(reason));
                setState('error');
            }
            return;
        }

        if (pendingExecution?.status === PendingTransactionStatus.PENDING) {
            setError(undefined);
            setState('executing');
            let resumeHash = pendingExecution.hash;
            try {
                if (resumeHash == null) {
                    const exact = (
                        await readSafeTransactions({
                            network,
                            safeAddress,
                        })
                    ).find(
                        ({ safeTxHash }) =>
                            safeTxHash.toLowerCase() ===
                            prepared.transaction.safeTxHash.toLowerCase(),
                    );
                    if (
                        exact == null ||
                        !exact.isExecuted ||
                        !isHex(exact.transactionHash) ||
                        exact.transactionHash.length !== 66
                    ) {
                        markExecutionPending();
                        return;
                    }
                    resumeHash = exact.transactionHash as Hex;
                    registerExecutionSubmitted(resumeHash);
                }
                await resumeExecution(resumeHash);
            } catch (reason: unknown) {
                if (reason instanceof SafeExecutionPendingError) {
                    if (isHex(reason.hash) && reason.hash.length === 66) {
                        registerExecutionSubmitted(reason.hash);
                    }
                    markExecutionPending();
                    return;
                }
                setError(getErrorMessage(reason));
                setState('error');
            }
            return;
        }

        if (walletAddress == null || !prepared.canExecute) {
            return;
        }

        setError(undefined);
        setState('executing');
        try {
            const protocolKit = await getProtocolKit(walletAddress);
            const [owners, threshold, currentNonce] = await Promise.all([
                protocolKit.getOwners(),
                protocolKit.getThreshold(),
                protocolKit.getNonce(),
            ]);
            if (
                !owners.some((owner) =>
                    addressUtils.isAddressEqual(owner, walletAddress),
                )
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.notOwner'),
                );
            }
            if (threshold < 1 || threshold > owners.length) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.invalidThreshold'),
                );
            }
            const exact = (
                await readSafeTransactions({
                    network,
                    safeAddress,
                })
            ).find(
                ({ safeTxHash }) =>
                    safeTxHash.toLowerCase() ===
                    prepared.transaction.safeTxHash.toLowerCase(),
            );
            if (exact == null) {
                throw new Error(
                    t(
                        'app.safe.safeNativeTransactionDialog.transactionUnavailable',
                    ),
                );
            }
            if (
                !matchesReviewedTransaction(
                    prepared.transaction.safeTxHash,
                    exact.safeTxHash,
                )
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.hashMismatch'),
                );
            }
            if (
                safeDaoProposalUtils.findDaoExecuteActions({
                    transaction: exact,
                    daoAddress,
                }) == null
            ) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.invalidPayload'),
                );
            }
            if (exact.isExecuted) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.alreadyExecuted'),
                );
            }
            const readiness = safeMultisigProposalUtils.getApprovalReadiness({
                currentNonce: String(currentNonce),
                owners,
                threshold,
                transaction: exact,
            });
            if (readiness !== SafeApprovalReadiness.READY_TO_EXECUTE) {
                throw new Error(
                    t(
                        'app.safe.safeNativeTransactionDialog.executionUnavailable',
                    ),
                );
            }
            const safeTransactionData = getSafeTransactionData(exact);
            const { EthSafeSignature, EthSafeTransaction } = await import(
                '@safe-global/protocol-kit'
            );
            const safeTransaction = new EthSafeTransaction({
                ...safeTransactionData,
            });
            const safeTxHash = (await protocolKit.getTransactionHash(
                safeTransaction,
            )) as Hex;
            if (safeTxHash.toLowerCase() !== exact.safeTxHash.toLowerCase()) {
                throw new Error(
                    t('app.safe.safeNativeTransactionDialog.hashMismatch'),
                );
            }
            const signatures = exact.confirmations.map(
                ({ owner, signature, signatureType }) =>
                    new EthSafeSignature(
                        owner,
                        signature,
                        signatureType === 'CONTRACT_SIGNATURE',
                    ),
            );
            const result = await execute({
                protocolKit,
                safeTransaction,
                safeTxHash,
                safeAddress,
                chainId: requiredChainId,
                signatures,
                verifyEffect: verifyDaoExecution,
                onSubmitted: registerExecutionSubmitted,
            });
            finishExecution(result);
        } catch (reason: unknown) {
            if (reason instanceof SafeExecutionPendingError) {
                if (isHex(reason.hash) && reason.hash.length === 66) {
                    registerExecutionSubmitted(reason.hash);
                }
                markExecutionPending();
                return;
            }
            if (reason instanceof SafeExecutionSubmissionError) {
                registerExecutionUncertain();
                markExecutionPending();
                return;
            }
            setError(getErrorMessage(reason));
            setState('error');
        }
    }, [
        daoAddress,
        execute,
        executionIntentId,
        finishExecution,
        getProtocolKit,
        markExecutionPending,
        network,
        prepared,
        registerExecutionSubmitted,
        registerExecutionUncertain,
        requiredChainId,
        resume,
        reviewGateBlocked,
        safeAddress,
        t,
        verifyDaoExecution,
        walletAddress,
    ]);

    const handleSign = useCallback(async () => {
        if (prepared == null || walletAddress == null || reviewGateBlocked) {
            return;
        }
        const pendingExecution =
            executionIntentId == null
                ? undefined
                : pendingTransactionManager.get(executionIntentId);
        if (
            executionPending ||
            pendingExecution?.status === PendingTransactionStatus.PENDING ||
            pendingExecution?.status === PendingTransactionStatus.SUBMITTED
        ) {
            markExecutionPending();
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
                    canExecute: false,
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
                        handoffAcceptedProposal(attempt);
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
            handoffAcceptedProposal(attempt);
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
        executionIntentId,
        executionPending,
        getProtocolKit,
        inputTransaction,
        network,
        prepared,
        reconcile,
        invalidateSafeQueries,
        markExecutionPending,
        requiredChainId,
        reviewGateBlocked,
        safeAddress,
        setUncertainAttempt,
        t,
        handoffAcceptedProposal,
        walletAddress,
    ]);

    const isDismissBlocked = state === 'signing' || state === 'executing';
    const handleDismiss = useCallback(() => {
        if (isDismissBlocked) {
            return;
        }

        close(SafeDialogId.NATIVE_TRANSACTION);
    }, [close, isDismissBlocked]);

    useEffect(() => {
        updateOptions({
            disableOutsideClick: true,
            onClose: handleDismiss,
        });
    }, [handleDismiss, updateOptions]);

    const proposalHref =
        state === 'success' && inputTransaction == null && prepared != null
            ? `/dao/${network}/${daoAddress}/proposals/safe/${prepared.transaction.safeTxHash}?safeAddress=${encodeURIComponent(safeAddress)}`
            : undefined;
    const title = t('app.safe.safeNativeTransactionDialog.title');
    const pendingExecution =
        executionIntentId == null
            ? undefined
            : pendingTransactionManager.get(executionIntentId);
    const executionNeedsRecheck =
        executionPending ||
        pendingExecution?.status === PendingTransactionStatus.PENDING ||
        pendingExecution?.status === PendingTransactionStatus.SUBMITTED;
    const primaryAction =
        state === 'ready'
            ? {
                  label: t(
                      executionNeedsRecheck
                          ? 'app.safe.safeNativeTransactionDialog.actions.recheck'
                          : prepared?.canExecute
                            ? 'app.safe.safeNativeTransactionDialog.actions.execute'
                            : 'app.safe.safeNativeTransactionDialog.actions.sign',
                  ),
                  disabled:
                      prepared == null ||
                      reviewGateBlocked ||
                      (!executionNeedsRecheck &&
                          prepared.transaction.isExecuted),
                  onClick: () => {
                      if (!isWalletConnected) {
                          checkWalletConnection();
                          return;
                      }
                      withNetworkSwitch(() => {
                          void (executionNeedsRecheck || prepared?.canExecute
                              ? handleExecute()
                              : handleSign());
                      });
                  },
              }
            : state === 'success'
              ? {
                    label: t(
                        proposalHref == null
                            ? 'app.safe.safeNativeTransactionDialog.actions.done'
                            : 'app.safe.safeNativeTransactionDialog.actions.view',
                    ),
                    href: proposalHref,
                    onClick: () => close(SafeDialogId.NATIVE_TRANSACTION),
                }
              : state === 'executionPending'
                ? {
                      label: t(
                          'app.safe.safeNativeTransactionDialog.actions.recheck',
                      ),
                      onClick: () => {
                          setError(undefined);
                          void handleExecute();
                      },
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
                                    setState(
                                        accepted ? 'success' : 'uncertain',
                                    );
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
            <Dialog.Header onClose={handleDismiss} title={title} />
            <Dialog.Content
                className="max-h-[70vh] overflow-y-auto"
                description={t(
                    'app.safe.safeNativeTransactionDialog.description',
                )}
            >
                {state === 'loading' && (
                    <p>{t('app.safe.safeNativeTransactionDialog.loading')}</p>
                )}
                {state === 'executing' && (
                    <p>{t('app.safe.safeNativeTransactionDialog.executing')}</p>
                )}
                {error != null && <p className="text-critical">{error}</p>}
                {state === 'success' && inputTransaction == null && (
                    <p>{t('app.safe.safeNativeTransactionDialog.submitted')}</p>
                )}
                {state === 'success' && executionSucceeded && (
                    <p>{t('app.safe.safeNativeTransactionDialog.executed')}</p>
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

export type {
    ISafeNativeTransactionDialogParams,
    ISafeNativeTransactionDialogProps,
} from './safeNativeTransactionDialog.api';
