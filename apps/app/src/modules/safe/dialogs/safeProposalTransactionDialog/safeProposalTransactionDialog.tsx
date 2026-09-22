'use client';

import {
    AlertCard,
    addressUtils,
    Dialog,
    IconType,
    invariant,
    StateSkeletonBar,
} from '@aragon/gov-ui-kit';
import type Safe from '@safe-global/protocol-kit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Hex, isHex, numberToHex, pad, toEventSelector } from 'viem';
import { getBytecode, getConnection, watchConnection } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import {
    type ISafeExecutionOutcomeReport,
    type ISafeRecoveryContext,
    parseSafeRecoveryContext,
    SafeExecutionPendingError,
    SafeExecutionResult,
    SafeExecutionSubmissionError,
    useSafeTransactionExecution,
} from '@/modules/safe/hooks/useSafeTransactionExecution';
import { SafeExecutionOutcome } from '@/modules/safe/utils/safeExecutionOutcomeUtils';
import {
    SafeBatchStatus,
    safeTransactionEnvelopeUtils,
} from '@/modules/safe/utils/safeTransactionEnvelopeUtils';
import { safeQueueReadLimit } from '@/plugins/safeMultisigPlugin/constants';
import { safeMultisigProposalUtils } from '@/plugins/safeMultisigPlugin/utils/safeMultisigProposalUtils';
import { safeMultisigTransactionUtils } from '@/plugins/safeMultisigPlugin/utils/safeMultisigTransactionUtils';
import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import {
    SafeServiceError,
    safeService,
    useConfirmSafeTransaction,
    useProposeSafeTransaction,
} from '@/shared/api/safeService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStep,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import { transactionDialogUtils } from '@/shared/components/transactionDialog/transactionDialogUtils';
import type { ITransactionStatusStepMeta } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { useStepper } from '@/shared/hooks/useStepper';
import { pendingTransactionManager } from '@/shared/utils/pendingTransactionManager';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { SafeTransactionReviewContent } from '../../components/safeTransactionReviewContent';

/** Proposal identity and caller callbacks for the reviewed Safe transaction flow. */
export interface ISafeProposalTransactionDialogParams {
    daoId: string;
    proposal: ISppProposal;
    externalAddress: string;
    stage: ISppStage;
    isVeto: boolean;
    bundleExecution: boolean;
    intentId: string;
    pendingTransaction?: ISafeMultisigTransaction;
    /** Called only after both the Safe execution and the proposal report effect are verified. */
    onExecuted?: (hash: Hex) => void;
    onSafeStateChange?: () => void | Promise<void>;
}

/** Dialog-provider location containing the Safe proposal flow parameters. */
export interface ISafeProposalTransactionDialogProps
    extends IDialogComponentProps<ISafeProposalTransactionDialogParams> {}

interface IPreparedReport {
    transaction: ISafeMultisigTransaction;
    isNew: boolean;
    landsOnCurrentNonce: boolean;
    bundleExecution: boolean;
    ownerAddress: string;
    walletRevision: number;
    safeVersion?: string | null;
}

type SafeTransaction = Awaited<ReturnType<Safe['createTransaction']>>;
type SafeSignature = Parameters<SafeTransaction['addSignature']>[0];

interface IExecutionContext {
    protocolKit: Safe;
    safeTransaction: SafeTransaction;
    safeTxHash: Hex;
    signatures: SafeSignature[];
    landsOnCurrentNonce: boolean;
    transaction: ISafeMultisigTransaction;
    isNew: boolean;
}

type SafeStep = 'PREPARE_REVIEW' | 'SIGN_SUBMIT' | 'EXECUTE';
type NumberedSafeStep = Exclude<SafeStep, 'PREPARE_REVIEW'>;
type ExecutionPhase = 'wallet' | 'confirming' | 'verifying';

type RecoveryState =
    | { status: 'none' }
    | { status: 'invalid'; message: string }
    | {
          status: 'valid';
          hash?: Hex;
          submittedAt: number;
          context: ISafeRecoveryContext;
      };

type SafePlan = NumberedSafeStep[];
const proposalResultReportedTopic = toEventSelector(
    'ProposalResultReported(uint256,uint16,address)',
);
const intentType = 'SAFE_PROPOSAL_RESULT';
const translationKey = 'app.plugins.safeMultisig.safeMultisigSubmitVote';
const dialogTranslationKey = 'app.safe.safeProposalTransactionDialog';

const isObject = (value: unknown): value is object =>
    value != null && typeof value === 'object';

const errorMessage = (error: unknown): string => {
    if (
        isObject(error) &&
        'message' in error &&
        typeof error.message === 'string'
    ) {
        return error.message;
    }
    return String(error);
};

const isWalletRejection = (error: unknown): boolean => {
    const message = errorMessage(error).toLowerCase();
    return (
        message.includes('user rejected') ||
        message.includes('user denied') ||
        message.includes('rejected the request')
    );
};

