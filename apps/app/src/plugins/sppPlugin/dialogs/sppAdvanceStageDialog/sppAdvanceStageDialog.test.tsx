import {
    GukModulesProvider,
    modulesCopy,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as Wagmi from 'wagmi';
import * as governanceService from '@/modules/governance/api/governanceService';
import { generateProposal } from '@/modules/governance/testUtils';
import * as DaoService from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import type { IDialogLocation } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogProps,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { generateSppProposal } from '../../testUtils';
import * as sppProposalUtils from '../../utils/sppProposalUtils';
import type {
    ISppAdvanceStageDialogParams,
    ISppAdvanceStageDialogProps,
} from './sppAdvanceStageDialog';
import { SppAdvanceStageDialog } from './sppAdvanceStageDialog';

jest.mock('@/shared/components/transactionDialog', () => {
    const actual = jest.requireActual<
        typeof import('@/shared/components/transactionDialog')
    >('@/shared/components/transactionDialog');
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

describe('<SppAdvanceStageDialog /> proposal card status after indexing', () => {
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
    const getProposalStatusSpy = jest.spyOn(
        sppProposalUtils.sppProposalUtils,
        'getProposalStatus',
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
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
    });

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDaoSpy.mockReset();
        useProposalBySlugSpy.mockReset();
        useSlotSingleFunctionSpy.mockReset();
        getProposalStatusSpy.mockReset();
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

    const createTestComponent = (
        props?: Partial<ISppAdvanceStageDialogProps>,
    ) => {
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

    it('keeps the proposal card on the current status before indexing completes', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.REJECTED);
        const location = generateDialogLocation();
        render(createTestComponent({ location }));

        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.REJECTED,
            ),
        ).toBeInTheDocument();

        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.ACTIVE,
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTABLE,
            ),
        ).not.toBeInTheDocument();
    });

    it('switches the proposal card to the computed status after indexing completes', () => {
        // Fixtures align the DAO plugin address with the proposal plugin address,
        // so proposalUtils.getProposalSlug resolves to SLUG-1.
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({
                    plugins: [
                        generateDaoPlugin({
                            interfaceType: PluginInterfaceType.SPP,
                        }),
                    ],
                }),
            }),
        );
        const indexedProposal = generateProposal({ id: 'advanced-1' });
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: indexedProposal,
                isFetchedAfterMount: true,
            }),
        );
        useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.EXECUTABLE);

        const location = generateDialogLocation();
        render(createTestComponent({ location }));

        // The post-index query and slot are available from the first render; the
        // card should still wait for the indexing signal before updating.
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

        // Capture onIndexed from the mocked TransactionDialog.
        const { onIndexed } = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as ITransactionDialogProps;

        expect(onIndexed).toBeInstanceOf(Function);

        // Advance-stage transactions do not receive a callback slug, so the
        // dialog must use its locally derived slug.
        act(() => {
            onIndexed!({ slug: undefined });
        });

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

        // The fetch must use the locally derived slug, not the absent callback slug.
        const fetchedWithLocalSlug = useProposalBySlugSpy.mock.calls.some(
            ([params]) => params.urlParams.slug === 'SLUG-1',
        );
        expect(fetchedWithLocalSlug).toBe(true);
    });
});
