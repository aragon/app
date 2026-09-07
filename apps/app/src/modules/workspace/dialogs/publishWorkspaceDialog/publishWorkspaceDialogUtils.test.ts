import { Network } from '@/shared/api/daoService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import type {
    ICreateWorkspaceFormAccount,
    ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { publishWorkspaceDialogUtils } from './publishWorkspaceDialogUtils';

describe('publishWorkspaceDialog utils', () => {
    const owner = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const accountAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildAccount = (
        account?: Partial<ICreateWorkspaceFormAccount>,
    ): ICreateWorkspaceFormAccount => ({
        address: accountAddress,
        network: Network.ETHEREUM_SEPOLIA,
        ...account,
    });

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
                targets: [{ address: owner, network: Network.CITREA_MAINNET }],
            });

            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values,
                owner,
                accountAvatarCids: [undefined],
            });

            expect(workspace).toEqual({
                name: 'Demo Workspace',
                description: 'A demo workspace',
                avatar: null,
                links: [{ name: 'Website', url: 'https://aragon.org' }],
                owner,
                accounts: [
                    {
                        id: `ethereum-sepolia-${accountAddress}`,
                        type: WorkspaceAccountType.DAO,
                        address: accountAddress,
                        network: Network.ETHEREUM_SEPOLIA,
                        metadata: undefined,
                    },
                ],
                targets: [{ address: owner, network: Network.CITREA_MAINNET }],
            });
        });

        it('sets the workspace avatar as an IPFS URI when pinned', () => {
            const workspace = publishWorkspaceDialogUtils.buildWorkspace({
                values: buildValues(),
                owner,
                avatarCid: 'workspace-cid',
                accountAvatarCids: [undefined],
            });

            expect(workspace.avatar).toEqual('ipfs://workspace-cid');
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
                owner,
                accountAvatarCids: ['account-cid'],
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
                owner,
                accountAvatarCids: [undefined],
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
                owner,
                accountAvatarCids: [undefined],
            });

            expect(workspace.accounts[0].metadata?.description).toBeUndefined();
        });
    });

    describe('getAccountAvatarFiles', () => {
        it('returns one entry per account, undefined when there is nothing to pin', () => {
            const file = new File([], 'avatar.png');
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
                    // Unnamed metadata is not stored, therefore its avatar must not be pinned.
                    metadata: {
                        name: '',
                        description: '',
                        avatar: { file, url: 'blob:avatar' },
                    },
                }),
            ];

            const result =
                publishWorkspaceDialogUtils.getAccountAvatarFiles(accounts);

            expect(result).toEqual([undefined, file, undefined]);
        });
    });
});
