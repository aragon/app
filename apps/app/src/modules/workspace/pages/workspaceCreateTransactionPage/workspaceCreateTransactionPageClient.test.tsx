import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import type { ISafeCreateTransactionWizardProps } from '@/modules/safe/components/safeCreateTransactionWizard';
import * as safeCreateTransactionWizard from '@/modules/safe/components/safeCreateTransactionWizard';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { WorkspaceQueryServiceKey } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IUseWorkspaceAccountOptionsResult } from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import { WorkspaceCreateTransactionPageClient } from './workspaceCreateTransactionPageClient';

describe('<WorkspaceCreateTransactionPageClient /> component', () => {
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );
    const wizardSpy = jest.spyOn(
        safeCreateTransactionWizard,
        'SafeCreateTransactionWizard',
    );

    const safeAddress = '0x0000000000000000000000000000000000000001';
    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };
    const transactionsUrl = `/workspace/demo/${safeAccount.id}/transactions`;

    const pushMock = jest.fn();

    const mockAccount = (
        account?: IWorkspaceAccount,
        result?: Partial<IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [],
            accountId: safeAccount.id,
            activeOption:
                account == null
                    ? undefined
                    : {
                          id: account.id,
                          label: 'Account',
                          account,
                          isAllAccounts: false,
                          isExternal: false,
                      },
            isAllAccounts: false,
            scopedAccounts: account == null ? [] : [account],
            isPending: false,
            ...result,
        });

    beforeEach(() => {
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId: safeAccount.id,
        });
        useRouterSpy.mockReturnValue({
            push: pushMock,
        } as unknown as AppRouterInstance);
        wizardSpy.mockReturnValue(<div>safe wizard</div>);
        mockAccount(safeAccount);
    });

    afterEach(() => {
        useParamsSpy.mockReset();
        useRouterSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
        wizardSpy.mockReset();
        pushMock.mockReset();
    });

    const createTestComponent = (queryClient = new QueryClient()) => (
        <GukModulesProvider>
            <ReactQueryWrapper client={queryClient}>
                <WorkspaceCreateTransactionPageClient />
            </ReactQueryWrapper>
        </GukModulesProvider>
    );

    const lastWizardProps = () =>
        wizardSpy.mock.lastCall?.[0] as
            | ISafeCreateTransactionWizardProps
            | undefined;

    it('renders nothing while the account is being resolved', () => {
        mockAccount(undefined, { isPending: true });

        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
        expect(wizardSpy).not.toHaveBeenCalled();
    });

    it('hands a Safe account to the Safe wizard', () => {
        render(createTestComponent());

        expect(screen.getByText('safe wizard')).toBeInTheDocument();
        expect(lastWizardProps()).toEqual(
            expect.objectContaining({
                network: safeAccount.network,
                safeAddress,
            }),
        );
    });

    it('refreshes the transactions and returns to them once the transaction is created', () => {
        const queryClient = new QueryClient();
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        );
        render(createTestComponent(queryClient));

        act(() => lastWizardProps()?.onCreated?.());

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: [WorkspaceQueryServiceKey.TRANSACTIONS],
        });
        expect(pushMock).toHaveBeenCalledWith(transactionsUrl);
    });

    it('explains that only a Safe account creates transactions here, linking back to the transactions', () => {
        mockAccount({ ...safeAccount, type: WorkspaceAccountType.DAO });

        render(createTestComponent());

        expect(wizardSpy).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                'app.workspace.workspaceCreateTransactionPage.unsupported.title',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: 'app.workspace.workspaceCreateTransactionPage.action',
            }),
        ).toHaveAttribute('href', transactionsUrl);
    });
});
