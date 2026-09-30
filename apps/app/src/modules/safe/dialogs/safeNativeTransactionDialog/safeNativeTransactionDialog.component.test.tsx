import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Hex } from 'viem';
import * as WagmiActions from 'wagmi/actions';
import * as connectedWalletGuardApi from '@/modules/application/hooks/useConnectedWalletGuard';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import { generateProposalAction } from '@/modules/governance/testUtils/generators/proposalAction';
import { readSafeTransactions } from '@/plugins/safeMultisigPlugin/hooks/useSafeDaoProposals';
import {
    generateSafeConfirmation,
    generateSafeInfo,
} from '@/plugins/safeMultisigPlugin/testUtils/generators';
import { Network } from '@/shared/api/daoService';
import type {
    ISafeInfoResponse,
    ISafeMultisigTransaction,
} from '@/shared/api/safeService';
import * as safeServiceApi from '@/shared/api/safeService';
import { DialogProvider } from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import * as networkSwitchApi from '@/shared/hooks/useNetworkSwitch';
import { SafeNativeTransactionDialog } from './safeNativeTransactionDialog';
import type { ISafeNativeTransactionDialogParams } from './safeNativeTransactionDialog.api';

jest.mock('wagmi/actions', () => ({
    ...jest.requireActual('wagmi/actions'),
    getConnection: jest.fn(),
}));

jest.mock('@safe-global/protocol-kit', () => ({
    __esModule: true,
    default: { init: jest.fn() },
    calculateSafeTransactionHash: jest.fn(),
    EthSafeTransaction: jest.fn(),
}));

jest.mock('@/modules/safe/components/safeTransactionReviewContent', () => ({
    SafeTransactionReviewContent: ({
        onGateChange,
    }: {
        onGateChange: (blocked: boolean) => void;
    }) => (
        <button onClick={() => onGateChange(false)} type="button">
            confirm-review
        </button>
    ),
}));

jest.mock('@/plugins/safeMultisigPlugin/hooks/useSafeDaoProposals', () => ({
    readSafeTransactions: jest.fn(),
}));

jest.mock('@/modules/application/hooks/useConnectedWalletGuard', () => ({
    useConnectedWalletGuard: jest.fn(),
}));
const owner = '0x0000000000000000000000000000000000000011' as const;
const safeAddress = '0x0000000000000000000000000000000000000001' as const;
const daoAddress = '0x0000000000000000000000000000000000000021' as const;
const actionTarget = '0x0000000000000000000000000000000000000022' as const;
const network = Network.ETHEREUM_SEPOLIA;
const chainId = networkDefinitions[network].id;
const safeTxHash = `0x${'1'.repeat(64)}` as Hex;
const changedSafeTxHash = `0x${'2'.repeat(64)}` as Hex;
const signature = `0x${'3'.repeat(130)}` as Hex;
const signLabel = 'app.safe.safeNativeTransactionDialog.actions.sign';
const recheckLabel = 'app.safe.safeNativeTransactionDialog.actions.recheck';

const protocolKitModule = jest.requireMock('@safe-global/protocol-kit') as {
    default: { init: jest.Mock };
    calculateSafeTransactionHash: jest.Mock;
    EthSafeTransaction: jest.Mock;
};
const useWalletAccountSpy = jest.spyOn(walletAccountApi, 'useWalletAccount');
const useConnectedWalletGuardSpy = jest.spyOn(
    connectedWalletGuardApi,
    'useConnectedWalletGuard',
);
const useNetworkSwitchSpy = jest.spyOn(networkSwitchApi, 'useNetworkSwitch');
const useTranslationsSpy = jest.spyOn(translationsProvider, 'useTranslations');
const getSafeInfoSpy = jest.spyOn(safeServiceApi.safeService, 'getSafeInfo');
const getSafeNextNonceSpy = jest.spyOn(
    safeServiceApi.safeService,
    'getSafeNextNonce',
);
const proposeSafeTransactionSpy = jest.spyOn(
    safeServiceApi.safeTransactionService,
    'proposeSafeTransaction',
);
const readSafeTransactionsMock = jest.mocked(readSafeTransactions);

let protocolKit: {
    getOwners: jest.Mock;
    getThreshold: jest.Mock;
    getTransactionHash: jest.Mock;
    signTypedData: jest.Mock;
};
let safeInfo: ISafeInfoResponse;

const makeParams = (): ISafeNativeTransactionDialogParams => ({
    network,
    safeAddress,
    daoAddress,
    actions: [
        {
            ...generateProposalAction({
                to: actionTarget,
                value: '0',
                data: '0x',
            }),
            meta: undefined,
        },
    ],
    prepareActions: {},
});

