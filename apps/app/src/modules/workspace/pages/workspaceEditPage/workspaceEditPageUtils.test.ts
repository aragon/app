import { Network } from '@/shared/api/daoService';
import {
    type IWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceWizardStep } from '../../components/workspaceWizard';
import { workspaceEditPageUtils } from './workspaceEditPageUtils';

describe('workspaceEditPage utils', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'demo',
        name: 'Demo',
        description: 'A demo workspace',
        avatar: null,
        links: [{ name: 'Website', url: 'https://aragon.org' }],
        accounts: [
            {
                id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
                type: WorkspaceAccountType.DAO,
                address,
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        targets: [{ address, network: Network.CITREA_MAINNET }],
        ...workspace,
    });

    describe('buildFormValues', () => {
        it('maps the stored workspace to the form values', () => {
            expect(
                workspaceEditPageUtils.buildFormValues(buildWorkspace()),
            ).toEqual({
                name: 'Demo',
                description: 'A demo workspace',
                avatar: undefined,
                resources: [{ name: 'Website', url: 'https://aragon.org' }],
                targets: [{ address, network: Network.CITREA_MAINNET }],
                accounts: [
                    {
                        address,
                        network: Network.ETHEREUM_SEPOLIA,
                        metadata: undefined,
                    },
                ],
            });
        });

        it('maps a stored avatar to a preview URL carrying no file', () => {
            const values = workspaceEditPageUtils.buildFormValues(
                buildWorkspace({ avatar: 'ipfs://workspace-cid' }),
            );

            expect(values.avatar).toEqual({
                url: expect.stringContaining('/ipfs/workspace-cid'),
            });
        });

        it('maps the account metadata, defaulting a missing description to an empty string', () => {
            const workspace = buildWorkspace();
            workspace.accounts[0].metadata = {
                name: 'Main DAO',
                avatar: 'ipfs://account-cid',
            };

            const values = workspaceEditPageUtils.buildFormValues(workspace);

            expect(values.accounts[0].metadata).toEqual({
                name: 'Main DAO',
                description: '',
                avatar: {
                    url: expect.stringContaining('/ipfs/account-cid'),
                },
            });
        });
    });

    describe('resolveInitialStep', () => {
        it('resolves the step named by the parameter, regardless of its case', () => {
            expect(
                workspaceEditPageUtils.resolveInitialStep('accounts'),
            ).toEqual(WorkspaceWizardStep.ACCOUNTS);
            expect(
                workspaceEditPageUtils.resolveInitialStep('TARGETS'),
            ).toEqual(WorkspaceWizardStep.TARGETS);
        });

        it('resolves no step when the parameter is missing, repeated or unknown', () => {
            expect(workspaceEditPageUtils.resolveInitialStep()).toBeUndefined();
            expect(
                workspaceEditPageUtils.resolveInitialStep([
                    'accounts',
                    'targets',
                ]),
            ).toBeUndefined();
            expect(
                workspaceEditPageUtils.resolveInitialStep('unknown'),
            ).toBeUndefined();
        });
    });
});
