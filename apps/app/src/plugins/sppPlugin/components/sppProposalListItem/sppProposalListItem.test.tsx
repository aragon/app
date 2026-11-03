import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
} from '../../testUtils';
import { sppProposalUtils } from '../../utils/sppProposalUtils';
import {
    type ISppProposalListItemProps,
    SppProposalListItem,
} from './sppProposalListItem';

describe('<SppProposalListItem /> component', () => {
    const getProposalStatusSpy = jest.spyOn(
        sppProposalUtils,
        'getProposalStatus',
    );

    afterEach(() => {
        getProposalStatusSpy.mockReset();
    });

    const defaultPlugin = generateDaoPlugin({
        slug: 'spp',
        interfaceType: PluginInterfaceType.SPP,
    });
    const defaultDao = generateDao({
        address: '0x123',
        plugins: [defaultPlugin],
    });

    const createTestComponent = (
        props?: Partial<ISppProposalListItemProps>,
    ) => {
        const completeProps: ISppProposalListItemProps = {
            dao: defaultDao,
            proposal: generateSppProposal(),
            proposalSlug: 'spp-1',
            ...props,
        };

        return (
            <GukModulesProvider>
                <SppProposalListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    const rowLink = () =>
        screen
            .getAllByRole('link')
            .find((link) => !link.getAttribute('href')?.includes('/members/'));

    // The workspace proposals list passes the account-scoped workspace URL so a row keeps the reader inside it.
    it('links the row to the given href', () => {
        render(
            createTestComponent({
                href: '/workspace/demo/eth-0xAbc/proposals/SPP-1',
            }),
        );

        expect(rowLink()).toHaveAttribute(
            'href',
            '/workspace/demo/eth-0xAbc/proposals/SPP-1',
        );
    });

    it('falls back to the DAO proposal URL when no href is given', () => {
        render(createTestComponent());

        const expectedHref = proposalUtils.getProposalUrl(
            generateSppProposal(),
            defaultDao,
        );

        // A DAO-route URL rather than a workspace one, and the row uses exactly it.
        expect(expectedHref).toMatch(/^\/dao\/.+\/proposals\/SPP-1$/);
        expect(rowLink()).toHaveAttribute('href', expectedHref);
    });

    it('renders the SPP proposal', () => {
        const proposal = generateSppProposal({ title: 'SPP Proposal' });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('renders the identifier once without a warning when only the title is empty', () => {
        const proposal = generateSppProposal({ title: '' });
        render(createTestComponent({ proposal, proposalSlug: 'SPP-2' }));

        expect(screen.getByText('SPP-2')).toBeInTheDocument();
        expect(
            screen.queryByText('app.governance.proposalMetadataAlert.missing'),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.governance.proposalMetadataAlert.nonStandard',
            ),
        ).not.toBeInTheDocument();
    });

    it.each([
        {
            metadataUri: null,
            warning: 'app.governance.proposalMetadataAlert.missing',
        },
        {
            metadataUri: 'raw-metadata-string',
            warning: 'app.governance.proposalMetadataAlert.nonStandard',
        },
    ])(
        'renders $warning with the identifier once',
        ({ metadataUri, warning }) => {
            const proposal = generateSppProposal({
                title: '',
                summary: '',
                description: '',
                metadataUri,
            });
            render(createTestComponent({ proposal, proposalSlug: 'SPP-2' }));

            expect(screen.getByText(warning)).toBeInTheDocument();
            expect(screen.getByText('SPP-2')).toBeInTheDocument();
        },
    );

    it('sets the correct link for proposal page', () => {
        const proposal = generateSppProposal({ incrementalId: 5 });
        render(createTestComponent({ proposal, proposalSlug: 'SPP-5' }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toMatch(
            'proposals/SPP-5',
        );
    });

    it('renders the stage name in status context when proposal is multistage', () => {
        const stages = [
            generateSppStage({ name: 'stage-name' }),
            generateSppStage(),
        ];
        const proposal = generateSppProposal({
            stageIndex: 0,
            settings: generateSppPluginSettings({ stages }),
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(screen.getByText(stages[0].name!)).toBeInTheDocument();
    });

    it('renders default stage label with index in status context when proposal is multistage and active stage has no name', () => {
        const stages = [
            generateSppStage({ name: 'first-stage' }),
            generateSppStage({ name: undefined }),
        ];
        const proposal = generateSppProposal({
            stageIndex: 1,
            settings: generateSppPluginSettings({ stages }),
        });
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(
            screen.getByText(/sppProposalListItem.stage \(stageIndex=2/),
        ).toBeInTheDocument();
    });
});
