import { ProposalStatus } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Wagmi from 'wagmi';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import * as permissionCheckGuardApi from '@/modules/governance/hooks/usePermissionCheckGuard';
import { SafeDialogId } from '@/modules/safe/constants';
import type { ISafeProposalTransactionDialogParams } from '@/modules/safe/dialogs/safeProposalTransactionDialog';
import {
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { Network } from '@/shared/api/daoService';
import * as transactionServiceApi from '@/shared/api/transactionService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import * as networkSwitchApi from '@/shared/hooks/useNetworkSwitch';
import { generateDialogContext } from '@/shared/testUtils';
import { pendingTransactionManager } from '@/shared/utils/pendingTransactionManager';
import { safeIndexingTimeout } from '../../constants';
import * as safeBodyStateApi from '../../hooks/useSafeMultisigBodyState';
import {
    generateSafeBodyState,
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { SafeTransactionState } from '../../types';
import {
    type ISafeMultisigSubmitVoteProps,
    SafeMultisigSubmitVote,
} from './safeMultisigSubmitVote';

describe('<SafeMultisigSubmitVote /> component', () => {
    const owner = '0x0000000000000000000000000000000000000011';
    const nonOwner = '0x0000000000000000000000000000000000000099';
    const safeAddress = '0x0000000000000000000000000000000000000001';
    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );
    const usePermissionCheckGuardSpy = jest.spyOn(
        permissionCheckGuardApi,
        'usePermissionCheckGuard',
    );
    const useNetworkSwitchSpy = jest.spyOn(
        networkSwitchApi,
        'useNetworkSwitch',
    );
    const useSafeBodyStateSpy = jest.spyOn(
        safeBodyStateApi,
        'useSafeMultisigBodyState',
    );
    const useTransactionStatusSpy = jest.spyOn(
        transactionServiceApi,
        'useTransactionStatus',
    );
    const dialogOpen = jest.fn();
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );
    const useBytecodeSpy = jest.spyOn(Wagmi, 'useBytecode');

    const safeInfo = generateSafeInfo({
        address: safeAddress,
        threshold: 1,
        owners: [owner],
    });
    const baseState = generateSafeBodyState({
        safeInfo,
        minApprovals: 1,
        membersCount: 1,
    });
    const proposal = generateSppProposal({
        id: 'proposal-id',
        network: Network.ETHEREUM_SEPOLIA,
        pluginAddress: '0x0000000000000000000000000000000000000021',
        proposalIndex: '0',
    });
    const stage = generateSppStage({ stageIndex: 1 });
    const intentId = `safe-proposal:${proposal.network}:${safeAddress.toLowerCase()}:${proposal.id}:${stage.stageIndex}:vote`;
    const recoveryHash = `0x${'4'.repeat(64)}` as `0x${string}`;

    const clickVoteAction = async (
        route:
            | 'approveAndExecute'
            | 'approveOnly'
            | 'vetoAndExecute'
            | 'vetoOnly' = 'approveAndExecute',
    ) => {
        const trigger = route.startsWith('veto') ? 'veto' : 'approve';

        await userEvent.click(
            screen.getByRole('button', {
                name: `app.plugins.safeMultisig.safeMultisigSubmitVote.${trigger}`,
            }),
        );
        await userEvent.click(
            screen.getByRole('menuitem', {
                name: `app.plugins.safeMultisig.safeMultisigSubmitVote.${route}`,
            }),
        );
    };

    const createTestComponent = (
        props?: Partial<ISafeMultisigSubmitVoteProps>,
        queryClient = new QueryClient(),
    ) => {
        const completeProps: ISafeMultisigSubmitVoteProps = {
            daoId: 'dao-id',
            proposal,
            externalAddress: safeAddress,
            stage,
            isVeto: false,
            ...props,
        };

        return (
            <QueryClientProvider client={queryClient}>
                <SafeMultisigSubmitVote {...completeProps} />
            </QueryClientProvider>
        );
    };

    const renderCard = (
        props?: Partial<ISafeMultisigSubmitVoteProps>,
        queryClient?: QueryClient,
    ) => render(createTestComponent(props, queryClient));

    const lastDialogParams = (): ISafeProposalTransactionDialogParams => {
        const [, options] = dialogOpen.mock.calls.at(-1) as [
            SafeDialogId,
            { params: ISafeProposalTransactionDialogParams },
        ];
        return options.params;
    };

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: owner,
            chainId: 11_155_111,
            isConnecting: false,
            isReconnecting: false,
        });
        usePermissionCheckGuardSpy.mockReturnValue({
            check: ({ onSuccess } = {}) => onSuccess?.(),
            result: true,
        });
        useNetworkSwitchSpy.mockReturnValue({
            requiredChainId: 11_155_111,
            isCrossNetworkTransaction: false,
            networkName: 'Sepolia',
            switchChainStatus: 'idle',
            withNetworkSwitch: (callback) => callback(),
        });
        useSafeBodyStateSpy.mockReturnValue(baseState);
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: dialogOpen }),
        );
        useBytecodeSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as ReturnType<typeof Wagmi.useBytecode>);
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: () => true,
        } as unknown as ReturnType<
            typeof featureFlagsProvider.useFeatureFlags
        >);
        useTransactionStatusSpy.mockReturnValue({ data: undefined } as never);
        dialogOpen.mockReset();
        pendingTransactionManager.clearActive();
    });

    afterEach(() => {
        pendingTransactionManager.clearActive();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('states that the Safe can still act after the voting window closed', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            canStillAffectOutcome: true,
        });

        renderCard({
            stage: generateSppStage({
                stageIndex: 1,
                voteDuration: 60,
                maxAdvance: 60 * 60 * 24,
            }),
            proposal: generateSppProposal({
                network: Network.ETHEREUM_SEPOLIA,
                stageIndex: 1,
                lastStageTransition: Math.floor(Date.now() / 1000) - 3600,
            }),
        });

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.stillCounts',
            ),
        ).toBeInTheDocument();
    });

    it('withholds the action and names the expiry once the stage can never advance', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            canStillAffectOutcome: false,
        });

        renderCard();

        expect(
            screen.queryByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.stageExpired',
            ),
        ).toBeInTheDocument();
    });

    it('says a recorded result had no effect when the stage had already advanced', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            settledResultType: SppProposalType.APPROVAL,
            isStageCurrent: false,
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.recordedAfterAdvance',
            ),
        ).toBeInTheDocument();
    });

    it('does not claim a recorded result was ineffective while its stage is current', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            settledResultType: SppProposalType.APPROVAL,
            isStageCurrent: true,
        });

        renderCard();

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.recordedAfterAdvance',
            ),
        ).not.toBeInTheDocument();
    });

    it('does not call an unwritten result ineffective when the stage merely expired', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isStageCurrent: false,
            canStillAffectOutcome: false,
        });

        renderCard();

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.recordedAfterAdvance',
            ),
        ).not.toBeInTheDocument();
    });

    it('routes an ineligible wallet through the standard vote guard', async () => {
        const check = jest.fn();
        usePermissionCheckGuardSpy.mockReturnValue({
            check,
            result: false,
        });
        renderCard();

        await clickVoteAction();

        expect(check).toHaveBeenCalled();
        expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('guards the sign-only route exactly like the bundled one', async () => {
        const check = jest.fn();
        usePermissionCheckGuardSpy.mockReturnValue({
            check,
            result: false,
        });
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: 11_155_111,
            isConnecting: false,
            isReconnecting: false,
        });
        renderCard();

        await clickVoteAction('approveOnly');

        expect(check).toHaveBeenCalled();
        expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('keeps an EOA owner actionable on a pre-v1.4.1 Safe', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                address: safeAddress,
                owners: [owner],
                threshold: 1,
                version: '1.3.0',
            }),
        });

        renderCard();

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).toBeEnabled();
    });

    it('degrades explicitly for a contract owner on a pre-v1.4.1 Safe', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                address: safeAddress,
                owners: [owner],
                threshold: 1,
                version: '1.3.0',
            }),
        });
        useBytecodeSpy.mockReturnValue({
            data: '0x1234',
            isLoading: false,
        } as ReturnType<typeof Wagmi.useBytecode>);

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.versionUnsupported (version=1.3.0)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).toBeDisabled();
    });

    it('offers execution when the pending report has reached threshold', () => {
        const transaction = generateSafeMultisigTransaction({
            confirmationsRequired: 1,
            confirmations: [generateSafeConfirmation({ owner })],
        });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction,
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.LIVE,
                status: ProposalStatus.ACTIVE,
                hasNonceCompetition: false,
            },
            hasConnectedWalletSigned: true,
            approvalsAmount: 1,
            isExecutableNow: true,
        });

        renderCard();

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        ).toBeEnabled();
    });

    it('opens the shared proposal transaction dialog with the exact intent and vote params', async () => {
        renderCard();
        await clickVoteAction();

        await waitFor(() => {
            expect(dialogOpen).toHaveBeenCalledWith(
                SafeDialogId.PROPOSAL_TRANSACTION,
                expect.objectContaining({
                    params: expect.objectContaining({
                        intentId,
                        daoId: 'dao-id',
                        proposal,
                        externalAddress: safeAddress,
                        stage,
                        isVeto: false,
                        bundleExecution: true,
                        pendingTransaction: undefined,
                    }),
                }),
            );
        });
    });

    it.each([
        { route: 'approveAndExecute' as const, bundleExecution: true },
        { route: 'approveOnly' as const, bundleExecution: false },
    ])(
        'passes bundleExecution=$bundleExecution to the shared dialog',
        async ({ route, bundleExecution }) => {
            renderCard();
            await clickVoteAction(route);

            await waitFor(() => {
                expect(lastDialogParams().bundleExecution).toBe(
                    bundleExecution,
                );
            });
        },
    );

    it('routes a live queued report to the account queue', () => {
        const transaction = generateSafeMultisigTransaction({ nonce: '4' });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction,
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.LIVE,
                status: ProposalStatus.ACTIVE,
                hasNonceCompetition: false,
            },
        });

        renderCard();

        expect(
            screen.getByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.viewInAccountQueue',
            }),
        ).toHaveAttribute('href', `/safe/${proposal.network}/${safeAddress}`);
    });
    it('hides the account queue link when the Safe account page is disabled', () => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: () => false,
        } as unknown as ReturnType<
            typeof featureFlagsProvider.useFeatureFlags
        >);

        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: generateSafeMultisigTransaction({ nonce: '4' }),
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.LIVE,
                status: ProposalStatus.ACTIVE,
                hasNonceCompetition: false,
            },
        });

        renderCard();

        expect(
            screen.queryByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.viewInAccountQueue',
            }),
        ).not.toBeInTheDocument();
    });

    it('warns while another queued transaction still holds the same nonce', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: generateSafeMultisigTransaction({
                    confirmationsRequired: 2,
                    confirmations: [generateSafeConfirmation({ owner })],
                }),
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.LIVE,
                status: ProposalStatus.ACTIVE,
                hasNonceCompetition: true,
            },
            hasConnectedWalletSigned: true,
            approvalsAmount: 1,
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceShared',
            ),
        ).toBeInTheDocument();
    });

    it('withholds execution while earlier Safe transactions are still ahead', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                address: safeAddress,
                threshold: 1,
                owners: [owner],
                nonce: '4',
            }),
            pendingReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '6',
                    confirmationsRequired: 1,
                    confirmations: [generateSafeConfirmation({ owner })],
                }),
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.LIVE,
                status: ProposalStatus.ACTIVE,
                hasNonceCompetition: false,
            },
            hasConnectedWalletSigned: true,
            approvalsAmount: 1,
            isExecutableNow: false,
            nonceDistance: 2,
        });

        renderCard();

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        ).toBeDisabled();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceQueued (currentNonce=4,transactionNonce=6)',
            ),
        ).toBeInTheDocument();
    });

    it('names execution as the second gate once the threshold is met', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '0',
                    confirmationsRequired: 1,
                    confirmations: [generateSafeConfirmation({ owner })],
                }),
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.LIVE,
                status: ProposalStatus.ACTIVE,
                hasNonceCompetition: false,
            },
            hasConnectedWalletSigned: true,
            approvalsAmount: 1,
            isExecutableNow: true,
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.awaitingExecution',
            ),
        ).toBeInTheDocument();
    });

    it('offers a refresh when the Safe read is stale', () => {
        useSafeBodyStateSpy.mockReturnValue({ ...baseState, isStale: true });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.unreachable',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.refreshSafeState',
            }),
        ).toBeEnabled();
    });

    it('withholds refresh while the Safe read budget is spent', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isStale: true,
            isRateLimited: true,
            rateLimitedRetryAfter: 300,
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.budgetSpentRetry (wait=5 minutes)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.refreshSafeState',
            }),
        ).toBeNull();
    });

    it('warns when the read budget is spent even though no read is stale', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isRateLimited: true,
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.budgetSpent',
            ),
        ).toBeInTheDocument();
    });

    it('opens recovery for a known submitted hash without re-running the vote guard', async () => {
        const check = jest.fn();
        usePermissionCheckGuardSpy.mockReturnValue({
            check,
            result: false,
        });
        useWalletAccountSpy.mockReturnValue({
            address: nonOwner,
            chainId: 11_155_111,
            isConnecting: false,
            isReconnecting: false,
        });
        pendingTransactionManager.registerSubmitted(intentId, {
            hash: recoveryHash,
            chainId: 11_155_111,
        });

        renderCard();
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.resumeExecution',
            }),
        );

        expect(check).not.toHaveBeenCalled();
        expect(dialogOpen).toHaveBeenCalledWith(
            SafeDialogId.PROPOSAL_TRANSACTION,
            expect.objectContaining({
                params: expect.objectContaining({ intentId }),
            }),
        );
    });

    it('keeps the card disabled after indexing timeout when a known execution is unsettled', async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });
        renderCard();
        await user.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        );
        await user.click(
            screen.getByRole('menuitem', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approveAndExecute',
            }),
        );
        const params = lastDialogParams();

        act(() => {
            params.onExecuted?.(recoveryHash);
        });
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.finalizing',
            }),
        ).toBeDisabled();

        await act(async () => {
            await jest.advanceTimersByTimeAsync(safeIndexingTimeout);
        });

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.indexingDelayed',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).toBeDisabled();
    });

    it('does not cancel the timeout when the transaction status is processed but body state is stale', async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });
        useTransactionStatusSpy.mockReturnValue({
            data: { isProcessed: true },
        } as never);
        renderCard();
        await user.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        );
        await user.click(
            screen.getByRole('menuitem', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approveAndExecute',
            }),
        );
        const params = lastDialogParams();

        act(() => {
            params.onExecuted?.(recoveryHash);
        });
        await act(async () => {
            await jest.advanceTimersByTimeAsync(safeIndexingTimeout);
        });

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.indexingDelayed',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).toBeDisabled();
    });

    it('retains recovery custody when an unrelated body settles', async () => {
        pendingTransactionManager.registerSubmitted(intentId, {
            hash: recoveryHash,
            chainId: 11_155_111,
        });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            settledResultType: SppProposalType.APPROVAL,
        });

        renderCard();

        await waitFor(() => {
            expect(pendingTransactionManager.get(intentId)).toEqual(
                expect.objectContaining({ hash: recoveryHash }),
            );
        });
    });

    it('clears attributed recovery custody after the body settles', async () => {
        const view = renderCard();
        await clickVoteAction();
        const params = lastDialogParams();
        pendingTransactionManager.registerSubmitted(intentId, {
            hash: recoveryHash,
            chainId: 11_155_111,
        });

        act(() => {
            params.onExecuted?.(recoveryHash);
        });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            settledResultType: SppProposalType.APPROVAL,
        });
        view.rerender(createTestComponent());

        await waitFor(() => {
            expect(pendingTransactionManager.get(intentId)).toBeUndefined();
        });
    });
});