const makeTransaction = (
    overrides: Partial<ISafeMultisigTransaction> = {},
): ISafeMultisigTransaction => ({
    nonce: '0',
    safeTxHash,
    from: owner,
    to: daoAddress,
    value: '0',
    data: '0x',
    operation: 0,
    safeTxGas: '0',
    baseGas: '0',
    gasPrice: '0',
    gasToken: '0x0000000000000000000000000000000000000000',
    refundReceiver: '0x0000000000000000000000000000000000000000',
    confirmations: [],
    confirmationsRequired: 1,
    signatures: null,
    isExecuted: false,
    isSuccessful: null,
    submissionDate: '2026-01-01T00:00:00Z',
    ...overrides,
});

const renderDialog = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <GukModulesProvider>
            <QueryClientProvider client={queryClient}>
                <DialogProvider>
                    <Dialog.Root open={true}>
                        <SafeNativeTransactionDialog
                            location={{
                                id: 'safe-native-test',
                                params: makeParams(),
                            }}
                        />
                    </Dialog.Root>
                </DialogProvider>
            </QueryClientProvider>
        </GukModulesProvider>,
    );
};

const confirmReview = async (): Promise<void> => {
    await userEvent.click(
        await screen.findByRole('button', { name: 'confirm-review' }),
    );
    await waitFor(() => {
        expect(screen.getByRole('button', { name: signLabel })).toBeEnabled();
    });
};

beforeEach(() => {
    safeInfo = generateSafeInfo({
        address: safeAddress,
        owners: [owner],
        threshold: 1,
        version: '1.4.1',
    });
    protocolKit = {
        getOwners: jest.fn().mockResolvedValue([owner]),
        getThreshold: jest.fn().mockResolvedValue(1),
        getTransactionHash: jest.fn().mockResolvedValue(safeTxHash),
        signTypedData: jest.fn().mockResolvedValue({ data: signature }),
    };
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
    });
    useTranslationsSpy.mockReturnValue({
        t: (key: string) => key,
    });
    getSafeInfoSpy.mockResolvedValue(safeInfo);
    getSafeNextNonceSpy.mockResolvedValue({
        nextNonce: '0',
        currentNonce: '0',
        meta: {
            source: 'chain',
            fetchedAt: '2026-01-01T00:00:00Z',
            stale: false,
        },
    });
    proposeSafeTransactionSpy.mockResolvedValue({});
    readSafeTransactionsMock.mockResolvedValue([]);
    protocolKitModule.default.init.mockResolvedValue(protocolKit);
    protocolKitModule.EthSafeTransaction.mockImplementation(
        (data: unknown) => data,
    );
    protocolKitModule.calculateSafeTransactionHash.mockReturnValue(safeTxHash);
    jest.mocked(WagmiActions.getConnection).mockReturnValue({
        address: owner,
        chainId,
        status: 'connected',
        connector: {
            getProvider: jest.fn().mockResolvedValue({ request: jest.fn() }),
        },
    } as never);
});

afterEach(() => {
    jest.clearAllMocks();
});

test('does not sign or submit when the reviewed hash changes', async () => {
    protocolKitModule.calculateSafeTransactionHash
        .mockReturnValueOnce(safeTxHash)
        .mockReturnValueOnce(changedSafeTxHash);

    renderDialog();
    await confirmReview();
    await userEvent.click(screen.getByRole('button', { name: signLabel }));

    await waitFor(() => {
        expect(
            screen.getByText(
                'app.safe.safeNativeTransactionDialog.hashMismatch',
            ),
        ).toBeInTheDocument();
    });
    expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    expect(proposeSafeTransactionSpy).not.toHaveBeenCalled();
});

test('prompts for a wallet before signing while disconnected', async () => {
    const checkWalletConnection = jest.fn();
    useConnectedWalletGuardSpy.mockReturnValue({
        result: false,
        check: checkWalletConnection,
    });

    renderDialog();
    await confirmReview();
    const signButton = screen.getByRole('button', { name: signLabel });
    expect(signButton).toBeEnabled();

    await userEvent.click(signButton);

    expect(checkWalletConnection).toHaveBeenCalledTimes(1);
    expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    expect(proposeSafeTransactionSpy).not.toHaveBeenCalled();
});

test('rechecks an uncertain write without resubmitting it', async () => {
    const pendingTransaction = makeTransaction();
    const confirmedTransaction = makeTransaction({
        confirmations: [generateSafeConfirmation({ owner, signature })],
    });
    readSafeTransactionsMock
        .mockResolvedValueOnce([pendingTransaction])
        .mockResolvedValueOnce([confirmedTransaction]);
    proposeSafeTransactionSpy.mockRejectedValueOnce(
        new Error('request timeout'),
    );

    renderDialog();
    await confirmReview();
    await userEvent.click(screen.getByRole('button', { name: signLabel }));

    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: recheckLabel }),
        ).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: recheckLabel }));

    await waitFor(() => {
        expect(
            screen.getByRole('button', {
                name: 'app.safe.safeNativeTransactionDialog.actions.done',
            }),
        ).toBeEnabled();
    });
    expect(proposeSafeTransactionSpy).toHaveBeenCalledTimes(1);
    expect(protocolKit.signTypedData).toHaveBeenCalledTimes(1);
});
