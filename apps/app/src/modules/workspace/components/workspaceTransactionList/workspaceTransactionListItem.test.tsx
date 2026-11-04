import * as GovUiKit from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TransactionSide } from '@/modules/finance/api/financeService';
import * as transactionExecutionDetails from '@/modules/finance/components/transactionExecutionDetails';
import {
    generateToken,
    generateTransaction,
} from '@/modules/finance/testUtils';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
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

    beforeEach(() => {
        assetTransferSpy.mockReturnValue(<div data-testid="asset-transfer" />);
        transactionExecutionDetailsSpy.mockReturnValue(
            <div data-testid="execution-detail" />,
        );
    });

    afterEach(() => {
        assetTransferSpy.mockReset();
        transactionExecutionDetailsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTransactionListItemProps>,
    ) => {
        const completeProps: IWorkspaceTransactionListItemProps = {
            transaction: generateTransaction(),
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
        const transaction = generateTransaction({
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
        const transaction = generateTransaction({
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
        const transaction = generateTransaction({
            side: TransactionSide.WITHDRAW,
            network: Network.ETHEREUM_SEPOLIA,
            value: '12',
            token,
            fromAddress: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
            toAddress: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
        });

        render(createTestComponent({ transaction }));

        expect(screen.queryByTestId('asset-transfer')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /Sent/ }));

        expect(screen.getByTestId('asset-transfer')).toBeInTheDocument();
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

    it('renders an execution with the plugin that emitted it and its action count', () => {
        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            subdomain: 'multisig',
            name: 'Core council',
        });
        const dao = generateDao({ plugins: [plugin] });
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            source: 'multisig',
            actionCount: 2,
        });

        render(createTestComponent({ transaction, dao }));

        const header = screen.getByRole('button', { name: /Executed/ });
        expect(header).toHaveTextContent('Core council');
        expect(header).toHaveTextContent('2 actions');
    });

    it('expands an execution to its detail in the context of its DAO', async () => {
        const dao = generateDao();
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
        });

        render(createTestComponent({ transaction, dao }));

        expect(
            screen.queryByTestId('execution-detail'),
        ).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /Executed/ }));

        expect(screen.getByTestId('execution-detail')).toBeInTheDocument();
        expect(transactionExecutionDetailsSpy).toHaveBeenCalledWith(
            { dao, transaction },
            undefined,
        );
    });

    it('renders an execution without a DAO as a block-explorer row, as its actions cannot be decoded', () => {
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
        });

        render(createTestComponent({ transaction }));

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });
});
