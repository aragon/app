import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UserRejectedRequestError } from 'viem';
import * as connectedWalletGuardApi from '@/modules/application/hooks/useConnectedWalletGuard';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { generateProposalAction } from '@/modules/governance/testUtils';
import {
    generateSafeConfirmation,
    generateSafeMultisigTransaction,
} from '@/plugins/safeMultisigPlugin/testUtils';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    SafeServiceError,
    SafeServiceErrorCode,
} from '@/shared/api/safeService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { DialogProvider } from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import * as networkSwitchApi from '@/shared/hooks/useNetworkSwitch';
import {
    generateSafeInfoResponse,
    generateSafeNextNonceResponse,
} from '@/shared/testUtils/generators/safeResponse';
import { SafeDialogId } from '../../constants/safeDialogId';
import {
    type SafeProtocolKit,
    SafeProtocolKitError,
    safeProtocolKitUtils,
} from '../../utils/safeProtocolKitUtils';
import { safeTransactionLookupUtils } from '../../utils/safeTransactionLookupUtils';
import { SafeCreateTransactionDialog } from './safeCreateTransactionDialog';
import type { ISafeCreateTransactionDialogParams } from './safeCreateTransactionDialog.api';

// Named ESM exports of the protocol kit cannot be spied on, so it is the only module mock of this suite.
jest.mock('@safe-global/protocol-kit', () => ({
    __esModule: true,
    default: { init: jest.fn() },
    EthSafeTransaction: jest.fn(),
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

describe('<SafeCreateTransactionDialog /> component', () => {
    const owner = '0x0000000000000000000000000000000000000011';
    const otherOwner = '0x0000000000000000000000000000000000000012';
    const safeAddress = '0x0000000000000000000000000000000000000001';
    const network = Network.ETHEREUM_SEPOLIA;
    const chainId = networkDefinitions[network].id;
    const safeTxHash = `0x${'1'.repeat(64)}`;
    const signature = `0x${'3'.repeat(130)}`;
    const multiSendCallOnly = '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B';

    const signingTranslationKey = 'app.safe.safeOwnerSigning';
    const translationKey = 'app.safe.safeCreateTransactionDialog';

    // Composed outside a DAO, the actions carry no metadata of their own.
    const actions: IProposalActionData[] = [
        {
            ...generateProposalAction({
                to: '0x0000000000000000000000000000000000000a01',
                value: '0',
                data: '0x1234',
            }),
            meta: undefined,
        },
        {
            ...generateProposalAction({
                to: '0x0000000000000000000000000000000000000a02',
                value: '7',
                data: '0x',
            }),
            meta: undefined,
        },
    ];

    const protocolKitModule = jest.requireMock('@safe-global/protocol-kit') as {
        EthSafeTransaction: jest.Mock;
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
    const getSafeInfoSpy = jest.spyOn(
        safeServiceApi.safeService,
        'getSafeInfo',
    );
    const getSafeNextNonceSpy = jest.spyOn(
        safeServiceApi.safeService,
        'getSafeNextNonce',
    );
    const proposeSafeTransactionSpy = jest.spyOn(
        safeServiceApi.safeTransactionService,
        'proposeSafeTransaction',
    );
    const findTransactionSpy = jest.spyOn(
        safeTransactionLookupUtils,
        'findTransaction',
    );
    const initReadOnlySpy = jest.spyOn(safeProtocolKitUtils, 'initReadOnly');
    const initForOwnerSpy = jest.spyOn(safeProtocolKitUtils, 'initForOwner');
    const getOwnerConnectionSpy = jest.spyOn(
        safeProtocolKitUtils,
        'getOwnerConnection',
    );

    // The batch the protocol kit builds for several actions: one delegate call to MultiSendCallOnly.
    const batchData = {
        to: multiSendCallOnly,
        value: '0',
        data: '0x8d80ff0a',
        operation: 1,
        safeTxGas: '0',
        baseGas: '0',
        gasPrice: '0',
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: 5,
    };

    let readOnlyKit: {
        createTransaction: jest.Mock;
        getTransactionHash: jest.Mock;
    };
    let ownerKit: {
        getOwners: jest.Mock;
        getThreshold: jest.Mock;
        getNonce: jest.Mock;
        getTransactionHash: jest.Mock;
        signTypedData: jest.Mock;
    };

    const mockSafe = (params?: { threshold?: number; nextNonce?: string }) => {
        const { threshold = 2, nextNonce = '5' } = params ?? {};

        getSafeInfoSpy.mockResolvedValue(
            generateSafeInfoResponse({
                address: safeAddress,
                owners: [owner, otherOwner],
                threshold,
                nonce: '3',
                version: '1.4.1',
            }),
        );
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({ nextNonce, currentNonce: '3' }),
        );
        ownerKit.getThreshold.mockResolvedValue(threshold);
    };

    beforeEach(() => {
        readOnlyKit = {
            createTransaction: jest.fn().mockResolvedValue({ data: batchData }),
            getTransactionHash: jest.fn().mockResolvedValue(safeTxHash),
        };
        ownerKit = {
            getOwners: jest.fn().mockResolvedValue([owner, otherOwner]),
            getThreshold: jest.fn().mockResolvedValue(2),
            getNonce: jest.fn().mockResolvedValue(3),
            getTransactionHash: jest.fn().mockResolvedValue(safeTxHash),
            signTypedData: jest.fn().mockResolvedValue({ data: signature }),
        };
        initReadOnlySpy.mockResolvedValue(
            readOnlyKit as unknown as SafeProtocolKit,
        );
        initForOwnerSpy.mockResolvedValue(
            ownerKit as unknown as SafeProtocolKit,
        );
        getOwnerConnectionSpy.mockReturnValue({} as never);
        protocolKitModule.EthSafeTransaction.mockImplementation(
            (data: unknown) => ({ data }),
        );
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
            withNetworkSwitch: (callback: () => void) => callback(),
        } as unknown as ReturnType<typeof networkSwitchApi.useNetworkSwitch>);
        useTranslationsSpy.mockReturnValue({
            t: (key: string) => key,
        } as ReturnType<typeof translationsProvider.useTranslations>);
        proposeSafeTransactionSpy.mockResolvedValue({});
        mockSafe();
    });

    afterEach(() => {
        jest.clearAllMocks();
        getSafeInfoSpy.mockReset();
        getSafeNextNonceSpy.mockReset();
        proposeSafeTransactionSpy.mockReset();
        findTransactionSpy.mockReset();
        initReadOnlySpy.mockReset();
        initForOwnerSpy.mockReset();
        getOwnerConnectionSpy.mockReset();
    });

    const createTestComponent = (
        params?: Partial<ISafeCreateTransactionDialogParams>,
    ) => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const completeParams: ISafeCreateTransactionDialogParams = {
            network,
            safeAddress,
            actions,
            ...params,
        };

        return (
            <GukModulesProvider>
                <QueryClientProvider client={queryClient}>
                    <DialogProvider>
                        <Dialog.Root open={true}>
                            <SafeCreateTransactionDialog
                                location={{
                                    id: SafeDialogId.CREATE_TRANSACTION,
                                    params: completeParams,
                                }}
                            />
                        </Dialog.Root>
                    </DialogProvider>
                </QueryClientProvider>
            </GukModulesProvider>
        );
    };

    const getCreateButton = () =>
        screen.getByRole('button', {
            name: `${translationKey}.actions.create`,
        });

    const confirmReview = async () => {
        await userEvent.click(
            await screen.findByRole('button', { name: 'confirm-review' }),
        );
        const button = getCreateButton();
        await waitFor(() => expect(button).toBeEnabled());

        return button;
    };

    it('batches the actions into one transaction at the next free nonce, without a wallet', async () => {
        render(createTestComponent());

        await screen.findByRole('button', { name: 'confirm-review' });

        expect(initReadOnlySpy).toHaveBeenCalledWith({ chainId, safeAddress });
        expect(readOnlyKit.createTransaction).toHaveBeenCalledWith({
            transactions: [
                { to: actions[0].to, value: '0', data: '0x1234' },
                { to: actions[1].to, value: '7', data: '0x' },
            ],
            onlyCalls: true,
            options: { nonce: 5 },
        });
        expect(initForOwnerSpy).not.toHaveBeenCalled();
    });

    it('checksums the target of an action, which the service refuses in any other casing', async () => {
        const target = '0x9642F9b4480F6e134742922d8e0C7D3503F95b0e';
        render(
            createTestComponent({
                actions: [
                    {
                        ...generateProposalAction({
                            to: target.toLowerCase(),
                            data: '0x1234',
                        }),
                        meta: undefined,
                    },
                ],
            }),
        );

        await screen.findByRole('button', { name: 'confirm-review' });

        expect(readOnlyKit.createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                transactions: [{ to: target, value: '0', data: '0x1234' }],
            }),
        );
    });

    it('keeps the action disabled until the review content clears the payload', async () => {
        render(createTestComponent());

        await screen.findByRole('button', { name: 'confirm-review' });

        expect(getCreateButton()).toBeDisabled();
    });

    it('reports a transaction that could not be built', async () => {
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({ nextNonce: 'not-a-nonce' }),
        );
        render(createTestComponent());

        expect(
            await screen.findByText(`${translationKey}.invalidNonce`),
        ).toBeInTheDocument();
        expect(readOnlyKit.createTransaction).not.toHaveBeenCalled();
    });

    it('signs the reviewed transaction and proposes it as the connected owner', async () => {
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${translationKey}.created`),
        ).toBeInTheDocument();
        expect(ownerKit.signTypedData).toHaveBeenCalledWith({
            data: expect.objectContaining({
                to: multiSendCallOnly,
                operation: 1,
                nonce: 5,
            }),
        });
        expect(proposeSafeTransactionSpy).toHaveBeenCalledWith({
            urlParams: { network, address: safeAddress },
            body: {
                safeTransactionData: expect.objectContaining({
                    to: multiSendCallOnly,
                    nonce: 5,
                }),
                safeTxHash,
                senderAddress: owner,
                senderSignature: signature,
                origin: 'Aragon',
            },
        });
    });

    it('tells a single owner the transaction can be executed right away', async () => {
        mockSafe({ threshold: 1 });
        ownerKit.getOwners.mockResolvedValue([owner]);
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${translationKey}.createdReadyToExecute`),
        ).toBeInTheDocument();
    });

    it('hands over to the caller once the created transaction is left', async () => {
        const onCreated = jest.fn();
        const close = jest.fn();
        const useDialogContextSpy = jest
            .spyOn(dialogProvider, 'useDialogContext')
            .mockReturnValue({
                close,
                updateOptions: jest.fn(),
            } as unknown as ReturnType<typeof dialogProvider.useDialogContext>);
        render(createTestComponent({ onCreated }));

        await userEvent.click(await confirmReview());
        await userEvent.click(
            await screen.findByRole('button', {
                name: `${translationKey}.actions.done`,
            }),
        );

        expect(close).toHaveBeenCalledWith(SafeDialogId.CREATE_TRANSACTION);
        expect(onCreated).toHaveBeenCalledTimes(1);
        useDialogContextSpy.mockRestore();
    });

    it('never builds the transaction again once it is created', async () => {
        const { rerender } = render(createTestComponent());

        await userEvent.click(await confirmReview());
        await screen.findByText(`${translationKey}.created`);

        // Another Safe address changes every callback the build depends on, which would otherwise run it again.
        rerender(
            createTestComponent({
                safeAddress: '0x0000000000000000000000000000000000000002',
            }),
        );

        expect(
            await screen.findByText(`${translationKey}.created`),
        ).toBeInTheDocument();
        expect(readOnlyKit.createTransaction).toHaveBeenCalledTimes(1);
    });

    it('rebuilds the transaction on the next free nonce when the queue changed since the review, for a new review', async () => {
        render(createTestComponent());
        const button = await confirmReview();
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '6',
                currentNonce: '3',
            }),
        );
        readOnlyKit.getTransactionHash.mockResolvedValue(`0x${'2'.repeat(64)}`);

        await userEvent.click(button);

        expect(
            await screen.findByText(`${translationKey}.queueChanged`),
        ).toBeInTheDocument();
        expect(readOnlyKit.createTransaction).toHaveBeenLastCalledWith(
            expect.objectContaining({ options: { nonce: 6 } }),
        );
        expect(ownerKit.signTypedData).not.toHaveBeenCalled();
        expect(proposeSafeTransactionSpy).not.toHaveBeenCalled();
        // The new payload is reviewed again before it can be signed.
        expect(getCreateButton()).toBeDisabled();
        await confirmReview();
    });

    it('floors the rebuilt nonce at the chain when the service lags behind it', async () => {
        render(createTestComponent());
        const button = await confirmReview();
        // The service still answers the reviewed nonce while the chain already used it.
        ownerKit.getNonce.mockResolvedValue(7);

        await userEvent.click(button);

        expect(
            await screen.findByText(`${translationKey}.queueChanged`),
        ).toBeInTheDocument();
        expect(readOnlyKit.createTransaction).toHaveBeenLastCalledWith(
            expect.objectContaining({ options: { nonce: 7 } }),
        );
        expect(ownerKit.signTypedData).not.toHaveBeenCalled();
    });

    it('keeps the action available when a rebuild yields the reviewed transaction again', async () => {
        render(createTestComponent());
        const button = await confirmReview();
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '6',
                currentNonce: '3',
            }),
        );

        await userEvent.click(button);

        await screen.findByText(`${translationKey}.queueChanged`);
        expect(getCreateButton()).toBeEnabled();
    });

    it('reports a Safe network the app cannot read', async () => {
        initReadOnlySpy.mockRejectedValue(
            new SafeProtocolKitError('providerUnavailable'),
        );
        render(createTestComponent());

        expect(
            await screen.findByText(`${translationKey}.networkUnavailable`),
        ).toBeInTheDocument();
    });

    it('refuses a wallet that is not a current owner', async () => {
        ownerKit.getOwners.mockResolvedValue([otherOwner]);
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${signingTranslationKey}.notOwner`),
        ).toBeInTheDocument();
        expect(ownerKit.signTypedData).not.toHaveBeenCalled();
    });

    it('refuses a Safe whose threshold its owners cannot reach', async () => {
        ownerKit.getThreshold.mockResolvedValue(3);
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(
                `${signingTranslationKey}.invalidThreshold`,
            ),
        ).toBeInTheDocument();
        expect(ownerKit.signTypedData).not.toHaveBeenCalled();
    });

    it('refuses to sign fields that do not hash to the reviewed transaction', async () => {
        ownerKit.getTransactionHash.mockResolvedValue(`0x${'9'.repeat(64)}`);
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${signingTranslationKey}.hashMismatch`),
        ).toBeInTheDocument();
        expect(ownerKit.signTypedData).not.toHaveBeenCalled();
    });

    it('reports a wallet that is not the owner on the Safe network', async () => {
        initForOwnerSpy.mockRejectedValue(
            new SafeProtocolKitError('walletRequired'),
        );
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${signingTranslationKey}.walletRequired`),
        ).toBeInTheDocument();
    });

    it('goes back to the action when the signature is rejected in the wallet, and creates on retry', async () => {
        ownerKit.signTypedData.mockRejectedValueOnce(
            new UserRejectedRequestError(new Error('User rejected.')),
        );
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${translationKey}.signatureRejected`),
        ).toBeInTheDocument();
        expect(proposeSafeTransactionSpy).not.toHaveBeenCalled();

        await userEvent.click(getCreateButton());

        expect(
            await screen.findByText(`${translationKey}.created`),
        ).toBeInTheDocument();
    });

    it('does not propose a signature made by an account switched to during the prompt', async () => {
        getOwnerConnectionSpy.mockReturnValue(undefined);
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${signingTranslationKey}.walletRequired`),
        ).toBeInTheDocument();
        expect(proposeSafeTransactionSpy).not.toHaveBeenCalled();
    });

    it('reports a proposal the service refused', async () => {
        proposeSafeTransactionSpy.mockRejectedValue(
            new SafeServiceError(
                SafeServiceErrorCode.UPSTREAM_ERROR,
                'Refused',
                422,
            ),
        );
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(await screen.findByText('Refused')).toBeInTheDocument();
        expect(findTransactionSpy).not.toHaveBeenCalled();
    });

    it('confirms a proposal without an answer once the service holds it with the submitted signature', async () => {
        proposeSafeTransactionSpy.mockRejectedValue(
            new SafeServiceError(
                SafeServiceErrorCode.UPSTREAM_ERROR,
                'Timeout',
                504,
            ),
        );
        findTransactionSpy.mockResolvedValue(
            generateSafeMultisigTransaction({
                safeTxHash,
                confirmations: [generateSafeConfirmation({ owner, signature })],
            }),
        );
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${translationKey}.created`),
        ).toBeInTheDocument();
        expect(findTransactionSpy).toHaveBeenCalledWith({
            network,
            address: safeAddress,
            safeTxHash,
        });
    });

    it('keeps a proposal without an answer re-checkable until the service holds it', async () => {
        proposeSafeTransactionSpy.mockRejectedValue(
            new TypeError('Failed to fetch'),
        );
        findTransactionSpy.mockResolvedValue(undefined);
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        const recheck = await screen.findByRole('button', {
            name: `${translationKey}.actions.recheck`,
        });
        expect(
            screen.getByText(`${translationKey}.uncertain`),
        ).toBeInTheDocument();

        findTransactionSpy.mockResolvedValue(
            generateSafeMultisigTransaction({
                safeTxHash,
                confirmations: [generateSafeConfirmation({ owner, signature })],
            }),
        );
        await userEvent.click(recheck);

        expect(
            await screen.findByText(`${translationKey}.created`),
        ).toBeInTheDocument();
        expect(proposeSafeTransactionSpy).toHaveBeenCalledTimes(1);
    });

    it('does not take another signature of the owner as proof that the proposal without an answer landed', async () => {
        proposeSafeTransactionSpy.mockRejectedValue(
            new TypeError('Failed to fetch'),
        );
        findTransactionSpy.mockResolvedValue(
            generateSafeMultisigTransaction({
                safeTxHash,
                confirmations: [
                    generateSafeConfirmation({
                        owner,
                        signature: `0x${'5'.repeat(130)}`,
                    }),
                ],
            }),
        );
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByRole('button', {
                name: `${translationKey}.actions.recheck`,
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(`${translationKey}.created`),
        ).not.toBeInTheDocument();
    });

    it('asks a disconnected reader to connect a wallet before signing', async () => {
        const checkWalletConnection = jest.fn();
        useConnectedWalletGuardSpy.mockReturnValue({
            result: false,
            check: checkWalletConnection,
        });
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(checkWalletConnection).toHaveBeenCalled();
        expect(initForOwnerSpy).not.toHaveBeenCalled();
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
        render(createTestComponent());

        await userEvent.click(await confirmReview());

        expect(
            await screen.findByText(`${translationKey}.networkSwitchRejected`),
        ).toBeInTheDocument();
        expect(getCreateButton()).toBeEnabled();
        expect(ownerKit.signTypedData).not.toHaveBeenCalled();
    });
});
