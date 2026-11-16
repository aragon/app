import {
    GukModulesProvider,
    modulesCopy,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as Wagmi from 'wagmi';
import * as ensModule from '@/modules/ens';
import * as governanceService from '@/modules/governance/api/governanceService';
import { generateProposal } from '@/modules/governance/testUtils';
import { externalPluginId } from '@/plugins/safeMultisigPlugin/constants';
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
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
    generateSppStagePlugin,
} from '../../testUtils';
import * as sppProposalUtils from '../../utils/sppProposalUtils';
import * as sppStageUtils from '../../utils/sppStageUtils';
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
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');

    beforeEach(() => {
        useEnsNameSpy.mockReturnValue({ data: null } as ReturnType<
            typeof ensModule.useEnsName
        >);
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
        useEnsNameSpy.mockReset();
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

    it('shows the resolved ENS name of the proposal creator', () => {
        const creator = {
            address: '0x92e9d0Cd7f5E87a2B2b19661aAa4C2e6D019472F',
            ens: null,
            avatar: null,
        };
        useEnsNameSpy.mockReturnValue({ data: 'creator.eth' } as ReturnType<
            typeof ensModule.useEnsName
        >);
        const location = generateDialogLocation({
            proposal: generateSppProposal({ creator }),
        });

        render(createTestComponent({ location }));

        expect(useEnsNameSpy).toHaveBeenCalledWith(creator.address);
        expect(screen.getByText(/creator\.eth/)).toBeInTheDocument();
    });

    describe('queued Safe report forfeiture warning', () => {
        const getBodyPluginIdSpy = jest.spyOn(
            sppStageUtils.sppStageUtils,
            'getBodyPluginId',
        );
        const warningKey =
            'app.plugins.spp.advanceStageDialog.queuedReportWarning';

        afterEach(() => getBodyPluginIdSpy.mockReset());

        const generateStagedProposal = () =>
            generateSppProposal({
                stageIndex: 1,
                settings: generateSppPluginSettings({
                    stages: [
                        generateSppStage({
                            stageIndex: 0,
                            plugins: [generateSppStagePlugin()],
                        }),
                        generateSppStage({
                            stageIndex: 1,
                            plugins: [generateSppStagePlugin()],
                        }),
                    ],
                }),
            });

        it('warns when the stage being advanced from carries a Safe body', () => {
            getBodyPluginIdSpy.mockReturnValue(PluginInterfaceType.SAFE);
            const location = generateDialogLocation({
                proposal: generateStagedProposal(),
            });
            render(createTestComponent({ location }));

            expect(screen.getByText(warningKey)).toBeInTheDocument();
        });

        it('stays silent when no Safe body sits on the stage being advanced from', () => {
            getBodyPluginIdSpy.mockReturnValue(externalPluginId);
            const location = generateDialogLocation({
                proposal: generateStagedProposal(),
            });
            render(createTestComponent({ location }));

            expect(screen.queryByText(warningKey)).not.toBeInTheDocument();
        });
    });
});
