import { clipboardUtils, GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import type * as ReactQuery from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    DaoProposalDetailsPageClient,
    type IDaoProposalDetailsPageClientProps,
} from '@/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPageClient';
import { generateProposal, generateSimulationResult } from '@/modules/governance/testUtils';
import * as DaoService from '@/shared/api/daoService';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import { generateAddressInfo, generateDao, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import * as actionSimulationService from '../../api/actionSimulationService';
import * as governanceService from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

jest.mock('@tanstack/react-query', () => {
    const actual = jest.requireActual<typeof ReactQuery>('@tanstack/react-query');
    return {
        ...actual,
        useQueryClient: jest.fn(),
    };
});

jest.mock('../../components/proposalVotingTerminal', () => ({
    ProposalVotingTerminal: () => <div data-testid="voting-terminal-mock" />,
}));

jest.mock('../../components/proposalExecutionStatus', () => ({
    ProposalExecutionStatus: () => <div data-testid="proposal-execution-status-mock" />,
}));

describe('<DaoProposalDetailsPageClient /> component', () => {
    const useProposalSpy = jest.spyOn(governanceService, 'useProposalBySlug');
    const useProposalActionsSpy = jest.spyOn(governanceService, 'useProposalActions');
    const useLastSimulationSpy = jest.spyOn(actionSimulationService, 'useLastSimulation');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');
    const useSlotSingleFunctionSpy = jest.spyOn(useSlotSingleFunction, 'useSlotSingleFunction');

    const mockInvalidateQueries = jest.fn();
    const mockQueryClient = { invalidateQueries: mockInvalidateQueries };

    beforeEach(() => {
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateProposal() }));
        useProposalActionsSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: { decoding: false, actions: [], rawActions: [] },
            })
        );
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useLastSimulationSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSimulationResult(),
            })
        );
        (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    });

    afterEach(() => {
        useProposalSpy.mockReset();
        useProposalActionsSpy.mockReset();
        useDaoSpy.mockReset();
        clipboardCopySpy.mockReset();
        useSlotSingleFunctionSpy.mockReset();
        useLastSimulationSpy.mockReset();
        mockInvalidateQueries.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalDetailsPageClientProps>) => {
        const completeProps: IDaoProposalDetailsPageClientProps = {
            daoId: 'dao-id',
            proposalSlug: 'proposal-id',
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoProposalDetailsPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the proposal title and summary', () => {
        const proposal = generateProposal({
            id: 'test-id',
            title: 'test-title',
            summary: 'my-summary',
        });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent({ proposalSlug: proposal.id }));

        expect(useProposalSpy).toHaveBeenCalledWith({
            urlParams: { slug: proposal.id },
            queryParams: { daoId: 'dao-id' },
        });
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(screen.getByText(proposal.summary)).toBeInTheDocument();
    });

    it('renders the proposal page breadcrumbs', () => {
        const proposal = generateProposal({
            proposalIndex: 'incremental-index',
            incrementalId: 3,
        });
        const proposalSlug = 'ADMIN-10';
        const dao = generateDao({
            id: 'test-id',
            address: '0x123',
            network: Network.ETHEREUM_MAINNET,
        });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));

        render(createTestComponent({ daoId: dao.id, proposalSlug }));

        const breadcrumbsContainer = screen.getByRole('navigation');
        expect(breadcrumbsContainer).toBeInTheDocument();

        const proposalsLink = screen.getByRole('link', {
            name: /daoProposalDetailsPage.header.breadcrumb.proposals/,
        });
        expect(proposalsLink).toBeInTheDocument();
        expect(proposalsLink.getAttribute('href')).toEqual(`/dao/${dao.network}/${dao.address}/proposals`);
        expect(within(breadcrumbsContainer).getByText(proposalSlug)).toBeInTheDocument();
    });

    it('uses the plugin-specific function to process and render the proposal status', () => {
        const status = ProposalStatus.REJECTED;
        const proposal = generateProposal({
            pluginInterfaceType: PluginInterfaceType.MULTISIG,
        });
        useSlotSingleFunctionSpy.mockReturnValue(status);
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        expect(useSlotSingleFunctionSpy).toHaveBeenCalledWith({
            params: proposal,
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: proposal.pluginInterfaceType,
        });
        expect(screen.getAllByText('Rejected')).toHaveLength(2);
        expect(screen.getByText(/daoProposalDetailsPage.aside.details.status/)).toBeInTheDocument();
    });

    it('returns empty container on proposal fetch error', () => {
        useProposalSpy.mockReturnValue(generateReactQueryResultError({ error: new Error('proposal fetch error') }));
        useProposalActionsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error('proposal actions fetch error') }));
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the proposal description when defined on a collapsible component', () => {
        const proposal = generateProposal({
            description: 'proposal-description',
        });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        expect(screen.getByText(/daoProposalDetailsPage.main.description.header/)).toBeInTheDocument();
        expect(screen.getByTestId('doc-parser')).toBeInTheDocument();
        expect(screen.getByText(proposal.description!)).toBeInTheDocument();
    });

    it('renders the proposal info', () => {
        const proposalSlug = 'TEST-SLUG-1';
        const proposal = generateProposal({
            proposalIndex: '123',
            blockTimestamp: 1_690_367_967,
            creator: generateAddressInfo({ address: '0x123' }),
            network: Network.ETHEREUM_SEPOLIA,
            transactionHash: '0x4654',
            incrementalId: 3,
        });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));

        render(createTestComponent({ proposalSlug }));

        const detailsTitle = screen.getByText(/daoProposalDetailsPage.aside.details.title/);
        const detailsContainer = screen.getByTestId('proposal-details-container');

        expect(detailsTitle).toBeInTheDocument();
        expect(screen.getByText(/daoProposalDetailsPage.aside.details.onChainId/)).toBeInTheDocument();
        expect(within(detailsContainer).getByText(proposal.proposalIndex)).toBeInTheDocument();
        expect(screen.getByText(/daoProposalDetailsPage.aside.details.id/)).toBeInTheDocument();
        expect(within(detailsContainer).getByText(proposalSlug)).toBeInTheDocument();

        expect(screen.getByText(/daoProposalDetailsPage.aside.details.published/)).toBeInTheDocument();
        const creationBlockLink = screen.getByRole('link', {
            name: 'July 26, 2023',
        });
        expect(creationBlockLink).toBeInTheDocument();
        expect(creationBlockLink.getAttribute('href')).toEqual('https://sepolia.etherscan.io/tx/0x4654');

        expect(screen.getByText(/daoProposalDetailsPage.aside.details.creator/)).toBeInTheDocument();
        const creatorLink = screen.getByRole('link', {
            name: proposal.creator.address,
        });
        expect(creatorLink).toBeInTheDocument();
        expect(creatorLink.getAttribute('href')).toEqual('https://sepolia.etherscan.io/address/0x123');
    });

    it('renders the proposal resources as external links', () => {
        const resources = [
            { name: 'Twitter', url: 'https://test.com' },
            { name: 'Website', url: 'https://w.com' },
        ];
        const proposal = generateProposal({ resources });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        expect(screen.getByText(/daoProposalDetailsPage.aside.links.title/)).toBeInTheDocument();

        resources.forEach((resource) => {
            const link = screen.getByRole('link', {
                name: new RegExp(resource.name),
            });
            expect(link).toBeInTheDocument();
            expect(screen.getByText(resource.url)).toBeInTheDocument();
            expect(link.getAttribute('href')).toEqual(resource.url);
            expect(link.getAttribute('target')).toEqual('_blank');
        });
    });

    it('does not render the links section when proposal has no resources', () => {
        const proposal = generateProposal({ resources: [] });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());
        expect(screen.queryByText(/daoProposalDetailsPage.aside.links.title/)).not.toBeInTheDocument();
    });

    it('renders the proposal voting terminal', () => {
        render(createTestComponent());
        expect(screen.getByTestId('voting-terminal-mock')).toBeInTheDocument();
    });

    describe('Action simulation behavior', () => {
        const useSimulateProposalSpy = jest.spyOn(actionSimulationService, 'useSimulateProposal');

        beforeEach(() => {
            useSimulateProposalSpy.mockReturnValue({
                mutate: jest.fn(),
                isPending: false,
                isError: false,
            } as Partial<ReturnType<typeof actionSimulationService.useSimulateProposal>> as ReturnType<
                typeof actionSimulationService.useSimulateProposal
            >);
        });

        afterEach(() => {
            useSimulateProposalSpy.mockReset();
        });

        it('does not fetch simulation when hasSimulation is false', () => {
            const proposal = generateProposal({
                hasActions: true,
                hasSimulation: false,
            });
            const dao = generateDao({ network: Network.ETHEREUM_MAINNET });
            useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
            useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
            useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.ACTIVE);

            render(createTestComponent());

            expect(useLastSimulationSpy).toHaveBeenCalledWith({ urlParams: { proposalId: proposal.id } }, { enabled: false });
        });

        it('fetches simulation when hasSimulation is true', () => {
            const proposal = generateProposal({
                hasActions: true,
                hasSimulation: true,
            });
            const dao = generateDao({ network: Network.ETHEREUM_MAINNET });
            useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
            useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
            useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.EXECUTED);

            render(createTestComponent());

            expect(useLastSimulationSpy).toHaveBeenCalledWith({ urlParams: { proposalId: proposal.id } }, { enabled: true });
        });

        it('invalidates proposal query after successful simulation', async () => {
            const mutateFn = jest.fn(
                (
                    _params: unknown,
                    options?: {
                        onSuccess?: () => void;
                        onError?: () => void;
                        onSettled?: () => void;
                    }
                ) => {
                    if (options?.onSuccess) {
                        options.onSuccess();
                    }
                }
            );

            useSimulateProposalSpy.mockReturnValue({
                mutate: mutateFn,
                isPending: false,
                isError: false,
            } as Partial<ReturnType<typeof actionSimulationService.useSimulateProposal>> as ReturnType<
                typeof actionSimulationService.useSimulateProposal
            >);

            const proposal = generateProposal({
                id: 'test-proposal',
                hasActions: true,
            });
            const dao = generateDao({ network: Network.ETHEREUM_MAINNET });
            useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
            useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
            useSlotSingleFunctionSpy.mockReturnValue(ProposalStatus.ACTIVE);

            render(
                createTestComponent({
                    daoId: 'test-dao',
                    proposalSlug: 'test-slug',
                })
            );

            const simulateButton = screen.getByRole('button', {
                name: /simulate/i,
            });
            await userEvent.click(simulateButton);

            expect(mutateFn).toHaveBeenCalled();

            const simulationQueryKey = actionSimulationService.actionSimulationServiceKeys.lastSimulation({
                urlParams: { proposalId: proposal.id },
            });
            const proposalQueryKey = governanceService.governanceServiceKeys.proposalBySlug({
                urlParams: { slug: 'test-slug' },
                queryParams: { daoId: 'test-dao' },
            });

            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: simulationQueryKey,
            });
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: proposalQueryKey,
            });
        });
    });
});
