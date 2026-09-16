import { ProposalStatus } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    concatHex,
    encodeFunctionData,
    encodePacked,
    type Hex,
    numberToHex,
    pad,
    size,
    toEventSelector,
} from 'viem';
import * as Wagmi from 'wagmi';
import * as WagmiActions from 'wagmi/actions';
import * as connectedWalletGuardApi from '@/modules/application/hooks/useConnectedWalletGuard';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import * as permissionCheckGuardApi from '@/modules/governance/hooks/usePermissionCheckGuard';
import { SafeDialogId } from '@/modules/safe/constants';
import { sppReportProposalResultAbi } from '@/plugins/sppPlugin/dialogs/sppReportProposalResultDialog/sppReportProposalResultAbi';
import {
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import * as safeServiceApi from '@/shared/api/safeService';
import * as transactionServiceApi from '@/shared/api/transactionService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as networkSwitchApi from '@/shared/hooks/useNetworkSwitch';
import {
    generateDialogContext,
    generateSafeNextNonceResponse,
} from '@/shared/testUtils';
import { safeMultiSendAbi } from '../../../../modules/safe/utils/safeTransactionEnvelopeUtils/safeMultiSendAbi';
import { safeIndexingTimeout } from '../../constants';
import * as safeBodyStateApi from '../../hooks/useSafeMultisigBodyState';
import {
    generateSafeBodyState,
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { SafeTransactionState } from '../../types';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';
import {
    type ISafeMultisigSubmitVoteProps,
    SafeMultisigSubmitVote,
} from './safeMultisigSubmitVote';

jest.mock('wagmi/actions', () => ({
    ...jest.requireActual('wagmi/actions'),
    getConnection: jest.fn(),
    sendTransaction: jest.fn(),
    waitForTransactionReceipt: jest.fn(),
}));

jest.mock('@safe-global/protocol-kit', () => ({
    __esModule: true,
    default: { init: jest.fn() },
    buildSignatureBytes: jest.fn(),
    EthSafeSignature: jest.fn(),
    EthSafeTransaction: jest.fn(),
}));

describe('<SafeMultisigSubmitVote /> component', () => {
    const owner = '0x0000000000000000000000000000000000000011';
    const nonOwner = '0x0000000000000000000000000000000000000099';
    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );
    const useConnectedWalletGuardSpy = jest.spyOn(
        connectedWalletGuardApi,
        'useConnectedWalletGuard',
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
    const useProposeSpy = jest.spyOn(
        safeServiceApi,
        'useProposeSafeTransaction',
    );
    const useConfirmSpy = jest.spyOn(
        safeServiceApi,
        'useConfirmSafeTransaction',
    );
    const getSafeNextNonceSpy = jest.spyOn(
        safeServiceApi.safeService,
        'getSafeNextNonce',
    );
    const getQueueSpy = jest.spyOn(
        safeServiceApi.safeService,
        'getSafePendingTransactions',
    );
    const useTransactionStatusSpy = jest.spyOn(
        transactionServiceApi,
        'useTransactionStatus',
    );
    const dialogOpen = jest.fn();
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useBytecodeSpy = jest.spyOn(Wagmi, 'useBytecode');
    const proposeMutateAsync = jest.fn();
    const confirmMutateAsync = jest.fn();

    const safeInfo = generateSafeInfo({ threshold: 1, owners: [owner] });

    const baseState = generateSafeBodyState({
        safeInfo,
        minApprovals: 1,
        membersCount: 1,
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

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: owner,
            chainId: 11_155_111,
            isConnecting: false,
            isReconnecting: false,
        });
        useConnectedWalletGuardSpy.mockReturnValue({
            check: ({ onSuccess } = {}) => onSuccess?.(),
            result: true,
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
        // Standing in for the owner confirming the dialog, so the tests below exercise the signing
        // path rather than stopping at the confirmation step.
        dialogOpen.mockImplementation((_id, options) => {
            const params = options?.params as
                | { onConfirm?: () => void }
                | undefined;
            params?.onConfirm?.();
        });
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: dialogOpen }),
        );
        useProposeSpy.mockReturnValue({
            mutateAsync: proposeMutateAsync,
        } as never);
        useConfirmSpy.mockReturnValue({
            mutateAsync: confirmMutateAsync,
        } as never);
        useBytecodeSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as ReturnType<typeof Wagmi.useBytecode>);
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '0',
                currentNonce: '0',
            }),
        );
        // The report stays unattributed unless a test says otherwise, so the indexing hold is the
        // default post-execution state rather than a network-dependent one.
        useTransactionStatusSpy.mockReturnValue({ data: undefined } as never);
    });

    /**
     * The existing-report path re-reads the queue before review, so a queued report has to be
     * visible to the service as well as to the polled body state - a transaction the service no
     * longer serves is one the component refuses to sign.
     */
    const mockQueuedReport = (transaction: ISafeMultisigTransaction) =>
        getQueueSpy.mockResolvedValue({
            count: 1,
            next: null,
            previous: null,
            results: [transaction],
            meta: { stale: false, source: 'safe-api', fetchedAt: '' },
        } as never);

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Shared so the receipt mock and the rendered component cannot drift: the report event only
     * counts when its emitter, proposal and stage are the ones this card is reporting for.
     *
     * `proposalIndex` is the real onchain id from the sepolia fixture rather than the generator's
     * `0`, which encodes to all zeros and would match almost any encoding bug.
     */
    const reportedProposal = generateSppProposal({
        network: Network.ETHEREUM_SEPOLIA,
        pluginAddress: `0x${'ab'.repeat(20)}`,
        proposalIndex:
            '88995626346429952950895700040679797192033948228404734175794720873791947498256',
    });
    const reportedStageIndex = 1;

    const createTestComponent = (
        props?: Partial<ISafeMultisigSubmitVoteProps>,
        queryClient = new QueryClient(),
    ) => {
        const completeProps: ISafeMultisigSubmitVoteProps = {
            daoId: `sep:${owner}`,
            proposal: reportedProposal,
            externalAddress: safeInfo.address,
            stage: generateSppStage({ stageIndex: reportedStageIndex }),
            isVeto: false,
            ...props,
        };

        return (
            <QueryClientProvider client={queryClient}>
                <SafeMultisigSubmitVote {...completeProps} />
            </QueryClientProvider>
        );
    };

    it('states that the Safe can still act after the voting window closed', () => {
        // The most surprising thing about a Safe body: Aragon's window closes, the Safe queue has
        // no deadline, and a verdict still counts while the stage can still advance.
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            canStillAffectOutcome: true,
        });

        render(
            createTestComponent({
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
            }),
        );

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

        render(createTestComponent());

        // Executing would still succeed against the Safe and still change nothing, so offering it
        // would be a lie.
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

    /**
     * The settled surface renders a verdict with a checkmark and says nothing else, so a result
     * written after its stage advanced reads exactly like one that decided the stage. The record
     * is real and the gas was spent; the authority is what it lacks.
     */
    it('says a recorded result had no effect when the stage had already advanced', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            settledResultType: SppProposalType.APPROVAL,
            isStageCurrent: false,
        });

        render(createTestComponent());

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

        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.recordedAfterAdvance',
            ),
        ).not.toBeInTheDocument();
    });

    it('does not call an unwritten result ineffective when the stage merely expired', () => {
        // Expiry without an advance is a dead proposal, not a forfeited vote - and nothing was
        // recorded, so there is no result to describe as having had no effect.
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isStageCurrent: false,
            canStillAffectOutcome: false,
        });

        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.recordedAfterAdvance',
            ),
        ).not.toBeInTheDocument();
    });

    it('routes an ineligible wallet through the standard vote guard', async () => {
        // Ownership is the guard's business, exactly as membership is for every other body: the
        // card offers the action and never explains eligibility beside its own button.
        const check = jest.fn();
        usePermissionCheckGuardSpy.mockReturnValue({
            check,
            result: false,
        });
        render(createTestComponent());

        await clickVoteAction('approveAndExecute');

        expect(check).toHaveBeenCalled();
        expect(proposeMutateAsync).not.toHaveBeenCalled();
    });

    it('guards the sign-only route exactly like the bundled one', async () => {
        // Both routes are offered to anyone who can read the card; connection and eligibility are
        // decided on click, so neither is hidden from a disconnected or ineligible viewer.
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
        render(createTestComponent());

        await clickVoteAction('approveOnly');

        expect(check).toHaveBeenCalled();
        expect(proposeMutateAsync).not.toHaveBeenCalled();
    });

    it('keeps an EOA owner actionable on a pre-v1.4.1 Safe', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                owners: [owner],
                threshold: 1,
                version: '1.3.0',
            }),
        });

        render(createTestComponent());

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
                owners: [owner],
                threshold: 1,
                version: '1.3.0',
            }),
        });
        useBytecodeSpy.mockReturnValue({
            data: '0x1234',
            isLoading: false,
        } as ReturnType<typeof Wagmi.useBytecode>);

        render(createTestComponent());

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

        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        ).toBeEnabled();
    });

    it('reviews the exact payload before producing a signature', async () => {
        const { safeTxHash } = mockThresholdOneExecution();
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '5',
                currentNonce: '5',
            }),
        );
        render(createTestComponent());

        await clickVoteAction('approveAndExecute');

        await waitFor(() =>
            expect(dialogOpen).toHaveBeenCalledWith(
                SafeDialogId.TRANSACTION_REVIEW,
                expect.objectContaining({
                    params: expect.objectContaining({
                        safeAddress: safeInfo.address,
                        transaction: expect.objectContaining({
                            safeTxHash,
                            data: '0xreport',
                            nonce: '0',
                        }),
                    }),
                }),
            ),
        );
    });

    it('warns that the confirmation reaching threshold is followed by a gas transaction', async () => {
        // One click, two wallet interactions: a free confirmation, then execution. Promising
        // "signing costs no gas" and then opening a gas prompt would be a bait.
        mockThresholdOneExecution();
        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        await waitFor(() =>
            expect(dialogOpen).toHaveBeenCalledWith(
                SafeDialogId.TRANSACTION_REVIEW,
                expect.objectContaining({
                    params: expect.objectContaining({
                        costNote:
                            'app.plugins.safeMultisig.safeMultisigSubmitVote.review.bundledExecution',
                    }),
                }),
            ),
        );
    });

    it('routes a queued report to the same transaction in the account queue', () => {
        // W4's handoff: the proposal states what is true of this body's report and hands the
        // Safe's nonce sequence to the account surface, deep-linked to the same transaction so one
        // `safeTxHash` resolves to one review payload on both sides.
        const queued = generateSafeMultisigTransaction({
            nonce: '4',
            safeTxHash: `0x${'cd'.repeat(32)}`,
        });
        mockQueuedReport(queued);
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: queued,
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

        render(createTestComponent());

        const link = screen.getByRole('link', {
            name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.viewInAccountQueue',
        });

        expect(link).toHaveAttribute(
            'href',
            `/safe/${Network.ETHEREUM_SEPOLIA}/${safeInfo.address}?tx=${queued.safeTxHash}`,
        );
        // The queue is a detour from signing, not a step in it: it opens alongside the card so the
        // review the owner is mid-way through is not thrown away to look at co-signer state.
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('does not warn of a gas transaction when more owners are still needed', async () => {
        const queued = generateSafeMultisigTransaction({
            nonce: '0',
            confirmationsRequired: 3,
            confirmations: [generateSafeConfirmation({ owner: nonOwner })],
        });
        mockQueuedReport(queued);
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                threshold: 3,
                owners: [owner, nonOwner, `0x${'4'.repeat(40)}`],
            }),
            pendingReport: {
                transaction: queued,
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
            approvalsAmount: 1,
            minApprovals: 3,
        });

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        );

        await waitFor(() =>
            expect(dialogOpen).toHaveBeenCalledWith(
                SafeDialogId.TRANSACTION_REVIEW,
                expect.objectContaining({
                    params: expect.objectContaining({
                        costNote:
                            'app.plugins.safeMultisig.safeMultisigSubmitVote.review.gasless',
                    }),
                }),
            ),
        );
    });

    it('reviews the payload before executing an already-signed report, and says it costs gas', async () => {
        const queued = generateSafeMultisigTransaction({
            nonce: '0',
            confirmationsRequired: 1,
            confirmations: [generateSafeConfirmation({ owner })],
        });
        mockQueuedReport(queued);
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: queued,
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

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        );

        // Executing is the act with consequences, so the payload is disclosed here too - and the
        // note says gas is due for a single prompt, not that this owner's confirmation completes a
        // threshold that is already complete.
        await waitFor(() =>
            expect(dialogOpen).toHaveBeenCalledWith(
                SafeDialogId.TRANSACTION_REVIEW,
                expect.objectContaining({
                    params: expect.objectContaining({
                        costNote:
                            'app.plugins.safeMultisig.safeMultisigSubmitVote.review.executionOnly',
                    }),
                }),
            ),
        );
    });

    it('refuses a queued report the service no longer serves', async () => {
        // Executed by another owner, or deleted, while this card sat open. The polled body state
        // still shows it as signable; the queue is the authority and it is gone.
        const queued = generateSafeMultisigTransaction({
            nonce: '0',
            confirmationsRequired: 1,
            confirmations: [generateSafeConfirmation({ owner })],
        });
        getQueueSpy.mockResolvedValue({
            count: 0,
            next: null,
            previous: null,
            results: [],
            meta: { stale: false, source: 'safe-api', fetchedAt: '' },
        } as never);
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: queued,
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

        const queryClient = new QueryClient();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        render(createTestComponent(undefined, queryClient));
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        );

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.reportGone',
            ),
        ).toBeInTheDocument();
        expect(dialogOpen).not.toHaveBeenCalled();

        // The body state that offered this action is now known to be wrong, so the read that
        // disproved it replaces it: the card stops offering a transaction the queue does not hold.
        await waitFor(() =>
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey:
                    safeServiceApi.safeServiceKeys.safePendingTransactions({
                        urlParams: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: safeInfo.address,
                        },
                    }),
            }),
        );
    });

    it('does not claim a report is gone when the queue read was partial', async () => {
        // `next` set means pages went unread, and the endpoint cannot filter by nonce, so absence
        // from the pages read is a gap in the read rather than a missing transaction.
        const queued = generateSafeMultisigTransaction({
            nonce: '0',
            confirmationsRequired: 1,
            confirmations: [generateSafeConfirmation({ owner })],
        });
        getQueueSpy.mockResolvedValue({
            count: 500,
            next: 'https://safe/api/next-page',
            previous: null,
            results: [],
            meta: { stale: false, source: 'safe-api', fetchedAt: '' },
        } as never);
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: queued,
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

        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        );

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.error',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.reportGone',
            ),
        ).not.toBeInTheDocument();
    });

    it('refuses a queued report whose nonce the Safe has passed', async () => {
        // Polled state said executable. The fresh read says the Safe is at nonce 4, so this
        // transaction is dead however many signatures it holds - and gas would be wasted proving it.
        const queued = generateSafeMultisigTransaction({
            nonce: '2',
            confirmationsRequired: 1,
            confirmations: [generateSafeConfirmation({ owner })],
        });
        mockQueuedReport(queued);
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '4',
                currentNonce: '4',
            }),
        );
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: queued,
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

        const queryClient = new QueryClient();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        render(createTestComponent(undefined, queryClient));
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        );

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.replaced',
            ),
        ).toBeInTheDocument();
        expect(dialogOpen).not.toHaveBeenCalled();

        // The card is still offering execution off the polled state this read just disproved. The
        // disproving read is pushed into the cache, so the body re-derives to superseded and offers
        // a re-queue now rather than at the next poll.
        await waitFor(() =>
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey:
                    safeServiceApi.safeServiceKeys.safePendingTransactions({
                        urlParams: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: safeInfo.address,
                        },
                    }),
            }),
        );
    });

    it('reviews the confirmations the service holds now, not the polled ones', async () => {
        // Another owner signed while the card was idle. Signing the stale envelope would assemble
        // a signature set the Safe rejects, so the review shows what the queue holds.
        const polled = generateSafeMultisigTransaction({
            nonce: '0',
            confirmationsRequired: 2,
            confirmations: [generateSafeConfirmation({ owner: nonOwner })],
        });
        const fresh = generateSafeMultisigTransaction({
            nonce: '0',
            safeTxHash: polled.safeTxHash,
            confirmationsRequired: 2,
            confirmations: [
                generateSafeConfirmation({ owner: nonOwner }),
                generateSafeConfirmation({ owner: `0x${'7'.repeat(40)}` }),
            ],
        });
        mockQueuedReport(fresh);
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: polled,
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
            approvalsAmount: 1,
            minApprovals: 2,
        });

        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        );

        await waitFor(() =>
            expect(dialogOpen).toHaveBeenCalledWith(
                SafeDialogId.TRANSACTION_REVIEW,
                expect.objectContaining({
                    params: expect.objectContaining({
                        transaction: expect.objectContaining({
                            confirmations: fresh.confirmations,
                        }),
                    }),
                }),
            ),
        );
    });

    describe('authority claimed by the confirm button', () => {
        const pluginAddress = reportedProposal.pluginAddress;
        const approveLabel =
            'app.plugins.safeMultisig.safeMultisigSubmitVote.approve';
        const neutralLabel =
            'app.plugins.safeMultisig.safeMultisigSubmitVote.review.mixedConfirm';

        // `buildReportProposalResultData` pins `_tryAdvance` to false by design, so the advancing
        // payload is encoded directly against the same ABI.
        const buildReport = (
            resultType = SppProposalType.APPROVAL,
            tryAdvance = false,
        ): Hex =>
            tryAdvance
                ? encodeFunctionData({
                      abi: sppReportProposalResultAbi,
                      functionName: 'reportProposalResult',
                      args: [
                          BigInt(reportedProposal.proposalIndex),
                          reportedStageIndex,
                          resultType,
                          true,
                      ],
                  })
                : safeMultisigTransactionUtils.buildReportProposalResultData({
                      proposalId: BigInt(reportedProposal.proposalIndex),
                      stageId: reportedStageIndex,
                      resultType,
                  });

        const encodeMultiSend = (
            calls: Array<{ to: string; data: Hex }>,
        ): Hex =>
            encodeFunctionData({
                abi: safeMultiSendAbi,
                functionName: 'multiSend',
                args: [
                    concatHex(
                        calls.map(({ to, data }) =>
                            encodePacked(
                                [
                                    'uint8',
                                    'address',
                                    'uint256',
                                    'uint256',
                                    'bytes',
                                ],
                                [
                                    0,
                                    to as Hex,
                                    BigInt(0),
                                    BigInt(size(data)),
                                    data,
                                ],
                            ),
                        ),
                    ),
                ],
            });

        const openReview = async (
            data: string,
            to: string,
            overrides?: { operation?: 0 | 1; value?: string },
        ) => {
            // The shared mock confirms the dialog immediately, which would run the whole signing
            // path and replace the disclosure under test with a generic failure.
            dialogOpen.mockImplementation(() => undefined);

            const queued = generateSafeMultisigTransaction({
                nonce: '0',
                to,
                data,
                confirmationsRequired: 2,
                confirmations: [generateSafeConfirmation({ owner: nonOwner })],
                ...overrides,
            });
            mockQueuedReport(queued);
            useSafeBodyStateSpy.mockReturnValue({
                ...baseState,
                pendingReport: {
                    transaction: queued,
                    report: {
                        proposalId: BigInt(reportedProposal.proposalIndex),
                        stageId: reportedStageIndex,
                        resultType: SppProposalType.APPROVAL,
                        tryAdvance: false,
                    },
                    state: SafeTransactionState.LIVE,
                    status: ProposalStatus.ACTIVE,
                    hasNonceCompetition: false,
                },
                approvalsAmount: 1,
                minApprovals: 2,
            });

            render(createTestComponent());
            await userEvent.click(
                screen.getByRole('button', { name: approveLabel }),
            );

            await waitFor(() => expect(dialogOpen).toHaveBeenCalled());

            return (
                dialogOpen.mock.calls[0][1] as {
                    params: { confirmLabel: string; intent: string };
                }
            ).params;
        };

        /**
         * The label is the narrowest authority claim on the consent surface, so it may only read
         * "Approve proposal" for a payload that approves and does nothing else. Each row below is a
         * different way of being more or other than that, and each gets its own disclosure: the
         * batch sentence is true of an extra call but wrong about an opposite verdict.
         */
        it.each([
            {
                case: 'reports the selected result and nothing else',
                data: () => buildReport(),
                to: () => pluginAddress,
                label: approveLabel,
                intent: 'reportOnly',
            },
            {
                case: 'reports the opposite verdict to the button pressed',
                data: () => buildReport(SppProposalType.VETO),
                to: () => pluginAddress,
                label: neutralLabel,
                intent: 'oppositeResult',
            },
            {
                case: 'also advances the governance stage',
                data: () => buildReport(SppProposalType.APPROVAL, true),
                to: () => pluginAddress,
                label: neutralLabel,
                intent: 'advancesStage',
            },
            {
                case: 'carries an unrelated call alongside the report',
                data: () =>
                    encodeMultiSend([
                        { to: pluginAddress, data: buildReport() },
                        { to: `0x${'4'.repeat(40)}`, data: '0xdeadbeef' },
                    ]),
                to: () => `0x${'5'.repeat(40)}`,
                label: neutralLabel,
                intent: 'batched',
            },
            {
                case: 'carries no report this stage can read',
                data: () => '0xdeadbeef',
                to: () => pluginAddress,
                label: neutralLabel,
                intent: 'unrecognised',
            },
        ])(
            'offers $label when the payload $case',
            async ({ data, to, label, intent }) => {
                const params = await openReview(data(), to());

                expect(params.confirmLabel).toEqual(label);
                expect(params.intent).toEqual(
                    `app.plugins.safeMultisig.safeMultisigSubmitVote.review.${intent} (proposal=title)`,
                );
            },
        );

        /**
         * `operation` and `value` arrive from the queue like the rest of the envelope, so report
         * calldata alone must not earn the narrow label: a delegate call runs that code in the
         * Safe's own storage context and reports nothing, and value moves ETH the label never
         * mentions.
         */
        it.each([
            {
                case: 'is a delegate call',
                overrides: { operation: 1 as const },
                intent: 'delegateCall',
            },
            {
                case: 'sends value from the Safe',
                overrides: { value: '1' },
                intent: 'carriesValue',
            },
        ])(
            'refuses the approve wording when an otherwise valid report $case',
            async ({ overrides, intent }) => {
                const params = await openReview(
                    buildReport(),
                    pluginAddress,
                    overrides,
                );

                expect(params.confirmLabel).toEqual(neutralLabel);
                expect(params.intent).toEqual(
                    `app.plugins.safeMultisig.safeMultisigSubmitVote.review.${intent} (proposal=title)`,
                );
            },
        );
    });

    it('refuses to execute when the owner set no longer authorises the signatures', async () => {
        // The Safe validates against the owners it holds now, not the ones recorded when the
        // transaction was proposed. A replaced owner's signature is bytes the Safe will not accept.
        const { protocolKit } = mockThresholdOneExecution();
        protocolKit.getOwners.mockResolvedValue([`0x${'9'.repeat(40)}`]);

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.authorityChanged',
            ),
        ).toBeInTheDocument();
        // No gas spent proving what the contract read already said.
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
        // The confirmation before it still stands.
        expect(proposeMutateAsync).toHaveBeenCalled();
    });

    it('refuses to execute when the live threshold outgrew the confirmations', async () => {
        const { protocolKit } = mockThresholdOneExecution();
        protocolKit.getThreshold.mockResolvedValue(2);

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.authorityChanged',
            ),
        ).toBeInTheDocument();
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('does not submit a transaction the Safe rejects in simulation', async () => {
        // Checked with the signatures attached and only at the execution step, which is the one
        // moment the answer means "this would go through" rather than "it is not signed yet".
        const { protocolKit } = mockThresholdOneExecution();
        protocolKit.isValidTransaction.mockResolvedValue(false);

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.executionRejected',
            ),
        ).toBeInTheDocument();
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('claims nothing when the receipt carries no Safe event for this transaction', async () => {
        // A mined transaction whose Safe said nothing about it. Neither success nor failure is
        // known, so the copy says exactly that instead of picking one.
        mockThresholdOneExecution();
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue({
            status: 'success',
            logs: [],
        } as never);

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.executionUnconfirmed',
            ),
        ).toBeInTheDocument();
    });

    it('refetches the history scan after its own report executes', async () => {
        // The scan answers "which executed transaction produced this verdict". An execution that
        // just happened is exactly what it is looking for, so serving the pre-execution answer from
        // cache would leave the body reading as unreported until the entry expired on its own.
        const { safeTransaction } = mockThresholdOneExecution({ nonce: 6 });
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '6',
                currentNonce: '6',
            }),
        );
        const queryClient = new QueryClient();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        render(createTestComponent(undefined, queryClient));
        await clickVoteAction('approveAndExecute');

        await waitFor(() =>
            expect(WagmiActions.sendTransaction).toHaveBeenCalled(),
        );
        expect(safeTransaction.data.nonce).toBe(6);

        // By prefix: the scan's own key carries the indexed verdict, which has not caught up yet at
        // this point, so only the history prefix reliably reaches the entry that exists.
        await waitFor(() =>
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: safeServiceApi.safeServiceKeys.safeTransactionHistory(
                    {
                        urlParams: {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: safeInfo.address,
                        },
                    },
                ),
            }),
        );
    });

    it('signs nothing when the Safe consumes the reviewed nonce during review', async () => {
        // Review takes as long as a person takes, and nothing reserved the nonce. Re-noncing the
        // reviewed payload silently would sign a transaction nobody saw.
        const { protocolKit } = mockThresholdOneExecution({ nonce: 5 });
        getSafeNextNonceSpy
            .mockResolvedValueOnce(
                generateSafeNextNonceResponse({
                    nextNonce: '5',
                    currentNonce: '5',
                }),
            )
            .mockResolvedValueOnce(
                generateSafeNextNonceResponse({
                    nextNonce: '6',
                    currentNonce: '6',
                }),
            );

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceConsumed',
            ),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(proposeMutateAsync).not.toHaveBeenCalled();
    });

    it('signs nothing when another transaction takes the reviewed nonce during review', async () => {
        // The nonce is still live, so this is not a dead payload — but competing for it is a
        // deliberate replacement, not something to do on the owner's behalf.
        const { protocolKit } = mockThresholdOneExecution({ nonce: 5 });
        getSafeNextNonceSpy
            .mockResolvedValueOnce(
                generateSafeNextNonceResponse({
                    nextNonce: '5',
                    currentNonce: '5',
                }),
            )
            .mockResolvedValueOnce(
                generateSafeNextNonceResponse({
                    nextNonce: '6',
                    currentNonce: '5',
                }),
            );

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceContested',
            ),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(proposeMutateAsync).not.toHaveBeenCalled();
    });

    it('signs nothing when the rebuilt envelope no longer hashes to the reviewed transaction', async () => {
        // The reviewed hash is the whole consent. If rebuilding the envelope produces a different
        // one, the two disagree about what is being authorised and neither can be signed.
        const { protocolKit } = mockThresholdOneExecution({ nonce: 6 });
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '6',
                currentNonce: '6',
            }),
        );
        protocolKit.getTransactionHash
            .mockResolvedValueOnce(`0x${'1'.repeat(64)}`)
            .mockResolvedValueOnce(`0x${'9'.repeat(64)}`);

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.error',
            ),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(proposeMutateAsync).not.toHaveBeenCalled();
    });

    it('offers a re-queue and the account queue when the pending report lost its nonce', () => {
        const superseded = generateSafeMultisigTransaction({
            safeTxHash: `0x${'ef'.repeat(32)}`,
            confirmationsRequired: 1,
            confirmations: [generateSafeConfirmation({ owner })],
        });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: superseded,
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.SUPERSEDED,
                status: ProposalStatus.EXPIRED,
                hasNonceCompetition: false,
            },
            hasConnectedWalletSigned: true,
            approvalsAmount: 1,
        });

        render(createTestComponent());

        // A superseded report has collected signatures but can never execute, so the owner must be
        // able to sign a replacement rather than being told to wait for the other owners.
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approveAndRequeue',
            }),
        ).toBeEnabled();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.replaced',
            ),
        ).toBeInTheDocument();
        // Whatever took the nonce is account-level traffic, so the queue answers it - the proposal
        // states the report is dead and hands over the lookup.
        expect(
            screen.getByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.viewInAccountQueue',
            }),
        ).toHaveAttribute(
            'href',
            `/safe/${Network.ETHEREUM_SEPOLIA}/${safeInfo.address}?tx=${superseded.safeTxHash}`,
        );
    });

    it('rebuilds a superseded report instead of re-submitting its signatures', async () => {
        // The superseded transaction still carries a full signature set, and reusing it is the one
        // thing that must never happen: a new nonce means a new hash, so those signatures authorise
        // a transaction that can no longer execute. The owner signs a freshly built envelope after
        // reviewing it again, and the replacement is proposed rather than confirmed.
        const { safeTxHash } = mockThresholdOneExecution({ nonce: 7 });
        const superseded = generateSafeMultisigTransaction({
            nonce: '2',
            safeTxHash: '0xdead',
            confirmationsRequired: 1,
            confirmations: [generateSafeConfirmation({ owner })],
        });
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '7',
                currentNonce: '5',
            }),
        );
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: superseded,
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.SUPERSEDED,
                status: ProposalStatus.ACTIVE,
                hasNonceCompetition: false,
            },
            hasConnectedWalletSigned: true,
            approvalsAmount: 1,
        });

        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approveAndRequeue',
            }),
        );

        await waitFor(() =>
            expect(dialogOpen).toHaveBeenCalledWith(
                SafeDialogId.TRANSACTION_REVIEW,
                expect.objectContaining({
                    params: expect.objectContaining({
                        transaction: expect.objectContaining({
                            safeTxHash,
                            nonce: '7',
                            confirmations: [],
                        }),
                    }),
                }),
            ),
        );
        // The positive half: what actually reaches the service is a propose carrying the rebuilt
        // hash and a signature produced in this flow - never the dead hash or its stored
        // confirmation, and never a confirm against the superseded transaction.
        await waitFor(() =>
            expect(proposeMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        safeTxHash,
                        senderSignature: '0xsignature',
                    }),
                }),
            ),
        );
        expect(proposeMutateAsync).not.toHaveBeenCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({ safeTxHash: '0xdead' }),
            }),
        );
        expect(confirmMutateAsync).not.toHaveBeenCalled();
    });

    it('states the reported verdict without offering to act again', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            settledResultType: SppProposalType.APPROVAL,
        });

        render(createTestComponent());

        // The slot stays filled so the card does not reflow when a body reports, but a recorded
        // verdict is not an invitation: pressing it would re-report over a settled result.
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approved',
            }),
        ).toBeDisabled();
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

        render(createTestComponent());

        // Said while the collision is still live: once the rival executes this report is already
        // superseded, and the signatures it competed for are spent.
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

        render(createTestComponent());

        // Fully confirmed but not executable: a Safe runs in nonce order and a confirmation is
        // bound to its slot, so the owner is waiting on the queue. The action stays named for what
        // is pending - executing the Safe transaction - but must not be offered as available.
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        ).toBeDisabled();
        // Named by nonce position, never as a quantity of transactions: the gap between nonces is
        // neither an upper nor a lower bound on what is queued.
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceQueued (currentNonce=4,transactionNonce=6)',
            ),
        ).toBeInTheDocument();
    });

    it('names execution as the second gate once the threshold is met', () => {
        // gov-ui-kit's card says "approval reached" at threshold, but a Safe body has told Aragon
        // nothing until its transaction executes - so the card alone overstates the position.
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

        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        ).toBeEnabled();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.awaitingExecution',
            ),
        ).toBeInTheDocument();
    });

    it('offers a refresh when the Safe read is stale, instead of passing the count off as current', () => {
        useSafeBodyStateSpy.mockReturnValue({ ...baseState, isStale: true });

        render(createTestComponent());

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

    // A spent read budget answers every refetch with the same 429, so a refresh control there is
    // one that provably cannot work: the wait is the remedy and the copy says so.
    it('withholds the refresh while the Safe read budget is spent', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isStale: true,
            isRateLimited: true,
            rateLimitedRetryAfter: 300,
        });

        render(createTestComponent());

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

    // The budget is per read: the queue 429s while the owner read still answers fresh, so the
    // counts freeze with nothing flagged stale. Saying nothing there passes frozen counts off as
    // current on a signing surface.
    it('warns when the read budget is spent even though no read is flagged stale', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            isRateLimited: true,
        });

        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.budgetSpent',
            ),
        ).toBeInTheDocument();
    });

    /**
     * `nonce` must match whatever `getSafeNextNonce` is mocked to allocate: the component
     * revalidates the reviewed nonce before signing, so a stub built for a different one is
     * correctly refused.
     */
    const mockThresholdOneExecution = ({ nonce = 0 } = {}) => {
        const signature = {
            signer: owner,
            data: '0xsignature',
            isContractSignature: false,
            staticPart: jest.fn(),
            dynamicPart: jest.fn(),
        };
        const safeTransaction = {
            data: {
                to: safeInfo.address,
                value: '0',
                data: '0xreport',
                operation: 0,
                safeTxGas: '0',
                baseGas: '0',
                gasPrice: '0',
                gasToken: '0x0000000000000000000000000000000000000000',
                refundReceiver: '0x0000000000000000000000000000000000000000',
                nonce,
            },
            addSignature: jest.fn(),
            encodedSignatures: jest.fn(() => '0xsignatureBytes'),
        };
        const safeTxHash = `0x${'1'.repeat(64)}`;
        const protocolKit = {
            createTransaction: jest.fn().mockResolvedValue(safeTransaction),
            getTransactionHash: jest.fn().mockResolvedValue(safeTxHash),
            signTypedData: jest.fn().mockResolvedValue(signature),
            // Authority is read from the Safe at the execution step, so the stub answers as a
            // 1-of-1 whose owner is the connected wallet and whose simulation passes.
            getThreshold: jest.fn().mockResolvedValue(1),
            getOwners: jest.fn().mockResolvedValue([owner]),
            isValidTransaction: jest.fn().mockResolvedValue(true),
            getEncodedTransaction: jest
                .fn()
                .mockResolvedValue('0xexecTransaction'),
        };
        const protocolKitModule = jest.requireMock(
            '@safe-global/protocol-kit',
        ) as {
            default: { init: jest.Mock };
            buildSignatureBytes: jest.Mock;
            EthSafeTransaction: jest.Mock;
        };
        protocolKitModule.default.init.mockResolvedValue(protocolKit);
        protocolKitModule.buildSignatureBytes.mockReturnValue(
            '0xsignatureBytes',
        );
        // Submitting rebuilds the reviewed envelope rather than reusing the object built before
        // consent, so the constructor stands in for the same transaction.
        protocolKitModule.EthSafeTransaction.mockImplementation(
            () => safeTransaction,
        );
        jest.mocked(WagmiActions.getConnection).mockReturnValue({
            connector: {
                getProvider: jest
                    .fn()
                    .mockResolvedValue({ request: jest.fn() }),
            },
        } as never);
        jest.mocked(WagmiActions.sendTransaction).mockResolvedValue(
            `0x${'2'.repeat(64)}`,
        );
        /**
         * A bare receipt proves nothing, and neither does the Safe's own event on its own: a
         * `DELEGATECALL` to a codeless address emits `ExecutionSuccess` having done nothing at all.
         * The successful path therefore carries both - the Safe's event for this hash, and the
         * plugin's `ProposalResultReported` for this proposal and stage, which is what a real
         * report emits (observed on sepolia at nonce 4).
         */
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue({
            status: 'success',
            logs: [
                {
                    address: safeInfo.address,
                    topics: [
                        toEventSelector('ExecutionSuccess(bytes32,uint256)'),
                        safeTxHash,
                    ],
                    data: pad('0x01'),
                },
                {
                    // Same proposal and stage the component under test is rendered with.
                    address: reportedProposal.pluginAddress,
                    topics: [
                        toEventSelector(
                            'ProposalResultReported(uint256,uint16,address)',
                        ),
                        pad(
                            numberToHex(BigInt(reportedProposal.proposalIndex)),
                        ),
                        pad(numberToHex(reportedStageIndex)),
                        pad(safeInfo.address as Hex),
                    ],
                    data: '0x',
                },
            ],
        } as never);

        return {
            signature,
            safeTransaction,
            safeTxHash,
            protocolKit,
            protocolKitModule,
        };
    };

    it('proposes gaslessly and executes after a threshold-one signature', async () => {
        const { signature, safeTransaction, protocolKit, protocolKitModule } =
            mockThresholdOneExecution({ nonce: 6 });
        // The Safe sits at nonce 6 with that slot free, so the report lands on it and can execute
        // in the same flow.
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '6',
                currentNonce: '6',
            }),
        );

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        await waitFor(() => {
            expect(proposeMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        safeTransactionData: safeTransaction.data,
                        senderAddress: owner,
                        senderSignature: signature.data,
                    }),
                }),
            );
        });
        // The service reads the live nonce itself; nothing from the polled body state is passed in,
        // because a polled value can lag and a stale floor allocates a consumed nonce.
        expect(getSafeNextNonceSpy).toHaveBeenCalledWith({
            urlParams: {
                network: Network.ETHEREUM_SEPOLIA,
                address: safeInfo.address,
            },
        });
        expect(protocolKit.createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ options: { nonce: 6 } }),
        );
        expect(protocolKitModule.buildSignatureBytes).toHaveBeenCalledWith([
            signature,
        ]);
        expect(
            jest.mocked(WagmiActions.sendTransaction).mock.calls[0][1],
        ).toEqual(expect.objectContaining({ data: '0xexecTransaction' }));
        expect(WagmiActions.waitForTransactionReceipt).toHaveBeenCalled();
    });

    it('proposes without executing when the allocated nonce sits behind the queue', async () => {
        const { signature, safeTransaction } = mockThresholdOneExecution({
            nonce: 7,
        });
        // Something else holds nonce 6, so the report is allocated 7. A Safe executes in strict
        // nonce order, so executing now would pay gas for a revert.
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '7',
                currentNonce: '6',
            }),
        );

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        await waitFor(() => {
            expect(proposeMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        safeTransactionData: safeTransaction.data,
                        senderSignature: signature.data,
                    }),
                }),
            );
        });
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('signs without executing when the owner chooses to approve only', async () => {
        mockThresholdOneExecution({ nonce: 6 });
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '6',
                currentNonce: '6',
            }),
        );

        render(createTestComponent());
        await clickVoteAction('approveOnly');

        // The signature is still collected and the transaction is left fully signed in the queue -
        // only the gas-paying half is declined.
        await waitFor(() => {
            expect(proposeMutateAsync).toHaveBeenCalled();
        });
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('signs the EIP-712 transaction rather than a bare hash', async () => {
        const { protocolKit, safeTransaction } = mockThresholdOneExecution();

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        // Signing the struct is what lets the wallet show the target, value and nonce. Hashing
        // offchain and signing the digest asks the owner to approve an opaque blob instead.
        await waitFor(() => {
            expect(protocolKit.signTypedData).toHaveBeenCalledWith(
                safeTransaction,
            );
        });
    });

    it('derives the report topic and topics the plugin actually emits onchain', () => {
        /**
         * Ground truth, not a restatement. These three strings are copied from the log the SPP
         * plugin `0xc18021bf…` emitted on sepolia when a report really landed (tx `0xda718cd5…`,
         * nonce 4). The component and the mocks below derive theirs from the same signature and
         * encoding, so without this they would agree with each other while matching nothing on
         * chain - a check that silently never fires, and a suite that passes anyway.
         */
        expect(
            toEventSelector('ProposalResultReported(uint256,uint16,address)'),
        ).toBe(
            '0xbfaa970a350cc4e6c21888b5c4b888e2750f035ce824e40cfc7dc5f07e3936c5',
        );
        expect(pad(numberToHex(BigInt(reportedProposal.proposalIndex)))).toBe(
            '0xc4c1bd4e48d9e9b8f017822f273e886c1646cb5a742fa12cb7320e8812736310',
        );
        expect(pad(numberToHex(reportedStageIndex))).toBe(
            '0x0000000000000000000000000000000000000000000000000000000000000001',
        );
    });

    it('says nothing was recorded when the Safe succeeded but no report was emitted', async () => {
        const { safeTxHash } = mockThresholdOneExecution();
        /**
         * Reproduced from sepolia `0x4c8e665d…` (nonce 6): the batch was reviewed, signed by both
         * owners and executed honestly, but its `DELEGATECALL` target held no code, so the Safe
         * emitted `ExecutionSuccess` having run nothing. Two logs, no report.
         */
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue({
            status: 'success',
            logs: [
                {
                    address: safeInfo.address,
                    topics: [
                        toEventSelector('ExecutionSuccess(bytes32,uint256)'),
                        safeTxHash,
                    ],
                    data: pad('0x01'),
                },
            ],
        } as never);

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        // The nonce is spent and nothing will ever be indexed, so waiting would age out into
        // "the indexer is slow" for a result that was never recorded.
        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.executionRecordedNothing',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.finalizing',
            }),
        ).not.toBeInTheDocument();
    });

    /**
     * A batch executes arbitrary calls, so any contract in it can emit this event with any topics.
     * A report only counts when the plugin itself emitted it for this proposal and this stage -
     * each of the three has to be checked, or a neighbouring report would be read as this one.
     */
    it.each([
        { case: 'another contract', emitter: `0x${'cd'.repeat(20)}` },
        { case: 'another proposal', proposalId: BigInt(99) },
        { case: 'another stage', stageIndex: 7 },
    ])(
        'does not accept a report event from $case',
        async ({ emitter, proposalId, stageIndex }) => {
            const { safeTxHash } = mockThresholdOneExecution();
            jest.mocked(
                WagmiActions.waitForTransactionReceipt,
            ).mockResolvedValue({
                status: 'success',
                logs: [
                    {
                        address: safeInfo.address,
                        topics: [
                            toEventSelector(
                                'ExecutionSuccess(bytes32,uint256)',
                            ),
                            safeTxHash,
                        ],
                        data: pad('0x01'),
                    },
                    {
                        address: emitter ?? reportedProposal.pluginAddress,
                        topics: [
                            toEventSelector(
                                'ProposalResultReported(uint256,uint16,address)',
                            ),
                            pad(
                                numberToHex(
                                    proposalId ??
                                        BigInt(reportedProposal.proposalIndex),
                                ),
                            ),
                            pad(numberToHex(stageIndex ?? reportedStageIndex)),
                            pad(safeInfo.address as Hex),
                        ],
                        data: '0x',
                    },
                ],
            } as never);

            render(createTestComponent());
            await clickVoteAction('approveAndExecute');

            expect(
                await screen.findByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionRecordedNothing',
                ),
            ).toBeInTheDocument();
        },
    );

    it('holds the action while an executed report is not indexed yet', async () => {
        mockThresholdOneExecution();

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        // The executed report has left the Safe queue but the indexed body result does not exist
        // yet. Re-offering the idle CTA here would invite a duplicate report at the next nonce.
        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.finalizing',
                }),
            ).toBeDisabled();
        });
    });

    it('does not claim a report executed when the execution reverted', async () => {
        mockThresholdOneExecution();
        // A receipt arrives for a reverted transaction too. Nothing was recorded and the nonce was
        // never consumed, so waiting for an indexed verdict would wait for one that cannot come.
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue({
            status: 'reverted',
            logs: [],
        } as never);

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.executionReverted',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.awaitingIndexing',
            ),
        ).not.toBeInTheDocument();
    });

    it('distinguishes a failed inner call from a failed execution', async () => {
        const { safeTxHash } = mockThresholdOneExecution();
        // The Safe ran and the nonce is gone, but the report never reached the plugin. Retrying
        // this transaction is impossible, which is why it cannot share the revert copy.
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue({
            status: 'success',
            logs: [
                {
                    address: safeInfo.address,
                    topics: [
                        toEventSelector('ExecutionFailure(bytes32,uint256)'),
                        safeTxHash,
                    ],
                    data: pad('0x01'),
                },
            ],
        } as never);

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.executionInnerFailed',
            ),
        ).toBeInTheDocument();
    });

    it('refreshes Safe state even when the execution did not succeed', async () => {
        // The confirmation before it was accepted by the service and is real work. Skipping the
        // refresh would leave the queue showing the pre-signature state.
        mockThresholdOneExecution();
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue({
            status: 'reverted',
            logs: [],
        } as never);
        const invalidateSpy = jest.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        );

        render(createTestComponent());
        await clickVoteAction('approveAndExecute');

        await waitFor(() =>
            expect(invalidateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: expect.arrayContaining([
                        'SAFE_PENDING_TRANSACTIONS',
                    ]),
                }),
            ),
        );
        invalidateSpy.mockRestore();
    });

    it('releases the hold when the executed report is never indexed', async () => {
        jest.useFakeTimers();

        try {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            });
            mockThresholdOneExecution();

            render(createTestComponent());
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
            await waitFor(() =>
                expect(
                    WagmiActions.waitForTransactionReceipt,
                ).toHaveBeenCalled(),
            );

            // A stalled indexer is indistinguishable from a slow one, so the hold must expire
            // instead of leaving the owner behind a permanent spinner with no way out.
            await act(async () => {
                jest.advanceTimersByTime(safeIndexingTimeout);
                await Promise.resolve();
            });

            expect(
                screen.getByRole('button', {
                    name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
                }),
            ).toBeEnabled();
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.indexingDelayed',
                ),
            ).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });
});
