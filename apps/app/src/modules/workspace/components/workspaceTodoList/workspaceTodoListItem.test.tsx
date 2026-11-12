import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateProposal } from '@/modules/governance/testUtils';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceTodoProposalItem,
    type IWorkspaceTodoTransactionItem,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
import { workspaceTransactionUtils } from '../../utils/workspaceTransactionUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspaceTodoListItemProps,
    WorkspaceTodoListItem,
} from './workspaceTodoListItem';

describe('<WorkspaceTodoListItem /> component', () => {
    const network = Network.ETHEREUM_SEPOLIA;
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const pluginAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const safeAddress = '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B';

    const daoAccountId = workspaceUtils.buildAccountId({
        network,
        address: daoAddress,
    });

    const dao = generateDao({
        name: 'Demo DAO',
        plugins: [
            generateDaoPlugin({
                address: pluginAddress,
                slug: 'gov',
                interfaceType: PluginInterfaceType.MULTISIG,
            }),
        ],
    });

    const safeAccount: IWorkspaceAccount = {
        id: workspaceUtils.buildAccountId({ network, address: safeAddress }),
        type: WorkspaceAccountType.SAFE,
        network,
        address: safeAddress,
        metadata: { name: 'Treasury Safe' },
    };

    const buildProposalTodo = (
        todo?: Partial<IWorkspaceTodoProposalItem>,
    ): IWorkspaceTodoProposalItem => ({
        type: WorkspaceTodoType.PROPOSAL,
        proposal: {
            ...generateProposal({
                network,
                daoAddress,
                pluginAddress,
                incrementalId: 3,
                title: 'Ecosystem incentives',
            }),
            // Five days and a bit, so the relative date rounds to five days for the whole test run.
            voteEndDate: Math.floor(Date.now() / 1000) + 5 * 24 * 3600 + 3600,
        },
        dao,
        ...todo,
    });

    const buildTransactionTodo = (
        todo?: Partial<IWorkspaceTodoTransactionItem>,
    ): IWorkspaceTodoTransactionItem => ({
        type: WorkspaceTodoType.TRANSACTION,
        account: safeAccount,
        safeInfo: generateSafeInfo({ threshold: 2 }),
        transaction: generateSafeTransaction({
            nonce: '12',
            confirmations: [
                { owner: '0xOwner', signature: '0x', submissionDate: '' },
            ] as never,
            confirmationsRequired: 3,
        }),
        hasNonceRival: false,
        ...todo,
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTodoListItemProps>,
    ) => {
        const completeProps: IWorkspaceTodoListItemProps = {
            todo: buildProposalTodo(),
            workspaceId: 'my-workspace',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodoListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    describe('proposal', () => {
        it('titles the row with the proposal, identified by its slug', () => {
            render(createTestComponent());

            expect(
                screen.getByText('Ecosystem incentives'),
            ).toBeInTheDocument();
            expect(screen.getByText('GOV-3')).toBeInTheDocument();
        });

        it('does not repeat the slug titling an untitled proposal', () => {
            const todo = buildProposalTodo();
            todo.proposal.title = '';
            render(createTestComponent({ todo }));

            expect(screen.getAllByText('GOV-3')).toHaveLength(1);
        });

        it('tells how long the vote window stays open', () => {
            render(createTestComponent());

            // The duration rounds with the clock of the run, so only its shape is asserted.
            expect(screen.getByText(/^\d+ days left$/)).toBeInTheDocument();
        });

        it('tells no time left when the end of the vote window is unknown', () => {
            const todo = buildProposalTodo();
            todo.proposal.voteEndDate = Number.NaN;
            render(createTestComponent({ todo }));

            expect(
                screen.getByText('Ecosystem incentives'),
            ).toBeInTheDocument();
            expect(screen.queryByText(/left$/)).not.toBeInTheDocument();
        });

        it('calls for a vote and links to the proposal page of its account', () => {
            render(createTestComponent());

            expect(
                screen.getByText(/item\.proposal\.action$/),
            ).toBeInTheDocument();
            expect(screen.getByRole('link')).toHaveAttribute(
                'href',
                workspaceUtils.getAccountScopeUrl(
                    'my-workspace',
                    daoAccountId,
                    'proposals/GOV-3',
                ),
            );
        });

        it('links to the proposals of its account when its plugin does not resolve', () => {
            render(
                createTestComponent({
                    todo: buildProposalTodo({ dao: generateDao() }),
                }),
            );

            expect(screen.getByRole('link')).toHaveAttribute(
                'href',
                workspaceUtils.getAccountScopeUrl(
                    'my-workspace',
                    daoAccountId,
                    'proposals',
                ),
            );
        });
    });

    describe('Safe transaction', () => {
        it('titles the row as the transactions page does, with the account and its nonce', () => {
            render(createTestComponent({ todo: buildTransactionTodo() }));

            expect(screen.getByText('Treasury Safe')).toBeInTheDocument();
            expect(screen.getByText('TS-12')).toBeInTheDocument();
        });

        it('counts the signatures against the threshold read from the Safe', () => {
            render(createTestComponent({ todo: buildTransactionTodo() }));

            expect(
                screen.getByText(
                    /item\.transaction\.signatures \(count=1,required=2\)$/,
                ),
            ).toBeInTheDocument();
        });

        it('falls back to the queue threshold when the Safe could not be read', () => {
            render(
                createTestComponent({
                    todo: buildTransactionTodo({ safeInfo: null }),
                }),
            );

            expect(
                screen.getByText(/\(count=1,required=3\)$/),
            ).toBeInTheDocument();
        });

        it('flags a nonce conflict', () => {
            render(
                createTestComponent({
                    todo: buildTransactionTodo({ hasNonceRival: true }),
                }),
            );

            expect(
                screen.getByText(
                    /item\.transaction\.signaturesNonceRival \(count=1,required=2\)$/,
                ),
            ).toBeInTheDocument();
        });

        it('calls for a signature and links to the transaction among the ones of its Safe', () => {
            const todo = buildTransactionTodo();
            render(createTestComponent({ todo }));

            expect(
                screen.getByText(/item\.transaction\.action$/),
            ).toBeInTheDocument();
            expect(screen.getByRole('link')).toHaveAttribute(
                'href',
                workspaceTransactionUtils.getSafeTransactionUrl(
                    'my-workspace',
                    safeAccount.id,
                    todo.transaction.safeTxHash,
                ),
            );
        });
    });
});
