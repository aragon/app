import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import * as ipfsMutations from '@/shared/api/ipfsService/mutations';
import * as blockNavigationContext from '@/shared/components/blockNavigationContext';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    workspaceService,
    workspaceStorageKey,
} from '../../api/workspaceService';
import type { ICreateWorkspaceFormData } from '../../components/createWorkspaceForm';
import {
    type IPublishWorkspaceDialogProps,
    PublishWorkspaceDialog,
} from './publishWorkspaceDialog';

describe('<PublishWorkspaceDialog /> component', () => {
    const setIsBlockedSpy = jest.fn();
    const closeSpy = jest.fn();

    const useBlockNavigationContextSpy = jest.spyOn(
        blockNavigationContext,
        'useBlockNavigationContext',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const usePinFileSpy = jest.spyOn(ipfsMutations, 'usePinFile');
    const pinFileSpy = jest.fn();

    // Re-created on every test so that the spy calls through to the real registry by default.
    let createWorkspaceSpy: jest.SpyInstance<
        ReturnType<typeof workspaceService.createWorkspace>
    >;

    beforeEach(() => {
        createWorkspaceSpy = jest.spyOn(workspaceService, 'createWorkspace');

        useBlockNavigationContextSpy.mockReturnValue({
            isBlocked: true,
            setIsBlocked: setIsBlockedSpy,
        });
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ close: closeSpy }),
        );
        getAccountsSpy.mockResolvedValue([
            {
                network: Network.ETHEREUM_SEPOLIA,
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
            },
        ]);
        usePinFileSpy.mockReturnValue({
            mutateAsync: pinFileSpy,
        } as unknown as ReturnType<typeof ipfsMutations.usePinFile>);
        pinFileSpy.mockResolvedValue({ IpfsHash: 'pinned-cid' });
    });

    afterEach(() => {
        useBlockNavigationContextSpy.mockReset();
        useDialogContextSpy.mockReset();
        getAccountsSpy.mockReset();
        usePinFileSpy.mockReset();
        pinFileSpy.mockReset();
        createWorkspaceSpy.mockRestore();
        setIsBlockedSpy.mockClear();
        closeSpy.mockClear();
        localStorage.clear();
    });

    const buildValues = (
        values?: Partial<ICreateWorkspaceFormData>,
    ): ICreateWorkspaceFormData => ({
        name: 'Demo Workspace',
        description: 'A demo workspace',
        resources: [],
        targets: [],
        accounts: [
            {
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        ...values,
    });

    const createTestComponent = (
        props?: Partial<IPublishWorkspaceDialogProps>,
    ) => {
        const completeProps: IPublishWorkspaceDialogProps = {
            location: {
                id: 'PUBLISH_WORKSPACE',
                params: { values: buildValues() },
            },
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <Dialog.Root open={true}>
                        <PublishWorkspaceDialog {...completeProps} />
                    </Dialog.Root>
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    const getSubmitButton = () =>
        screen.getByRole('button', {
            name: /publishWorkspaceDialog.create.submit/,
        });

    it('does not unblock the navigation before the workspace is created', () => {
        render(createTestComponent());

        expect(getSubmitButton()).toBeInTheDocument();
        expect(setIsBlockedSpy).not.toHaveBeenCalledWith(false);
    });

    it('unblocks the navigation and displays the success link once the workspace is created', async () => {
        render(createTestComponent());

        await userEvent.click(getSubmitButton());

        const successLink = await screen.findByRole('link', {
            name: /publishWorkspaceDialog.button.success/,
        });

        expect(successLink).toHaveAttribute(
            'href',
            '/workspace/demo-workspace/all/overview',
        );
        expect(setIsBlockedSpy).toHaveBeenCalledWith(false);
    });

    it('creates the workspace without an owner', async () => {
        render(createTestComponent());

        await userEvent.click(getSubmitButton());
        await screen.findByRole('link', {
            name: /publishWorkspaceDialog.button.success/,
        });

        const workspace = await workspaceService.getWorkspace({
            urlParams: { id: 'demo-workspace' },
        });
        expect(workspace).not.toHaveProperty('owner');
    });

    it('creates a workspace holding no account without resolving account types', async () => {
        render(
            createTestComponent({
                location: {
                    id: 'PUBLISH_WORKSPACE',
                    params: { values: buildValues({ accounts: [] }) },
                },
            }),
        );

        await userEvent.click(getSubmitButton());
        await screen.findByRole('link', {
            name: /publishWorkspaceDialog.button.success/,
        });

        expect(getAccountsSpy).not.toHaveBeenCalled();
        await expect(
            workspaceService.getWorkspace({
                urlParams: { id: 'demo-workspace' },
            }),
        ).resolves.toMatchObject({ accounts: [] });
    });

    it('closes the dialog when navigating to the created workspace', async () => {
        render(createTestComponent());

        await userEvent.click(getSubmitButton());
        await userEvent.click(
            await screen.findByRole('link', {
                name: /publishWorkspaceDialog.button.success/,
            }),
        );

        expect(closeSpy).toHaveBeenCalledWith('PUBLISH_WORKSPACE');
    });

    it('keeps the navigation blocked and offers a retry when the creation fails', async () => {
        createWorkspaceSpy.mockRejectedValue(new Error('failed'));
        render(createTestComponent());

        await userEvent.click(getSubmitButton());

        await waitFor(() =>
            expect(
                screen.getByRole('button', {
                    name: /publishWorkspaceDialog.button.retry/,
                }),
            ).toBeInTheDocument(),
        );
        expect(setIsBlockedSpy).not.toHaveBeenCalledWith(false);
    });

    describe('update mode', () => {
        const storedWorkspace: IWorkspace = {
            id: 'demo-workspace',
            name: 'Demo Workspace',
            description: '',
            avatar: 'ipfs://stored-cid',
            links: [],
            owner: '0x0000000000000000000000000000000000000001',
            accounts: [],
            targets: [],
        };

        const createUpdateComponent = (
            values?: Partial<ICreateWorkspaceFormData>,
        ) =>
            createTestComponent({
                location: {
                    id: 'PUBLISH_WORKSPACE',
                    params: {
                        values: buildValues(values),
                        workspaceId: storedWorkspace.id,
                    },
                },
            });

        const getUpdateButton = () =>
            screen.getByRole('button', {
                name: /publishWorkspaceDialog.update.submit/,
            });

        beforeEach(() => {
            localStorage.setItem(
                workspaceStorageKey,
                JSON.stringify({ [storedWorkspace.id]: storedWorkspace }),
            );
        });

        it('updates the workspace, keeping the owner of a workspace that has one', async () => {
            render(createUpdateComponent({ name: 'Renamed' }));

            await userEvent.click(getUpdateButton());

            const successLink = await screen.findByRole('link', {
                name: /publishWorkspaceDialog.button.success/,
            });
            expect(successLink).toHaveAttribute(
                'href',
                '/workspace/demo-workspace/all/overview',
            );
            await expect(
                workspaceService.getWorkspace({
                    urlParams: { id: storedWorkspace.id },
                }),
            ).resolves.toMatchObject({
                name: 'Renamed',
                owner: storedWorkspace.owner,
            });
        });

        it('keeps a stored avatar without pinning it again', async () => {
            render(
                createUpdateComponent({
                    accounts: [],
                    avatar: {
                        url: 'https://aragon-1.mypinata.cloud/ipfs/stored-cid?img-width=256&img-height=256',
                    },
                }),
            );

            await userEvent.click(getUpdateButton());
            await screen.findByRole('link', {
                name: /publishWorkspaceDialog.button.success/,
            });

            expect(pinFileSpy).not.toHaveBeenCalled();
            await expect(
                workspaceService.getWorkspace({
                    urlParams: { id: storedWorkspace.id },
                }),
            ).resolves.toMatchObject({ avatar: 'ipfs://stored-cid' });
        });

        it('pins a newly selected avatar', async () => {
            const file = new File([], 'avatar.png');
            render(
                createUpdateComponent({
                    avatar: { file, url: 'blob:avatar' },
                }),
            );

            await userEvent.click(getUpdateButton());
            await screen.findByRole('link', {
                name: /publishWorkspaceDialog.button.success/,
            });

            expect(pinFileSpy).toHaveBeenCalledWith({ body: file });
            await expect(
                workspaceService.getWorkspace({
                    urlParams: { id: storedWorkspace.id },
                }),
            ).resolves.toMatchObject({ avatar: 'ipfs://pinned-cid' });
        });

        it('resolves no account type when the workspace holds no account', async () => {
            render(createUpdateComponent({ accounts: [] }));

            await userEvent.click(getUpdateButton());
            await screen.findByRole('link', {
                name: /publishWorkspaceDialog.button.success/,
            });

            expect(getAccountsSpy).not.toHaveBeenCalled();
        });
    });
});
