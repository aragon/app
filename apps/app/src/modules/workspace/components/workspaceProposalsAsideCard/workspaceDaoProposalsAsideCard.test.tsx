import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as proposalListStats from '@/modules/governance/components/proposalListStats';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceDaoProposalsAsideCardProps,
    WorkspaceDaoProposalsAsideCard,
} from './workspaceDaoProposalsAsideCard';

describe('<WorkspaceDaoProposalsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const proposalListStatsSpy = jest.spyOn(
        proposalListStats,
        'ProposalListStats',
    );

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const dao = generateDao({ id: daoAccount.id, address: daoAddress });

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }) as ReturnType<
                typeof daoService.useDao
            >,
        );
        proposalListStatsSpy.mockImplementation(() => (
            <div data-testid="proposal-list-stats-mock" />
        ));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        proposalListStatsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceDaoProposalsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceDaoProposalsAsideCardProps = {
            account: daoAccount,
            label: 'Demo DAO',
            pageSize: 20,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceDaoProposalsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('reads the DAO of the account and displays its proposal stats under the account label', () => {
        render(createTestComponent());

        expect(useDaoSpy).toHaveBeenLastCalledWith({
            urlParams: { id: daoAccount.id },
        });
        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
        expect(
            screen.getByTestId('proposal-list-stats-mock'),
        ).toBeInTheDocument();
        expect(proposalListStatsSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                dao,
                initialParams: {
                    queryParams: {
                        daoId: daoAccount.id,
                        pageSize: 20,
                        sort: 'blockTimestamp',
                        isSubProposal: false,
                        includeLinkedAccounts: false,
                    },
                },
            }),
            undefined,
        );
    });

    it('renders nothing while the DAO is being read', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof daoService.useDao
            >,
        );
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });
});
