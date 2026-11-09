import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateProposal } from '@/modules/governance/testUtils';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspaceTodoProposalItemProps,
    WorkspaceTodoProposalItem,
} from './workspaceTodoProposalItem';

describe('<WorkspaceTodoProposalItem /> component', () => {
    const network = Network.ETHEREUM_SEPOLIA;
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const pluginAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const dao = generateDao({
        name: 'Demo DAO',
        plugins: [
            generateDaoPlugin({
                address: pluginAddress,
                slug: 'gov',
                interfaceType: PluginInterfaceType.MULTISIG,
            }),
        ],
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTodoProposalItemProps>,
    ) => {
        const completeProps: IWorkspaceTodoProposalItemProps = {
            proposal: {
                ...generateProposal({
                    network,
                    daoAddress,
                    pluginAddress,
                    incrementalId: 3,
                    title: 'Ecosystem incentives',
                }),
                // Five days and a bit, so the relative date rounds to five days for the whole test run.
                voteEndDate:
                    Math.floor(Date.now() / 1000) + 5 * 24 * 3600 + 3600,
            },
            dao,
            workspaceId: 'my-workspace',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodoProposalItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('titles the row with the proposal slug and title', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                /workspaceTodoList\.proposal\.title \(slug=GOV-3,title=Ecosystem incentives\)/,
            ),
        ).toBeInTheDocument();
    });

    it('tells when the vote window closes', () => {
        render(createTestComponent());

        expect(
            // The relative date rounds with the clock of the run, so only its shape is asserted.
            screen.getByText(
                /workspaceTodoList\.proposal\.meta \(date=in \d+ days\)/,
            ),
        ).toBeInTheDocument();
    });

    it('links the vote button to the proposal page of its account', () => {
        render(createTestComponent());

        const accountId = workspaceUtils.buildAccountId({
            network,
            address: daoAddress,
        });
        expect(
            screen.getByRole('link', {
                name: /workspaceTodoList\.proposal\.action$/,
            }),
        ).toHaveAttribute(
            'href',
            workspaceUtils.getAccountScopeUrl(
                'my-workspace',
                accountId,
                'proposals/GOV-3',
            ),
        );
    });
});
