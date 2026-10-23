import {
    IconType,
    ProposalStatus,
    ProposalVotingTab,
    Tabs,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    generateSppProposal,
    generateSppStage,
} from '../../../sppPlugin/testUtils';
import { SppProposalType } from '../../../sppPlugin/types';
import * as safeBodyStateApi from '../../hooks/useSafeMultisigBodyState';
import {
    generateSafeBodyState,
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { SafeTransactionState } from '../../types';
import {
    type ISafeMultisigProposalVotingBreakdownProps,
    SafeMultisigProposalVotingBreakdown,
} from './safeMultisigProposalVotingBreakdown';

describe('<SafeMultisigProposalVotingBreakdown /> component', () => {
    const signer = '0x0000000000000000000000000000000000000011';
    const secondSigner = '0x0000000000000000000000000000000000000012';
    const useSafeMultisigBodyStateSpy = jest.spyOn(
        safeBodyStateApi,
        'useSafeMultisigBodyState',
    );

    const state = generateSafeBodyState({
        safeInfo: generateSafeInfo({
            nonce: '7',
            threshold: 2,
            version: '1.3.0',
            owners: [
                signer,
                secondSigner,
                '0x0000000000000000000000000000000000000013',
            ],
        }),
        isLoading: false,
        isError: false,
        pendingReport: {
            transaction: generateSafeMultisigTransaction({
                nonce: '7',
                confirmationsRequired: 2,
                confirmations: [generateSafeConfirmation({ owner: signer })],
            }),
            report: {
                proposalId: BigInt(42),
                stageId: 1,
                resultType: SppProposalType.VETO,
                tryAdvance: false,
            },
            state: SafeTransactionState.LIVE,
            status: ProposalStatus.ACTIVE,
            hasNonceCompetition: false,
        },
        signers: [signer],
        hasConnectedWalletSigned: true,
        approvalsAmount: 1,
        minApprovals: 2,
        membersCount: 3,
        isRateLimited: false,
        isStale: false,
    });

    beforeEach(() => {
        useSafeMultisigBodyStateSpy.mockReturnValue(state);
    });

    afterEach(() => {
        useSafeMultisigBodyStateSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeMultisigProposalVotingBreakdownProps>,
    ) => {
        const completeProps: ISafeMultisigProposalVotingBreakdownProps = {
            body: '0x0000000000000000000000000000000000000001',
            proposal: generateSppProposal({
                network: Network.ETHEREUM_MAINNET,
                proposalIndex: '42',
            }),
            stage: generateSppStage({ stageIndex: 1 }),
            isVeto: true,
            ...props,
        };

        return (
            <Tabs.Root defaultValue={ProposalVotingTab.BREAKDOWN}>
                <SafeMultisigProposalVotingBreakdown {...completeProps} />
            </Tabs.Root>
        );
    };

    it('keeps a live threshold neutral without a reached status', () => {
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            approvalsAmount: 2,
            minApprovals: 2,
        });

        render(createTestComponent());

        const progress = screen.getByRole('progressbar');
        expect(progress.firstElementChild).toHaveClass('bg-neutral-400');
        expect(
            screen.queryByTestId(IconType.CHECKMARK),
        ).not.toBeInTheDocument();
        expect(screen.queryByText('reached')).not.toBeInTheDocument();
    });

    it('shows an unreached status while a live body is below threshold', () => {
        render(createTestComponent());

        expect(screen.getByText('not reached')).toBeInTheDocument();
        expect(screen.getByText('of 3 members')).toBeInTheDocument();
    });

    it('draws recovered confirmations against the current owner count', () => {
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            settledReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '4',
                    isExecuted: true,
                    confirmationsRequired: 2,
                    confirmations: [
                        generateSafeConfirmation({ owner: signer }),
                        generateSafeConfirmation({ owner: secondSigner }),
                    ],
                }),
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
            },
        });

        render(createTestComponent({ isVeto: false }));

        expect(screen.getByTestId(IconType.CHECKMARK)).toBeInTheDocument();
        expect(screen.getByText('reached')).toBeInTheDocument();
        expect(screen.getByText('of 3 members')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('shows a skeleton rather than read-state prose without Safe info', () => {
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            safeInfo: undefined,
            isError: true,
        });

        render(createTestComponent());

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders the action passed by the terminal', () => {
        render(
            createTestComponent({
                children: <button type="button">Approve</button>,
            }),
        );

        expect(
            screen.getByRole('button', { name: 'Approve' }),
        ).toBeInTheDocument();
    });
});
