'use client';

import { addressUtils, Button, IconType } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { Hex } from 'viem';
import { useBytecode } from 'wagmi';
import {
    getBytecode,
    getConnection,
    sendTransaction,
    waitForTransactionReceipt,
} from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { ISppVotingTerminalBodyVoteDefaultProps } from '@/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyVoteDefault';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import {
    safeServiceKeys,
    useConfirmSafeTransaction,
    useProposeSafeTransaction,
} from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeTransactionState } from '../../types';
import { safeMultisigProposalUtils } from '../../utils/safeMultisigProposalUtils';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';

export interface ISafeMultisigSubmitVoteProps
    extends ISppVotingTerminalBodyVoteDefaultProps {}

interface IEip1193Provider {
    request: (args: {
        method: string;
        params?: readonly unknown[] | object;
    }) => Promise<unknown>;
}

const isEip1193Provider = (value: unknown): value is IEip1193Provider =>
    value != null &&
    typeof value === 'object' &&
    'request' in value &&
    typeof value.request === 'function';

const toSafeNonce = (nonce: string): number => {
    const parsedNonce = Number(nonce);

    if (!Number.isSafeInteger(parsedNonce) || parsedNonce < 0) {
        throw new Error('Safe nonce cannot be represented safely');
    }

    return parsedNonce;
};

const translationKey = 'app.plugins.safeMultisig.safeMultisigSubmitVote';

