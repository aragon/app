import { addressUtils, Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { IPublishDaoDialogParams } from '@/modules/createDao/dialogs/publishDaoDialog';
import { SafeDialogId } from '@/modules/safe/constants/safeDialogId';
import type { ISafeDeployTransactionDialogParams } from '@/modules/safe/dialogs/safeDeployTransactionDialog';
import { multisigPlugin } from '@/plugins/multisigPlugin/constants/multisigPlugin';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    buildCreateAccountRequest,
    buildCreatedAccount,
    type IWorkspaceCreateAccountDialogProps,
    WorkspaceCreateAccountDialog,
} from './workspaceCreateAccountDialog';
import { WorkspaceCreateAccountType } from './workspaceCreateAccountDialogDefinitions';

describe('<WorkspaceCreateAccountDialog /> component', () => {
    const address = '0x5dcD623bf6E792bfBDbf8d643f6478153df4A8D2';
    const open = jest.fn();
    const close = jest.fn();
    const onCreated = jest.fn();

    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address,
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open, close }),
        );
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
        open.mockReset();
        close.mockReset();
        onCreated.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceCreateAccountDialogProps>,
    ) => {
        const completeProps: IWorkspaceCreateAccountDialogProps = {
            location: { id: 'WORKSPACE_CREATE_ACCOUNT', params: { onCreated } },
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <Dialog.Root open={true}>
                        <WorkspaceCreateAccountDialog {...completeProps} />
                    </Dialog.Root>
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    const stepTitle = (step: string) =>
        new RegExp(`workspaceCreateAccountDialog.steps.${step}.title`);
    const clickNext = () =>
        userEvent.click(
            screen.getByRole('button', { name: /wizard.footer.next/ }),
        );
    const fillDetails = () =>
        userEvent.type(
            screen.getByRole('textbox', { name: /details.name.label/ }),
            'My account',
        );
    const walkToSignersStep = async () => {
        await clickNext();
        await fillDetails();
        await clickNext();
        await screen.findByText(stepTitle('SIGNERS'));
    };
    const walkToTypeStep = async () => {
        await walkToSignersStep();
        await clickNext();
    };
    const backToNetwork = async () => {
        for (let step = 0; step < 3; step++) {
            await userEvent.click(
                screen.getByRole('button', {
                    name: /wizardDialog.container.back/,
                }),
            );
        }
    };
    const returnToTypeStep = async () => {
        for (let step = 0; step < 3; step++) {
            await clickNext();
        }
    };

    it('walks the four steps with the design copy', async () => {
        render(createTestComponent());
        expect(
            screen.getByText(/workspaceCreateAccountDialog.title/),
        ).toBeInTheDocument();

        expect(screen.getByText(stepTitle('NETWORK'))).toBeInTheDocument();
        expect(
            screen.getByText(/steps.NETWORK.description/),
        ).toBeInTheDocument();
        await clickNext();
        expect(
            await screen.findByText(stepTitle('DETAILS')),
        ).toBeInTheDocument();
        await fillDetails();
        await clickNext();
        expect(
            await screen.findByText(stepTitle('SIGNERS')),
        ).toBeInTheDocument();
        await clickNext();
        expect(await screen.findByText(stepTitle('TYPE'))).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /workspaceCreateAccountDialog.submit/,
            }),
        ).toBeInTheDocument();
    }, 15_000); // Walks every step: slow under a parallel run.

    it('selects Ethereum Sepolia by default among the mainnets and testnets', () => {
        render(createTestComponent());
        expect(screen.getByText(/network.mainnets/)).toBeInTheDocument();
        expect(screen.getByText(/network.testnets/)).toBeInTheDocument();
        expect(
            screen.getByRole('radio', { name: /^Ethereum Sepolia/ }),
        ).toBeChecked();
    });

    it('renders the account details fields with the account copy and no ENS field', async () => {
        render(createTestComponent());
        // The DAO wizard's ENS field only shows on Ethereum mainnet.
        await userEvent.click(
            screen.getByRole('radio', { name: /^Ethereum$/ }),
        );
        await clickNext();

        expect(
            await screen.findByRole('textbox', { name: /details.name.label/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: /details.description.label/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/details.description.helpText/),
        ).toBeInTheDocument();
        expect(screen.getByText(/avatarInput.label/)).toBeInTheDocument();
        expect(
            screen.getByText(/details.resources.helpText/),
        ).toBeInTheDocument();
        expect(screen.queryByText(/createDaoForm/)).not.toBeInTheDocument();
    });

    it('requires a name on the details step', async () => {
        render(createTestComponent());
        await clickNext();
        await clickNext();

        expect(
            await screen.findByText(/details.name.required/),
        ).toBeInTheDocument();
        expect(screen.getByText(stepTitle('DETAILS'))).toBeInTheDocument();
    });

    it('renders the signers and approvals with the account copy, prefilled with the wallet', async () => {
        render(createTestComponent());
        await walkToSignersStep();

        expect(screen.getByText(/signers.label/)).toBeInTheDocument();
        expect(screen.getByText(/signers.helpText/)).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', {
                name: /accessibleName \(number=1\)/,
            }),
        ).toHaveValue(addressUtils.truncateAddress(address));

        expect(screen.getAllByText(/approvals.label/)).toHaveLength(1);
        expect(screen.getByText(/approvals.helpText/)).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: /approvals.label/ }),
        ).toHaveValue('1');
        expect(
            screen.getByText(/approvals.total \(value=1,total=1\)/),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/multisigSetupGovernance/),
        ).not.toBeInTheDocument();
    });

    it('validates the signer addresses', async () => {
        render(createTestComponent());
        await walkToSignersStep();
        await userEvent.click(
            screen.getByRole('button', {
                name: /addressesInput.container.add/,
            }),
        );
        await clickNext();
        expect(
            await screen.findByText(/addressesInput.item.input.error.invalid/),
        ).toBeInTheDocument();

        expect(screen.getByText(stepTitle('SIGNERS'))).toBeInTheDocument();
    });

    it('caps the approvals at the number of signers', async () => {
        render(createTestComponent());
        await walkToSignersStep();
        const approvals = screen.getByRole('textbox', {
            name: /approvals.label/,
        });
        expect(approvals).toHaveAttribute('max', '1');

        await userEvent.click(
            screen.getByRole('button', {
                name: /addressesInput.container.add/,
            }),
        );
        expect(approvals).toHaveAttribute('max', '2');
        expect(
            screen.getByText(/approvals.total \(value=1,total=2\)/),
        ).toBeInTheDocument();
    });

    it('lowers the approvals with the signers when a signer is removed', async () => {
        render(createTestComponent());
        await walkToSignersStep();
        await userEvent.click(
            screen.getByRole('button', {
                name: /addressesInput.container.add/,
            }),
        );
        const approvals = screen.getByRole('textbox', {
            name: /approvals.label/,
        });
        await userEvent.clear(approvals);
        await userEvent.type(approvals, '2');
        expect(
            screen.getByText(/approvals.total \(value=2,total=2\)/),
        ).toBeInTheDocument();

        const [, , removeSecond] = screen.getAllByRole('button', {
            name: /addressesInput.item.remove/,
        });
        await userEvent.click(removeSecond);

        expect(
            await screen.findByText(/approvals.total \(value=1,total=1\)/),
        ).toBeInTheDocument();
        expect(approvals).toHaveValue('1');
    });

    it('resets the approvals to one when all signers are cleared', async () => {
        render(createTestComponent());
        await walkToSignersStep();
        await userEvent.click(
            screen.getByRole('button', {
                name: /addressesInput.container.add/,
            }),
        );
        const approvals = screen.getByRole('textbox', {
            name: /approvals.label/,
        });
        await userEvent.clear(approvals);
        await userEvent.type(approvals, '2');

        await userEvent.click(
            screen.getByRole('button', {
                name: /addressesInput.container.more/,
            }),
        );
        await userEvent.click(
            screen.getByRole('menuitem', {
                name: /addressesInput.container.clearAll/,
            }),
        );

        expect(
            await screen.findByText(/approvals.total \(value=1,total=1\)/),
        ).toBeInTheDocument();
        expect(approvals).toHaveValue('1');
    });

    it('selects Safe on Sepolia', async () => {
        render(createTestComponent());
        await walkToTypeStep();

        const aragon = await screen.findByRole('radio', {
            name: /accountType.ARAGON.label/,
        });
        const safe = screen.getByRole('radio', {
            name: /accountType.SAFE.label/,
        });
        expect(aragon).not.toBeChecked();
        expect(safe).toBeEnabled();
        expect(safe).toBeChecked();
    });

    it('opens the Safe deploy dialog with the chosen network and signers', async () => {
        render(createTestComponent());
        await walkToTypeStep();
        await userEvent.click(
            screen.getByRole('radio', { name: /accountType.SAFE.label/ }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceCreateAccountDialog.submit/,
            }),
        );

        expect(open).toHaveBeenCalledWith(SafeDialogId.DEPLOY_TRANSACTION, {
            stack: true,
            params: {
                network: Network.ETHEREUM_SEPOLIA,
                name: 'My account',
                description: '',
                avatar: undefined,
                owners: [address],
                threshold: 1,
                onCreated: expect.any(Function),
            },
        });
        const [, { params }] = open.mock.calls[0] as [
            string,
            { params: ISafeDeployTransactionDialogParams },
        ];
        const safeAddress = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';
        params.onCreated({
            network: Network.ETHEREUM_SEPOLIA,
            address: safeAddress,
        });
        expect(onCreated).toHaveBeenCalledWith({
            id: workspaceUtils.buildAccountId({
                network: Network.ETHEREUM_SEPOLIA,
                address: safeAddress,
            }),
            type: WorkspaceAccountType.SAFE,
            address: safeAddress,
            network: Network.ETHEREUM_SEPOLIA,
            metadata: { name: 'My account' },
        });
        expect(close).toHaveBeenCalledWith('WORKSPACE_CREATE_ACCOUNT');
    });

    it('selects Aragon on Chiliz and explains why Safe is disabled', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByRole('radio', { name: /^Chiliz$/ }));
        await walkToTypeStep();
        expect(
            screen.getByRole('radio', { name: /accountType.SAFE.label/ }),
        ).toBeDisabled();
        expect(
            screen.getByText(/accountType.SAFE.unsupported/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radio', { name: /accountType.ARAGON.label/ }),
        ).toBeChecked();
    });

    it('opens Aragon after Safe was chosen on Sepolia and the network changes to Citrea', async () => {
        render(createTestComponent());
        await walkToTypeStep();
        expect(
            screen.getByRole('radio', { name: /accountType.SAFE.label/ }),
        ).toBeChecked();
        await backToNetwork();
        await userEvent.click(screen.getByRole('radio', { name: /^Citrea$/ }));
        await returnToTypeStep();
        expect(
            screen.getByRole('radio', { name: /accountType.SAFE.label/ }),
        ).toBeDisabled();
        expect(
            screen.getByText(/accountType.SAFE.unsupported/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radio', { name: /accountType.ARAGON.label/ }),
        ).toBeChecked();
        await backToNetwork();
        await userEvent.click(
            screen.getByRole('radio', { name: /^Ethereum Sepolia/ }),
        );
        await returnToTypeStep();
        expect(
            screen.getByRole('radio', { name: /accountType.SAFE.label/ }),
        ).toBeChecked();
        await backToNetwork();
        await userEvent.click(screen.getByRole('radio', { name: /^Citrea$/ }));
        await returnToTypeStep();
        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceCreateAccountDialog.submit/,
            }),
        );
        expect(open).toHaveBeenCalledWith(
            CreateDaoDialogId.PUBLISH_DAO,
            expect.objectContaining({ stack: true }),
        );
    });

    it('opens the deploy dialog stacked, with the multisig plugin and the account labels', async () => {
        render(createTestComponent());
        await walkToTypeStep();
        await userEvent.click(
            screen.getByRole('radio', { name: /accountType.ARAGON.label/ }),
        );
        await userEvent.click(
            await screen.findByRole('button', {
                name: /workspaceCreateAccountDialog.submit/,
            }),
        );

        const base = 'app.workspace.workspaceCreateAccountDialog.deploy';
        expect(open).toHaveBeenCalledWith(CreateDaoDialogId.PUBLISH_DAO, {
            stack: true,
            params: {
                values: {
                    name: 'My account',
                    description: '',
                    avatar: undefined,
                    resources: [],
                    network: Network.ETHEREUM_SEPOLIA,
                    ens: '',
                },
                plugin: {
                    pluginId: multisigPlugin.id,
                    settings: { signers: [address], minApprovals: 1 },
                },
                labels: {
                    title: `${base}.title`,
                    description: `${base}.description`,
                    submit: `${base}.submit`,
                    success: `${base}.success`,
                },
                onCreated: expect.any(Function),
            },
        });
        expect(close).not.toHaveBeenCalled();
    });

    it('hands the created account to its caller and closes', async () => {
        render(createTestComponent());
        await walkToTypeStep();
        await userEvent.click(
            screen.getByRole('radio', { name: /accountType.ARAGON.label/ }),
        );
        await userEvent.click(
            await screen.findByRole('button', {
                name: /workspaceCreateAccountDialog.submit/,
            }),
        );

        const [, { params }] = open.mock.calls[0] as [
            string,
            { params: IPublishDaoDialogParams },
        ];
        const network = Network.ETHEREUM_SEPOLIA;
        const daoAddress = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';
        params.onCreated?.({ address: daoAddress, network });

        expect(onCreated).toHaveBeenCalledWith({
            id: workspaceUtils.buildAccountId({ network, address: daoAddress }),
            type: WorkspaceAccountType.DAO,
            address: daoAddress,
            network,
        });
        expect(close).toHaveBeenCalledWith('WORKSPACE_CREATE_ACCOUNT');
    });

    it('closes only itself, leaving the dialogs below it open', async () => {
        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: /wizardDialog.container.close/,
            }),
        );
        expect(close).toHaveBeenCalledWith('WORKSPACE_CREATE_ACCOUNT');
    });
});

