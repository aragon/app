import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useSimulateProposal from '@/modules/governance/hooks/useSimulateProposal';
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
    type IWorkspaceSelectProcessDialogProps,
    WorkspaceSelectProcessDialog,
} from './workspaceSelectProcessDialog';

describe('<WorkspaceSelectProcessDialog /> component', () => {
    const useWorkspaceDaosSpy = jest.spyOn(
        useWorkspaceDaos,
        'useWorkspaceDaos',
    );
    const useDaoOverridesSpy = jest.spyOn(cmsService, 'useDaoOverrides');
    const useSimulateProposalCreationSpy = jest.spyOn(
        useSimulateProposal,
        'useSimulateProposalCreation',
    );
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

    const buildDao = (id: string, address: string, name: string) =>
        generateDao({
            id,
            address,
            network,
            name,
            plugins: [
                generateDaoPlugin({
                    address: '0xProcess',
                    isProcess: true,
                    interfaceType: PluginInterfaceType.MULTISIG,
                    slug: 'multisig',
                }),
            ],
        });

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useWorkspaceDaosSpy.mockReturnValue({
            daos: {
                [firstAccount.id]: buildDao(
                    firstAccount.id,
                    firstAddress,
                    'First DAO',
                ),
                [secondAccount.id]: buildDao(
                    secondAccount.id,
                    secondAddress,
                    'Second DAO',
                ),
            },
            isPending: false,
        });
        useDaoOverridesSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: {} }),
        );
        // Resolves the per-row eligibility so the dialog leaves its spinner state.
        useSimulateProposalCreationSpy.mockReturnValue({
            result: 'success',
            isLoading: false,
        } as ReturnType<
            typeof useSimulateProposal.useSimulateProposalCreation
        >);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWorkspaceDaosSpy.mockReset();
        useDaoOverridesSpy.mockReset();
        useSimulateProposalCreationSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceSelectProcessDialogProps>,
    ) => {
        const completeProps = {
            location: {
                id: 'WORKSPACE_SELECT_PROCESS',
                params: {
                    accounts: [firstAccount, secondAccount],
                    onProcessSelected: jest.fn(),
                },
            },
            ...props,
        } as IWorkspaceSelectProcessDialogProps;

        return (
            <GukModulesProvider>
                <Dialog.Root open={true}>
                    <WorkspaceSelectProcessDialog {...completeProps} />
                </Dialog.Root>
            </GukModulesProvider>
        );
    };

    it('lists the processes of every DAO of the workspace', () => {
        render(createTestComponent());

        // One row per DAO, each labelled with the DAO it belongs to.
        expect(screen.getByText('First DAO')).toBeInTheDocument();
        expect(screen.getByText('Second DAO')).toBeInTheDocument();
    });

    it('reports the DAO and the process of the selected row', async () => {
        const onProcessSelected = jest.fn();
        render(
            createTestComponent({
                location: {
                    id: 'WORKSPACE_SELECT_PROCESS',
                    params: {
                        accounts: [firstAccount, secondAccount],
                        onProcessSelected,
                    },
                },
            } as Partial<IWorkspaceSelectProcessDialogProps>),
        );

        // A data-list row is clicked through the overlay button it renders over its content, which the kit labels
        // from that content — the content itself is `pointer-events-none`.
        await userEvent.click(
            screen.getByRole('button', { name: /Second DAO/ }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceSelectProcessDialog\.action\.select$/,
            }),
        );

        expect(onProcessSelected).toHaveBeenCalledWith({
            dao: expect.objectContaining({ name: 'Second DAO' }),
            plugin: expect.objectContaining({ address: '0xProcess' }),
        });
    });

    it('cannot be confirmed before a process is selected', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /workspaceSelectProcessDialog\.action\.select$/,
            }),
        ).toBeDisabled();
    });
});