export const SafeMultisigSubmitVote: React.FC<ISafeMultisigSubmitVoteProps> = (
    props,
) => {
    const { proposal, externalAddress, stage, isVeto } = props;
    const { t } = useTranslations();
    const queryClient = useQueryClient();
    const { address: connectedAddress } = useWalletAccount();
    const latestConnectedAddress = useRef(connectedAddress);
    const { check: checkWalletConnection } = useConnectedWalletGuard();
    const { requiredChainId, withNetworkSwitch } = useNetworkSwitch({
        network: proposal.network,
    });
    const [actionError, setActionError] = useState<string>();
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        latestConnectedAddress.current = connectedAddress;
    }, [connectedAddress]);

    const bodyState = useSafeMultisigBodyState({
        network: proposal.network,
        address: externalAddress,
        proposal,
        stage,
    });
    const {
        safeInfo,
        pendingReport,
        hasConnectedWalletSigned,
        settledResultType,
    } = bodyState;

    const { mutateAsync: proposeTransaction } = useProposeSafeTransaction();
    const { mutateAsync: confirmTransaction } = useConfirmSafeTransaction();

    const liveReport =
        pendingReport?.state === SafeTransactionState.LIVE
            ? pendingReport
            : undefined;
    const thresholdReached =
        liveReport != null &&
        safeMultisigProposalUtils.isThresholdReached(liveReport.transaction);
    const supportsEip1271Signatures =
        safeMultisigProposalUtils.supportsEip1271Signatures(
            safeInfo?.version ?? null,
        );
    const {
        data: connectedAccountBytecode,
        isLoading: isContractOwnerCheckLoading,
    } = useBytecode({
        address: connectedAddress,
        chainId: requiredChainId,
        query: {
            enabled: connectedAddress != null && !supportsEip1271Signatures,
        },
    });
    const hasUnsupportedContractOwner =
        !supportsEip1271Signatures && connectedAccountBytecode != null;
    const hasSettled = settledResultType != null;

    const invalidateSafeState = async () => {
        if (safeInfo == null) {
            return;
        }

        const urlParams = {
            network: proposal.network,
            address: externalAddress,
        };

        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safeInfo({ urlParams }),
            }),
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safePendingTransactions({
                    urlParams,
                    queryParams: { currentNonce: safeInfo.nonce },
                }),
            }),
        ]);
    };

    const submitReport = async () => {
        const ownerAddress = latestConnectedAddress.current;

        if (safeInfo == null || ownerAddress == null) {
            return;
        }

        setActionError(undefined);
        setIsExecuting(true);

        try {
            if (!supportsEip1271Signatures) {
                const ownerBytecode = await getBytecode(wagmiConfig, {
                    address: ownerAddress,
                    chainId: requiredChainId,
                });

                if (ownerBytecode != null) {
                    setActionError(
                        t(`${translationKey}.versionUnsupported`, {
                            version:
                                safeInfo.version ??
                                t(`${translationKey}.unknownVersion`),
                        }),
                    );
                    return;
                }
            }

            const connection = getConnection(wagmiConfig);
            const provider = await connection.connector?.getProvider({
                chainId: requiredChainId,
            });

            if (!isEip1193Provider(provider)) {
                throw new Error('Connected wallet does not expose a provider');
            }

            const {
                default: Safe,
                buildSignatureBytes,
                EthSafeSignature,
                EthSafeTransaction,
            } = await import('@safe-global/protocol-kit');
            const protocolKit = await Safe.init({
                provider,
                signer: ownerAddress,
                safeAddress: externalAddress,
            });

            const resultType = isVeto
                ? SppProposalType.VETO
                : SppProposalType.APPROVAL;
            const reportData =
                safeMultisigTransactionUtils.buildReportProposalResultData({
                    proposalId: proposal.proposalIndex,
                    stageId: stage.stageIndex,
                    resultType,
                });

            let safeTransaction;
            let signatures;
            let confirmationsRequired: number;

            if (liveReport == null) {
                safeTransaction = await protocolKit.createTransaction({
                    transactions: [
                        {
                            to: proposal.pluginAddress,
                            value: '0',
                            data: reportData,
                        },
                    ],
                    onlyCalls: true,
                    options: { nonce: toSafeNonce(safeInfo.nonce) },
                });
                const safeTxHash =
                    await protocolKit.getTransactionHash(safeTransaction);
                const signature = await protocolKit.signHash(safeTxHash);

                await proposeTransaction({
                    urlParams: {
                        network: proposal.network,
                        address: externalAddress,
                    },
                    body: {
                        safeTransactionData: safeTransaction.data,
                        safeTxHash,
                        senderAddress: ownerAddress,
                        senderSignature: signature.data,
                        origin: 'Aragon',
                    },
                });

                signatures = [signature];
                confirmationsRequired = safeInfo.threshold;
            } else {
                const { transaction } = liveReport;
                safeTransaction = new EthSafeTransaction({
                    to: transaction.to,
                    value: transaction.value,
                    data: transaction.data ?? '0x',
                    operation: transaction.operation,
                    safeTxGas: transaction.safeTxGas,
                    baseGas: transaction.baseGas,
                    gasPrice: transaction.gasPrice,
                    gasToken: transaction.gasToken,
                    refundReceiver: transaction.refundReceiver,
                    nonce: toSafeNonce(transaction.nonce),
                });
                const safeTxHash =
                    await protocolKit.getTransactionHash(safeTransaction);

                if (
                    safeTxHash.toLowerCase() !==
                    transaction.safeTxHash.toLowerCase()
                ) {
                    throw new Error(
                        'Queued Safe transaction hash does not match its transaction data',
                    );
                }

                const collectedSignatures = transaction.confirmations.map(
                    ({ owner, signature, signatureType }) =>
                        new EthSafeSignature(
                            owner,
                            signature,
                            signatureType === 'CONTRACT_SIGNATURE',
                        ),
                );

                const hasEnoughCollectedSignatures =
                    collectedSignatures.length >=
                    transaction.confirmationsRequired;

                if (hasEnoughCollectedSignatures || hasConnectedWalletSigned) {
                    signatures = collectedSignatures;
                } else {
                    const signature = await protocolKit.signHash(safeTxHash);
                    await confirmTransaction({
                        urlParams: {
                            network: proposal.network,
                            safeTxHash,
                        },
                        body: { signature: signature.data },
                    });
                    signatures = [...collectedSignatures, signature];
                }

                confirmationsRequired = transaction.confirmationsRequired;
            }

            if (signatures.length >= confirmationsRequired) {
                for (const signature of signatures) {
                    safeTransaction.addSignature(signature);
                }

                const signatureBytes = buildSignatureBytes(signatures);

                if (safeTransaction.encodedSignatures() !== signatureBytes) {
                    throw new Error(
                        'Protocol Kit produced inconsistent Safe signature bytes',
                    );
                }

                const data =
                    await protocolKit.getEncodedTransaction(safeTransaction);
                const hash = await sendTransaction(wagmiConfig, {
                    chainId: requiredChainId,
                    to: externalAddress as Hex,
                    data: data as Hex,
                    value: BigInt(0),
                });
                await waitForTransactionReceipt(wagmiConfig, { hash });
            }

            await invalidateSafeState();
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    safeAddress: externalAddress,
                    proposalId: proposal.id,
                    operation: 'safe_report_proposal_result',
                },
            });
            setActionError(t(`${translationKey}.error`));
        } finally {
            setIsExecuting(false);
        }
    };

    const checkOwnershipAndSubmit = () => {
        const ownerAddress = latestConnectedAddress.current;
        const isOwner =
            ownerAddress != null &&
            safeInfo?.owners.some((owner) =>
                addressUtils.isAddressEqual(owner, ownerAddress),
            ) === true;

        if (!isOwner) {
            setActionError(t(`${translationKey}.ownerRequired`));
            return;
        }

        if (hasUnsupportedContractOwner) {
            setActionError(
                t(`${translationKey}.versionUnsupported`, {
                    version:
                        safeInfo?.version ??
                        t(`${translationKey}.unknownVersion`),
                }),
            );
            return;
        }

        withNetworkSwitch(() => void submitReport());
    };

    const handleVoteClick = () =>
        checkWalletConnection({ onSuccess: checkOwnershipAndSubmit });

    const actionKey = isVeto ? 'veto' : 'approve';
    const buttonKey = hasSettled
        ? isVeto
            ? 'vetoed'
            : 'approved'
        : thresholdReached
          ? isVeto
              ? 'executeVeto'
              : 'executeApproval'
          : actionKey;
    const isWaitingForOwners =
        liveReport != null && hasConnectedWalletSigned && !thresholdReached;

    return (
        <div className="flex w-full flex-col gap-3">
            <Button
                className="w-full md:w-fit"
                disabled={
                    hasSettled ||
                    isWaitingForOwners ||
                    hasUnsupportedContractOwner ||
                    isContractOwnerCheckLoading ||
                    safeInfo == null
                }
                iconLeft={hasSettled ? IconType.CHECKMARK : undefined}
                isLoading={isExecuting}
                onClick={hasSettled ? undefined : handleVoteClick}
                size="md"
                variant={hasSettled ? 'secondary' : 'primary'}
            >
                {t(`${translationKey}.${buttonKey}`)}
            </Button>
            {!hasSettled &&
                (hasUnsupportedContractOwner || isWaitingForOwners) && (
                    <p className="text-center font-normal text-neutral-500 text-sm leading-normal md:text-left">
                        {hasUnsupportedContractOwner
                            ? t(`${translationKey}.versionUnsupported`, {
                                  version:
                                      safeInfo?.version ??
                                      t(`${translationKey}.unknownVersion`),
                              })
                            : t(`${translationKey}.waitingForOwners`)}
                    </p>
                )}
            {actionError != null && (
                <p className="text-center text-critical-500 text-sm md:text-left">
                    {actionError}
                </p>
            )}
        </div>
    );
};
