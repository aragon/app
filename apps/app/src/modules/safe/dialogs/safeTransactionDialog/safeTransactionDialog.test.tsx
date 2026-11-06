import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type Hex, UserRejectedRequestError } from 'viem';
import * as WagmiActions from 'wagmi/actions';
import * as connectedWalletGuardApi from '@/modules/application/hooks/useConnectedWalletGuard';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import {
    generateSafeConfirmation,
    generateSafeMultisigTransaction,
} from '@/plugins/safeMultisigPlugin/testUtils';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    type ISafeMultisigTransaction,
    SafeServiceError,
    SafeServiceErrorCode,
} from '@/shared/api/safeService';
import { DialogProvider } from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import * as networkSwitchApi from '@/shared/hooks/useNetworkSwitch';
import { generateSafeInfoResponse } from '@/shared/testUtils/generators/safeResponse';
import * as safeExecutionApi from '../../hooks/useSafeTransactionExecution';
import {
    SafeExecutionPendingError,
    SafeExecutionResult,
} from '../../hooks/useSafeTransactionExecution';
import { safeTransactionLookupUtils } from '../../utils/safeTransactionLookupUtils';
import { SafeTransactionDialog } from './safeTransactionDialog';
import type { ISafeTransactionDialogParams } from './safeTransactionDialog.api';

// Named ESM exports of these modules cannot be spied on, so they are the only module mocks of this suite.
jest.mock('wagmi/actions', () => ({
    ...jest.requireActual('wagmi/actions'),
    getConnection: jest.fn(),
}));

jest.mock('@safe-global/protocol-kit', () => ({
    __esModule: true,
    default: { init: jest.fn() },
    EthSafeTransaction: jest.fn(),
    EthSafeSignature: jest.fn(),
}));

// The review content verifies the payload on its own; the dialog only consumes its verdict.
jest.mock('../../components/safeTransactionReviewContent', () => ({
    SafeTransactionReviewContent: ({
        onGateChange,
    }: {
        onGateChange: (isBlocked: boolean) => void;
    }) => (
        <button onClick={() => onGateChange(false)} type="button">
            confirm-review
        </button>
    ),
}));

