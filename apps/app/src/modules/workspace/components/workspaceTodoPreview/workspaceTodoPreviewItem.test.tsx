import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateProposal } from '@/modules/governance/testUtils';
import { SafeDialogId } from '@/modules/safe/constants';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
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
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspaceTodoPreviewItemProps,
    WorkspaceTodoPreviewItem,
} from './workspaceTodoPreviewItem';

describe('<WorkspaceTodoPreviewItem /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

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
        metadata: { name: 'Treasury' },
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
        safeInfo: generateSafeInfo({ threshold: 2, version: '1.4.1' }),
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

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTodoPreviewItemProps>,
    ) => {
        const completeProps: IWorkspaceTodoPreviewItemProps = {
            todo: buildProposalTodo(),
            workspaceId: 'my-workspace',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodoPreviewItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    describe('proposal', () => {
        it('titles the row with the proposal slug and title', () => {
            render(createTestComponent());

            expect(
                screen.getByText(
                    /workspaceTodoPreview\.proposal\.title \(slug=GOV-3,title=Ecosystem incentives\)/,
                ),
            ).toBeInTheDocument();
        });

        it('titles an untitled proposal with its slug alone', () => {
            const todo = buildProposalTodo();
            todo.proposal.title = '';
            render(createTestComponent({ todo }));

            expect(screen.getByText('GOV-3')).toBeInTheDocument();
        });

        it('tells when the vote window closes', () => {
            render(createTestComponent());

            expect(
                // The relative date rounds with the clock of the run, so only its shape is asserted.
                screen.getByText(
                    /workspaceTodoPreview\.proposal\.meta \(date=in \d+ days\)/,
                ),
            ).toBeInTheDocument();
        });

        it('only calls for a vote when the end of the vote window is unknown', () => {
            const todo = buildProposalTodo();
            todo.proposal.voteEndDate = Number.NaN;
            render(createTestComponent({ todo }));

            expect(
                screen.queryByText(/workspaceTodoPreview\.proposal\.meta/),
            ).not.toBeInTheDocument();
            // Once as what to do about the row, once as its button.
            expect(
                screen.getAllByText(/workspaceTodoPreview\.proposal\.action$/),
            ).toHaveLength(2);
        });

        it('links the vote button to the proposal page of its account', () => {
            render(createTestComponent());

            expect(
                screen.getByRole('link', {
                    name: /workspaceTodoPreview\.proposal\.action$/,
                }),
            ).toHaveAttribute(
                'href',
                workspaceUtils.getAccountScopeUrl(
                    'my-workspace',
                    daoAccountId,
                    'proposals/GOV-3',
                ),
            );
        });
    });

    describe('Safe transaction', () => {
        it('titles the row with the nonce and counts the signatures against the Safe threshold', () => {
            render(createTestComponent({ todo: buildTransactionTodo() }));

            expect(
                screen.getByText(
                    /workspaceTodoPreview\.transaction\.title \(nonce=12\)/,
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    /workspaceTodoPreview\.transaction\.meta \(account=Treasury,count=1,required=2\)$/,
                ),
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
                    /workspaceTodoPreview\.transaction\.nonceRival$/,
                ),
            ).toBeInTheDocument();
        });

        it('opens the review dialog of the transaction on sign', async () => {
            const open = jest.fn();
            useDialogContextSpy.mockReturnValue(
                generateDialogContext({ open }),
            );
            const todo = buildTransactionTodo();
            render(createTestComponent({ todo }));

            await userEvent.click(
                screen.getByRole('button', {
                    name: /workspaceTodoPreview\.transaction\.action$/,
                }),
            );

            expect(open).toHaveBeenCalledWith(SafeDialogId.TRANSACTION_REVIEW, {
                params: {
                    transaction: todo.transaction,
                    safeAddress: safeAccount.address,
                    network: safeAccount.network,
                    safeVersion: '1.4.1',
                },
            });
        });
    });
});
