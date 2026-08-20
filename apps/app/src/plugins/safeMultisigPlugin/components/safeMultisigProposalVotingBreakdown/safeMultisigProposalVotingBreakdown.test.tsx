import {
    addressUtils,
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
    const signer = '0x0000000000000000000000000000000000000011';

    const transaction = generateSafeMultisigTransaction({
        nonce: '7',
        confirmationsRequired: 2,
        confirmations: [generateSafeConfirmation({ owner: signer })],
    });

    const state = {
        safeInfo: generateSafeInfo({
            nonce: '7',
            threshold: 3,
            version: '1.3.0',
            owners: [signer, `0x${'2'.repeat(40)}`, `0x${'3'.repeat(40)}`],
        }),
        isLoading: false,
        isError: false,
        pendingReport: {
            transaction,
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
    } satisfies safeBodyStateApi.IUseSafeMultisigBodyStateReturn;

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

    it('renders the decoded effect, per-transaction threshold and signer state', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.report.veto.pending (count=1,required=2)',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('of 3 members')).toBeInTheDocument();
        expect(screen.getByText('1.3.0')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(signer)),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.tag.youSigned',
            ),
        ).toBeInTheDocument();
    });

    it('renders Safe state when no wallet has signed and no report is pending', () => {
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            pendingReport: undefined,
            signers: [],
            hasConnectedWalletSigned: false,
            approvalsAmount: 0,
            minApprovals: state.safeInfo.threshold,
        });

        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown.report.nonePending',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText(state.safeInfo.nonce)).toBeInTheDocument();
        expect(screen.getByText('1.3.0')).toBeInTheDocument();
    });
});
