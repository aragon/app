import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import * as useUserVoteHook from '../../hooks/useUserVote';
import { generateProposal } from '../../testUtils';
import { proposalUtils } from '../../utils/proposalUtils';
import {
    DaoProposalListDefaultItem,
    type IDaoProposalListDefaultItemProps,
} from './daoProposalListDefaultItem';

describe('<DaoProposalListDefaultItem /> component', () => {
    const useSlotSingleFunctionSpy = jest.spyOn(
        useSlotSingleFunction,
        'useSlotSingleFunction',
    );
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    // The real hook subscribes to the wagmi connection, which wagmi's reconnect-on-mount updates
    // after the test's act scope has closed.
    const useUserVoteSpy = jest.spyOn(useUserVoteHook, 'useUserVote');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useUserVoteSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        useSlotSingleFunctionSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useDaoSpy.mockReset();
        useUserVoteSpy.mockReset();
    });

    const defaultDao = generateDao({
        address: '0x123',
        plugins: [generateDaoPlugin()],
    });

    const createTestComponent = (
        props?: Partial<IDaoProposalListDefaultItemProps>,
    ) => {
        const completeProps: IDaoProposalListDefaultItemProps = {
            proposal: generateProposal(),
            dao: defaultDao,
            proposalSlug: 'admin-1',
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoProposalListDefaultItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    const rowLink = () =>
        screen
            .getAllByRole('link')
            .find((link) => !link.getAttribute('href')?.includes('/members/'));

    // `getProposalSlug` resolves the plugin through `getDaoPlugins`, which drops unsupported ones, so the link
    // only builds when the plugin the proposal names is a supported one installed on the DAO.
    const linkableProps = {
        proposal: generateProposal({
            pluginAddress: '0x123',
            incrementalId: 4,
        }),
        dao: generateDao({
            address: '0x123',
            plugins: [
                generateDaoPlugin({
                    address: '0x123',
                    slug: 'mul',
                    interfaceType: daoService.PluginInterfaceType.MULTISIG,
                }),
            ],
        }),
    };

    it('links the row to the given href', () => {
        render(
            createTestComponent({
                ...linkableProps,
                href: '/workspace/demo/eth-0xAbc/proposals/MUL-4',
            }),
        );

        expect(rowLink()).toHaveAttribute(
            'href',
            '/workspace/demo/eth-0xAbc/proposals/MUL-4',
        );
    });

    it('falls back to the DAO proposal URL when no href is given', () => {
        render(createTestComponent(linkableProps));

        const expectedHref = proposalUtils.getProposalUrl(
            linkableProps.proposal,
            linkableProps.dao,
        );

        // A DAO-route URL rather than a workspace one, and the row uses exactly it. The network is left to
        // `getProposalUrl`, whose own branching has its own tests.
        expect(expectedHref).toMatch(/^\/dao\/.+\/proposals\/MUL-4$/);
        expect(rowLink()).toHaveAttribute('href', expectedHref);
    });

    it('renders the proposal info', () => {
        const proposal = generateProposal({
            title: 'my-proposal',
            summary: 'proposal-summary',
        });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(screen.getByText(proposal.summary)).toBeInTheDocument();
    });

    it('renders a warning when the proposal metadata is a non-standard string', () => {
        const proposal = generateProposal({
            title: '',
            summary: '',
            description: '',
            metadataUri: 'raw-metadata-string',
        });
        render(createTestComponent({ proposal }));
        expect(
            screen.getByText(
                'app.governance.proposalMetadataAlert.nonStandard',
            ),
        ).toBeInTheDocument();
    });

    it('renders a warning when the proposal metadata is missing', () => {
        const proposal = generateProposal({
            title: '',
            summary: '',
            description: '',
            metadataUri: null,
        });
        render(createTestComponent({ proposal, proposalSlug: 'ADMIN-2' }));
        expect(
            screen.getByText('app.governance.proposalMetadataAlert.missing'),
        ).toBeInTheDocument();
        expect(screen.getByText('ADMIN-2')).toBeInTheDocument();
    });

    it('renders the proposal identifier once when the title is empty', () => {
        const proposal = generateProposal({ title: '', summary: '' });
        render(createTestComponent({ proposal, proposalSlug: 'ADMIN-2' }));
        expect(screen.getByText('ADMIN-2')).toBeInTheDocument();
    });

    it('uses the plugin slot-function to process the proposal status', () => {
        const status = ProposalStatus.EXECUTABLE;
        useSlotSingleFunctionSpy.mockReturnValue(status);
        render(createTestComponent());
        expect(screen.getByText(/Executable/)).toBeInTheDocument();
    });

    it('displays the tag when set, used by the workspace list to name the DAO of the row', () => {
        render(createTestComponent({ tag: 'Demo DAO' }));
        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
    });

    it('displays no tag by default, the DAO pages show one proposal source at a time', () => {
        render(createTestComponent());
        expect(screen.queryByText('Demo DAO')).not.toBeInTheDocument();
    });
});
