import {
    DaoProposalDetailsPageClient,
    type IDaoProposalDetailsPageClientProps,
} from '@/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPageClient';
import { generateProposal, generateProposalActionChangeMembers } from '@/modules/governance/testUtils';
import * as DaoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import * as useSlotFunction from '@/shared/hooks/useSlotFunction';
import {
    generateAddressInfo,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { clipboardUtils, OdsModulesProvider, ProposalStatus } from '@aragon/ods';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as governanceService from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

jest.mock('../../components/proposalVotingTerminal', () => ({
    ProposalVotingTerminal: () => <div data-testid="voting-terminal-mock" />,
}));

describe('<DaoProposalDetailsPageClient /> component', () => {
    const useProposalSpy = jest.spyOn(governanceService, 'useProposal');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');
    const useSlotFunctionSpy = jest.spyOn(useSlotFunction, 'useSlotFunction');
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    beforeEach(() => {
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateProposal() }));
        useDaoPluginIdsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useProposalSpy.mockReset();
        useDaoSpy.mockReset();
        clipboardCopySpy.mockReset();
        useSlotFunctionSpy.mockReset();
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalDetailsPageClientProps>) => {
        const completeProps: IDaoProposalDetailsPageClientProps = {
            daoId: 'dao-id',
            proposalId: 'proposal-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <DaoProposalDetailsPageClient {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('fetches and renders the proposal title and summary', () => {
        const proposal = generateProposal({ id: 'test-id', title: 'test-title', summary: 'my-summary' });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent({ proposalId: proposal.id }));

        expect(useProposalSpy).toHaveBeenCalledWith({ urlParams: { id: proposal.id } });
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
        const proposal = generateProposal({ proposalIndex: 'incremental-index' });
        const daoId = 'test-id';
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent({ daoId }));

        const breadcrumbsContainer = screen.getByRole('navigation');
        expect(breadcrumbsContainer).toBeInTheDocument();

        const proposalsLink = screen.getByRole('link', { name: /daoProposalDetailsPage.header.breadcrumb.proposals/ });
        expect(proposalsLink).toBeInTheDocument();
        expect(proposalsLink.getAttribute('href')).toEqual(`/dao/${daoId}/proposals`);
        expect(within(breadcrumbsContainer).getByText(proposal.proposalIndex)).toBeInTheDocument();
    });

    it('uses the plugin-specific function to process and render the proposal status', () => {
        const pluginIds = ['test-1', 'test-2'];
        const status = ProposalStatus.REJECTED;
        const proposal = generateProposal();
        useSlotFunctionSpy.mockReturnValue(status);
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        expect(useSlotFunctionSpy).toHaveBeenCalledWith({
            params: proposal,
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginIds,
        });
        expect(screen.getAllByText('Rejected')).toHaveLength(2);
        expect(screen.getByText(/daoProposalDetailsPage.aside.details.status/)).toBeInTheDocument();
    });

    it('returns empty container on proposal fetch error', () => {
        useProposalSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the proposal description when defined on a collapsible component', () => {
        const proposal = generateProposal({ description: 'proposal-description' });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        expect(screen.getByText(/daoProposalDetailsPage.main.proposal/)).toBeInTheDocument();
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
        });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        const detailsTitle = screen.getByText(/daoProposalDetailsPage.aside.details.title/);
        // eslint-disable-next-line testing-library/no-node-access
        const detailsContainer = detailsTitle.parentElement!.parentElement!;

        expect(detailsTitle).toBeInTheDocument();
        expect(screen.getByText(/daoProposalDetailsPage.aside.details.id/)).toBeInTheDocument();
        expect(within(detailsContainer).getByText(proposal.proposalIndex)).toBeInTheDocument();

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

    it('renders the proposal actions when defined', () => {
        const actions = [
            generateProposalActionChangeMembers({
                inputData: {
                    function: 'test1',
                    contract: 'test',
                    parameters: [{ name: 'functionName1', type: 'argument', value: '1' }],
                },
            }),
            generateProposalActionChangeMembers({
                inputData: {
                    function: 'test2',
                    contract: 'test',
                    parameters: [{ name: 'functionName2', type: 'argument', value: '1' }],
                },
            }),
        ];
        const proposal = generateProposal({ actions });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());

        expect(screen.getByText(/daoProposalDetailsPage.main.actions.header/)).toBeInTheDocument();
        actions.forEach((action) => {
            expect(screen.getByText(action.inputData!.function)).toBeInTheDocument();
        });
    });

    it('renders the proposal voting terminal', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoProposalDetailsPage.main.governance/)).toBeInTheDocument();
        expect(screen.getByTestId('voting-terminal-mock')).toBeInTheDocument();
    });
});