const hasOwnerSignature = (
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

const resolveReviewIntent = (params: {
    transaction: ISafeMultisigTransaction;
    pluginAddress: string;
    proposalId: string;
    stageId: number;
    isVeto: boolean;
}): string => {
    const report = safeMultisigTransactionUtils.findProposalResultReport({
        transaction: params.transaction,
        pluginAddress: params.pluginAddress,
        proposalId: params.proposalId,
        stageId: params.stageId,
    });
    const expectedResult = params.isVeto
        ? SppProposalType.VETO
        : SppProposalType.APPROVAL;

    if (report == null) {
        return 'unrecognised';
    }
    if (report.resultType !== expectedResult) {
        return 'oppositeResult';
    }
    if (report.tryAdvance) {
        return 'advancesStage';
    }
    if (params.transaction.operation !== 0) {
        return 'delegateCall';
    }
    if (params.transaction.value !== '0') {
        return 'carriesValue';
    }
    if (
        safeTransactionEnvelopeUtils.inspectBatch(params.transaction.data)
            .status !== SafeBatchStatus.NOT_A_BATCH
    ) {
        return 'batched';
    }
    return 'reportOnly';
};

const resolveCostNote = (prepared: IPreparedReport, owner: string): string => {
    const { transaction } = prepared;
    const ownerSignatureOwed =
        transaction.confirmations.length < transaction.confirmationsRequired &&
        !hasOwnerSignature(transaction, owner);
    const reachesThreshold =
        transaction.confirmations.length >= transaction.confirmationsRequired ||
        transaction.confirmations.length + (ownerSignatureOwed ? 1 : 0) >=
            transaction.confirmationsRequired;
    const executes =
        prepared.bundleExecution &&
        prepared.landsOnCurrentNonce &&
        reachesThreshold;

    if (!executes) {
        return 'gasless';
    }
    return ownerSignatureOwed ? 'bundledExecution' : 'executionOnly';
};

const findTransaction = async (params: {
    network: Network;
    address: string;
    safeTxHash: string;
}): Promise<ISafeMultisigTransaction | undefined> => {
    for (const history of [false, true]) {
        let offset = 0;
        for (;;) {
            const page = history
                ? await safeService.getSafeTransactionHistory({
                      urlParams: {
                          network: params.network,
                          address: params.address,
                      },
                      queryParams: {
                          limit: safeQueueReadLimit,
                          offset,
                      },
                  })
                : await safeService.getSafePendingTransactions({
                      urlParams: {
                          network: params.network,
                          address: params.address,
                      },
                      queryParams: {
                          limit: safeQueueReadLimit,
                          offset,
                      },
                  });
            const transaction = page.results.find(
                (item) =>
                    item.safeTxHash.toLowerCase() ===
                    params.safeTxHash.toLowerCase(),
            );
            if (transaction != null) {
                return transaction;
            }
            if (page.next == null || page.results.length === 0) {
                break;
            }
            offset += page.results.length;
        }
    }
    return undefined;
};

const recoveryTransaction = (
    context: ISafeRecoveryContext,
    submittedAt: number,
): ISafeMultisigTransaction => ({
    ...context.reviewedTx,
    operation: context.reviewedTx.operation === 1 ? 1 : 0,
    safeTxHash: context.safeTxHash,
    from: null,
    confirmations: [],
    confirmationsRequired: 1,
    signatures: null,
    submissionDate: new Date(submittedAt).toISOString(),
    isExecuted: false,
    isSuccessful: null,
});
const getSafePlan = (params: {
    transaction: ISafeMultisigTransaction;
    owner: string;
    signatureCount: number;
    ownerSigned: boolean;
    landsOnCurrentNonce: boolean;
    bundleExecution: boolean;
}): SafePlan => {
    const {
        transaction,
        owner,
        signatureCount,
        ownerSigned: hasOwnerSignedSignature,
        landsOnCurrentNonce,
        bundleExecution,
    } = params;
    const ownerSigned =
        hasOwnerSignedSignature || hasOwnerSignature(transaction, owner);
    const enoughSignatures =
        signatureCount >= transaction.confirmationsRequired;
    const canExecuteNow =
        bundleExecution && landsOnCurrentNonce && enoughSignatures;
    const needsSignature = !ownerSigned && !canExecuteNow;
    const reachesThresholdAfterSignature =
        enoughSignatures ||
        (!ownerSigned &&
            signatureCount + 1 >= transaction.confirmationsRequired);
    const canExecute =
        bundleExecution &&
        landsOnCurrentNonce &&
        reachesThresholdAfterSignature;

    return [
        ...(needsSignature ? (['SIGN_SUBMIT'] as const) : []),
        ...(canExecute ? (['EXECUTE'] as const) : []),
    ];
};
const applyAuthority = (
    transaction: ISafeMultisigTransaction,
    owners: string[],
    threshold: number,
): ISafeMultisigTransaction => {
    const seen = new Set<string>();
    return {
        ...transaction,
        confirmationsRequired: threshold,
        confirmations: transaction.confirmations.filter(({ owner }) => {
            const key = owner.toLowerCase();
            if (
                seen.has(key) ||
                !owners.some((current) =>
                    addressUtils.isAddressEqual(current, owner),
                )
            ) {
                return false;
            }
            seen.add(key);
            return true;
        }),
    };
};

/** Reviews, signs, submits, executes, and recovers a Safe proposal result in one transaction dialog. */
export const SafeProposalTransactionDialog: React.FC<
    ISafeProposalTransactionDialogProps
> = ({ location }) => {
    invariant(
        location.params != null,
        'SafeProposalTransactionDialog: required parameters must be set.',
    );
    const {
        daoId,
        proposal,
        externalAddress,
        stage,
        isVeto,
        bundleExecution,
        intentId,
        pendingTransaction,
        onExecuted,
        onSafeStateChange,
    } = location.params;
    const { t } = useTranslations();
    const { close } = useDialogContext();
    const network = proposal.network;
    const { id: requiredChainId } = networkDefinitions[network];
    const { withNetworkSwitch } = useNetworkSwitch({ network });
    const { isConnecting, isReconnecting } = useWalletAccount();
    const walletPending = isConnecting || isReconnecting;
    const { mutateAsync: proposeTransaction } = useProposeSafeTransaction();
    const { mutateAsync: confirmTransaction } = useConfirmSafeTransaction();
    const { execute, resume } = useSafeTransactionExecution();
    const stepper = useStepper<ITransactionStatusStepMeta, SafeStep>({
        initialActiveStep: 'SIGN_SUBMIT',
    });
    const [prepared, setPrepared] = useState<IPreparedReport>();
    const [plan, setPlan] = useState<SafePlan>();
    const [isPreparing, setIsPreparing] = useState(true);
    const [prepareError, setPrepareError] = useState<string>();
    const preparationStartedRef = useRef(false);
    const pendingSignatureRef = useRef<SafeSignature | undefined>(undefined);
    const [flowStep, setFlowStep] = useState<NumberedSafeStep>();
    const [workingStep, setWorkingStep] = useState<SafeStep>();
    const [actionStarted, setActionStarted] = useState(false);
    const [signSubmitPhase, setSignSubmitPhase] = useState<
        'signing' | 'submitting' | 'reconciling'
    >('reconciling');
    const [errorStep, setErrorStep] = useState<SafeStep>();
    const [errorLabel, setErrorLabel] = useState<string>();
    const [reviewGateBlocked, setReviewGateBlocked] = useState(true);
    const [signatureNotNeeded, setSignatureNotNeeded] = useState(false);
    const [planDiverged, setPlanDiverged] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [executionSucceeded, setExecutionSucceeded] = useState(false);
    const [terminalFailure, setTerminalFailure] = useState(false);
    const [recoveryPending, setRecoveryPending] = useState(false);
    const [submittedHash, setSubmittedHash] = useState<Hex>();
    const [executionPhase, setExecutionPhase] =
        useState<ExecutionPhase>('wallet');
    const submittedHashRef = useRef<Hex | undefined>(undefined);
    const serviceAcceptedHashRef = useRef<string | undefined>(undefined);
    const serviceWriteUncertainRef = useRef(false);
    const walletRevisionRef = useRef(0);
    const reviewSeedRef = useRef(pendingTransaction);
    const [walletChanged, setWalletChanged] = useState(false);
    const [retryAt, setRetryAt] = useState<number>();
    const intentScope = `${daoId}:${network}:${externalAddress.toLowerCase()}:${proposal.id}`;

    useEffect(
        () =>
            watchConnection(wagmiConfig, {
                onChange: (current, previous) => {
                    if (
                        current.address !== previous.address ||
                        current.chainId !== previous.chainId
                    ) {
                        walletRevisionRef.current += 1;
                        setWalletChanged(true);
                    }
                },
            }),
        [],
    );

    useEffect(() => {
        if (retryAt == null) {
            return;
        }
        const timeout = setTimeout(
            () => setRetryAt(undefined),
            Math.max(0, retryAt - Date.now()),
        );
        return () => clearTimeout(timeout);
    }, [retryAt]);

    const recoveryState = useMemo<RecoveryState>(() => {
        const stored = pendingTransactionManager.get(intentId);
        if (stored == null) {
            return { status: 'none' };
        }
        if (stored.recovery == null) {
            return {
                status: 'invalid',
                message: t(`${translationKey}.recoveryContextMissing`),
            };
        }
        const context = parseSafeRecoveryContext(stored.recovery);
        if (
            context == null ||
            stored.chainId !== context.chainId ||
            context.safeAddress.toLowerCase() !==
                externalAddress.toLowerCase() ||
            context.chainId !== requiredChainId ||
            context.proposal.proposalId !== proposal.id ||
            !addressUtils.isAddressEqual(
                context.proposal.pluginAddress,
                proposal.pluginAddress,
            ) ||
            context.proposal.stageIndex !== stage.stageIndex
        ) {
            return {
                status: 'invalid',
                message: t(`${translationKey}.recoveryContextMismatch`),
            };
        }
        return {
            status: 'valid',
            hash: stored.hash,
            submittedAt: stored.submittedAt ?? Date.now(),
            context,
        };
    }, [
        externalAddress,
        intentId,
        proposal.id,
        proposal.pluginAddress,
        requiredChainId,
        stage.stageIndex,
        t,
    ]);
    const reviewIntent =
        prepared == null
            ? undefined
            : t(
                  `${translationKey}.review.${resolveReviewIntent({
                      transaction: prepared.transaction,
                      pluginAddress: proposal.pluginAddress,
                      proposalId: proposal.proposalIndex,
                      stageId: stage.stageIndex,
                      isVeto,
                  })}`,
                  { proposal: proposal.title },
              );
    const reviewCostNote =
        prepared == null
            ? undefined
            : t(
                  `${translationKey}.review.${resolveCostNote(
                      prepared,
                      prepared.ownerAddress,
                  )}`,
              );

    const track = useCallback(
        (
            event:
                | 'transaction_start'
                | 'transaction_stage'
                | 'transaction_end'
                | 'transaction_failed',
            status?: string,
        ) => {
            plausibleAnalyticsUtils.track(event, {
                flow: 'safe_proposal_result',
                network,
                status,
                proposalStage: stage.stageIndex,
            });
        },
        [network, stage.stageIndex],
    );

    const fail = useCallback(
        (step: SafeStep, error: unknown, message = errorMessage(error)) => {
            if (
                SafeServiceError.isRateLimitedError(error) &&
                error.retryAfter != null &&
                Number.isFinite(error.retryAfter) &&
                error.retryAfter > 0
            ) {
                setRetryAt(Date.now() + error.retryAfter * 1000);
            }
            setWorkingStep(undefined);
            setErrorStep(step);
            setErrorLabel(message);
            track('transaction_failed', step);
            transactionDialogUtils.monitorTransactionError(error, {
                flow: 'safe_proposal_result',
                step,
                network,
            });
        },
        [network, track],
    );

    const clearError = useCallback(() => {
        setErrorStep(undefined);
        setErrorLabel(undefined);
    }, []);

    const assertWallet = useCallback(
        (owner: string, revision: number) => {
            const connection = getConnection(wagmiConfig);
            if (
                walletRevisionRef.current !== revision ||
                connection.address == null ||
                !addressUtils.isAddressEqual(connection.address, owner)
            ) {
                throw new Error(t(`${translationKey}.walletChanged`));
            }
            if (connection.chainId !== requiredChainId) {
                throw new Error(t(`${translationKey}.networkChanged`));
            }
        },
        [requiredChainId, t],
    );

    const getProtocolKit = useCallback(
        async (owner: string) => {
            const connection = getConnection(wagmiConfig);
            if (
                connection.status !== 'connected' ||
                typeof connection.connector?.getProvider !== 'function'
            ) {
                throw new Error(t(`${translationKey}.providerUnavailable`));
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
                throw new Error(t(`${translationKey}.providerUnavailable`));
            }
            const { default: Safe } = await import('@safe-global/protocol-kit');
            const request = provider.request;
            return Safe.init({
                provider: {
                    request: async (args) => await request.call(provider, args),
                },
                signer: owner,
                safeAddress: externalAddress,
            });
        },
        [externalAddress, requiredChainId, t],
    );

    const buildFreshContext = useCallback(
        async (report: IPreparedReport): Promise<IExecutionContext> => {
            assertWallet(report.ownerAddress, report.walletRevision);
            let transaction = report.transaction;
            let isNew = report.isNew;
            if (!isNew || serviceAcceptedHashRef.current != null) {
                const exact = await findTransaction({
                    network,
                    address: externalAddress,
                    safeTxHash: transaction.safeTxHash,
                });
                if (exact == null) {
                    if (
                        serviceAcceptedHashRef.current?.toLowerCase() !==
                        transaction.safeTxHash.toLowerCase()
                    ) {
                        throw new Error(
                            t(`${translationKey}.reportUnavailable`),
                        );
                    }
                } else {
                    transaction = exact;
                }
                isNew = false;
            }
            const nextNonce = await safeService.getSafeNextNonce({
                urlParams: { network, address: externalAddress },
            });
            if (BigInt(nextNonce.currentNonce) > BigInt(transaction.nonce)) {
                throw new Error(
                    t(
                        `${translationKey}.${isNew ? 'nonceConsumed' : 'replaced'}`,
                    ),
                );
            }
            if (
                isNew &&
                BigInt(nextNonce.nextNonce) !== BigInt(transaction.nonce)
            ) {
                throw new Error(t(`${translationKey}.nonceContested`));
            }
            const { EthSafeSignature, EthSafeTransaction } = await import(
                '@safe-global/protocol-kit'
            );
            const protocolKit = await getProtocolKit(report.ownerAddress);
            const [owners, threshold] = await Promise.all([
                protocolKit.getOwners(),
                protocolKit.getThreshold(),
            ]);
            if (
                !owners.some((owner) =>
                    addressUtils.isAddressEqual(owner, report.ownerAddress),
                )
            ) {
                throw new Error(t(`${translationKey}.authorityChanged`));
            }
            transaction = applyAuthority(transaction, owners, threshold);
            const envelope =
                safeTransactionEnvelopeUtils.getEnvelope(transaction);
            const safeTransaction = new EthSafeTransaction({
                ...envelope,
                nonce: Number(envelope.nonce),
            });
            const safeTxHash = (await protocolKit.getTransactionHash(
                safeTransaction,
            )) as Hex;
            if (
                safeTxHash.toLowerCase() !==
                    transaction.safeTxHash.toLowerCase() ||
                safeTxHash.toLowerCase() !==
                    report.transaction.safeTxHash.toLowerCase()
            ) {
                throw new Error(t(`${translationKey}.hashMismatch`));
            }
            const signatures = transaction.confirmations.map(
                ({ owner, signature, signatureType }) =>
                    new EthSafeSignature(
                        owner,
                        signature,
                        signatureType === 'CONTRACT_SIGNATURE',
                    ),
            );
            const acceptedSignature = pendingSignatureRef.current;
            if (
                acceptedSignature != null &&
                serviceAcceptedHashRef.current?.toLowerCase() ===
                    safeTxHash.toLowerCase() &&
                !signatures.some((signature) =>
                    addressUtils.isAddressEqual(
                        signature.signer,
                        acceptedSignature.signer,
                    ),
                )
            ) {
                signatures.push(acceptedSignature);
            }
            assertWallet(report.ownerAddress, report.walletRevision);
            return {
                protocolKit,
                safeTransaction,
                safeTxHash,
                signatures,
                landsOnCurrentNonce:
                    BigInt(transaction.nonce) ===
                    BigInt(nextNonce.currentNonce),
                transaction,
                isNew,
            };
        },
        [assertWallet, externalAddress, getProtocolKit, network, t],
    );

    const prepare = useCallback(async () => {
        const walletAddress = getConnection(wagmiConfig).address;
        const walletRevision = walletRevisionRef.current;
        if (recoveryState.status === 'invalid') {
            throw new Error(recoveryState.message);
        }
        if (recoveryState.status === 'valid') {
            const transaction = recoveryTransaction(
                recoveryState.context,
                recoveryState.submittedAt,
            );
            setPrepared({
                transaction,
                isNew: false,
                landsOnCurrentNonce: false,
                bundleExecution: true,
                ownerAddress: walletAddress ?? externalAddress,
                walletRevision,
            });
            setPlan(['EXECUTE']);
            setActionStarted(true);
            submittedHashRef.current = recoveryState.hash;
            setSubmittedHash(recoveryState.hash);
            setRecoveryPending(true);
            setFlowStep('EXECUTE');
            return;
        }
        if (walletAddress == null) {
            throw new Error(t(`${translationKey}.walletChanged`));
        }
        assertWallet(walletAddress, walletRevision);
        const currentSafeInfo = await safeService.getSafeInfo({
            urlParams: { network, address: externalAddress },
        });
        if (
            !currentSafeInfo.owners.some((owner) =>
                addressUtils.isAddressEqual(owner, walletAddress),
            )
        ) {
            throw new Error(t(`${translationKey}.authorityChanged`));
        }
        if (
            !safeMultisigProposalUtils.supportsEip1271Signatures(
                currentSafeInfo.version,
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
        const nextNonce = await safeService.getSafeNextNonce({
            urlParams: { network, address: externalAddress },
        });
        let transaction = reviewSeedRef.current;
        const isNew = transaction == null;
        if (transaction != null) {
            const exact = await findTransaction({
                network,
                address: externalAddress,
                safeTxHash: transaction.safeTxHash,
            });
            if (exact == null) {
                throw new Error(t(`${translationKey}.reportUnavailable`));
            }
            transaction = exact;
        } else {
            const protocolKit = await getProtocolKit(walletAddress);
            const reportData =
                safeMultisigTransactionUtils.buildReportProposalResultData({
                    proposalId: proposal.proposalIndex,
                    stageId: stage.stageIndex,
                    resultType: isVeto
                        ? SppProposalType.VETO
                        : SppProposalType.APPROVAL,
                });
            const safeTransaction = await protocolKit.createTransaction({
                transactions: [
                    {
                        to: proposal.pluginAddress,
                        value: '0',
                        data: reportData,
                    },
                ],
                onlyCalls: true,
                options: { nonce: Number(nextNonce.nextNonce) },
            });
            transaction = {
                ...safeTransaction.data,
                nonce: safeTransaction.data.nonce.toString(),
                safeTxHash:
                    await protocolKit.getTransactionHash(safeTransaction),
                from: walletAddress,
                confirmations: [],
                confirmationsRequired: currentSafeInfo.threshold,
                signatures: null,
                isExecuted: false,
                isSuccessful: null,
                submissionDate: new Date().toISOString(),
            };
        }
        assertWallet(walletAddress, walletRevision);
        const normalizedTransaction = applyAuthority(
            transaction,
            currentSafeInfo.owners,
            currentSafeInfo.threshold,
        );
        const landsOnCurrentNonce =
            BigInt(normalizedTransaction.nonce) ===
            BigInt(nextNonce.currentNonce);
        const preparedReport: IPreparedReport = {
            transaction: normalizedTransaction,
            isNew,
            landsOnCurrentNonce,
            bundleExecution,
            ownerAddress: walletAddress,
            walletRevision,
            safeVersion: currentSafeInfo.version,
        };
        setWalletChanged(false);
        setPrepared(preparedReport);
        const nextPlan = getSafePlan({
            transaction: normalizedTransaction,
            owner: walletAddress,
            signatureCount: normalizedTransaction.confirmations.length,
            ownerSigned: false,
            landsOnCurrentNonce,
            bundleExecution,
        });
        setPlan(nextPlan);
        setFlowStep(nextPlan[0]);
        if (nextPlan.length === 0) {
            setIsComplete(true);
        }
    }, [
        assertWallet,
        bundleExecution,
        externalAddress,
        getProtocolKit,
        network,
        proposal.pluginAddress,
        proposal.proposalIndex,
        recoveryState,
        requiredChainId,
        stage.stageIndex,
        t,
        isVeto,
    ]);
    const runPreparation = useCallback(() => {
        clearError();
        setPrepareError(undefined);
        setIsPreparing(true);
        track('transaction_start', 'prepare');
        const run = () => {
            void prepare()
                .catch((prepareError) => {
                    setPrepareError(errorMessage(prepareError));
                    fail('PREPARE_REVIEW', prepareError);
                })
                .finally(() => setIsPreparing(false));
        };
        if (recoveryState.status === 'none') {
            withNetworkSwitch(run);
        } else {
            run();
        }
    }, [
        clearError,
        fail,
        prepare,
        recoveryState.status,
        track,
        withNetworkSwitch,
    ]);

    useEffect(() => {
        if (
            preparationStartedRef.current ||
            (walletPending && recoveryState.status === 'none')
        ) {
            return;
        }
        preparationStartedRef.current = true;
        runPreparation();
    }, [recoveryState.status, runPreparation, walletPending]);

    const reconcile = useCallback(
        (safeTxHash: string) =>
            findTransaction({
                network,
                address: externalAddress,
                safeTxHash,
            }),
        [externalAddress, network],
    );

    const refreshAfterAccepted = useCallback(() => {
        void Promise.resolve()
            .then(() => onSafeStateChange?.())
            .catch(() => undefined);
    }, [onSafeStateChange]);

    const handleSignSubmit = useCallback(async () => {
        if (prepared == null || reviewGateBlocked || recoveryPending) {
            return;
        }
        setActionStarted(true);
        clearError();
        track('transaction_stage', 'sign');
        setWorkingStep('SIGN_SUBMIT');
        setSignSubmitPhase('reconciling');
        try {
            const owner = prepared.ownerAddress;
            let signature = pendingSignatureRef.current;
            let exact = await reconcile(prepared.transaction.safeTxHash);
            const ownerAccepted =
                serviceAcceptedHashRef.current?.toLowerCase() ===
                    prepared.transaction.safeTxHash.toLowerCase() ||
                (exact != null &&
                    hasOwnerSignature(exact, owner, signature?.data));
            if (serviceWriteUncertainRef.current && !ownerAccepted) {
                throw new Error(
                    t(`${translationKey}.serviceAcceptanceUnknown`),
                );
            }
            const report =
                exact == null
                    ? prepared
                    : { ...prepared, transaction: exact, isNew: false };
            let context = await buildFreshContext(report);
            const livePlan = getSafePlan({
                transaction: context.transaction,
                owner,
                signatureCount: context.signatures.length,
                ownerSigned: context.signatures.some((item) =>
                    addressUtils.isAddressEqual(item.signer, owner),
                ),
                landsOnCurrentNonce: context.landsOnCurrentNonce,
                bundleExecution: prepared.bundleExecution,
            });
            const plannedSign = plan?.includes('SIGN_SUBMIT') ?? false;
            const plannedExecute = plan?.includes('EXECUTE') ?? false;
            if (livePlan.includes('SIGN_SUBMIT') && !plannedSign) {
                setPlanDiverged(true);
                fail(
                    'SIGN_SUBMIT',
                    new Error(t(`${dialogTranslationKey}.planChanged`)),
                    t(`${dialogTranslationKey}.planChanged`),
                );
                return;
            }
            if (!livePlan.includes('SIGN_SUBMIT')) {
                setSignatureNotNeeded(plannedSign);
                serviceAcceptedHashRef.current =
                    exact?.safeTxHash ?? context.safeTxHash;
                serviceWriteUncertainRef.current = false;
                setPrepared({
                    ...report,
                    transaction: context.transaction,
                    isNew: false,
                });
                refreshAfterAccepted();
                if (livePlan.includes('EXECUTE') && plannedExecute) {
                    setFlowStep('EXECUTE');
                } else {
                    track('transaction_end', 'service_accepted');
                    setIsComplete(true);
                }
                return;
            }
            if (!ownerAccepted) {
                if (signature == null) {
                    assertWallet(owner, prepared.walletRevision);
                    setSignSubmitPhase('signing');
                    signature = await context.protocolKit.signTypedData(
                        context.safeTransaction,
                    );
                    pendingSignatureRef.current = signature;
                    setSignSubmitPhase('submitting');
                    context = await buildFreshContext(report);
                }
                assertWallet(owner, prepared.walletRevision);
                setSignSubmitPhase('submitting');
                try {
                    if (context.isNew) {
                        await proposeTransaction({
                            urlParams: { network, address: externalAddress },
                            body: {
                                safeTransactionData:
                                    context.safeTransaction.data,
                                safeTxHash: context.safeTxHash,
                                senderAddress: owner,
                                senderSignature: signature.data,
                                origin: 'Aragon',
                            },
                        });
                    } else {
                        await confirmTransaction({
                            urlParams: {
                                network,
                                safeTxHash: context.safeTxHash,
                            },
                            body: { signature: signature.data },
                        });
                    }
                } catch (writeError) {
                    serviceWriteUncertainRef.current = !(
                        writeError instanceof SafeServiceError &&
                        writeError.status >= 400 &&
                        writeError.status < 500 &&
                        writeError.status !== 408 &&
                        writeError.status !== 409
                    );
                    if (SafeServiceError.isRateLimitedError(writeError)) {
                        throw writeError;
                    }
                    exact = await reconcile(context.safeTxHash);
                    if (
                        exact == null ||
                        !hasOwnerSignature(exact, owner, signature.data)
                    ) {
                        throw writeError;
                    }
                }
            }
            // Acknowledgement is recorded before cache refresh or another wallet action.
            serviceAcceptedHashRef.current = context.safeTxHash;
            serviceWriteUncertainRef.current = false;
            setPrepared({
                ...report,
                transaction: context.transaction,
                isNew: false,
            });
            refreshAfterAccepted();
            if (
                signature != null &&
                !context.signatures.some((item) =>
                    addressUtils.isAddressEqual(item.signer, signature.signer),
                )
            ) {
                context.signatures.push(signature);
            }
            const nextPlan = getSafePlan({
                transaction: context.transaction,
                owner,
                signatureCount: context.signatures.length,
                ownerSigned: context.signatures.some((item) =>
                    addressUtils.isAddressEqual(item.signer, owner),
                ),
                landsOnCurrentNonce: context.landsOnCurrentNonce,
                bundleExecution: prepared.bundleExecution,
            });
            if (nextPlan.includes('EXECUTE') && !plannedExecute) {
                setPlanDiverged(true);
                fail(
                    'SIGN_SUBMIT',
                    new Error(t(`${dialogTranslationKey}.planChanged`)),
                    t(`${dialogTranslationKey}.planChanged`),
                );
                return;
            }
            if (nextPlan.includes('EXECUTE') && plannedExecute) {
                setFlowStep('EXECUTE');
            } else {
                track('transaction_end', 'service_accepted');
                setIsComplete(true);
            }
        } catch (signError) {
            fail(
                'SIGN_SUBMIT',
                signError,
                isWalletRejection(signError)
                    ? t(`${translationKey}.walletRejected`)
                    : undefined,
            );
        } finally {
            refreshAfterAccepted();
            setWorkingStep(undefined);
        }
    }, [
        assertWallet,
        buildFreshContext,
        clearError,
        confirmTransaction,
        externalAddress,
        fail,
        plan,
        prepared,
        proposeTransaction,
        reconcile,
        refreshAfterAccepted,
        recoveryPending,
        reviewGateBlocked,
        t,
        track,
        network,
    ]);

    const verifyEffect = useCallback(
        (receipt: {
            logs: readonly { address: string; topics: readonly string[] }[];
        }) =>
            receipt.logs.some(
                (log) =>
                    addressUtils.isAddressEqual(
                        log.address,
                        proposal.pluginAddress,
                    ) &&
                    log.topics[0] === proposalResultReportedTopic &&
                    log.topics[1] ===
                        pad(numberToHex(BigInt(proposal.proposalIndex))) &&
                    log.topics[2] === pad(numberToHex(stage.stageIndex)),
            ),
        [proposal.pluginAddress, proposal.proposalIndex, stage.stageIndex],
    );
    const finishExecution = useCallback(
        (result: ISafeExecutionOutcomeReport) => {
            if (result.result === SafeExecutionResult.EXECUTED) {
                submittedHashRef.current = undefined;
                setRecoveryPending(false);
                setSubmittedHash(undefined);
                setExecutionSucceeded(true);
                setIsComplete(true);
                track('transaction_end', 'executed');
                void Promise.resolve()
                    .then(() => onExecuted?.(result.hash))
                    .catch(() => undefined);
                return;
            }
            if (result.result === SafeExecutionResult.EFFECT_MISSING) {
                pendingTransactionManager.clear(intentId);
                submittedHashRef.current = undefined;
                setRecoveryPending(false);
                setSubmittedHash(undefined);
                setTerminalFailure(true);
                fail(
                    'EXECUTE',
                    t(`${translationKey}.executionRecordedNothing`),
                );
                return;
            }
            if (result.result === SafeExecutionResult.FAILED) {
                if (result.outcome === SafeExecutionOutcome.UNMATCHED) {
                    setRecoveryPending(true);
                    setSubmittedHash(result.hash);
                    submittedHashRef.current = result.hash;
                    fail('EXECUTE', t(`${translationKey}.executionPending`));
                    return;
                }
                pendingTransactionManager.clear(intentId);
                submittedHashRef.current = undefined;
                setRecoveryPending(false);
                setSubmittedHash(undefined);
                if (result.outcome === SafeExecutionOutcome.EXECUTION_FAILURE) {
                    setTerminalFailure(true);
                }
                if (recoveryState.status === 'valid') {
                    setWalletChanged(true);
                }
                fail(
                    'EXECUTE',
                    t(
                        `${translationKey}.${result.outcome === SafeExecutionOutcome.EXECUTION_FAILURE ? 'executionInnerFailed' : 'executionReverted'}`,
                    ),
                );
                return;
            }
            pendingTransactionManager.clear(intentId);
            submittedHashRef.current = undefined;
            setRecoveryPending(false);
            setSubmittedHash(undefined);
            fail(
                'EXECUTE',
                t(
                    `${translationKey}.${
                        result.result === SafeExecutionResult.AUTHORITY_CHANGED
                            ? 'authorityChanged'
                            : 'executionRejected'
                    }`,
                ),
            );
        },
        [fail, intentId, onExecuted, recoveryState.status, t, track],
    );
    const handleExecute = useCallback(async () => {
        if (prepared == null || (!recoveryPending && reviewGateBlocked)) {
            return;
        }
        setActionStarted(true);
        clearError();
        track('transaction_stage', 'execute');
        setWorkingStep('EXECUTE');
        let recovery: ISafeRecoveryContext | undefined;
        try {
            const stored = pendingTransactionManager.get(intentId);
            if (stored?.recovery != null) {
                const context = parseSafeRecoveryContext(stored.recovery);
                if (
                    context == null ||
                    context.chainId !== stored.chainId ||
                    context.safeAddress.toLowerCase() !==
                        externalAddress.toLowerCase() ||
                    context.chainId !== requiredChainId ||
                    context.proposal.proposalId !== proposal.id ||
                    !addressUtils.isAddressEqual(
                        context.proposal.pluginAddress,
                        proposal.pluginAddress,
                    ) ||
                    context.proposal.stageIndex !== stage.stageIndex
                ) {
                    throw new Error(
                        t(`${translationKey}.recoveryContextMismatch`),
                    );
                }
                recovery = context;
                setRecoveryPending(true);
                let hash = stored.hash;
                if (hash == null) {
                    const exact = await reconcile(context.safeTxHash);
                    if (
                        exact == null ||
                        !exact.isExecuted ||
                        !isHex(exact.transactionHash) ||
                        exact.transactionHash.length !== 66
                    ) {
                        throw new Error(
                            t(`${translationKey}.executionSubmissionUnknown`),
                        );
                    }
                    const envelope =
                        safeTransactionEnvelopeUtils.getEnvelope(exact);
                    const matchesReview = Object.entries(
                        context.reviewedTx,
                    ).every(
                        ([key, value]) =>
                            String(
                                envelope[key as keyof typeof envelope],
                            ).toLowerCase() === String(value).toLowerCase(),
                    );
                    if (!matchesReview) {
                        throw new Error(
                            t(`${translationKey}.recoveryContextMismatch`),
                        );
                    }
                    hash = exact.transactionHash;
                    pendingTransactionManager.registerSubmitted(
                        intentId,
                        {
                            hash,
                            chainId: context.chainId,
                            submittedAt: stored.submittedAt,
                        },
                        {
                            type: intentType,
                            scope: intentScope,
                            recovery: { ...context },
                        },
                    );
                }
                submittedHashRef.current = hash;
                setSubmittedHash(hash);
                setExecutionPhase('verifying');
                const result = await resume({
                    hash,
                    safeTxHash: context.safeTxHash,
                    safeAddress: context.safeAddress,
                    chainId: context.chainId,
                    verifyEffect,
                });
                finishExecution(result);
                return;
            }
            if (terminalFailure) {
                throw new Error(t(`${translationKey}.executionTerminal`));
            }
            submittedHashRef.current = undefined;
            setSubmittedHash(undefined);
            setRecoveryPending(false);
            const context = await buildFreshContext(prepared);
            if (!context.landsOnCurrentNonce) {
                throw new Error(t(`${translationKey}.nonceNotCurrent`));
            }
            const executionRecovery = {
                safeAddress: externalAddress as Hex,
                chainId: requiredChainId,
                safeTxHash: context.safeTxHash,
                reviewedTx: safeTransactionEnvelopeUtils.getEnvelope(
                    context.transaction,
                ),
                proposal: {
                    proposalId: proposal.id,
                    pluginAddress: proposal.pluginAddress as Hex,
                    stageIndex: stage.stageIndex,
                },
            } satisfies ISafeRecoveryContext;
            recovery = executionRecovery;
            setExecutionPhase('wallet');
            const result = await execute({
                protocolKit: context.protocolKit,
                safeTransaction: context.safeTransaction,
                safeTxHash: context.safeTxHash,
                safeAddress: externalAddress,
                chainId: requiredChainId,
                signatures: context.signatures,
                verifyEffect,
                beforeSubmit: () =>
                    assertWallet(
                        prepared.ownerAddress,
                        prepared.walletRevision,
                    ),
                onSubmitted: (hash) => {
                    submittedHashRef.current = hash;
                    setSubmittedHash(hash);
                    setExecutionPhase('confirming');
                    setRecoveryPending(true);
                    pendingTransactionManager.registerSubmitted(
                        intentId,
                        { hash, chainId: requiredChainId },
                        {
                            type: intentType,
                            scope: intentScope,
                            recovery: executionRecovery,
                        },
                    );
                },
            });
            setExecutionPhase('verifying');
            finishExecution(result);
        } catch (executionError) {
            const hash =
                executionError instanceof SafeExecutionPendingError
                    ? executionError.hash
                    : submittedHashRef.current;
            if (hash != null) {
                setExecutionPhase('confirming');
            }
            if (recovery != null) {
                if (
                    hash != null &&
                    pendingTransactionManager.get(intentId)?.hash !== hash
                ) {
                    pendingTransactionManager.registerSubmitted(
                        intentId,
                        { hash, chainId: requiredChainId },
                        {
                            type: intentType,
                            scope: intentScope,
                            recovery: { ...recovery },
                        },
                    );
                } else if (
                    executionError instanceof SafeExecutionSubmissionError
                ) {
                    pendingTransactionManager.registerSubmissionUncertain(
                        intentId,
                        { chainId: requiredChainId },
                        {
                            type: intentType,
                            scope: intentScope,
                            recovery: { ...recovery },
                        },
                    );
                }
            }
            if (pendingTransactionManager.get(intentId)?.recovery != null) {
                setRecoveryPending(true);
                fail(
                    'EXECUTE',
                    executionError,
                    t(
                        `${translationKey}.${hash == null ? 'executionSubmissionUnknown' : 'executionPending'}`,
                    ),
                );
            } else {
                fail(
                    'EXECUTE',
                    executionError,
                    isWalletRejection(executionError)
                        ? t(`${translationKey}.executionWalletRejected`)
                        : undefined,
                );
            }
        } finally {
            refreshAfterAccepted();
            setWorkingStep(undefined);
        }
    }, [
        assertWallet,
        buildFreshContext,
        clearError,
        execute,
        externalAddress,
        fail,
        finishExecution,
        intentId,
        intentScope,
        prepared,
        proposal.id,
        proposal.pluginAddress,
        reconcile,
        recoveryPending,
        refreshAfterAccepted,
        requiredChainId,
        resume,
        reviewGateBlocked,
        stage.stageIndex,
        t,
        terminalFailure,
        track,
        verifyEffect,
    ]);

    const restartReview = useCallback(async () => {
        let transaction = prepared?.isNew ? undefined : prepared?.transaction;
        if (serviceWriteUncertainRef.current && prepared != null) {
            setWorkingStep('SIGN_SUBMIT');
            clearError();
            try {
                const exact = await reconcile(prepared.transaction.safeTxHash);
                if (
                    exact == null ||
                    !hasOwnerSignature(
                        exact,
                        prepared.ownerAddress,
                        pendingSignatureRef.current?.data,
                    )
                ) {
                    throw new Error(
                        t(`${translationKey}.serviceAcceptanceUnknown`),
                    );
                }
                transaction = exact;
            } catch (reconciliationError) {
                fail('SIGN_SUBMIT', reconciliationError);
                return;
            } finally {
                setWorkingStep(undefined);
            }
        }
        reviewSeedRef.current = transaction;
        pendingSignatureRef.current = undefined;
        serviceAcceptedHashRef.current = undefined;
        serviceWriteUncertainRef.current = false;
        setPrepared(undefined);
        setPlan(undefined);
        setPrepareError(undefined);
        setIsPreparing(true);
        setReviewGateBlocked(true);
        setSignatureNotNeeded(false);
        setActionStarted(false);
        setPlanDiverged(false);
        setIsComplete(false);
        setExecutionSucceeded(false);
        setTerminalFailure(false);
        setWalletChanged(false);
        setFlowStep(undefined);
        clearError();
        preparationStartedRef.current = true;
        runPreparation();
    }, [clearError, fail, prepared, reconcile, runPreparation, t]);

    const activeStep = stepper.activeStep;
    const requiresReview =
        (walletChanged || planDiverged) &&
        prepared != null &&
        !recoveryPending &&
        !isComplete;
    const numberedSteps = plan ?? [];

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (flowStep != null && numberedSteps.includes(flowStep)) {
                stepper.updateActiveStep(flowStep);
            }
        }, 0);
        return () => clearTimeout(timeout);
    }, [flowStep, numberedSteps, stepper]);

    const executionUnavailable =
        isComplete &&
        plan?.includes('EXECUTE') === true &&
        !executionSucceeded &&
        !recoveryPending;
    const customSteps = useMemo<ITransactionDialogStep<SafeStep>[]>(() => {
        const getState = (
            step: NumberedSafeStep,
        ): ITransactionStatusStepMeta['state'] => {
            if (requiresReview && step === activeStep) {
                return 'error';
            }
            if (errorStep === step) {
                return 'error';
            }
            if (workingStep === step) {
                return 'pending';
            }
            if (step === 'SIGN_SUBMIT') {
                if (signatureNotNeeded) {
                    return 'warning';
                }
                return flowStep === 'EXECUTE' || isComplete
                    ? 'success'
                    : 'idle';
            }
            if (executionUnavailable) {
                return 'warning';
            }
            if (executionSucceeded) {
                return 'success';
            }
            return terminalFailure ? 'error' : 'idle';
        };
        const actionFor = (step: NumberedSafeStep) => {
            if (requiresReview) {
                return restartReview;
            }
            if (step === 'SIGN_SUBMIT') {
                return () => {
                    clearError();
                    withNetworkSwitch(() => void handleSignSubmit());
                };
            }
            return () => {
                clearError();
                const runExecute = () => void handleExecute();
                if (pendingTransactionManager.get(intentId)?.recovery == null) {
                    withNetworkSwitch(runExecute);
                } else {
                    runExecute();
                }
            };
        };
        const failedStep = requiresReview ? activeStep : errorStep;
        const failedLabel =
            errorLabel ??
            (requiresReview ? t(`${translationKey}.walletChanged`) : undefined);
        const walletAddon = {
            label: t('app.shared.transactionDialog.step.APPROVE.addon'),
            icon: IconType.BLOCKCHAIN_WALLET,
        };
        return numberedSteps.map((step, order) => ({
            id: step,
            order,
            meta: {
                label: t(
                    `app.safe.safeProposalTransactionDialog.steps.${
                        step === 'SIGN_SUBMIT' && workingStep === step
                            ? signSubmitPhase
                            : step === 'EXECUTE' && workingStep === step
                              ? executionPhase === 'wallet'
                                  ? 'wallet_approval'
                                  : executionPhase === 'confirming'
                                    ? 'chain_confirmation'
                                    : 'result_verification'
                              : step.toLowerCase()
                    }`,
                ),
                state: getState(step),
                errorLabel: failedStep === step ? failedLabel : undefined,
                warningLabel:
                    step === 'SIGN_SUBMIT' && signatureNotNeeded
                        ? t(`${dialogTranslationKey}.signatureNotNeeded`)
                        : step === 'EXECUTE' && executionUnavailable
                          ? t(`${dialogTranslationKey}.executionUnavailable`)
                          : undefined,
                action: actionFor(step),
                addon:
                    workingStep === step &&
                    ((step === 'SIGN_SUBMIT' &&
                        signSubmitPhase === 'signing') ||
                        (step === 'EXECUTE' &&
                            executionPhase === 'wallet' &&
                            submittedHash == null))
                        ? walletAddon
                        : undefined,
            },
        }));
    }, [
        activeStep,
        clearError,
        errorLabel,
        errorStep,
        executionSucceeded,
        executionUnavailable,
        flowStep,
        handleExecute,
        handleSignSubmit,
        intentId,
        isComplete,
        numberedSteps,
        requiresReview,
        restartReview,
        signatureNotNeeded,
        signSubmitPhase,
        submittedHash,
        t,
        terminalFailure,
        withNetworkSwitch,
        executionPhase,
        workingStep,
    ]);

    const primaryStepLabel = requiresReview
        ? t(`${dialogTranslationKey}.actions.review`)
        : recoveryPending
          ? t(`${dialogTranslationKey}.actions.resume`)
          : flowStep === 'SIGN_SUBMIT'
            ? t(`${dialogTranslationKey}.actions.sign_submit`)
            : t(`${dialogTranslationKey}.actions.execute`);
    const gateBlocksAction =
        !requiresReview &&
        !recoveryPending &&
        reviewGateBlocked &&
        flowStep != null;
    const primaryDisabled =
        !isComplete &&
        (activeStep !== flowStep ||
            workingStep != null ||
            (walletPending && !recoveryPending) ||
            retryAt != null ||
            gateBlocksAction ||
            terminalFailure);
    const currentStepIndex =
        flowStep == null ? -1 : numberedSteps.indexOf(flowStep);

    const retryPreparation = useCallback(() => {
        preparationStartedRef.current = true;
        setPrepared(undefined);
        setPlan(undefined);
        setPrepareError(undefined);
        setIsPreparing(true);
        runPreparation();
    }, [runPreparation]);

    if (plan == null || prepared == null) {
        return (
            <>
                <Dialog.Header
                    description={t(
                        'app.safe.safeProposalTransactionDialog.description',
                    )}
                    title={t('app.safe.safeProposalTransactionDialog.title')}
                />
                <Dialog.Content>
                    <div className="flex flex-col gap-4 pb-3 md:pb-4">
                        {isPreparing ? (
                            <>
                                <StateSkeletonBar size="lg" width="60%" />
                                <StateSkeletonBar size="lg" width="90%" />
                                <StateSkeletonBar size="lg" width="75%" />
                            </>
                        ) : (
                            <AlertCard
                                message={t(
                                    `${dialogTranslationKey}.loadingError`,
                                )}
                                variant="critical"
                            >
                                {prepareError}
                            </AlertCard>
                        )}
                    </div>
                </Dialog.Content>
                <Dialog.Footer
                    primaryAction={{
                        label: isPreparing
                            ? t(`${dialogTranslationKey}.actions.loading`)
                            : t('app.shared.transactionDialog.footer.retry'),
                        onClick: isPreparing ? undefined : retryPreparation,
                        disabled: isPreparing,
                        isLoading: isPreparing,
                    }}
                    secondaryAction={{
                        label: t('app.shared.transactionDialog.footer.cancel'),
                        onClick: () => close(location.id),
                    }}
                />
            </>
        );
    }

    return (
        <TransactionDialog
            completion={{
                label: t('app.safe.safeProposalTransactionDialog.completion'),
                onClick: () => close(location.id),
            }}
            customSteps={customSteps}
            description={t(
                'app.safe.safeProposalTransactionDialog.description',
            )}
            disableCancel={workingStep != null && !recoveryPending}
            isComplete={isComplete}
            mode="custom"
            network={network}
            onDismiss={() => close(location.id)}
            primaryActionDisabled={primaryDisabled}
            showStatus={actionStarted || isComplete}
            stepper={stepper}
            submitLabel={primaryStepLabel}
            title={t('app.safe.safeProposalTransactionDialog.title')}
            transactionInfo={{
                title: t(
                    'app.safe.safeProposalTransactionDialog.transactionInfo',
                ),
                current: currentStepIndex < 0 ? 1 : currentStepIndex + 1,
                total: numberedSteps.length,
            }}
        >
            <div className="flex flex-col gap-3">
                <SafeTransactionReviewContent
                    costNote={reviewCostNote}
                    intent={reviewIntent}
                    network={network}
                    onGateChange={setReviewGateBlocked}
                    safeAddress={externalAddress}
                    safeVersion={prepared.safeVersion}
                    transaction={prepared.transaction}
                />
                {isComplete && (
                    <div className="text-neutral-700 text-sm">
                        {t(
                            `${dialogTranslationKey}.${
                                executionSucceeded
                                    ? 'executionVerified'
                                    : 'confirmationRecorded'
                            }`,
                        )}
                    </div>
                )}
                {executionUnavailable && (
                    <AlertCard
                        message={t(
                            `${dialogTranslationKey}.executionUnavailable`,
                        )}
                        variant="warning"
                    />
                )}
                {recoveryPending && (
                    <AlertCard
                        message={t(
                            `${dialogTranslationKey}.${
                                submittedHash == null
                                    ? 'submissionUnknown'
                                    : 'recoveryPending'
                            }`,
                        )}
                        variant="warning"
                    />
                )}
            </div>
        </TransactionDialog>
    );
};
