import {
    DaoProposalDetailsPageClient,
    type IDaoProposalDetailsPageClientProps,
} from '@/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPageClient';
import { generateProposal } from '@/modules/governance/testUtils';
import * as DaoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import {
    generateAddressInfo,
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
    generateTabComponentPlugin,
} from '@/shared/testUtils';
import { clipboardUtils, GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as governanceService from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

jest.mock('../../components/proposalVotingTerminal', () => ({
    ProposalVotingTerminal: () => <div data-testid="voting-terminal-mock" />,
}));

jest.mock('../../components/proposalExecutionStatus', () => ({
    ProposalExecutionStatus: () => <div data-testid="proposal-execution-status-mock" />,
}));

describe('<DaoProposalDetailsPageClient /> component', () => {
    const useProposalSpy = jest.spyOn(governanceService, 'useProposalBySlug');
    const useProposalActionsSpy = jest.spyOn(governanceService, 'useProposalActions');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');
    const useSlotSingleFunctionSpy = jest.spyOn(useSlotSingleFunction, 'useSlotSingleFunction');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateProposal() }));
        useProposalActionsSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { decoding: false, actions: [], rawActions: [] } }),
        );
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ id: 'plugin', meta: generateDaoPlugin() })]);
    });

    afterEach(() => {
        useProposalSpy.mockReset();
        useProposalActionsSpy.mockReset();
        useDaoSpy.mockReset();
        clipboardCopySpy.mockReset();
        useSlotSingleFunctionSpy.mockReset();
        useDaoPluginsSpy.mockReset();
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
        const proposal = generateProposal({ id: 'test-id', title: 'test-title', summary: 'my-summary' });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent({ proposalSlug: proposal.id }));

        expect(useProposalSpy).toHaveBeenCalledWith({
            urlParams: { slug: proposal.id },
            queryParams: { daoId: 'dao-id' },
        });
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(screen.getByText(proposal.summary)).toBeInTheDocument();
    });

    it('renders a share button to share the url of the current proposal', async () => {
        render(createTestComponent());
        const shareButton = screen.getByRole('button', { name: /daoProposalDetailsPage.header.action.share/ });
        expect(shareButton).toBeInTheDocument();

        await userEvent.click(shareButton);
        expect(clipboardCopySpy).toHaveBeenCalledWith('localhost/');
    });

    it('renders the proposal page breadcrumbs', () => {
        const proposal = generateProposal({ proposalIndex: 'incremental-index', incrementalId: 3 });
        const daoId = 'test-id';
        const daoEns = 'test.dao.ens';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ id: daoId, ens: daoEns }),
            }),
        );
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));

        const plugin = generateDaoPlugin({ slug: 'test-plugin-slug' });
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ id: 'test-plugin', meta: plugin })]);

        render(createTestComponent({ daoId }));

        const breadcrumbsContainer = screen.getByRole('navigation');
        expect(breadcrumbsContainer).toBeInTheDocument();

        const proposalsLink = screen.getByRole('link', { name: /daoProposalDetailsPage.header.breadcrumb.proposals/ });
        expect(proposalsLink).toBeInTheDocument();
        expect(proposalsLink.getAttribute('href')).toEqual(`/dao/${daoNetwork}/${daoEns}/proposals`);
        expect(within(breadcrumbsContainer).getByText('TEST-PLUGIN-SLUG-3')).toBeInTheDocument();
    });

    it('uses the plugin-specific function to process and render the proposal status', () => {
        const status = ProposalStatus.REJECTED;
        const proposal = generateProposal({ pluginSubdomain: 'multisig' });
        useSlotSingleFunctionSpy.mockReturnValue(status);
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        expect(useSlotSingleFunctionSpy).toHaveBeenCalledWith({
            params: proposal,
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: proposal.pluginSubdomain,
        });
        expect(screen.getAllByText('Rejected')).toHaveLength(2);
        expect(screen.getByText(/daoProposalDetailsPage.aside.details.status/)).toBeInTheDocument();
    });

    it('returns empty container on proposal fetch error', () => {
        useProposalSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        useProposalActionsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the proposal description when defined on a collapsible component', () => {
        const proposal = generateProposal({ description: 'proposal-description' });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        expect(screen.getByText(/daoProposalDetailsPage.main.description.header/)).toBeInTheDocument();
        expect(screen.getByTestId('doc-parser')).toBeInTheDocument();
        expect(screen.getByText(proposal.description!)).toBeInTheDocument();
    });

    it('renders the proposal info', () => {
        const proposal = generateProposal({
            proposalIndex: '123',
            blockTimestamp: 1690367967,
            creator: generateAddressInfo({ address: '0x123' }),
            network: Network.ETHEREUM_SEPOLIA,
            transactionHash: '0x4654',
            incrementalId: 3,
        });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));

        const plugin = generateDaoPlugin({ slug: 'test-slug' });
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ id: 'test-plugin', meta: plugin })]);

        render(createTestComponent());

        const detailsTitle = screen.getByText(/daoProposalDetailsPage.aside.details.title/);

        const detailsContainer = screen.getByTestId('proposal-details-container');

        expect(detailsTitle).toBeInTheDocument();
        expect(screen.getByText(/daoProposalDetailsPage.aside.details.onChainId/)).toBeInTheDocument();
        expect(within(detailsContainer).getByText(proposal.proposalIndex)).toBeInTheDocument();
        expect(screen.getByText(/daoProposalDetailsPage.aside.details.id/)).toBeInTheDocument();
        expect(within(detailsContainer).getByText('TEST-SLUG-3')).toBeInTheDocument();

        expect(screen.getByText(/daoProposalDetailsPage.aside.details.published/)).toBeInTheDocument();
        const creationBlockLink = screen.getByRole('link', { name: 'July 26, 2023' });
        expect(creationBlockLink).toBeInTheDocument();
        expect(creationBlockLink.getAttribute('href')).toEqual('https://sepolia.etherscan.io/tx/0x4654');

        expect(screen.getByText(/daoProposalDetailsPage.aside.details.creator/)).toBeInTheDocument();
        const creatorLink = screen.getByRole('link', { name: proposal.creator.address });
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
            const link = screen.getByRole('link', { name: new RegExp(resource.name) });
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
});
