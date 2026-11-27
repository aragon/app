import {
    AddressNetworkProvider,
    AddressResolutionProvider,
    addressEntryKey,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { SafeTransactionState } from '@/modules/safe/types';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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
import { SafeMultisigProposalVotingSummary } from './safeMultisigProposalVotingSummary';
import type { ISafeMultisigProposalVotingSummaryProps } from './safeMultisigProposalVotingSummary.api';

describe('<SafeMultisigProposalVotingSummary /> component', () => {
    const body = '0x0000000000000000000000000000000000000001';
    const signer = '0x0000000000000000000000000000000000000011';

    const useSafeMultisigBodyStateSpy = jest.spyOn(
        safeBodyStateApi,
        'useSafeMultisigBodyState',
    );
    const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');

    const pendingReport = {
        transaction: generateSafeMultisigTransaction({
            nonce: '7',
            confirmationsRequired: 2,
            confirmations: [generateSafeConfirmation({ owner: signer })],
        }),
        report: {
            proposalId: BigInt(42),
            stageId: 1,
            resultType: SppProposalType.APPROVAL,
            tryAdvance: false,
        },
        state: SafeTransactionState.LIVE,
        status: ProposalStatus.ACTIVE,
        hasNonceCompetition: false,
    };

    const state = generateSafeBodyState({
        safeInfo: generateSafeInfo({
            nonce: '7',
            threshold: 2,
            owners: [signer, `0x${'2'.repeat(40)}`, `0x${'3'.repeat(40)}`],
        }),
        pendingReport,
        isExecutableNow: true,
        signers: [signer],
        hasConnectedWalletSigned: true,
        approvalsAmount: 1,
        minApprovals: 2,
        membersCount: 3,
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
        props?: Partial<ISafeMultisigProposalVotingSummaryProps>,
    ) => {
        const completeProps: ISafeMultisigProposalVotingSummaryProps = {
            body,
            proposal: generateSppProposal({
                network: Network.ETHEREUM_MAINNET,
                proposalIndex: '42',
            }),
            stage: generateSppStage({ stageIndex: 1 }),
            isVeto: false,
            ...props,
        };

        return <SafeMultisigProposalVotingSummary {...completeProps} />;
    };

    it('states the live approval count against the Safe owner set', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingSummary.approvalLabel',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingSummary.ownerCount (count=3)',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('keeps a live threshold neutral once the required count is met', () => {
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            approvalsAmount: 2,
            minApprovals: 2,
        });

        render(createTestComponent());

        expect(screen.getByRole('progressbar').firstElementChild).toHaveClass(
            'bg-neutral-400',
        );
    });

    it('reads the indexed result once the body has reported, not the Safe queue', () => {
        getStageStatusSpy.mockReturnValue(ProposalStatus.ACCEPTED);
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            settledResultType: SppProposalType.APPROVAL,
        });

        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingSummary.approved',
            ),
        ).toBeInTheDocument();
    });

    it('reports a replaced body when the stage closed with a superseded report and no result', () => {
        getStageStatusSpy.mockReturnValue(ProposalStatus.REJECTED);
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            pendingReport: {
                ...pendingReport,
                state: SafeTransactionState.SUPERSEDED,
            },
        });

        render(createTestComponent());

        // A replacement is not the same as declining to approve, and the owner set never voted it
        // down: say what happened to the transaction.
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingSummary.replaced',
            ),
        ).toBeInTheDocument();
    });

    it('states the count that stopped short when the stage closed without a report', () => {
        getStageStatusSpy.mockReturnValue(ProposalStatus.REJECTED);
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            pendingReport: undefined,
        });

        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingSummary.notApproved',
            ),
        ).toBeInTheDocument();
    });

    it('names the body without a count when the Safe state cannot be read', () => {
        useSafeMultisigBodyStateSpy.mockReturnValue({
            ...state,
            safeInfo: undefined,
            isError: true,
        });

        render(createTestComponent());

        // A failed read must not be dressed up as zero approvals.
        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigProposalVotingSummary.approvalLabel',
            ),
        ).not.toBeInTheDocument();
        expect(screen.getByText('0x0000…0001')).toBeInTheDocument();
    });

    // The body is a contract, so its name is saved for its network: the page's network decides.
    it.each([
        { network: Network.ETHEREUM_MAINNET, expected: 'Treasury Safe' },
        { network: Network.BASE_MAINNET, expected: '0x0000…0001' },
    ])(
        'names the body from the address book on a page of $network',
        ({ network, expected }) => {
            const entries = new Map([
                [
                    addressEntryKey(
                        body,
                        networkDefinitions[Network.ETHEREUM_MAINNET].id,
                    ),
                    {
                        label: 'Treasury Safe',
                        source: 'known-account' as const,
                    },
                ],
            ]);

            render(
                <AddressResolutionProvider entries={entries}>
                    <AddressNetworkProvider
                        chainId={networkDefinitions[network].id}
                    >
                        {createTestComponent()}
                    </AddressNetworkProvider>
                </AddressResolutionProvider>,
            );

            expect(screen.getAllByText(expected).length).toBeGreaterThan(0);
        },
    );
});
