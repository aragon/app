import {
    GukModulesProvider,
    modulesCopy,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as Wagmi from 'wagmi';
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
import * as governanceService from '../../api/governanceService';
import { generateProposal } from '../../testUtils';
import type {
    IExecuteDialogParams,
    IExecuteDialogProps,
} from './executeDialog';
// Import directly from source to avoid next/dynamic in Jest (index.ts uses dynamic())
import { ExecuteDialog } from './executeDialog';

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

describe('<ExecuteDialog /> proposal card status after indexing', () => {
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
            address: '0xExecutor',
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
        params?: Partial<IExecuteDialogParams>,
    ): IDialogLocation<IExecuteDialogParams> => ({
        id: 'test',
        params: {
            proposal: generateProposal(),
            status: ProposalStatus.EXECUTABLE,
            daoId: 'test-dao',
            ...params,
        },
    });

    const createTestComponent = (props?: Partial<IExecuteDialogProps>) => {
        const completeProps: IExecuteDialogProps = {
            location: { id: 'test' },
            ...props,
        };
        return (
            <GukModulesProvider>
                <ExecuteDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('keeps the proposal card on the passed-in status before indexing completes', () => {
        const location = generateDialogLocation({
            status: ProposalStatus.EXECUTABLE,
        });
        render(createTestComponent({ location }));

        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTABLE,
            ),
        ).toBeInTheDocument();

        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTED,
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
                            interfaceType: PluginInterfaceType.MULTISIG,
                        }),
                    ],
                }),
            }),
        );
        const indexedProposal = generateProposal({ id: 'executed-1' });
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: indexedProposal,
                isFetchedAfterMount: true,
            }),
        );
        useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.EXECUTED);

        const location = generateDialogLocation({
            status: ProposalStatus.EXECUTABLE,
        });
        render(createTestComponent({ location }));

        // The post-index query and slot are available from the first render; the
        // card should still wait for the indexing signal before updating.
        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTABLE,
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTED,
            ),
        ).not.toBeInTheDocument();

        // Capture onIndexed from the mocked TransactionDialog.
        const { onIndexed } = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as ITransactionDialogProps;

        expect(onIndexed).toBeInstanceOf(Function);

        // Execute transactions do not receive a callback slug, so the dialog must
        // use its locally derived slug.
        act(() => {
            onIndexed!({ slug: undefined });
        });

        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTED,
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.EXECUTABLE,
            ),
        ).not.toBeInTheDocument();

        // The fetch must use the locally derived slug, not the absent callback slug.
        const fetchedWithLocalSlug = useProposalBySlugSpy.mock.calls.some(
            ([params]) => params.urlParams.slug === 'SLUG-1',
        );
        expect(fetchedWithLocalSlug).toBe(true);
    });
});
