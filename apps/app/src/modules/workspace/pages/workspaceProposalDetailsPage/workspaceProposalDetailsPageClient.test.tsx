import { render, screen } from '@testing-library/react';
import {
    DaoProposalDetailsPageClient,
    type IDaoProposalDetailsPageClientProps,
} from '@/modules/governance/pages/daoProposalDetailsPage';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import * as workspaceAccountSelectorProvider from '../../components/workspaceAccountSelectorProvider';
import {
    type IWorkspaceProposalDetailsPageClientProps,
    WorkspaceProposalDetailsPageClient,
} from './workspaceProposalDetailsPageClient';

jest.mock('@/modules/governance/pages/daoProposalDetailsPage', () => ({
    DaoProposalDetailsPageClient: jest.fn(() => (
        <div data-testid="proposal-details-mock" />
    )),
}));

describe('<WorkspaceProposalDetailsPageClient /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const otherAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const otherAccountId = `${Network.ETHEREUM_SEPOLIA}-${otherAddress}`;

    const proposalDetailsMock = DaoProposalDetailsPageClient as jest.Mock;
    const useWorkspaceAccountSelectorContextSpy = jest.spyOn(
        workspaceAccountSelectorProvider,
        'useWorkspaceAccountSelectorContext',
    );

    const buildOption = (
        id: string,
    ): workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption => ({
        id,
        label: id,
        account: {
            id,
            type: WorkspaceAccountType.DAO,
            address: id.slice(id.lastIndexOf('-') + 1),
            network: Network.ETHEREUM_SEPOLIA,
        } as IWorkspaceAccount,
        isAllAccounts: false,
    });

    const allAccountsOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        { id: 'all', label: 'All accounts', isAllAccounts: true };

    const pathOption = buildOption(accountId);
    const otherOption = buildOption(otherAccountId);

    const mockAccountSelector = (
        context?: Partial<workspaceAccountSelectorProvider.IWorkspaceAccountSelectorContext>,
    ) =>
        useWorkspaceAccountSelectorContextSpy.mockReturnValue({
            activeOption: pathOption,
            setActiveOption: jest.fn(),
            options: [allAccountsOption, pathOption, otherOption],
            ...context,
        });

    const lastDetailsProps = () =>
        proposalDetailsMock.mock.calls.at(-1)?.[0] as
            | IDaoProposalDetailsPageClientProps
            | undefined;

    beforeEach(() => {
        mockAccountSelector();
    });

    afterEach(() => {
        useWorkspaceAccountSelectorContextSpy.mockReset();
        proposalDetailsMock.mockClear();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceProposalDetailsPageClientProps>,
    ) => {
        const completeProps: IWorkspaceProposalDetailsPageClientProps = {
            accountId,
            proposalSlug: 'MULTISIG-3',
            workspaceId: 'demo',
            ...props,
        };

        return <WorkspaceProposalDetailsPageClient {...completeProps} />;
    };

    it('renders the proposal of the account on the URL', () => {
        render(createTestComponent());

        expect(screen.getByTestId('proposal-details-mock')).toBeInTheDocument();
        expect(lastDetailsProps()).toEqual(
            expect.objectContaining({
                daoId: accountId,
                proposalSlug: 'MULTISIG-3',
            }),
        );
    });

    it('sends the breadcrumb back to the proposals of the workspace', () => {
        render(createTestComponent());

        expect(lastDetailsProps()?.proposalsUrl).toEqual(
            `/workspace/demo/proposals?account=${accountId}`,
        );
    });

    it('sends the breadcrumb back to the list of the selected account for a proposal of an account outside the workspace', () => {
        const linkedAccountId = `${Network.ETHEREUM_MAINNET}-${otherAddress}`;
        mockAccountSelector({ activeOption: pathOption });
        render(createTestComponent({ accountId: linkedAccountId }));

        expect(lastDetailsProps()?.daoId).toEqual(linkedAccountId);
        expect(lastDetailsProps()?.proposalsUrl).toEqual(
            `/workspace/demo/proposals?account=${accountId}`,
        );
    });

    it('falls back to the account of the URL when no account is selected', () => {
        mockAccountSelector({ activeOption: undefined });
        render(createTestComponent());

        expect(lastDetailsProps()?.proposalsUrl).toEqual(
            `/workspace/demo/proposals?account=${accountId}`,
        );
    });
});
