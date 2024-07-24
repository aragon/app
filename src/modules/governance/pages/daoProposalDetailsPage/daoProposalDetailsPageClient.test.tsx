import { generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { clipboardUtils, OdsModulesProvider } from '@aragon/ods';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as governanceService from '../../api/governanceService';
import { generateProposal } from '../../testUtils';
import { DaoProposalDetailsPageClient, type IDaoProposalDetailsPageClientProps } from './daoProposalDetailsPageClient';

describe('<DaoProposalDetailsPageClient /> component', () => {
    const useProposalSpy = jest.spyOn(governanceService, 'useProposal');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');

    beforeEach(() => {
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateProposal() }));
    });

    afterEach(() => {
        useProposalSpy.mockReset();
        clipboardCopySpy.mockReset();
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
        const proposal = generateProposal({ proposalId: 'incremental-id' });
        const daoId = 'test-id';
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent({ daoId }));

        const breadcrumbsContainer = screen.getByRole('navigation');
        expect(breadcrumbsContainer).toBeInTheDocument();

        const proposalsLink = screen.getByRole('link', { name: /daoProposalDetailsPage.header.breadcrumb.proposals/ });
        expect(proposalsLink).toBeInTheDocument();
        expect(proposalsLink.getAttribute('href')).toEqual(`/dao/${daoId}/proposals`);
        expect(within(breadcrumbsContainer).getByText(proposal.proposalId)).toBeInTheDocument();
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
        screen.debug(undefined, 9999999999);
    });
});
