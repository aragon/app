import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import type {
    ICreateWorkspaceFormAccount,
    ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { publishWorkspaceDialogUtils } from './publishWorkspaceDialogUtils';

describe('publishWorkspaceDialog utils', () => {
    const targetAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const accountAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildAccount = (
        account?: Partial<ICreateWorkspaceFormAccount>,
    ): ICreateWorkspaceFormAccount => ({
        address: accountAddress,
        network: Network.ETHEREUM_SEPOLIA,
        ...account,
    });

    const buildAccountInfo = (
        accountInfo?: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        network: Network.ETHEREUM_SEPOLIA,
        address: accountAddress,
        type: WorkspaceAccountInfoType.DAO,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: true,
        ...accountInfo,
    });

    const accountInfos = [buildAccountInfo()];

    const buildValues = (
        values?: Partial<ICreateWorkspaceFormData>,
    ): ICreateWorkspaceFormData => ({
        name: 'Demo Workspace',
        description: 'A demo workspace',
        resources: [],
        targets: [],
        accounts: [buildAccount()],
        ...values,
    });

    describe('buildWorkspace', () => {
        it('maps the form values to the workspace to be persisted', () => {
            const values = buildValues({
                resources: [{ name: 'Website', url: 'https://aragon.org' }],
                targets: [
                    { address: targetAddress, network: Network.CITREA_MAINNET },
                ],
            });

            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values,
                accountAvatarUris: [undefined],
                accountInfos,
            });

            expect(workspace).toEqual({
                name: 'Demo Workspace',
                description: 'A demo workspace',
                avatar: null,
                links: [{ name: 'Website', url: 'https://aragon.org' }],
                accounts: [
                    {
                        id: `ethereum-sepolia-${accountAddress}`,
                        type: WorkspaceAccountType.DAO,
                        address: accountAddress,
                        network: Network.ETHEREUM_SEPOLIA,
                        metadata: undefined,
                    },
                ],
                targets: [
                    { address: targetAddress, network: Network.CITREA_MAINNET },
                ],
            });
        });

        it('sets the workspace avatar URI', () => {
            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values: buildValues(),
                avatarUri: 'ipfs://workspace-cid',
                accountAvatarUris: [undefined],
                accountInfos,
            });

            expect(workspace.avatar).toEqual('ipfs://workspace-cid');
        });

        it('builds a workspace without owner', () => {
            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values: buildValues(),
                accountAvatarUris: [undefined],
                accountInfos,
            });

            expect(workspace).not.toHaveProperty('owner');
        });

        it('stores the account metadata when the account has been named', () => {
            const values = buildValues({
                accounts: [
                    buildAccount({
                        metadata: {
                            name: '  Main multisig  ',
                            description: 'The main multisig',
                        },
                    }),
                ],
            });

            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values,
                accountAvatarUris: ['ipfs://account-cid'],
                accountInfos,
            });

            expect(workspace.accounts[0].metadata).toEqual({
                name: 'Main multisig',
                description: 'The main multisig',
                avatar: 'ipfs://account-cid',
            });
        });

        it('omits the account metadata when the metadata section has been left empty', () => {
            const values = buildValues({
                accounts: [
                    buildAccount({ metadata: { name: '', description: '' } }),
                ],
            });

            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values,
                accountAvatarUris: [undefined],
                accountInfos,
            });

            expect(workspace.accounts[0].metadata).toBeUndefined();
        });

        it('omits an empty account metadata description', () => {
            const values = buildValues({
                accounts: [
                    buildAccount({
                        metadata: { name: 'Main multisig', description: '  ' },
                    }),
                ],
            });

            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values,
                accountAvatarUris: [undefined],
                accountInfos,
            });

            expect(workspace.accounts[0].metadata?.description).toBeUndefined();
        });
    });

    describe('buildWorkspace account type', () => {
        it('stores the type resolved by the accounts API', () => {
            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values: buildValues(),
                accountAvatarUris: [undefined],
                accountInfos: [
                    buildAccountInfo({ type: WorkspaceAccountInfoType.SAFE }),
                ],
            });

            expect(workspace.accounts[0].type).toEqual(
                WorkspaceAccountType.SAFE,
            );
        });

        it('throws when the accounts API did not resolve the account', () => {
            expect(() =>
                publishWorkspaceDialogUtils.buildWorkspace({
                    values: buildValues(),
                    accountAvatarUris: [undefined],
                    accountInfos: [],
                }),
            ).toThrow(/unable to resolve the type of the account/);
        });

        it('throws when the account stopped being available', () => {
            expect(() =>
                publishWorkspaceDialogUtils.buildWorkspace({
                    values: buildValues(),
                    accountAvatarUris: [undefined],
                    accountInfos: [
                        buildAccountInfo({
                            type: WorkspaceAccountInfoType.UNKNOWN,
                            status: WorkspaceAccountInfoStatus.UNAVAILABLE,
                        }),
                    ],
                }),
            ).toThrow(/unable to resolve the type of the account/);
        });
    });

    describe('getAccountAvatars', () => {
        it('returns one entry per account, undefined when there is no avatar to store', () => {
            const file = new File([], 'avatar.png');
            const storedAvatar = { url: 'https://gateway/ipfs/account-cid' };
            const accounts = [
                buildAccount(),
                buildAccount({
                    metadata: {
                        name: 'Named',
                        description: '',
                        avatar: { file, url: 'blob:avatar' },
                    },
                }),
                buildAccount({
                    metadata: {
                        name: 'Stored',
                        description: '',
                        avatar: storedAvatar,
                    },
                }),
                buildAccount({
                    // Unnamed metadata is not stored, therefore its avatar must not be stored either.
                    metadata: {
                        name: '',
                        description: '',
                        avatar: { file, url: 'blob:avatar' },
                    },
                }),
            ];

            const result =
                publishWorkspaceDialogUtils.getAccountAvatars(accounts);

            expect(result).toEqual([
                undefined,
                { file, url: 'blob:avatar' },
                storedAvatar,
                undefined,
            ]);
        });
    });
});
