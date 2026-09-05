import { ProposalStatus, ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    generateSppProposal,
    generateSppStage,
} from '../../../sppPlugin/testUtils';
import { SppProposalType } from '../../../sppPlugin/types';
import { sppStageUtils } from '../../../sppPlugin/utils/sppStageUtils';
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
    const useSafeMultisigBodyStateSpy = jest.spyOn(
        safeBodyStateApi,
        'useSafeMultisigBodyState',
    );
    const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');
    const signer = '0x0000000000000000000000000000000000000011';

    const state = generateSafeBodyState({
        safeInfo: generateSafeInfo({
            nonce: '7',
            threshold: 3,
            version: '1.3.0',
            owners: [signer, `0x${'2'.repeat(40)}`, `0x${'3'.repeat(40)}`],
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
        getStageStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
    });

    afterEach(() => {
        useSafeMultisigBodyStateSpy.mockReset();
        getStageStatusSpy.mockReset();
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

    it('links a reported body out to the Safe once its transaction executed', () => {
        // The action slot is gone by then - the chrome drops it as soon as the proposal executes -
        // so the provenance has to live on the body itself.
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            settledResultType: SppProposalType.VETO,
        });

        render(createTestComponent());

        const link = screen.getByRole('link', {
            name: 'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.executed',
        });

        expect(link).toHaveAttribute(
            'href',
            'https://app.safe.global/transactions/history?safe=eth:0x0000000000000000000000000000000000000001',
        );
    });

    it('shows no Safe link while the body has not reported', () => {
        render(createTestComponent());

        expect(
            screen.queryByRole('link', {
                name: 'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.executed',
            }),
        ).not.toBeInTheDocument();
    });

    it.each([
        {
            label: 'with the upstream retry window',
            rateLimitedRetryAfter: 42,
            expected:
                'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.rateLimitedRetry (seconds=42)',
        },
        {
            label: 'without a retry window',
            rateLimitedRetryAfter: undefined,
            expected:
                'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.rateLimited',
        },
    ])(
        'renders an exhausted Safe API quota as a degraded state $label',
        ({ rateLimitedRetryAfter, expected }) => {
            // A rate-limited read recovers on its own once the poll backs off, so it must not read
            // as the generic hard failure the user is expected to act on.
            useSafeMultisigBodyStateSpy.mockReturnValue({
                ...state,
                safeInfo: undefined,
                isError: true,
                isRateLimited: true,
                rateLimitedRetryAfter,
            });

            render(createTestComponent());

            expect(screen.getByText(expected)).toBeInTheDocument();
            expect(
                screen.queryByText(
                    'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.error',
                ),
            ).not.toBeInTheDocument();
        },
    );

    it('states the live approval count against the Safe owner set', () => {
        render(createTestComponent());

        // Fed from live Safe state rather than an indexed snapshot: 1 of 3 owners have signed.
        expect(screen.getByText('of 3 members')).toBeInTheDocument();
    });

    it('leaves the Safe particulars to the settings tab', () => {
        render(createTestComponent());

        // These used to be restated here beside gov-ui-kit's own approval header. Their home is the
        // body's settings, so the breakdown must not grow them back.
        expect(screen.queryByText('1.3.0')).not.toBeInTheDocument();
        expect(screen.queryByText('7')).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.viewSafeAccount',
            ),
        ).not.toBeInTheDocument();
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
