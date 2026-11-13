import * as GovUiKit from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TransactionSide } from '@/modules/finance/api/financeService';
import * as transactionExecutionDetails from '@/modules/finance/components/transactionExecutionDetails';
import { generateToken } from '@/modules/finance/testUtils';
import * as safeExecutionDetails from '@/modules/safe/components/safeExecutionDetails';
import * as safeTransactionSimulation from '@/modules/safe/components/safeTransactionSimulation';
import * as safeTransactionVoting from '@/modules/safe/components/safeTransactionVoting';
import { safeTransactionUtils } from '@/modules/safe/utils/safeTransactionUtils';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { WorkspaceAccountType } from '../../api/workspaceService';
import {
    generateWorkspaceAccount,
    generateWorkspacePendingTransaction,
    generateWorkspaceTransaction,
} from '../../testUtils';
import {
    type IWorkspaceTransactionListItemProps,
    WorkspaceTransactionListItem,
} from './workspaceTransactionListItem';

describe('<WorkspaceTransactionListItem /> component', () => {
    const assetTransferSpy = jest.spyOn(GovUiKit, 'AssetTransfer');
    const transactionExecutionDetailsSpy = jest.spyOn(
        transactionExecutionDetails,
        'TransactionExecutionDetails',
    );
    const safeExecutionDetailsSpy = jest.spyOn(
        safeExecutionDetails,
        'SafeExecutionDetails',
    );
    const safeTransactionVotingSpy = jest.spyOn(
        safeTransactionVoting,
        'SafeTransactionVoting',
    );
    const safeTransactionSimulationSpy = jest.spyOn(
        safeTransactionSimulation,
        'SafeTransactionSimulation',
    );
    const isRejectionSpy = jest.spyOn(safeTransactionUtils, 'isRejection');

    beforeEach(() => {
        isRejectionSpy.mockReturnValue(false);
        assetTransferSpy.mockReturnValue(<div>asset-transfer</div>);
        transactionExecutionDetailsSpy.mockReturnValue(
            <div>execution-detail</div>,
        );
        safeExecutionDetailsSpy.mockReturnValue(
            <div>safe-execution-detail</div>,
        );
        safeTransactionVotingSpy.mockReturnValue(
            <div>safe-transaction-voting</div>,
        );
        safeTransactionSimulationSpy.mockReturnValue(
            <div>safe-transaction-simulation</div>,
        );
    });

    afterEach(() => {
        isRejectionSpy.mockReset();
        assetTransferSpy.mockReset();
        transactionExecutionDetailsSpy.mockReset();
        safeExecutionDetailsSpy.mockReset();
        safeTransactionVotingSpy.mockReset();
        safeTransactionSimulationSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTransactionListItemProps>,
    ) => {
        const completeProps: IWorkspaceTransactionListItemProps = {
            transaction: generateWorkspaceTransaction(),
            value: 'transaction-0',
            index: 0,
            ...props,
        };

        return (
            <GovUiKit.GukModulesProvider>
                <GovUiKit.Accordion.Container isMulti={true}>
                    <WorkspaceTransactionListItem {...completeProps} />
                </GovUiKit.Accordion.Container>
            </GovUiKit.GukModulesProvider>
        );
    };

    it('renders a received transfer with its token amount', () => {
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.DEPOSIT,
            value: '10',
            token: generateToken({ symbol: 'USDC' }),
        });

        render(createTestComponent({ transaction }));

        expect(
            screen.getByRole('button', { name: /Received/ }),
        ).toBeInTheDocument();
        expect(screen.getByText('10 USDC')).toBeInTheDocument();
    });

    it('renders a sent transfer', () => {
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.WITHDRAW,
        });

        render(createTestComponent({ transaction }));

        expect(
            screen.getByRole('button', { name: /Sent/ }),
        ).toBeInTheDocument();
    });

    it('expands a transfer to the transferred asset', async () => {
        const token = generateToken({
            address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
            name: 'Shiba Inu',
            symbol: 'SHIB',
            logo: 'shib-logo.png',
            priceUsd: '0.5',
        });
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.WITHDRAW,
            network: Network.ETHEREUM_SEPOLIA,
            value: '12',
            token,
            fromAddress: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
            toAddress: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
        });

        render(createTestComponent({ transaction }));

        expect(screen.queryByText('asset-transfer')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /Sent/ }));

        expect(screen.getByText('asset-transfer')).toBeInTheDocument();
        expect(assetTransferSpy).toHaveBeenCalledWith(
            {
                assetAddress: token.address,
                assetAmount: '12',
                assetFiatPrice: '0.5',
                assetIconSrc: 'shib-logo.png',
                assetName: 'Shiba Inu',
                assetSymbol: 'SHIB',
                chainId: networkDefinitions[Network.ETHEREUM_SEPOLIA].id,
                recipient: { address: transaction.toAddress },
                sender: { address: transaction.fromAddress },
            },
            undefined,
        );
    });

    it('renders an execution without proposal by its executor alone, next to its executed status', () => {
        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            subdomain: 'multisig',
            name: 'Core council',
        });
        const dao = generateDao({ plugins: [plugin] });
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.EXECUTION,
            source: 'multisig',
            actionCount: 2,
        });

        render(createTestComponent({ transaction, dao }));

        const header = screen.getByRole('button', { name: /status\.executed/ });
        expect(header).toHaveTextContent('Core council');
        expect(header).toHaveTextContent(
            'app.workspace.workspaceTransactionList.item.status.executed',
        );
        expect(header).not.toHaveTextContent(/Executed/);
        expect(header).not.toHaveTextContent('2 actions');
    });

    it('titles a DAO execution with the proposal slug of the row', () => {
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.EXECUTION,
            proposalIndex: '2',
            proposalSlug: 'token-12',
        });

        render(createTestComponent({ transaction, dao: generateDao() }));

        // The executor comes first, followed by the proposal slug.
        expect(
            screen.getByRole('button', { name: /router TOKEN-12/ }),
        ).toBeInTheDocument();
    });

    it('renders an executed Safe transaction with its account initials, nonce and account name', () => {
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.EXECUTION,
            safeTxHash: '0xff54',
            nonce: '21',
        });

        render(
            createTestComponent({
                transaction,
                account: generateWorkspaceAccount({
                    type: WorkspaceAccountType.SAFE,
                    metadata: { name: 'Treasury Safe' },
                }),
            }),
        );

        const header = screen.getByRole('button', {
            name: /Treasury Safe TS-21/,
        });
        expect(header).toHaveTextContent(
            'app.workspace.workspaceTransactionList.item.status.executed',
        );
    });

    it('renders a pending Safe transaction with its submission date and active status', () => {
        const submittedAt = 1_793_804_572;
        const transaction = generateWorkspacePendingTransaction({
            nonce: '22',
            submittedAt,
            confirmations: 1,
            confirmationsRequired: 2,
        });

        render(
            createTestComponent({
                transaction,
                account: generateWorkspaceAccount({
                    type: WorkspaceAccountType.SAFE,
                    metadata: { name: 'Treasury Safe' },
                }),
            }),
        );

        const header = screen.getByRole('button', {
            name: /Treasury Safe TS-22/,
        });
        expect(header).toHaveTextContent(
            'app.workspace.workspaceTransactionList.item.status.active',
        );
        expect(header).toHaveTextContent(
            GovUiKit.formatterUtils.formatDate(submittedAt * 1000, {
                format: GovUiKit.DateFormat.YEAR_MONTH_DAY_TIME,
            })!,
        );
    });

    it('renders a pending Safe transaction with enough confirmations as executable', () => {
        const transaction = generateWorkspacePendingTransaction({
            confirmations: 2,
            confirmationsRequired: 2,
        });

        render(
            createTestComponent({
                transaction,
                account: generateWorkspaceAccount({
                    type: WorkspaceAccountType.SAFE,
                }),
            }),
        );

        expect(screen.getByRole('button')).toHaveTextContent(
            'app.workspace.workspaceTransactionList.item.status.executable',
        );
    });

    it('expands a pending Safe transaction to its detail read from the Safe, whatever its account type', async () => {
        const transaction = generateWorkspacePendingTransaction({
            safeTxHash: '0x2632',
        });

        render(createTestComponent({ transaction }));

        await userEvent.click(screen.getByRole('button'));

        expect(safeExecutionDetailsSpy).toHaveBeenCalledWith(
            {
                isRejection: false,
                safeAddress: transaction.account.address,
                safeTxHash: '0x2632',
                transaction,
            },
            undefined,
        );
        expect(transactionExecutionDetailsSpy).not.toHaveBeenCalled();
    });

    it('lists the rejection of a Safe nonce as one, with no simulation and no actions to read', async () => {
        isRejectionSpy.mockReturnValue(true);
        const transaction = generateWorkspacePendingTransaction({
            network: Network.ETHEREUM_SEPOLIA,
            safeTxHash: '0x2632',
            nonce: '22',
        });

        render(createTestComponent({ transaction }));

        expect(isRejectionSpy).toHaveBeenCalledWith({
            safeTxHash: '0x2632',
            nonce: '22',
            safeAddress: transaction.account.address,
            chainId: networkDefinitions[Network.ETHEREUM_SEPOLIA].id,
        });

        const header = screen.getByRole('button');
        expect(header).toHaveTextContent(
            /workspaceTransactionList.item.rejection \(date=/,
        );

        await userEvent.click(header);

        expect(screen.getByText('safe-transaction-voting')).toBeInTheDocument();
        expect(
            screen.queryByText('safe-transaction-simulation'),
        ).not.toBeInTheDocument();
        expect(safeExecutionDetailsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ isRejection: true }),
            undefined,
        );
    });

    it('renders the voting card of a pending Safe transaction above its actions', async () => {
        const transaction = generateWorkspacePendingTransaction({
            safeTxHash: '0x2632',
        });

        render(createTestComponent({ transaction }));

        await userEvent.click(screen.getByRole('button'));

        const votingCard = screen.getByText('safe-transaction-voting');
        expect(
            votingCard.compareDocumentPosition(
                screen.getByText('safe-execution-detail'),
            ),
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(safeTransactionVotingSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                network: transaction.network,
                safeAddress: transaction.account.address,
                safeTxHash: '0x2632',
                onSafeStateChange: expect.any(Function),
            }),
            undefined,
        );
    });

    it('renders the simulation of a pending Safe transaction between its voting card and its actions', async () => {
        const transaction = generateWorkspacePendingTransaction({
            safeTxHash: '0x2632',
            actionCount: 3,
        });

        render(createTestComponent({ transaction }));

        await userEvent.click(screen.getByRole('button'));

        const simulation = screen.getByText('safe-transaction-simulation');
        expect(
            screen
                .getByText('safe-transaction-voting')
                .compareDocumentPosition(simulation),
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(
            simulation.compareDocumentPosition(
                screen.getByText('safe-execution-detail'),
            ),
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(safeTransactionSimulationSpy).toHaveBeenCalledWith(
            {
                actionCount: 3,
                network: transaction.network,
                safeAddress: transaction.account.address,
                safeTxHash: '0x2632',
            },
            undefined,
        );
    });

    it('expands an execution to its detail in the context of its DAO', async () => {
        const dao = generateDao();
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.EXECUTION,
        });

        render(createTestComponent({ transaction, dao }));

        expect(screen.queryByText('execution-detail')).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', { name: /status\.executed/ }),
        );

        expect(screen.getByText('execution-detail')).toBeInTheDocument();
        expect(transactionExecutionDetailsSpy).toHaveBeenCalledWith(
            { dao, transaction },
            undefined,
        );
    });

    it('renders an execution without a DAO as a block-explorer row, as its actions cannot be decoded', () => {
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.EXECUTION,
        });

        render(createTestComponent({ transaction }));

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });

    it('expands an execution of a Safe account to its detail read from the Safe', async () => {
        const safeAddress = '0xeB88A1D01306Bd9d8442673ee78770f2665B008F';
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.EXECUTION,
            account: {
                network: Network.ETHEREUM_SEPOLIA,
                address: safeAddress,
            },
            safeTxHash: '0xff54',
        });

        render(
            createTestComponent({
                transaction,
                account: generateWorkspaceAccount({
                    type: WorkspaceAccountType.SAFE,
                }),
            }),
        );

        await userEvent.click(
            screen.getByRole('button', { name: /status\.executed/ }),
        );

        expect(screen.getByText('safe-execution-detail')).toBeInTheDocument();
        expect(safeExecutionDetailsSpy).toHaveBeenCalledWith(
            {
                isRejection: false,
                safeAddress,
                safeTxHash: '0xff54',
                transaction,
            },
            undefined,
        );
        expect(transactionExecutionDetailsSpy).not.toHaveBeenCalled();
        expect(safeTransactionVotingSpy).not.toHaveBeenCalled();
        expect(safeTransactionSimulationSpy).not.toHaveBeenCalled();
    });

    it('renders an execution of a Safe account without a Safe transaction hash as a block-explorer row', () => {
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.EXECUTION,
        });

        render(
            createTestComponent({
                transaction,
                account: generateWorkspaceAccount({
                    type: WorkspaceAccountType.SAFE,
                }),
            }),
        );

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });

    it('ignores the Safe transaction hash of an execution of a DAO account', async () => {
        const dao = generateDao();
        const transaction = generateWorkspaceTransaction({
            side: TransactionSide.EXECUTION,
            safeTxHash: '0xff54',
        });

        render(
            createTestComponent({
                transaction,
                dao,
                account: generateWorkspaceAccount({
                    type: WorkspaceAccountType.DAO,
                }),
            }),
        );

        await userEvent.click(
            screen.getByRole('button', { name: /status\.executed/ }),
        );

        expect(screen.getByText('execution-detail')).toBeInTheDocument();
        expect(safeExecutionDetailsSpy).not.toHaveBeenCalled();
    });

    describe('after a Safe state change', () => {
        const invalidateQueriesSpy = jest.spyOn(
            QueryClient.prototype,
            'invalidateQueries',
        );

        beforeEach(() => {
            jest.useFakeTimers();
            invalidateQueriesSpy.mockResolvedValue();
        });

        afterEach(() => {
            jest.useRealTimers();
            invalidateQueriesSpy.mockReset();
        });

        const expandAndChangeSafeState = async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            });
            await user.click(screen.getByRole('button'));
            const { onSafeStateChange } =
                safeTransactionVotingSpy.mock.calls[0][0];
            act(() => onSafeStateChange?.());
            invalidateQueriesSpy.mockClear();
        };

        it('refreshes the transactions until the row reflects the change', async () => {
            const transaction = generateWorkspacePendingTransaction({
                confirmations: 1,
            });
            const { rerender } = render(createTestComponent({ transaction }));
            await expandAndChangeSafeState();

            act(() => jest.advanceTimersByTime(10_000));
            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);

            rerender(
                createTestComponent({
                    transaction: { ...transaction, confirmations: 2 },
                }),
            );
            act(() => jest.advanceTimersByTime(10_000));
            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
        });

        it('refreshes the transactions until the nonce rivals of the row reflect the change', async () => {
            const transaction = generateWorkspacePendingTransaction();
            const { rerender } = render(createTestComponent({ transaction }));
            await expandAndChangeSafeState();

            act(() => jest.advanceTimersByTime(10_000));
            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);

            rerender(
                createTestComponent({
                    transaction,
                    nonceRivalsState: '0xdef:1',
                }),
            );
            act(() => jest.advanceTimersByTime(10_000));
            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);

            // The rival leaving the list brings the row back to the state it was awaited from.
            rerender(createTestComponent({ transaction }));
            act(() => jest.advanceTimersByTime(10_000));
            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
        });

        it('stops refreshing the transactions when the row never reflects the change', async () => {
            const transaction = generateWorkspacePendingTransaction();
            render(createTestComponent({ transaction }));
            await expandAndChangeSafeState();

            act(() => jest.advanceTimersByTime(5 * 60_000));
            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(24);
        });
    });
});
