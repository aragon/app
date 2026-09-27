import { ProposalStatus } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as permissionCheckGuardApi from '@/modules/governance/hooks/usePermissionCheckGuard';
import { SafeDialogId } from '@/modules/safe/constants';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import { generateDialogContext } from '@/shared/testUtils';
import type {
    ISafeMultisigBodyReport,
    ISafeMultisigSettledReport,
} from '../../hooks/useSafeMultisigBodyState';
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
    const safeAddress = '0x0000000000000000000000000000000000000001';
    const usePermissionCheckGuardSpy = jest.spyOn(
        permissionCheckGuardApi,
        'usePermissionCheckGuard',
    );
    const useSafeBodyStateSpy = jest.spyOn(
        safeBodyStateApi,
        'useSafeMultisigBodyState',
    );
    const dialogOpen = jest.fn();
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

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
    const executedHash = `0x${'4'.repeat(64)}` as `0x${string}`;

    const createPendingReport = (
        transaction?: Partial<ISafeMultisigTransaction>,
        overrides?: Partial<ISafeMultisigBodyReport>,
    ): ISafeMultisigBodyReport => ({
        transaction: generateSafeMultisigTransaction(transaction),
        report: {
            proposalId: BigInt(1),
            stageId: 1,
            resultType: SppProposalType.APPROVAL,
            tryAdvance: false,
        },
        state: SafeTransactionState.LIVE,
        status: ProposalStatus.ACTIVE,
        hasNonceCompetition: false,
        ...overrides,
    });

    const createSettledReport = (): ISafeMultisigSettledReport => ({
        transaction: generateSafeMultisigTransaction({
            confirmations: [generateSafeConfirmation({ owner })],
            confirmationsRequired: 1,
            isExecuted: true,
            safeTxHash: executedHash,
        }),
        report: {
            proposalId: BigInt(1),
            stageId: 1,
            resultType: SppProposalType.APPROVAL,
            tryAdvance: false,
        },
    });

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

    beforeEach(() => {
        usePermissionCheckGuardSpy.mockReturnValue({
            check: ({ onSuccess } = {}) => onSuccess?.(),
            result: true,
        });
        useSafeBodyStateSpy.mockReturnValue(baseState);
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: dialogOpen }),
        );
        useFeatureFlagsSpy.mockReturnValue({
            snapshot: [],
            setOverride: jest.fn(),
            isEnabled: () => true,
        });
        dialogOpen.mockReset();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('uses an inline alert for an advanceable stage and makes the Safe action secondary', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            canStillAffectOutcome: true,
            pendingReport: createPendingReport({ nonce: '0' }),
        });

        const advanceableStage = generateSppStage({
            stageIndex: 0,
            voteDuration: 60,
            minAdvance: 0,
            maxAdvance: 60 * 60 * 24,
            approvalThreshold: 0,
        });
        renderCard({
            stage: advanceableStage,
            proposal: generateSppProposal({
                network: Network.ETHEREUM_SEPOLIA,
                hasActions: true,
                stageIndex: 0,
                startDate: DateTime.now().toSeconds() - 3600,
                settings: generateSppPluginSettings({
                    stages: [
                        advanceableStage,
                        generateSppStage({ stageIndex: 1 }),
                    ],
                }),
            }),
        });

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.stillCounts',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).toHaveClass('bg-neutral-0');
    });

    it('suppresses the advanceable helper at threshold and keeps the execution note', () => {
        const advanceableStage = generateSppStage({
            stageIndex: 0,
            voteDuration: 60,
            minAdvance: 0,
            maxAdvance: 60 * 60 * 24,
            approvalThreshold: 0,
        });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            canStillAffectOutcome: true,
            hasConnectedWalletSigned: true,
            pendingReport: createPendingReport({
                confirmations: [generateSafeConfirmation({ owner })],
                confirmationsRequired: 1,
            }),
        });

        renderCard({
            stage: advanceableStage,
            proposal: generateSppProposal({
                network: Network.ETHEREUM_SEPOLIA,
                hasActions: true,
                stageIndex: 0,
                startDate: DateTime.now().toSeconds() - 3600,
                settings: generateSppPluginSettings({
                    stages: [
                        advanceableStage,
                        generateSppStage({ stageIndex: 1 }),
                    ],
                }),
            }),
        });

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.stillCounts',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.awaitingExecution',
            ),
        ).toBeInTheDocument();
    });

    it('removes the action and expired-stage prose when the body cannot affect the outcome', () => {
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

    it('opens the Safe dialog with bundled execution for approve-and-execute', async () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isExecutableNow: true,
            pendingReport: createPendingReport({ confirmationsRequired: 1 }),
        });

        renderCard();
        await clickVoteAction('approveAndExecute');

        expect(dialogOpen).toHaveBeenCalledTimes(1);
        expect(dialogOpen).toHaveBeenCalledWith(
            SafeDialogId.PROPOSAL_TRANSACTION,
            expect.objectContaining({
                params: expect.objectContaining({ bundleExecution: true }),
            }),
        );
    });

    it('opens the Safe dialog without bundled execution for approve-only', async () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isExecutableNow: true,
            pendingReport: createPendingReport({ confirmationsRequired: 1 }),
        });

        renderCard();
        await clickVoteAction('approveOnly');

        expect(dialogOpen).toHaveBeenCalledTimes(1);
        expect(dialogOpen).toHaveBeenCalledWith(
            SafeDialogId.PROPOSAL_TRANSACTION,
            expect.objectContaining({
                params: expect.objectContaining({ bundleExecution: false }),
            }),
        );
    });

    it('shows the ghost Safe link for a queued report', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: createPendingReport({ nonce: '4' }),
        });

        renderCard();

        expect(
            screen.getByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.viewInAccountQueue',
            }),
        ).toHaveAttribute('href', `/safe/${proposal.network}/${safeAddress}`);
    });

    it('shows the Safe link for stale reads but hides the vote action', () => {
        useSafeBodyStateSpy.mockReturnValue({ ...baseState, isStale: true });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.unreachable',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.unreachableDescription',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.retry',
            }),
        ).toBeEnabled();
        expect(
            screen.queryByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.viewInAccountQueue',
            }),
        ).toHaveAttribute('href', `/safe/${proposal.network}/${safeAddress}`);
    });

    it('uses the no-data read description and keeps settled cards suppressed during errors', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: undefined,
            isError: true,
            settledResultType: SppProposalType.APPROVAL,
            settledReport: createSettledReport(),
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.unreachable',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.noDataDescription',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approvedAndExecuted',
            }),
        ).not.toBeInTheDocument();
    });

    it('does not offer retry or an action while reads are rate limited', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isError: true,
            isRateLimited: true,
            isStale: true,
            pendingReport: createPendingReport({ nonce: '4' }),
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.rateLimited',
            ),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('alert')).toHaveLength(1);
        expect(
            screen.queryByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.retry',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.viewInAccountQueue',
            }),
        ).not.toBeInTheDocument();
    });

    it('disables the action while Safe reads are loading', () => {
        useSafeBodyStateSpy.mockReturnValue({ ...baseState, isLoading: true });

        renderCard();

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).toBeDisabled();
    });

    it('splits the nonce competition warning into a headline and description', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: createPendingReport(
                { confirmations: [generateSafeConfirmation({ owner })] },
                { hasNonceCompetition: true },
            ),
            hasConnectedWalletSigned: true,
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceShared',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceSharedDescription',
            ),
        ).toBeInTheDocument();
    });

    it('splits the queued-behind-nonce warning and suppresses the threshold note', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                address: safeAddress,
                owners: [owner],
                threshold: 1,
                nonce: '4',
            }),
            pendingReport: createPendingReport({
                confirmations: [generateSafeConfirmation({ owner })],
                confirmationsRequired: 1,
                nonce: '6',
            }),
            hasConnectedWalletSigned: true,
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
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceQueued (currentNonce=4)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceQueuedDescription (transactionNonce=6)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.awaitingExecution',
            ),
        ).not.toBeInTheDocument();
    });

    it('renders a signed waiting-owner state as a linked secondary checkmark', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: createPendingReport({
                confirmations: [generateSafeConfirmation({ owner })],
                confirmationsRequired: 2,
            }),
            hasConnectedWalletSigned: true,
        });

        renderCard();

        expect(
            screen.getByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approved',
            }),
        ).toHaveAttribute('href', `/safe/${proposal.network}/${safeAddress}`);
    });

    it('disables a signed waiting action without a queued report link', () => {
        useFeatureFlagsSpy.mockReturnValue({
            snapshot: [],
            setOverride: jest.fn(),
            isEnabled: () => false,
        });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: createPendingReport({
                confirmations: [generateSafeConfirmation({ owner })],
                confirmationsRequired: 2,
            }),
            hasConnectedWalletSigned: true,
        });

        renderCard();

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approved',
            }),
        ).toBeDisabled();
    });

    it('renders a recovered settled result as a linked completed action', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            canStillAffectOutcome: false,
            isExecutableNow: false,
            isStageCurrent: false,
            nonceDistance: 2,
            pendingReport: createPendingReport({
                confirmations: [generateSafeConfirmation({ owner })],
                confirmationsRequired: 1,
                nonce: '6',
            }),
            settledResultType: SppProposalType.APPROVAL,
            settledReport: createSettledReport(),
        });

        renderCard();

        const action = screen.getByRole('link', {
            name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approvedAndExecuted',
        });
        expect(action).toHaveAttribute(
            'href',
            expect.stringContaining(executedHash),
        );
        expect(action).toBeEnabled();
        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceQueued (currentNonce=0)',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).not.toBeInTheDocument();
    });

    it('splits the superseded warning and keeps the re-queue action', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: createPendingReport(
                { nonce: '0' },
                { state: SafeTransactionState.SUPERSEDED },
            ),
        });

        renderCard();

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.replaced',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.replacedDescription',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approveAndRequeue',
            }),
        ).toBeEnabled();
    });

    it('hides the internal account link when its feature flag is disabled', () => {
        useFeatureFlagsSpy.mockReturnValue({
            snapshot: [],
            setOverride: jest.fn(),
            isEnabled: () => false,
        });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: createPendingReport({ nonce: '4' }),
        });

        renderCard();

        expect(
            screen.queryByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.viewInAccountQueue',
            }),
        ).not.toBeInTheDocument();
    });
});