describe('<SafeTransactionDialog /> component', () => {
    const owner = '0x0000000000000000000000000000000000000011';
    const otherOwner = '0x0000000000000000000000000000000000000012';
    const safeAddress = '0x0000000000000000000000000000000000000001';
    const network = Network.ETHEREUM_SEPOLIA;
    const chainId = networkDefinitions[network].id;
    const safeTxHash = `0x${'1'.repeat(64)}`;
    const signature = `0x${'3'.repeat(130)}`;
    const executionHash = `0x${'4'.repeat(64)}` as Hex;

    const translationKey = 'app.safe.safeTransactionDialog';

    const protocolKitModule = jest.requireMock('@safe-global/protocol-kit') as {
        default: { init: jest.Mock };
        EthSafeTransaction: jest.Mock;
        EthSafeSignature: jest.Mock;
    };

    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );
    const useConnectedWalletGuardSpy = jest.spyOn(
        connectedWalletGuardApi,
        'useConnectedWalletGuard',
    );
    const useNetworkSwitchSpy = jest.spyOn(
        networkSwitchApi,
        'useNetworkSwitch',
    );
    const useTranslationsSpy = jest.spyOn(
        translationsProvider,
        'useTranslations',
    );
    const useSafeTransactionExecutionSpy = jest.spyOn(
        safeExecutionApi,
        'useSafeTransactionExecution',
    );
    const getSafeInfoSpy = jest.spyOn(
        safeServiceApi.safeService,
        'getSafeInfo',
    );
    const confirmSafeTransactionSpy = jest.spyOn(
        safeServiceApi.safeTransactionService,
        'confirmSafeTransaction',
    );
    const findTransactionSpy = jest.spyOn(
        safeTransactionLookupUtils,
        'findTransaction',
    );
    const getConnectionMock = jest.mocked(WagmiActions.getConnection);

    let protocolKit: {
        getOwners: jest.Mock;
        getThreshold: jest.Mock;
        getNonce: jest.Mock;
        getTransactionHash: jest.Mock;
        signTypedData: jest.Mock;
    };
    let executeSafeTransaction: jest.Mock;

    const generateTransaction = (
        transaction?: Partial<ISafeMultisigTransaction>,
    ) =>
        generateSafeMultisigTransaction({
            safeTxHash,
            nonce: '0',
            ...transaction,
        });

    const mockSafe = (params: {
        transaction?: ISafeMultisigTransaction;
        threshold?: number;
    }) => {
        const { transaction = generateTransaction(), threshold = 2 } = params;

        getSafeInfoSpy.mockResolvedValue(
            generateSafeInfoResponse({
                address: safeAddress,
                owners: [owner, otherOwner],
                threshold,
                nonce: '0',
                version: '1.4.1',
            }),
        );
        findTransactionSpy.mockResolvedValue(transaction);
        protocolKit.getThreshold.mockResolvedValue(threshold);
    };

    beforeEach(() => {
        protocolKit = {
            getOwners: jest.fn().mockResolvedValue([owner, otherOwner]),
            getThreshold: jest.fn().mockResolvedValue(2),
            getNonce: jest.fn().mockResolvedValue(0),
            getTransactionHash: jest.fn().mockResolvedValue(safeTxHash),
            signTypedData: jest.fn().mockResolvedValue({ data: signature }),
        };
        executeSafeTransaction = jest.fn().mockResolvedValue({
            result: SafeExecutionResult.EXECUTED,
            hash: executionHash,
        });
        protocolKitModule.default.init.mockResolvedValue(protocolKit);
        protocolKitModule.EthSafeTransaction.mockImplementation(
            (data: unknown) => data,
        );
        protocolKitModule.EthSafeSignature.mockImplementation(
            (signer: string, data: string) => ({ signer, data }),
        );
        getConnectionMock.mockReturnValue({
            address: owner,
            chainId,
            status: 'connected',
            connector: {
                getProvider: jest
                    .fn()
                    .mockResolvedValue({ request: jest.fn() }),
            },
        } as never);
        useWalletAccountSpy.mockReturnValue({
            address: owner,
            chainId,
            isConnecting: false,
            isReconnecting: false,
        });
        useConnectedWalletGuardSpy.mockReturnValue({
            result: true,
            check: jest.fn(),
        });
        useNetworkSwitchSpy.mockReturnValue({
            requiredChainId: chainId,
            isCrossNetworkTransaction: false,
            networkName: 'Sepolia',
            switchChainStatus: 'idle',
            withNetworkSwitch: (callback) => callback(),
        } as ReturnType<typeof networkSwitchApi.useNetworkSwitch>);
        useTranslationsSpy.mockReturnValue({
            t: (key: string) => key,
        } as ReturnType<typeof translationsProvider.useTranslations>);
        useSafeTransactionExecutionSpy.mockReturnValue({
            execute: executeSafeTransaction,
            resume: jest.fn(),
        } as never);
        confirmSafeTransactionSpy.mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
        getSafeInfoSpy.mockReset();
        findTransactionSpy.mockReset();
        confirmSafeTransactionSpy.mockReset();
        localStorage.clear();
    });

    const createTestComponent = (
        params?: Partial<ISafeTransactionDialogParams>,
    ) => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const completeParams: ISafeTransactionDialogParams = {
            network,
            safeAddress,
            safeTxHash,
            ...params,
        };

        return (
            <GukModulesProvider>
                <QueryClientProvider client={queryClient}>
                    <DialogProvider>
                        <Dialog.Root open={true}>
                            <SafeTransactionDialog
                                location={{
                                    id: 'safe-transaction',
                                    params: completeParams,
                                }}
                            />
                        </Dialog.Root>
                    </DialogProvider>
                </QueryClientProvider>
            </GukModulesProvider>
        );
    };

    const confirmReview = async (action: string) => {
        await userEvent.click(
            await screen.findByRole('button', { name: 'confirm-review' }),
        );
        const button = screen.getByRole('button', {
            name: `${translationKey}.actions.${action}`,
        });
        await waitFor(() => expect(button).toBeEnabled());

        return button;
    };

    it('keeps the action disabled until the review content clears the payload', async () => {
        mockSafe({});
        render(createTestComponent());

        await screen.findByRole('button', { name: 'confirm-review' });
        expect(
            screen.getByRole('button', {
                name: `${translationKey}.actions.confirm`,
            }),
        ).toBeDisabled();
    });

    it('signs the reviewed transaction and submits the confirmation to the Safe transaction service', async () => {
        const onSafeStateChange = jest.fn();
        mockSafe({});
        render(createTestComponent({ onSafeStateChange }));

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText(`${translationKey}.confirmed`),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).toHaveBeenCalled();
        expect(confirmSafeTransactionSpy).toHaveBeenCalledWith({
            urlParams: { network, safeTxHash },
            body: { signature },
        });
        expect(onSafeStateChange).toHaveBeenCalled();
    });

    it('does not sign when the connected wallet is not a current owner', async () => {
        mockSafe({});
        protocolKit.getOwners.mockResolvedValue([otherOwner]);
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText(`${translationKey}.notOwner`),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });

    it('does not sign fields that do not hash to the reviewed transaction', async () => {
        mockSafe({});
        protocolKit.getTransactionHash.mockResolvedValue(`0x${'2'.repeat(64)}`);
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText(`${translationKey}.hashMismatch`),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });

    it('treats a confirmation found on the Safe after an inconclusive answer as accepted', async () => {
        mockSafe({});
        confirmSafeTransactionSpy.mockRejectedValue(
            new SafeServiceError(
                SafeServiceErrorCode.UPSTREAM_ERROR,
                'Upstream error',
                502,
            ),
        );
        render(createTestComponent());

        const button = await confirmReview('confirm');
        findTransactionSpy.mockResolvedValue(
            generateTransaction({
                confirmations: [generateSafeConfirmation({ owner, signature })],
            }),
        );
        await userEvent.click(button);

        expect(
            await screen.findByText(`${translationKey}.confirmed`),
        ).toBeInTheDocument();
    });

    it('executes a transaction approved by enough owners on the current nonce', async () => {
        const confirmations = [
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner: otherOwner, signature }),
        ];
        mockSafe({ transaction: generateTransaction({ confirmations }) });
        render(createTestComponent());

        await userEvent.click(await confirmReview('execute'));

        expect(
            await screen.findByText(`${translationKey}.executed`),
        ).toBeInTheDocument();
        expect(executeSafeTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                safeTxHash,
                safeAddress,
                chainId,
                signatures: [
                    { signer: owner, data: signature },
                    { signer: otherOwner, data: signature },
                ],
            }),
        );
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });

    it('does not execute when the Safe no longer considers the transaction ready', async () => {
        const confirmations = [
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner: otherOwner, signature }),
        ];
        mockSafe({ transaction: generateTransaction({ confirmations }) });
        render(createTestComponent());

        const button = await confirmReview('execute');
        protocolKit.getThreshold.mockResolvedValue(3);
        protocolKit.getOwners.mockResolvedValue([
            owner,
            otherOwner,
            '0x0000000000000000000000000000000000000013',
        ]);
        await userEvent.click(button);

        expect(
            await screen.findByText(`${translationKey}.executionUnavailable`),
        ).toBeInTheDocument();
        expect(executeSafeTransaction).not.toHaveBeenCalled();
    });

    it('asks for a wallet instead of signing while disconnected', async () => {
        const checkWalletConnection = jest.fn();
        useConnectedWalletGuardSpy.mockReturnValue({
            result: false,
            check: checkWalletConnection,
        });
        mockSafe({});
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        expect(checkWalletConnection).toHaveBeenCalledTimes(1);
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(confirmSafeTransactionSpy).not.toHaveBeenCalled();
    });

    it('returns to the approval after a signature rejected in the wallet, so it can be retried', async () => {
        mockSafe({});
        protocolKit.signTypedData.mockRejectedValueOnce(
            new UserRejectedRequestError(new Error('User rejected.')),
        );
        render(createTestComponent());

        const confirmButton = await confirmReview('confirm');
        await userEvent.click(confirmButton);

        expect(
            await screen.findByText(`${translationKey}.signatureRejected`),
        ).toBeInTheDocument();
        expect(confirmSafeTransactionSpy).not.toHaveBeenCalled();

        await userEvent.click(
            screen.getByRole('button', {
                name: `${translationKey}.actions.confirm`,
            }),
        );

        expect(
            await screen.findByText(`${translationKey}.confirmed`),
        ).toBeInTheDocument();
        expect(confirmSafeTransactionSpy).toHaveBeenCalledTimes(1);
    });

    it('ends in an error when signing fails for another reason than a rejection', async () => {
        mockSafe({});
        protocolKit.signTypedData.mockRejectedValue(
            new Error('Provider disconnected.'),
        );
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText('Provider disconnected.'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: `${translationKey}.actions.close`,
            }),
        ).toBeEnabled();
    });

    it('returns to the execution after it was rejected in the wallet', async () => {
        const confirmations = [
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner: otherOwner, signature }),
        ];
        executeSafeTransaction.mockRejectedValue(
            new UserRejectedRequestError(new Error('User rejected.')),
        );
        mockSafe({ transaction: generateTransaction({ confirmations }) });
        render(createTestComponent());

        await userEvent.click(await confirmReview('execute'));

        expect(
            await screen.findByText(`${translationKey}.executionRejected`),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: `${translationKey}.actions.execute`,
            }),
        ).toBeEnabled();
    });

    it('does not submit a signature made after the wallet switched account', async () => {
        mockSafe({});
        protocolKit.signTypedData.mockImplementation(() => {
            getConnectionMock.mockReturnValue({
                address: otherOwner,
                chainId,
                status: 'connected',
                connector: { getProvider: jest.fn() },
            } as never);

            return Promise.resolve({ data: signature });
        });
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText(`${translationKey}.walletRequired`),
        ).toBeInTheDocument();
        expect(confirmSafeTransactionSpy).not.toHaveBeenCalled();
    });

    it('does not sign when the Safe reports an invalid threshold', async () => {
        mockSafe({});
        protocolKit.getThreshold.mockResolvedValue(3);
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText(`${translationKey}.invalidThreshold`),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });

    it('completes without signing again when the owner already approved', async () => {
        const onSafeStateChange = jest.fn();
        mockSafe({
            transaction: generateTransaction({
                confirmations: [generateSafeConfirmation({ owner, signature })],
            }),
        });
        render(createTestComponent({ onSafeStateChange }));

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText(`${translationKey}.confirmed`),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(confirmSafeTransactionSpy).not.toHaveBeenCalled();
        expect(onSafeStateChange).toHaveBeenCalled();
    });

    it('asks the owner to sign when their recorded approval carries a malformed signature', async () => {
        mockSafe({
            transaction: generateTransaction({
                confirmations: [
                    generateSafeConfirmation({ owner, signature: '0x1234' }),
                ],
            }),
        });
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText(`${translationKey}.confirmed`),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).toHaveBeenCalled();
        expect(confirmSafeTransactionSpy).toHaveBeenCalled();
    });

    it('re-checks an inconclusive confirmation without signing or submitting it again', async () => {
        mockSafe({});
        confirmSafeTransactionSpy.mockRejectedValue(
            new Error('request timeout'),
        );
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        const recheckButton = await screen.findByRole('button', {
            name: `${translationKey}.actions.recheck`,
        });
        expect(
            screen.getByText(`${translationKey}.uncertain`),
        ).toBeInTheDocument();

        findTransactionSpy.mockResolvedValue(
            generateTransaction({
                confirmations: [generateSafeConfirmation({ owner, signature })],
            }),
        );
        await userEvent.click(recheckButton);

        expect(
            await screen.findByText(`${translationKey}.confirmed`),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).toHaveBeenCalledTimes(1);
        expect(confirmSafeTransactionSpy).toHaveBeenCalledTimes(1);
    });

    it('follows a broadcast execution with an unknown outcome instead of sending it again', async () => {
        const confirmations = [
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner: otherOwner, signature }),
        ];
        const resumeSafeTransaction = jest.fn().mockResolvedValue({
            result: SafeExecutionResult.EXECUTED,
            hash: executionHash,
        });
        executeSafeTransaction.mockRejectedValue(
            new SafeExecutionPendingError(executionHash),
        );
        useSafeTransactionExecutionSpy.mockReturnValue({
            execute: executeSafeTransaction,
            resume: resumeSafeTransaction,
        } as never);
        mockSafe({ transaction: generateTransaction({ confirmations }) });
        render(createTestComponent());

        await userEvent.click(await confirmReview('execute'));
        await userEvent.click(
            await screen.findByRole('button', {
                name: `${translationKey}.actions.recheck`,
            }),
        );

        expect(
            await screen.findByText(`${translationKey}.executed`),
        ).toBeInTheDocument();
        expect(resumeSafeTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                hash: executionHash,
                safeTxHash,
                safeAddress,
                chainId,
            }),
        );
        expect(executeSafeTransaction).toHaveBeenCalledTimes(1);
    });

    it('hands the execution only one signature per current owner', async () => {
        const confirmations = [
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner: otherOwner, signature }),
        ];
        mockSafe({ transaction: generateTransaction({ confirmations }) });
        render(createTestComponent());

        await userEvent.click(await confirmReview('execute'));

        expect(
            await screen.findByText(`${translationKey}.executed`),
        ).toBeInTheDocument();
        expect(executeSafeTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                signatures: [
                    { signer: owner, data: signature },
                    { signer: otherOwner, data: signature },
                ],
            }),
        );
    });

    it('refuses to send the execution once the wallet switched to another account', async () => {
        const confirmations = [
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner: otherOwner, signature }),
        ];
        executeSafeTransaction.mockImplementation(
            (params: { beforeSubmit: () => void }) => {
                getConnectionMock.mockReturnValue({
                    address: otherOwner,
                    chainId,
                    status: 'connected',
                    connector: { getProvider: jest.fn() },
                } as never);
                params.beforeSubmit();

                return Promise.resolve({
                    result: SafeExecutionResult.EXECUTED,
                    hash: executionHash,
                });
            },
        );
        mockSafe({ transaction: generateTransaction({ confirmations }) });
        render(createTestComponent());

        await userEvent.click(await confirmReview('execute'));

        expect(
            await screen.findByText(`${translationKey}.walletRequired`),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(`${translationKey}.executed`),
        ).not.toBeInTheDocument();
    });

    it('stays dismissable when a re-check finds no execution to follow and no wallet', async () => {
        const confirmations = [
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner: otherOwner, signature }),
        ];
        // A broadcast whose hash is unusable leaves no record of the execution to follow.
        executeSafeTransaction.mockRejectedValue(
            new SafeExecutionPendingError('0x' as Hex),
        );
        mockSafe({ transaction: generateTransaction({ confirmations }) });
        const { rerender } = render(createTestComponent());

        await userEvent.click(await confirmReview('execute'));
        const recheckButton = await screen.findByRole('button', {
            name: `${translationKey}.actions.recheck`,
        });

        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId,
            isConnecting: false,
            isReconnecting: false,
        });
        rerender(createTestComponent());
        await userEvent.click(recheckButton);

        expect(
            screen.queryByText(`${translationKey}.executing`),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: `${translationKey}.actions.recheck`,
            }),
        ).toBeEnabled();
    });

    it('re-checks an execution sent before the dialog opened without asking for a wallet or a network', async () => {
        const confirmations = [
            generateSafeConfirmation({ owner, signature }),
            generateSafeConfirmation({ owner: otherOwner, signature }),
        ];
        const resumeSafeTransaction = jest.fn().mockResolvedValue({
            result: SafeExecutionResult.EXECUTED,
            hash: executionHash,
        });
        executeSafeTransaction.mockRejectedValue(
            new SafeExecutionPendingError(executionHash),
        );
        useSafeTransactionExecutionSpy.mockReturnValue({
            execute: executeSafeTransaction,
            resume: resumeSafeTransaction,
        } as never);
        mockSafe({ transaction: generateTransaction({ confirmations }) });

        // The execution is sent, then the dialog is closed while its outcome is still unknown, as on a reload.
        const { unmount } = render(createTestComponent());
        await userEvent.click(await confirmReview('execute'));
        await screen.findByRole('button', {
            name: `${translationKey}.actions.recheck`,
        });
        unmount();

        const checkWalletConnection = jest.fn();
        const withNetworkSwitch = jest.fn();
        useConnectedWalletGuardSpy.mockReturnValue({
            result: false,
            check: checkWalletConnection,
        });
        useNetworkSwitchSpy.mockReturnValue({
            requiredChainId: chainId,
            withNetworkSwitch,
        } as unknown as ReturnType<typeof networkSwitchApi.useNetworkSwitch>);
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isConnecting: false,
            isReconnecting: false,
        });
        render(createTestComponent());

        await userEvent.click(await confirmReview('recheck'));

        expect(
            await screen.findByText(`${translationKey}.executed`),
        ).toBeInTheDocument();
        expect(resumeSafeTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ hash: executionHash }),
        );
        expect(checkWalletConnection).not.toHaveBeenCalled();
        expect(withNetworkSwitch).not.toHaveBeenCalled();
        expect(executeSafeTransaction).toHaveBeenCalledTimes(1);
    });

    it('reports a rejected network switch and keeps the action available', async () => {
        useNetworkSwitchSpy.mockReturnValue({
            requiredChainId: chainId,
            withNetworkSwitch: (
                _onSend: () => void,
                onError?: (error: unknown) => void,
            ) =>
                onError?.(
                    new UserRejectedRequestError(new Error('User rejected.')),
                ),
        } as unknown as ReturnType<typeof networkSwitchApi.useNetworkSwitch>);
        mockSafe({});
        render(createTestComponent());

        await userEvent.click(await confirmReview('confirm'));

        expect(
            await screen.findByText(`${translationKey}.networkSwitchRejected`),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: `${translationKey}.actions.confirm`,
            }),
        ).toBeEnabled();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });

    it('renders an error when the transaction is no longer available', async () => {
        getSafeInfoSpy.mockResolvedValue(generateSafeInfoResponse());
        findTransactionSpy.mockResolvedValue(undefined);
        render(createTestComponent());

        expect(
            await screen.findByText(`${translationKey}.transactionUnavailable`),
        ).toBeInTheDocument();
    });
});
