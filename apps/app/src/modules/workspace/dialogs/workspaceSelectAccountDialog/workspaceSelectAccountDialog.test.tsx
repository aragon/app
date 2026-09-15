import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as cmsService from '@/shared/api/cmsService';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import * as useWorkspaceDaos from '../../hooks/useWorkspaceDaos';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspaceSelectAccountDialogProps,
    WorkspaceSelectAccountDialog,
} from './workspaceSelectAccountDialog';

describe('<WorkspaceSelectAccountDialog /> component', () => {
    const useWorkspaceDaosSpy = jest.spyOn(
        useWorkspaceDaos,
        'useWorkspaceDaos',
    );
    const useDaoOverridesSpy = jest.spyOn(cmsService, 'useDaoOverrides');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const network = Network.ETHEREUM_SEPOLIA;
    const firstAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const secondAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const buildAccount = (address: string): IWorkspaceAccount => ({
        id: workspaceUtils.buildAccountId({ network, address }),
        type: WorkspaceAccountType.DAO,
        network,
        address,
    });

    const firstAccount = buildAccount(firstAddress);
    const secondAccount = buildAccount(secondAddress);

    const buildDao = (
        account: IWorkspaceAccount,
        name: string,
        hasProcess: boolean,
    ) =>
        generateDao({
            id: account.id,
            address: account.address,
            network,
            name,
            plugins: hasProcess
                ? [
                      generateDaoPlugin({
                          address: '0xProcess',
                          isProcess: true,
                          interfaceType: PluginInterfaceType.MULTISIG,
                          slug: 'multisig',
                      }),
                  ]
                : [],
        });

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useWorkspaceDaosSpy.mockReturnValue({
            daos: {
                [firstAccount.id]: buildDao(firstAccount, 'First DAO', true),
                [secondAccount.id]: buildDao(secondAccount, 'Second DAO', true),
            },
            isPending: false,
        });
        useDaoOverridesSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: {} }),
        );
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWorkspaceDaosSpy.mockReset();
        useDaoOverridesSpy.mockReset();
    });

    const createTestComponent = (
        params?: Partial<
            IWorkspaceSelectAccountDialogProps['location']['params']
        >,
        props?: Partial<IWorkspaceSelectAccountDialogProps>,
    ) => {
        const completeProps = {
            location: {
                id: 'WORKSPACE_SELECT_ACCOUNT',
                params: {
                    accounts: [firstAccount, secondAccount],
                    onAccountSelected: jest.fn(),
                    ...params,
                },
            },
            ...props,
        } as IWorkspaceSelectAccountDialogProps;

        return (
            <GukModulesProvider>
                <Dialog.Root open={true}>
                    <WorkspaceSelectAccountDialog {...completeProps} />
                </Dialog.Root>
            </GukModulesProvider>
        );
    };

    it('lists every account of the workspace', () => {
        render(createTestComponent());

        expect(screen.getByText('First DAO')).toBeInTheDocument();
        expect(screen.getByText('Second DAO')).toBeInTheDocument();
    });

    it('reports the selected account without closing, so the next step can send the user back', async () => {
        const onAccountSelected = jest.fn();
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onAccountSelected }));

        // A data-list row is clicked through the overlay button it renders over its content, which the kit labels
        // from that content — the content itself is `pointer-events-none`.
        await userEvent.click(
            screen.getByRole('button', { name: /Second DAO/ }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceSelectAccountDialog\.action\.select$/,
            }),
        );

        expect(onAccountSelected).toHaveBeenCalledWith(secondAccount);
        expect(close).not.toHaveBeenCalled();
    });

    it('cannot be confirmed before an account is selected', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /workspaceSelectAccountDialog\.action\.select$/,
            }),
        ).toBeDisabled();
    });

    it('does not offer a DAO account running no visible process', () => {
        useWorkspaceDaosSpy.mockReturnValue({
            daos: {
                [firstAccount.id]: buildDao(firstAccount, 'First DAO', true),
                [secondAccount.id]: buildDao(
                    secondAccount,
                    'Second DAO',
                    false,
                ),
            },
            isPending: false,
        });
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.workspace.workspaceSelectAccountDialogItem.noProcesses',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /Second DAO/ }),
        ).not.toBeInTheDocument();
    });
});
