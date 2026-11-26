import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import { TokenProposalActionType } from '@/plugins/tokenPlugin/types';
import * as daoService from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { DialogProvider } from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { ProposalActionType } from '../../../api/governanceService';
import { smartContractService } from '../../../api/smartContractService';
import { GovernanceDialogId } from '../../../constants/governanceDialogId';
import type { IWalletConnectActionDialogParams } from '../../../dialogs/walletConnectActionDialog';
import { generateProposalAction } from '../../../testUtils';
import { ImportedContractAbisProvider } from '../../importedContractAbisProvider';
import type { IActionComposerProps } from './actionComposer';
import { ActionComposer } from './actionComposer';

describe('ActionComposer', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IActionComposerProps>) => {
        const completeProps: IActionComposerProps = {
            daoId: 'dao-1',
            onAddAction: jest.fn(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <DialogProvider>
                    <ImportedContractAbisProvider>
                        <ActionComposer {...completeProps} />
                    </ImportedContractAbisProvider>
                </DialogProvider>
            </GukModulesProvider>
        );
    };

    it('renders WalletConnect button by default', () => {
        render(createTestComponent());
        expect(
            screen.getByRole('button', { name: /walletConnect/i }),
        ).toBeInTheDocument();
    });

    it('does not render WalletConnect button when hideWalletConnect is true', () => {
        render(createTestComponent({ hideWalletConnect: true }));
        expect(
            screen.queryByRole('button', { name: /walletConnect/i }),
        ).not.toBeInTheDocument();
    });

    describe('actions added through WalletConnect', () => {
        const receiver = '0x2222222222222222222222222222222222222222';
        const token = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
        const rawAmount = '2500000';

        // An ERC-20 transfer as the backend decodes a dApp request: typed as a transfer, with the raw amount.
        const decodedTransfer = generateProposalAction({
            type: ProposalActionType.TRANSFER,
            from: '0x0000000000000000000000000000000000000001',
            to: token,
            value: '0',
            data: '0xa9059cbb',
            inputData: {
                function: 'transfer',
                contract: 'USDC',
                parameters: [
                    { name: '_to', type: 'address', value: receiver },
                    { name: '_value', type: 'uint256', value: rawAmount },
                ],
            },
        });

        const addThroughWalletConnect = async (
            props: Partial<IActionComposerProps>,
        ) => {
            const openMock = jest.fn();
            useDialogContextSpy.mockReturnValue(
                generateDialogContext({ open: openMock }),
            );
            const onAddAction = jest.fn();
            render(createTestComponent({ ...props, onAddAction }));

            await userEvent.click(
                screen.getByRole('button', { name: /walletConnect/i }),
            );
            const { params } = openMock.mock.calls[0][1] as {
                params: IWalletConnectActionDialogParams;
            };
            act(() => params.onAddActionsClick([decodedTransfer]));

            return onAddAction;
        };

        it('shapes a transfer for the transfer view outside DAO context, sent from the account', async () => {
            useDaoSpy.mockReturnValue(
                generateReactQueryResultLoading() as ReturnType<
                    typeof daoService.useDao
                >,
            );
            const accountAddress = '0x0000000000000000000000000000000000000003';

            const onAddAction = await addThroughWalletConnect({
                daoId: undefined,
                network: daoService.Network.ETHEREUM_SEPOLIA,
                accountAddress,
            });

            expect(onAddAction).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: ProposalActionType.TRANSFER,
                    from: accountAddress,
                    receiver: { address: receiver },
                    rawAmount,
                    data: decodedTransfer.data,
                    daoId: undefined,
                }),
            ]);
        });

        it('shapes a transfer for the transfer view in DAO context, its raw amount kept to format once decimals are known', async () => {
            const onAddAction = await addThroughWalletConnect({
                daoId: 'dao-1',
            });

            expect(onAddAction).toHaveBeenCalledWith([
                expect.objectContaining({
                    type: ProposalActionType.TRANSFER,
                    receiver: { address: receiver },
                    rawAmount,
                    data: decodedTransfer.data,
                    daoId: 'dao-1',
                }),
            ]);
        });
    });

    describe('DAO mint actions', () => {
        const tokenAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
        const receiver = '0x2222222222222222222222222222222222222222';
        const tokenPlugin = generateDaoPlugin({
            interfaceType: daoService.PluginInterfaceType.TOKEN_VOTING,
            settings: generateTokenPluginSettings({
                token: {
                    ...generateTokenPluginSettings().token,
                    address: tokenAddress,
                    decimals: 6,
                },
            }),
        });

        // A mint of the DAO's governance token as the backend decodes it, with the raw amount.
        const decodedMint = generateProposalAction({
            type: TokenProposalActionType.MINT,
            to: tokenAddress,
            value: '0',
            data: '0x40c10f19',
            inputData: {
                function: 'mint',
                contract: 'GovernanceERC20',
                parameters: [
                    { name: 'to', type: 'address', value: receiver },
                    { name: 'amount', type: 'uint256', value: '2500000' },
                ],
            },
        });

        // The mint view reads the token from the plugin set as `meta` as soon as it renders.
        const expectedMint = expect.objectContaining({
            type: TokenProposalActionType.MINT,
            receiver: { address: receiver },
            amount: '2.5',
            daoId: 'dao-1',
            meta: tokenPlugin,
        });

        beforeEach(() => {
            useDaoSpy.mockReturnValue(
                generateReactQueryResultSuccess({
                    data: generateDao({ plugins: [tokenPlugin] }),
                }),
            );
        });

        it('keeps the token-voting plugin as meta of a mint added through WalletConnect', async () => {
            const openMock = jest.fn();
            useDialogContextSpy.mockReturnValue(
                generateDialogContext({ open: openMock }),
            );
            const onAddAction = jest.fn();
            render(createTestComponent({ onAddAction }));

            await userEvent.click(
                screen.getByRole('button', { name: /walletConnect/i }),
            );
            const { params } = openMock.mock.calls[0][1] as {
                params: IWalletConnectActionDialogParams;
            };
            act(() => params.onAddActionsClick([decodedMint]));

            expect(onAddAction).toHaveBeenCalledWith([expectedMint]);
        });

        it('keeps the token-voting plugin as meta of a mint imported from a file', async () => {
            const decodeSpy = jest
                .spyOn(smartContractService, 'decodeTransactionsLight')
                .mockResolvedValue([decodedMint]);
            const onAddAction = jest.fn();
            const { container } = render(createTestComponent({ onAddAction }));

            const exported = [
                { to: tokenAddress, value: '0', data: decodedMint.data },
            ];
            const file = new File([JSON.stringify(exported)], 'actions.json', {
                type: 'application/json',
            });
            const input =
                container.querySelector<HTMLInputElement>(
                    'input[type="file"]',
                )!;
            await userEvent.upload(input, file);

            await waitFor(() =>
                expect(onAddAction).toHaveBeenCalledWith([expectedMint]),
            );
            decodeSpy.mockRestore();
        });
    });

    it('offers WalletConnect outside DAO context, connected as the given account on the given network', async () => {
        const openMock = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openMock }),
        );
        useDaoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof daoService.useDao
            >,
        );
        const accountAddress = '0x0000000000000000000000000000000000000001';
        const network = daoService.Network.ETHEREUM_SEPOLIA;
        render(
            createTestComponent({
                daoId: undefined,
                network,
                accountAddress,
            }),
        );

        await userEvent.click(
            screen.getByRole('button', { name: /walletConnect/i }),
        );

        expect(openMock).toHaveBeenCalledWith(
            GovernanceDialogId.WALLET_CONNECT_ACTION,
            {
                params: expect.objectContaining({
                    address: accountAddress,
                    network,
                }),
                stack: true,
            },
        );
    });

    it('does not offer WalletConnect outside DAO context without an account to connect as', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof daoService.useDao
            >,
        );
        render(
            createTestComponent({
                daoId: undefined,
                network: daoService.Network.ETHEREUM_SEPOLIA,
            }),
        );

        expect(
            screen.queryByRole('button', { name: /walletConnect/i }),
        ).not.toBeInTheDocument();
    });

    it('does not render the authorized-actions switch when no allowlist restricts the actions', () => {
        render(createTestComponent());

        expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('turns the authorized-actions switch on when an allowlist is given', () => {
        render(createTestComponent({ allowedActions: [] }));

        expect(screen.getByRole('switch')).toBeChecked();
    });

    // The switch also gates the import and WalletConnect buttons, so defaulting it on where the
    // caller cannot afford that takes both away.
    it('honours an overridden initial switch state and keeps the import buttons reachable', () => {
        render(
            createTestComponent({
                allowedActions: [],
                initialOnlyShowAuthorizedActions: false,
            }),
        );

        expect(screen.getByRole('switch')).not.toBeChecked();
        expect(
            screen.getByRole('button', {
                name: 'app.governance.createProposalForm.actionsImportExport.importButton',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /walletConnect/i }),
        ).toBeInTheDocument();
    });

    it('hides the import and WalletConnect buttons while the switch is on', () => {
        render(createTestComponent({ allowedActions: [] }));

        expect(
            screen.queryByRole('button', {
                name: 'app.governance.createProposalForm.actionsImportExport.importButton',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /walletConnect/i }),
        ).not.toBeInTheDocument();
    });

    it('allows spaces while typing in the action search input', async () => {
        const user = userEvent.setup();
        render(createTestComponent());

        await user.click(
            screen.getByRole('button', {
                name: 'app.governance.actionComposer.addAction.default',
            }),
        );

        const input = screen.getByRole('combobox');
        await user.type(input, 'Set metadata');

        expect(input).toHaveValue('Set metadata');
    });
});
