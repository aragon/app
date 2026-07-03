// contract 001 — proof-first tests for AC4: sppAdvanceStageDialog post-indexing status update
import {
    GukModulesProvider,
    modulesCopy,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as Wagmi from 'wagmi';
import * as DaoService from '@/shared/api/daoService';
import type { IDialogLocation } from '@/shared/components/dialogProvider';
import { TransactionDialog } from '@/shared/components/transactionDialog';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import * as governanceService from '@/modules/governance/api/governanceService';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { generateProposal } from '@/modules/governance/testUtils';
import { generateSppProposal } from '../../testUtils';
import { SppAdvanceStageDialog } from './sppAdvanceStageDialog';
import type {
    ISppAdvanceStageDialogParams,
    ISppAdvanceStageDialogProps,
} from './sppAdvanceStageDialog';

jest.mock('@/shared/components/transactionDialog', () => {
    const actual = jest.requireActual<typeof import('@/shared/components/transactionDialog')>(
        '@/shared/components/transactionDialog',
    );
    return {
        ...actual,
        TransactionDialog: jest.fn((props: { children: ReactNode }) => (
            <div data-testid="transaction-dialog">{props.children}</div>
        )),
    };
});

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ refresh: jest.fn() })),
    useParams: jest.fn(() => ({})),
}));

describe('<SppAdvanceStageDialog /> post-indexing status (contract 001 AC4)', () => {
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useProposalBySlugSpy = jest.spyOn(
        governanceService,
        'useProposalBySlug',
    );
    const useSlotSingleFunctionSpy = jest.spyOn(
        useSlotSingleFunction,
        'useSlotSingleFunction',
    );

    beforeEach(() => {
        useConnectionSpy.mockReturnValue({
            address: '0xAdvancer',
        } as unknown as Wagmi.UseConnectionReturnType);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        // Loading generator keeps data genuinely undefined (the success generator
        // coerces undefined to {}).
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof governanceService.useProposalBySlug
            >,
        );
        useSlotSingleFunctionSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDaoSpy.mockReset();
        useProposalBySlugSpy.mockReset();
        useSlotSingleFunctionSpy.mockReset();
        (TransactionDialog as jest.Mock).mockClear();
    });

    const generateDialogLocation = (
        params?: Partial<ISppAdvanceStageDialogParams>,
    ): IDialogLocation<ISppAdvanceStageDialogParams> => ({
        id: 'test',
        params: {
            proposal: generateSppProposal(),
            daoId: 'test-dao',
            ...params,
        },
    });

    const createTestComponent = (props?: Partial<ISppAdvanceStageDialogProps>) => {
        const completeProps: ISppAdvanceStageDialogProps = {
            location: { id: 'test' },
            ...props,
        };
        return (
            <GukModulesProvider>
                <SppAdvanceStageDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    // AC4 pre-index: card shows hardcoded ACTIVE status before indexing
    it('AC4 pre-index: proposal card shows hardcoded ACTIVE status before indexing completes', () => {
        const location = generateDialogLocation();
        render(createTestComponent({ location }));

        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.ACTIVE,
            ),
        ).toBeInTheDocument();

        // EXECUTABLE must not appear yet (the post-index real status we'll test)
        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTABLE,
            ),
        ).not.toBeInTheDocument();
    });

    it('AC4 post-index: after indexing completes, proposal card switches from ACTIVE to real computed status', () => {
        // Fixtures aligned so the LOCAL slug derives: dao plugin address matches
        // proposal.pluginAddress ('0x123') → proposalUtils.getProposalSlug = 'SLUG-1'.
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ plugins: [generateDaoPlugin()] }),
            }),
        );
        const indexedProposal = generateProposal({ id: 'advanced-1' });
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: indexedProposal }),
        );
        // The real status after advancing a stage would be EXECUTABLE (stage passed)
        useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.EXECUTABLE);

        const location = generateDialogLocation();
        render(createTestComponent({ location }));

        // Gate check: fetch + slot mocks are hot from the FIRST render (the proposal is
        // fetchable before the tx is even signed here), yet the card must keep the
        // placeholder until the indexing signal — pins "only after we index it".
        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.ACTIVE,
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTABLE,
            ),
        ).not.toBeInTheDocument();

        // Capture the onIndexed callback — contract 001 D2
        const passedProps = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as Record<string, unknown>;
        const onIndexed = passedProps['onIndexed'] as
            | ((result: { slug?: string }) => void)
            | undefined;

        expect(onIndexed).toBeInstanceOf(Function);

        // The backend only returns a slug for proposal-CREATION transactions
        // (transactionDialog.api.ts:19-21) — for PROPOSAL_ADVANCE_STAGE the payload
        // carries no slug, and the dialog must fall back to its locally derived slug.
        act(() => {
            (onIndexed as (result: { slug?: string }) => void)({
                slug: undefined,
            });
        });

        // EXECUTABLE must now appear; ACTIVE must disappear
        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTABLE,
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.ACTIVE,
            ),
        ).not.toBeInTheDocument();

        // The fetch must use the LOCALLY derived slug, not the (absent) callback slug.
        const fetchedWithLocalSlug = useProposalBySlugSpy.mock.calls.some(
            ([params]) => params.urlParams.slug === 'SLUG-1',
        );
        expect(fetchedWithLocalSlug).toBe(true);
    });

    // AC3 / AC4: real status derived via useSlotSingleFunction with GOVERNANCE_PROCESS_PROPOSAL_STATUS
    it('AC4+AC3: after indexing, status is derived via useSlotSingleFunction with GOVERNANCE_PROCESS_PROPOSAL_STATUS slot', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ plugins: [generateDaoPlugin()] }),
            }),
        );
        const indexedProposal = generateProposal({ id: 'advanced-1' });
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: indexedProposal }),
        );
        useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.EXECUTABLE);

        const location = generateDialogLocation();
        render(createTestComponent({ location }));

        const passedProps = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as Record<string, unknown>;
        const onIndexed = passedProps['onIndexed'] as
            | ((result: { slug?: string }) => void)
            | undefined;

        expect(onIndexed).toBeInstanceOf(Function);

        // No slug for PROPOSAL_ADVANCE_STAGE — indexed signal only (contract §2.4)
        act(() => {
            (onIndexed as (result: { slug?: string }) => void)({
                slug: undefined,
            });
        });

        // pluginId is load-bearing: without it the slot registry lookup misses in
        // production and the status never resolves.
        expect(useSlotSingleFunctionSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
                params: indexedProposal,
                pluginId: indexedProposal.pluginInterfaceType,
            }),
        );
    });
});
