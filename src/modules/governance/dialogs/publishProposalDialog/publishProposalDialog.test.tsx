import {
    GukModulesProvider,
    modulesCopy,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as Wagmi from 'wagmi';
import * as DaoService from '@/shared/api/daoService';
import * as usePinJson from '@/shared/api/ipfsService/mutations';
import type { IDialogLocation } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogProps,
    type ITransactionDialogStep,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryMutationResultIdle,
    generateReactQueryMutationResultSuccess,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { testLogger, timeUtils } from '@/test/utils';
import * as governanceService from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { generateProposal, generateProposalCreate } from '../../testUtils';
import {
    PublishProposalDialog,
    type PublishProposalStep,
} from './publishProposalDialog';
import type {
    IPublishProposalDialogParams,
    IPublishProposalDialogProps,
} from './publishProposalDialog.api';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

jest.mock('@/shared/components/transactionDialog', () => ({
    TransactionDialog: jest.fn((props: { children: ReactNode }) => (
        <div data-testid="transaction-dialog">{props.children}</div>
    )),
}));

describe('<PublishProposalDialog /> component', () => {
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const usePinJsonSpy = jest.spyOn(usePinJson, 'usePinJson');
    const prepareMetadataSpy = jest.spyOn(
        publishProposalDialogUtils,
        'prepareMetadata',
    );
    const buildTransactionSpy = jest.spyOn(
        publishProposalDialogUtils,
        'buildTransaction',
    );

    beforeEach(() => {
        useConnectionSpy.mockReturnValue({
            address: '0x123',
        } as unknown as Wagmi.UseConnectionReturnType);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useDaoPluginsSpy.mockReturnValue([generateFilterComponentPlugin()]);
        usePinJsonSpy.mockReturnValue(generateReactQueryMutationResultIdle());
        buildTransactionSpy.mockReturnValue({
            to: '0x123',
            data: '0x123',
            value: BigInt(0),
        });
    });

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        usePinJsonSpy.mockReset();
        prepareMetadataSpy.mockReset();
        useDaoSpy.mockReset();
        (TransactionDialog as jest.Mock).mockClear();
    });

    const generateDialogLocation = (
        params?: Partial<IPublishProposalDialogParams>,
    ): IDialogLocation<IPublishProposalDialogParams> => ({
        id: 'test',
        params: {
            proposal: generateProposalCreate(),
            daoId: 'test',
            plugin: generateDaoPlugin(),
            ...params,
        },
    });

    const createTestComponent = (
        props?: Partial<IPublishProposalDialogProps>,
    ) => {
        const completeProps: IPublishProposalDialogProps = {
            location: { id: 'test' },
            ...props,
        };

        return (
            <GukModulesProvider>
                <PublishProposalDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('throws error when dialog parameters are not set', () => {
        testLogger.suppressErrors();
        const location = { id: 'test', params: undefined };
        expect(() => render(createTestComponent({ location }))).toThrow();
    });

    it('throws error when user is not connected', () => {
        testLogger.suppressErrors();
        const location = generateDialogLocation();
        useConnectionSpy.mockReturnValue({
            address: undefined,
        } as Wagmi.UseConnectionReturnType);
        expect(() => render(createTestComponent({ location }))).toThrow();
    });

    it('renders the dialog title and description', () => {
        const location = generateDialogLocation();
        render(createTestComponent({ location }));
        expect(TransactionDialog).toHaveBeenCalledWith(
            expect.objectContaining({
                title: expect.stringMatching(
                    /publishProposalDialog.title/,
                ) as unknown,
                description: expect.stringMatching(
                    /publishProposalDialog.description/,
                ) as unknown,
            }),
            undefined,
        );
    });

    it('renders a draft version of the proposal being created', () => {
        const proposal = generateProposalCreate({
            title: 'Proposal title',
            summary: 'Proposal summary',
        });
        const location = generateDialogLocation({ proposal });
        useConnectionSpy.mockReturnValue({
            address: '0xD740fd724D616795120BC363316580dAFf41129A',
        } as unknown as Wagmi.UseConnectionReturnType);
        render(createTestComponent({ location }));
        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.DRAFT,
            ),
        ).toBeInTheDocument();
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(screen.getByText(proposal.summary)).toBeInTheDocument();
        expect(screen.getByText('0xD740…129A')).toBeInTheDocument();
    });

    it('set a custom step to pin the proposal metadata before preparing the transaction', () => {
        const parsedMetadata = {
            title: 'parsed-title',
            description: 'parsed-description',
            summary: 'summary',
            resources: [],
        };
        prepareMetadataSpy.mockReturnValue(parsedMetadata);

        const pinJson = jest.fn();
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultIdle({ mutate: pinJson }),
        );
        const errorHandler = jest.fn();

        const proposal = generateProposalCreate({
            title: 'test-title',
            summary: 'test-summary',
            resources: [{ name: 'twitter', url: 'https://x.com/test' }],
            body: '<p>Body</p>',
        });
        const location = generateDialogLocation({ proposal });
        render(createTestComponent({ location }));

        const { customSteps } = (
            TransactionDialog as jest.Mock<
                ReactNode,
                ITransactionDialogProps<PublishProposalStep>[]
            >
        ).mock.calls[0][0];
        const pinMetadataStep: ITransactionDialogStep<PublishProposalStep> =
            customSteps![0];
        expect(pinMetadataStep.meta.label).toMatch(
            /publishProposalDialog.step.PIN_METADATA.label/,
        );
        expect(pinMetadataStep.meta.errorLabel).toMatch(
            /publishProposalDialog.step.PIN_METADATA.errorLabel/,
        );
        expect(pinMetadataStep.meta.state).toEqual('idle');

        act(() => pinMetadataStep.meta.action?.({ onError: errorHandler }));
        expect(prepareMetadataSpy).toHaveBeenCalledWith(proposal);
        expect(pinJson).toHaveBeenCalledWith(
            { body: parsedMetadata },
            { onError: errorHandler },
        );
    });

    it('prepares the transaction using the buildTransaction functionality and the hash of the pinned data', async () => {
        timeUtils.setTime('2025-04-16T09:30:00');
        const daoPlugin = generateDaoPlugin();
        const ipfsResult = { IpfsHash: 'test' };
        const proposal = generateProposalCreate();
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: daoPlugin }),
        ]);
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultSuccess({ data: ipfsResult }),
        );
        const location = generateDialogLocation({ proposal });

        render(createTestComponent({ location }));
        const { prepareTransaction } = (
            TransactionDialog as jest.Mock<
                ReactNode,
                ITransactionDialogProps<PublishProposalStep>[]
            >
        ).mock.calls[0][0];
        await act(() => prepareTransaction());

        expect(buildTransactionSpy).toHaveBeenCalledWith({
            proposal,
            metadataCid: ipfsResult.IpfsHash,
            plugin: daoPlugin,
        });
    });
});