describe('buildCreateAccountRequest util', () => {
    const form = {
        network: Network.ETHEREUM_SEPOLIA,
        name: 'My account',
        description: 'Treasury',
        avatar: undefined,
        resources: [{ name: 'Site', url: 'https://aragon.org' }],
        members: [
            { address: '0x5dcD623bf6E792bfBDbf8d643f6478153df4A8D2' },
            { address: '0x1F01e6fe406295c9fe42189A2ef999636a04132a' },
        ],
        threshold: 2,
    };
    const t = (key: string) => key;

    afterEach(() => localStorage.clear());

    it('maps an Aragon account to the deploy dialog of a DAO with the multisig plugin', () => {
        const onCreated = jest.fn();
        const request = buildCreateAccountRequest(
            { ...form, accountType: WorkspaceCreateAccountType.ARAGON },
            { onCreated, t },
        );

        const base = 'app.workspace.workspaceCreateAccountDialog.deploy';
        expect(request).toEqual({
            dialogId: CreateDaoDialogId.PUBLISH_DAO,
            params: {
                values: {
                    network: form.network,
                    name: form.name,
                    description: form.description,
                    avatar: undefined,
                    resources: form.resources,
                    ens: '',
                },
                plugin: {
                    pluginId: multisigPlugin.id,
                    settings: {
                        signers: form.members.map((member) => member.address),
                        minApprovals: 2,
                    },
                },
                labels: {
                    title: `${base}.title`,
                    description: `${base}.description`,
                    submit: `${base}.submit`,
                    success: `${base}.success`,
                },
                onCreated: expect.any(Function),
            },
        });

        const address = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';
        if (request.dialogId !== CreateDaoDialogId.PUBLISH_DAO) {
            throw new Error('Expected the Aragon deploy dialog');
        }
        request.params.onCreated?.({ address, network: form.network });
        expect(onCreated).toHaveBeenCalledWith(
            buildCreatedAccount(WorkspaceCreateAccountType.ARAGON, {
                address,
                network: form.network,
            }),
        );
    });

    it('uses Aragon when Safe was chosen on an unsupported chain', () => {
        const request = buildCreateAccountRequest(
            {
                ...form,
                network: Network.CITREA_MAINNET,
                accountType: WorkspaceCreateAccountType.SAFE,
            },
            { onCreated: jest.fn(), t },
        );
        expect(request.dialogId).toBe(CreateDaoDialogId.PUBLISH_DAO);
    });

    it('keeps the Safe name, description, links and pinned logo in the account', () => {
        const onCreated = jest.fn();
        const avatar = {
            file: new File(['image'], 'logo.png'),
            url: 'blob:preview',
        };
        const request = buildCreateAccountRequest(
            { ...form, avatar, accountType: WorkspaceCreateAccountType.SAFE },
            { onCreated, t },
        );
        expect(request.dialogId).toBe(SafeDialogId.DEPLOY_TRANSACTION);
        expect(request.params).toMatchObject({
            network: form.network,
            name: form.name,
            avatar,
            owners: form.members.map(({ address }) => address),
            threshold: form.threshold,
        });
        const { onCreated: complete } =
            request.params as ISafeDeployTransactionDialogParams;
        const address = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';
        complete({
            network: form.network,
            address,
            avatarUri: 'ipfs://QmSafeLogo',
        });
        expect(onCreated).toHaveBeenCalledWith({
            id: workspaceUtils.buildAccountId({
                network: form.network,
                address,
            }),
            type: WorkspaceAccountType.SAFE,
            address,
            network: form.network,
            metadata: {
                name: form.name,
                description: form.description,
                links: form.resources,
                avatar: 'ipfs://QmSafeLogo',
            },
        });
    });

    it.each([
        ['aragon.org', 'https://aragon.org'],
        ['aragon.org?from=app#docs', 'https://aragon.org?from=app#docs'],
        ['http://aragon.org', 'http://aragon.org'],
    ])(
        'saves %s as a Safe link that survives export and import',
        async (url, savedUrl) => {
            const onCreated = jest.fn<void, [IWorkspaceAccount]>();
            const request = buildCreateAccountRequest(
                {
                    ...form,
                    accountType: WorkspaceCreateAccountType.SAFE,
                    resources: [{ name: 'Site', url }],
                },
                { onCreated, t },
            );
            if (request.dialogId !== SafeDialogId.DEPLOY_TRANSACTION) {
                throw new Error('Expected the Safe deploy dialog');
            }
            request.params.onCreated({
                network: form.network,
                address: '0x1F01e6fe406295c9fe42189A2ef999636a04132a',
            });
            const [account] = onCreated.mock.calls[0];
            const created = await workspaceService.createWorkspace({
                body: {
                    name: 'Workspace',
                    description: '',
                    avatar: null,
                    links: [],
                    accounts: [account],
                    targets: [],
                },
            });
            const exported = await workspaceService.exportWorkspace({
                urlParams: { id: created.id },
            });
            const imported = await workspaceService.importWorkspace(exported);

            expect(account.metadata?.links).toEqual([
                { name: 'Site', url: savedUrl },
            ]);
            expect(imported.accounts).toEqual([account]);
        },
    );
});