describe('<PublishProposalDialog /> proposal card status after indexing', () => {
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const usePinJsonSpy = jest.spyOn(usePinJson, 'usePinJson');
    const buildTransactionSpy = jest.spyOn(
        publishProposalDialogUtils,
        'buildTransaction',
    );
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
            address: '0x123',
        } as unknown as Wagmi.UseConnectionReturnType);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useDaoPluginsSpy.mockReturnValue([generateFilterComponentPlugin()]);
        usePinJsonSpy.mockReturnValue(generateReactQueryMutationResultIdle());
        buildTransactionSpy.mockReturnValue({
            to: '0x123',
            data: '0x123',
            value: BigInt(0),
        });
        // Default: useProposalBySlug returns no data (not yet indexed). Loading generator
        // keeps data genuinely undefined (the success generator coerces undefined to {}).
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof governanceService.useProposalBySlug
            >,
        );
        // Default: slot function returns undefined (not yet called with real proposal)
        useSlotSingleFunctionSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        usePinJsonSpy.mockReset();
        buildTransactionSpy.mockReset();
        useDaoSpy.mockReset();
        useProposalBySlugSpy.mockReset();
        useSlotSingleFunctionSpy.mockReset();
        (TransactionDialog as jest.Mock).mockClear();
    });

    const generateDialogLocation = (
        params?: Partial<IPublishProposalDialogParams>,
    ): IDialogLocation<IPublishProposalDialogParams> => ({
        id: 'test',
        params: {
            proposal: generateProposalCreate(),
            daoId: 'test-dao',
            plugin: generateDaoPlugin(),
            ...params,
        },
    });

    const createTestComponent = (
        props?: Partial<IPublishProposalDialogProps>,
    ) => {
        const completeProps: IPublishProposalDialogProps = {
            location: { id: 'test' },
            ...props,
        };
        return (
            <GukModulesProvider>
                <PublishProposalDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('keeps the proposal card in draft before indexing completes', () => {
        const location = generateDialogLocation();
        render(createTestComponent({ location }));

        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.DRAFT,
            ),
        ).toBeInTheDocument();

        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.ACTIVE,
            ),
        ).not.toBeInTheDocument();
    });

    it('switches the proposal card to the computed status after indexing completes', () => {
        const indexedProposal = generateProposal({ id: 'indexed-1' });
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: indexedProposal,
                isFetchedAfterMount: true,
            }),
        );
        useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.ACTIVE);

        const location = generateDialogLocation();
        render(createTestComponent({ location }));

        // The post-index query and slot are available from the first render; the
        // card should still wait for the indexing signal before updating.
        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.DRAFT,
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.ACTIVE,
            ),
        ).not.toBeInTheDocument();
        expect(screen.queryByText('MY-PROPOSAL')).not.toBeInTheDocument();

        // Capture onIndexed from the mocked TransactionDialog.
        const passedProps = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as Record<string, unknown>;
        const onIndexed = passedProps['onIndexed'] as
            | ((result: { slug?: string }) => void)
            | undefined;

        expect(onIndexed).toBeInstanceOf(Function);

        act(() => {
            (onIndexed as (result: { slug?: string }) => void)({
                slug: 'my-proposal',
            });
        });

        expect(
            screen.getByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.ACTIVE,
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                modulesCopy.proposalDataListItemStatus.statusLabel.DRAFT,
            ),
        ).not.toBeInTheDocument();
        expect(screen.getByText('MY-PROPOSAL')).toBeInTheDocument();
    });

    it('derives the indexed status from the governance proposal status slot', () => {
        const indexedProposal = generateProposal({ id: 'indexed-1' });
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: indexedProposal,
                isFetchedAfterMount: true,
            }),
        );
        useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.ACTIVE);

        const location = generateDialogLocation();
        render(createTestComponent({ location }));

        const passedProps = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as Record<string, unknown>;
        const onIndexed = passedProps['onIndexed'] as
            | ((result: { slug?: string }) => void)
            | undefined;

        expect(onIndexed).toBeInstanceOf(Function);

        act(() => {
            (onIndexed as (result: { slug?: string }) => void)({
                slug: 'my-proposal',
            });
        });

        expect(useSlotSingleFunctionSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
                params: indexedProposal,
                pluginId: indexedProposal.pluginInterfaceType,
            }),
        );

        // Create flow is the one place the backend delivers a slug via onIndexed — the
        // fetch must use it.
        const fetchedWithCallbackSlug = useProposalBySlugSpy.mock.calls.some(
            ([params]) => params.urlParams.slug === 'my-proposal',
        );
        expect(fetchedWithCallbackSlug).toBe(true);
    });
});