describe('buildCreatedAccount util', () => {
    const network = Network.ETHEREUM_SEPOLIA;
    const address = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';

    it.each([
        {
            accountType: WorkspaceCreateAccountType.ARAGON,
            type: WorkspaceAccountType.DAO,
        },
        {
            accountType: WorkspaceCreateAccountType.SAFE,
            type: WorkspaceAccountType.SAFE,
        },
    ])(
        'builds a $type workspace account for a deployed $accountType account',
        ({ accountType, type }) => {
            expect(
                buildCreatedAccount(accountType, { address, network }),
            ).toEqual({
                id: workspaceUtils.buildAccountId({ network, address }),
                type,
                address,
                network,
            });
        },
    );

    it('keeps the given details as the account metadata', () => {
        const account = buildCreatedAccount(
            WorkspaceCreateAccountType.SAFE,
            { address, network, avatarUri: 'ipfs://QmSafeLogo' },
            {
                name: 'Treasury',
                description: 'Main treasury',
                resources: [{ name: 'Site', url: 'aragon.org' }],
            },
        );
        expect(account.metadata).toEqual({
            name: 'Treasury',
            description: 'Main treasury',
            links: [{ name: 'Site', url: 'https://aragon.org' }],
            avatar: 'ipfs://QmSafeLogo',
        });
    });

    it('leaves empty details out of the account metadata', () => {
        const account = buildCreatedAccount(
            WorkspaceCreateAccountType.SAFE,
            { address, network },
            { name: 'Treasury', description: '', resources: [] },
        );
        expect(account.metadata).toEqual({ name: 'Treasury' });
    });
});
