import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    encodeAbiParameters,
    type Hex,
    type Log,
    numberToHex,
    pad,
    type TransactionReceipt,
    toEventSelector,
} from 'viem';
import * as Wagmi from 'wagmi';
import * as WagmiActions from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import * as smartContractServiceApi from '@/modules/governance/api/smartContractService';
import {
    generateSafeConfirmation,
    generateSafeInfo,
} from '@/plugins/safeMultisigPlugin/testUtils/generators';
import {
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils/generators';
import { Network } from '@/shared/api/daoService';
import type {
    ISafeInfoResponse,
    ISafeMultisigTransaction,
} from '@/shared/api/safeService';
import * as safeServiceApi from '@/shared/api/safeService';
import * as safeInfoApi from '@/shared/api/safeService/queries/useSafeInfo';
import { DialogProvider } from '@/shared/components/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import * as networkSwitchApi from '@/shared/hooks/useNetworkSwitch';
import { generateSafeNextNonceResponse } from '@/shared/testUtils';
import { pendingTransactionManager } from '@/shared/utils/pendingTransactionManager';
import type { ISafeProposalTransactionDialogParams } from './safeProposalTransactionDialog';
import { SafeProposalTransactionDialog } from './safeProposalTransactionDialog';

jest.mock('wagmi/actions', () => ({
    ...jest.requireActual('wagmi/actions'),
    getBytecode: jest.fn(),
    getConnection: jest.fn(),
    getTransactionReceipt: jest.fn(),
    sendTransaction: jest.fn(),
    waitForTransactionReceipt: jest.fn(),
    watchConnection: jest.fn(),
}));

jest.mock('@safe-global/protocol-kit', () => ({
    ...jest.requireActual('@safe-global/protocol-kit'),
    __esModule: true,
    default: { init: jest.fn() },
    buildSignatureBytes: jest.fn(),
    EthSafeSignature: jest.fn(),
    EthSafeTransaction: jest.fn(),
}));

const owner = '0x0000000000000000000000000000000000000011' as const;
const thirdOwner = '0x0000000000000000000000000000000000000013' as const;
const secondOwner = '0x0000000000000000000000000000000000000012' as const;
const safeAddress = '0x0000000000000000000000000000000000000001' as const;
const pluginAddress = '0x0000000000000000000000000000000000000021' as const;
const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
const network = Network.ETHEREUM_SEPOLIA;
const chainId = networkDefinitions[network].id;
const intentId = `safe-proposal:${network}:${safeAddress.toLowerCase()}:proposal-id:0:vote`;
const safeTxHash = `0x${'1'.repeat(64)}` as Hex;
const submittedHash = `0x${'2'.repeat(64)}` as Hex;
const signatureData = `0x${'3'.repeat(130)}` as Hex;

const protocolKitModule = jest.requireMock('@safe-global/protocol-kit') as {
    default: { init: jest.Mock };
    buildSignatureBytes: jest.Mock;
    EthSafeSignature: jest.Mock;
    EthSafeTransaction: jest.Mock;
};

const useWalletAccountSpy = jest.spyOn(walletAccountApi, 'useWalletAccount');
const useNetworkSwitchSpy = jest.spyOn(networkSwitchApi, 'useNetworkSwitch');
const useSafeInfoSpy = jest.spyOn(safeInfoApi, 'useSafeInfo');
const useProposeSpy = jest.spyOn(safeServiceApi, 'useProposeSafeTransaction');
const useConfirmSpy = jest.spyOn(safeServiceApi, 'useConfirmSafeTransaction');
const getSafeInfoSpy = jest.spyOn(safeServiceApi.safeService, 'getSafeInfo');
const getSafeNextNonceSpy = jest.spyOn(
    safeServiceApi.safeService,
    'getSafeNextNonce',
);
const getPendingTransactionsSpy = jest.spyOn(
    safeServiceApi.safeService,
    'getSafePendingTransactions',
);
const getTransactionHistorySpy = jest.spyOn(
    safeServiceApi.safeService,
    'getSafeTransactionHistory',
);
const useReadContractSpy = jest.spyOn(Wagmi, 'useReadContract');
const usePublicClientSpy = jest.spyOn(Wagmi, 'usePublicClient');
const decodeTransactionsSpy = jest.spyOn(
    smartContractServiceApi.smartContractService,
    'decodeTransactionsLight',
);

let safeInfo: ISafeInfoResponse;
let serviceTransaction: ISafeMultisigTransaction | undefined;
let proposeMutateAsync: jest.Mock;
let confirmMutateAsync: jest.Mock;
let protocolKit: {
    createTransaction: jest.Mock;
    getTransactionHash: jest.Mock;
    signTypedData: jest.Mock;
    getThreshold: jest.Mock;
    getOwners: jest.Mock;
    isValidTransaction: jest.Mock;
    getEncodedTransaction: jest.Mock;
};
let safeTransaction: {
    data: {
        to: string;
        value: string;
        data: string;
        operation: 0 | 1;
        safeTxGas: string;
        baseGas: string;
        gasPrice: string;
        gasToken: string;
        refundReceiver: string;
        nonce: number;
    };
    addSignature: jest.Mock;
    encodedSignatures: jest.Mock;
};

const makePage = (
    results: ISafeMultisigTransaction[],
    next: string | null = null,
) => ({
    count: results.length,
    next,
    previous: null,
    results,
    meta: {
        source: 'safe-api',
        fetchedAt: '2026-01-01T00:00:00Z',
        stale: false,
    },
});

const makeTransaction = (
    overrides: Partial<ISafeMultisigTransaction> = {},
): ISafeMultisigTransaction => ({
    nonce: '0',
    safeTxHash,
    from: owner,
    to: pluginAddress,
    value: '0',
    data: '0xreport',
    operation: 0,
    safeTxGas: '0',
    baseGas: '0',
    gasPrice: '0',
    gasToken: zeroAddress,
    refundReceiver: zeroAddress,
    confirmations: [],
    confirmationsRequired: 2,
    signatures: null,
    isExecuted: false,
    isSuccessful: null,
    submissionDate: '2026-01-01T00:00:00Z',
    ...overrides,
});

const createSafeTransaction = (): void => {
    safeTransaction = {
        data: {
            to: pluginAddress,
            value: '0',
            data: '0xreport',
            operation: 0,
            safeTxGas: '0',
            baseGas: '0',
            gasPrice: '0',
            gasToken: zeroAddress,
            refundReceiver: zeroAddress,
            nonce: 0,
        },
        addSignature: jest.fn(),
        encodedSignatures: jest.fn(() => '0xsignatureBytes'),
    };

    protocolKit = {
        createTransaction: jest.fn().mockResolvedValue(safeTransaction),
        getTransactionHash: jest.fn().mockResolvedValue(safeTxHash),
        signTypedData: jest.fn().mockResolvedValue({
            signer: owner,
            data: signatureData,
            isContractSignature: false,
            staticPart: jest.fn(),
            dynamicPart: jest.fn(),
        }),
        getThreshold: jest.fn().mockResolvedValue(2),
        getOwners: jest.fn().mockResolvedValue([owner, secondOwner]),
        isValidTransaction: jest.fn().mockResolvedValue(true),
        getEncodedTransaction: jest.fn().mockResolvedValue('0xexecTransaction'),
    };

    protocolKitModule.default.init.mockResolvedValue(protocolKit);
    protocolKitModule.buildSignatureBytes.mockReturnValue('0xsignatureBytes');
    protocolKitModule.EthSafeSignature.mockImplementation(
        (signer: string, data: Hex, isContractSignature: boolean) => ({
            signer,
            data,
            isContractSignature,
            staticPart: jest.fn(),
            dynamicPart: jest.fn(),
        }),
    );
    protocolKitModule.EthSafeTransaction.mockImplementation(
        () => safeTransaction,
    );

    jest.mocked(WagmiActions.getConnection).mockReturnValue({
        address: owner,
        chainId,
        status: 'connected',
        connector: {
            getProvider: jest.fn().mockResolvedValue({ request: jest.fn() }),
        },
    } as never);
};

const makeParams = (
    overrides: Partial<ISafeProposalTransactionDialogParams> = {},
): ISafeProposalTransactionDialogParams => ({
    daoId: 'dao-id',
    proposal: generateSppProposal({
        id: 'proposal-id',
        network,
        pluginAddress,
        proposalIndex: '0',
    }),
    externalAddress: safeAddress,
    stage: generateSppStage({ stageIndex: 0 }),
    isVeto: false,
    bundleExecution: true,
    intentId,
    onExecuted: jest.fn(),
    onSafeStateChange: jest.fn().mockResolvedValue(undefined),
    ...overrides,
});

const renderDialog = (
    overrides: Partial<ISafeProposalTransactionDialogParams> = {},
) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    const content = () => (
        <GukModulesProvider>
            <QueryClientProvider client={queryClient}>
                <DialogProvider>
                    <Dialog.Root open={true}>
                        <SafeProposalTransactionDialog
                            location={{
                                id: intentId,
                                params: makeParams(overrides),
                            }}
                        />
                    </Dialog.Root>
                </DialogProvider>
            </QueryClientProvider>
        </GukModulesProvider>
    );
    const result = render(content());
    return { ...result, rerenderDialog: () => result.rerender(content()) };
};

const actionLabels = {
    signSubmit: 'app.safe.safeProposalTransactionDialog.actions.sign_submit',
    execute: 'app.safe.safeProposalTransactionDialog.actions.execute',
    resume: 'app.safe.safeProposalTransactionDialog.actions.resume',
    retry: 'app.shared.transactionDialog.footer.retry',
} as const;

const clickPrimary = async (name: string): Promise<void> => {
    await userEvent.click(screen.getByRole('button', { name }));
};

const waitForAction = async (name: string): Promise<void> => {
    await waitFor(() => {
        expect(screen.getByRole('button', { name })).toBeEnabled();
    });
};

const waitForSignStep = async (): Promise<void> => {
    await waitForAction(actionLabels.signSubmit);
};

const waitForExecuteStep = async (): Promise<void> => {
    await waitForAction(actionLabels.execute);
};

const acceptNewProposal = (): void => {
    proposeMutateAsync.mockImplementation(
        (params: {
            body: {
                safeTransactionData: typeof safeTransaction.data;
                safeTxHash: string;
                senderSignature: Hex;
            };
        }) => {
            const {
                safeTransactionData,
                safeTxHash: acceptedHash,
                senderSignature,
            } = params.body;
            serviceTransaction = makeTransaction({
                nonce: safeTransactionData.nonce.toString(),
                safeTxHash: acceptedHash,
                to: safeTransactionData.to,
                value: safeTransactionData.value,
                data: safeTransactionData.data,
                operation: safeTransactionData.operation,
                safeTxGas: safeTransactionData.safeTxGas,
                baseGas: safeTransactionData.baseGas,
                gasPrice: safeTransactionData.gasPrice,
                gasToken: safeTransactionData.gasToken,
                refundReceiver: safeTransactionData.refundReceiver,
                confirmations: [
                    generateSafeConfirmation({
                        owner,
                        signature: senderSignature,
                    }),
                ],
                confirmationsRequired: 1,
            });
            return Promise.resolve();
        },
    );
};

const configureThresholdOne = (params?: {
    nonce?: number;
    currentNonce?: number;
    nextNonce?: number;
}): void => {
    safeInfo.threshold = 1;
    const nonce = params?.nonce ?? 0;
    const currentNonce = params?.currentNonce ?? nonce;
    const nextNonce = params?.nextNonce ?? nonce;
    safeTransaction.data.nonce = nonce;
    protocolKit.getThreshold.mockResolvedValue(1);
    protocolKit.getOwners.mockResolvedValue([owner]);
    acceptNewProposal();
    getSafeNextNonceSpy.mockResolvedValue(
        generateSafeNextNonceResponse({
            nextNonce: nextNonce.toString(),
            currentNonce: currentNonce.toString(),
        }),
    );
};

const zeroHash = `0x${'0'.repeat(64)}` as Hex;

const baseLog = {
    blockHash: zeroHash,
    blockNumber: BigInt(0),
    logIndex: 0,
    transactionHash: submittedHash,
    transactionIndex: 0,
    removed: false,
};

const baseReceipt = {
    blockHash: zeroHash,
    blockNumber: BigInt(0),
    contractAddress: null,
    cumulativeGasUsed: BigInt(0),
    effectiveGasPrice: BigInt(0),
    from: owner,
    gasUsed: BigInt(0),
    logsBloom: `0x${'0'.repeat(512)}` as Hex,
    to: safeAddress,
    transactionHash: submittedHash,
    transactionIndex: 0,
    type: 'eip1559',
} satisfies Omit<TransactionReceipt, 'status' | 'logs'>;
type TestTransactionReceipt = TransactionReceipt & {
    chainId: number;
};

const receiptWithLogs = (
    logs: TestTransactionReceipt['logs'],
    status: TestTransactionReceipt['status'] = 'success',
): TestTransactionReceipt => ({
    ...baseReceipt,
    chainId,
    status,
    logs,
});

const safeExecutionLog = (
    hash: Hex = safeTxHash,
    failure = false,
): Log<bigint, number, false> => ({
    ...baseLog,
    address: safeAddress,
    topics: [
        toEventSelector(
            failure
                ? 'ExecutionFailure(bytes32,uint256)'
                : 'ExecutionSuccess(bytes32,uint256)',
        ),
        hash,
    ],
    data: pad('0x01'),
});

const reportLog = (params?: {
    emitter?: Hex;
    proposalId?: bigint;
    stageIndex?: number;
    data?: Hex;
}): Log<bigint, number, false> => ({
    ...baseLog,
    address: params?.emitter ?? pluginAddress,
    topics: [
        toEventSelector('ProposalResultReported(uint256,uint16,address)'),
        pad(numberToHex(params?.proposalId ?? BigInt(0))),
        pad(numberToHex(params?.stageIndex ?? 0)),
        pad(safeAddress),
    ],
    data: params?.data ?? '0x',
});

const successfulReceipt = (includeReport = true): TestTransactionReceipt =>
    receiptWithLogs([
        safeExecutionLog(),
        ...(includeReport ? [reportLog()] : []),
    ]);
beforeEach(() => {
    serviceTransaction = undefined;
    safeInfo = generateSafeInfo({
        address: safeAddress,
        owners: [owner, secondOwner],
        threshold: 2,
        version: '1.4.1',
    });
    proposeMutateAsync = jest.fn().mockResolvedValue({});
    confirmMutateAsync = jest.fn().mockResolvedValue({});

    useWalletAccountSpy.mockReturnValue({
        address: owner,
        chainId,
        isConnecting: false,
        isReconnecting: false,
    });
    useNetworkSwitchSpy.mockReturnValue({
        requiredChainId: chainId,
        isCrossNetworkTransaction: false,
        networkName: 'Sepolia',
        switchChainStatus: 'idle',
        withNetworkSwitch: (callback) => callback(),
    });
    getSafeInfoSpy.mockResolvedValue(safeInfo);
    useSafeInfoSpy.mockReturnValue({
        data: safeInfo,
        isLoading: false,
        isError: false,
        error: null,
    } as never);
    useProposeSpy.mockReturnValue({ mutateAsync: proposeMutateAsync } as never);
    useConfirmSpy.mockReturnValue({ mutateAsync: confirmMutateAsync } as never);
    getSafeNextNonceSpy.mockResolvedValue(
        generateSafeNextNonceResponse({
            nextNonce: '0',
            currentNonce: '0',
        }),
    );
    getPendingTransactionsSpy.mockImplementation(async () =>
        makePage(serviceTransaction == null ? [] : [serviceTransaction]),
    );
    getTransactionHistorySpy.mockResolvedValue(makePage([]));
    useReadContractSpy.mockReturnValue({
        data: undefined,
        isPending: true,
        isLoading: true,
        isError: false,
    } as never);
    usePublicClientSpy.mockReturnValue(undefined);
    decodeTransactionsSpy.mockResolvedValue([]);
    jest.mocked(WagmiActions.watchConnection).mockReturnValue(jest.fn());
    jest.mocked(WagmiActions.getBytecode).mockResolvedValue('0x1234');
    jest.mocked(WagmiActions.sendTransaction).mockResolvedValue(submittedHash);
    jest.mocked(WagmiActions.waitForTransactionReceipt).mockReset();
    jest.mocked(WagmiActions.getTransactionReceipt).mockReset();
    createSafeTransaction();
    pendingTransactionManager.clearActive();
    sessionStorage.clear();
});

afterEach(() => {
    pendingTransactionManager.clearActive();
    sessionStorage.clear();
    jest.clearAllMocks();
});

describe('SafeProposalTransactionDialog', () => {
    it('keeps review retryable when reconnection exposes only persisted connector metadata', async () => {
        const existing = makeTransaction();
        serviceTransaction = existing;
        renderDialog({ pendingTransaction: existing });
        await waitForSignStep();
        const connected = WagmiActions.getConnection(wagmiConfig);
        jest.mocked(WagmiActions.getConnection).mockReturnValue({
            ...connected,
            status: 'reconnecting',
            connector: {
                id: 'injected',
                name: 'Injected',
                type: 'injected',
                uid: 'persisted',
            },
        } as never);

        await clickPrimary(actionLabels.signSubmit);
        expect(
            screen.queryByText(/getProvider.*is not a function/),
        ).not.toBeInTheDocument();
        expect(
            await screen.findByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.providerUnavailable',
            ),
        ).toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(proposeMutateAsync).not.toHaveBeenCalled();
        expect(confirmMutateAsync).not.toHaveBeenCalled();
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();

        jest.mocked(WagmiActions.getConnection).mockReturnValue(connected);
        await clickPrimary(actionLabels.retry);
        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.safe.safeProposalTransactionDialog.confirmationRecorded',
                ),
            ).toBeInTheDocument();
        });
        expect(protocolKit.signTypedData).toHaveBeenCalled();
    });

    it('waits for reconnection before preparing a new transaction', async () => {
        useWalletAccountSpy.mockReturnValue({
            address: owner,
            chainId,
            isConnecting: false,
            isReconnecting: true,
        });
        const view = renderDialog();
        await act(async () => {
            await Promise.resolve();
        });
        expect(
            screen.getByRole('button', {
                name: 'app.safe.safeProposalTransactionDialog.actions.loading',
            }),
        ).toBeDisabled();
        expect(getSafeNextNonceSpy).not.toHaveBeenCalled();

        useWalletAccountSpy.mockReturnValue({
            address: owner,
            chainId,
            isConnecting: false,
            isReconnecting: false,
        });
        view.rerenderDialog();
        await waitForSignStep();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });

    it('confirms an existing exact transaction when this owner is missing', async () => {
        const existing = makeTransaction({
            confirmations: [
                generateSafeConfirmation({
                    owner: secondOwner,
                    signature: `0x${'4'.repeat(130)}`,
                }),
            ],
            confirmationsRequired: 2,
        });
        serviceTransaction = existing;
        confirmMutateAsync.mockImplementation(() => {
            serviceTransaction = {
                ...existing,
                confirmations: [
                    ...existing.confirmations,
                    generateSafeConfirmation({
                        owner,
                        signature: signatureData,
                    }),
                ],
            };
            return Promise.resolve();
        });

        renderDialog({ pendingTransaction: existing });
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);

        await waitFor(() => {
            expect(confirmMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({ signature: signatureData }),
                }),
            );
        });
        expect(proposeMutateAsync).not.toHaveBeenCalled();
    });

    it('confirms a newly prepared envelope when another owner races it into the queue', async () => {
        renderDialog();
        await waitForSignStep();

        serviceTransaction = makeTransaction({
            confirmations: [
                generateSafeConfirmation({
                    owner: secondOwner,
                    signature: `0x${'4'.repeat(130)}`,
                }),
            ],
            confirmationsRequired: 2,
        });

        await clickPrimary(actionLabels.signSubmit);

        await waitFor(() => {
            expect(confirmMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({ signature: signatureData }),
                }),
            );
        });
        expect(proposeMutateAsync).not.toHaveBeenCalled();
    });

    it('does not treat a local signature as service acceptance', async () => {
        configureThresholdOne();
        let resolvePost: (() => void) | undefined;
        proposeMutateAsync.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolvePost = resolve;
                }),
        );

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());

        expect(
            screen.queryByRole('button', { name: actionLabels.execute }),
        ).toBeNull();
        expect(
            screen.queryByText(
                'app.safe.safeProposalTransactionDialog.completion',
            ),
        ).toBeNull();
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();

        resolvePost?.();
        await waitForExecuteStep();
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });
    it('reconciles an unknown service error without reposting', async () => {
        const error = new safeServiceApi.SafeServiceError(
            safeServiceApi.SafeServiceErrorCode.UPSTREAM_ERROR,
            'service unavailable',
            500,
        );
        proposeMutateAsync.mockRejectedValue(error);

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);

        await waitFor(() => {
            expect(screen.getByText('service unavailable')).toBeInTheDocument();
        });
        expect(proposeMutateAsync).toHaveBeenCalledTimes(1);

        await clickPrimary(actionLabels.retry);
        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.serviceAcceptanceUnknown',
                ),
            ).toBeInTheDocument();
        });
        expect(proposeMutateAsync).toHaveBeenCalledTimes(1);
        expect(confirmMutateAsync).not.toHaveBeenCalled();
    });

    it('offers Retry when preparation fails', async () => {
        getSafeInfoSpy.mockRejectedValueOnce(new Error('prepare failed'));

        renderDialog();

        await waitFor(() => {
            expect(screen.getByText('prepare failed')).toBeInTheDocument();
            expect(
                screen.getByRole('button', {
                    name: actionLabels.retry,
                }),
            ).toBeEnabled();
        });
        await clickPrimary(actionLabels.retry);
        await waitForSignStep();
    });

    it('does not show execution success from a submitted hash alone', async () => {
        const onExecuted = jest.fn();
        const pendingError = new Error('receipt pending');
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockRejectedValue(
            pendingError,
        );
        jest.mocked(WagmiActions.getTransactionReceipt).mockRejectedValue(
            pendingError,
        );
        protocolKit.getThreshold.mockResolvedValue(1);
        protocolKit.getOwners.mockResolvedValue([owner]);
        safeInfo.threshold = 1;
        serviceTransaction = makeTransaction({
            confirmations: [
                generateSafeConfirmation({
                    owner,
                    signature: signatureData,
                }),
            ],
            confirmationsRequired: 1,
        });

        renderDialog({ pendingTransaction: serviceTransaction, onExecuted });
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);
        await waitFor(() => {
            expect(WagmiActions.sendTransaction).toHaveBeenCalled();
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionPending',
                ),
            ).toBeInTheDocument();
        });

        expect(onExecuted).not.toHaveBeenCalled();
        expect(
            screen.queryByText(
                'app.safe.safeProposalTransactionDialog.completion',
            ),
        ).not.toBeInTheDocument();
    });

    it('keeps recovery custody when the receipt is unmatched', async () => {
        const onExecuted = jest.fn();
        const registerSubmittedSpy = jest.spyOn(
            pendingTransactionManager,
            'registerSubmitted',
        );
        protocolKit.getThreshold.mockResolvedValue(1);
        protocolKit.getOwners.mockResolvedValue([owner]);
        safeInfo.threshold = 1;
        serviceTransaction = makeTransaction({
            confirmations: [
                generateSafeConfirmation({
                    owner,
                    signature: signatureData,
                }),
            ],
            confirmationsRequired: 1,
        });
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receiptWithLogs([]),
        );

        renderDialog({ pendingTransaction: serviceTransaction, onExecuted });
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);
        await waitFor(() => {
            expect(registerSubmittedSpy).toHaveBeenCalled();
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionPending',
                ),
            ).toBeInTheDocument();
        });
        const [registeredIntentId] = registerSubmittedSpy.mock.calls[0];
        expect(registeredIntentId).toBe(intentId);
        expect(pendingTransactionManager.get(intentId)).toBeDefined();
        expect(onExecuted).not.toHaveBeenCalled();
    });

    it('preserves a successful handoff when invalidation throws', async () => {
        const onExecuted = jest.fn();
        const onSafeStateChange = jest
            .fn()
            .mockRejectedValue(new Error('invalidation failed'));
        protocolKit.getThreshold.mockResolvedValue(1);
        protocolKit.getOwners.mockResolvedValue([owner]);
        safeInfo.threshold = 1;
        serviceTransaction = makeTransaction({
            confirmations: [
                generateSafeConfirmation({
                    owner,
                    signature: signatureData,
                }),
            ],
            confirmationsRequired: 1,
        });
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receiptWithLogs([
                safeExecutionLog(),
                reportLog({
                    data: encodeAbiParameters([{ type: 'bool' }], [true]),
                }),
            ]),
        );

        renderDialog({
            pendingTransaction: serviceTransaction,
            onExecuted,
            onSafeStateChange,
        });
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);
        await waitFor(() => {
            expect(onExecuted).toHaveBeenCalledWith(submittedHash);
        });

        expect(
            screen.queryByText('invalidation failed'),
        ).not.toBeInTheDocument();
    });

    it('refuses to sign when the reviewed envelope hash changes', async () => {
        const mismatch = `0x${'9'.repeat(64)}` as Hex;
        protocolKit.getTransactionHash.mockResolvedValue(safeTxHash);
        serviceTransaction = makeTransaction();

        renderDialog({ pendingTransaction: serviceTransaction });
        await waitForSignStep();
        protocolKit.getTransactionHash.mockResolvedValue(mismatch);
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.hashMismatch',
                ),
            ).toBeInTheDocument();
        });
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });
    it('refuses a queued report that disappeared before review', async () => {
        const pending = makeTransaction();
        getPendingTransactionsSpy.mockResolvedValue(makePage([]));
        getTransactionHistorySpy.mockResolvedValue(makePage([]));

        renderDialog({ pendingTransaction: pending });
        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.reportUnavailable',
                ),
            ).toBeInTheDocument();
        });

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.reportGone',
            ),
        ).toBeNull();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(proposeMutateAsync).not.toHaveBeenCalled();
    });

    it('does not claim a missing report is gone when the queue read is partial', async () => {
        const pending = makeTransaction();
        const other = makeTransaction({
            safeTxHash: `0x${'8'.repeat(64)}`,
        });
        getPendingTransactionsSpy
            .mockResolvedValueOnce(
                makePage([other], 'https://safe.example/pending?page=2'),
            )
            .mockResolvedValueOnce(makePage([]));
        getTransactionHistorySpy.mockResolvedValue(makePage([]));

        renderDialog({ pendingTransaction: pending });
        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.reportUnavailable',
                ),
            ).toBeInTheDocument();
        });

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.reportGone',
            ),
        ).toBeNull();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });

    it.each([
        {
            name: 'a new report with a consumed nonce',
            pending: false,
            nextNonce: '6',
            currentNonce: '6',
            message:
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceConsumed',
        },
        {
            name: 'a new report with a competing nonce',
            pending: false,
            nextNonce: '6',
            currentNonce: '0',
            message:
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceContested',
        },
        {
            name: 'an existing report whose nonce was consumed',
            pending: true,
            nextNonce: '6',
            currentNonce: '6',
            message: 'app.plugins.safeMultisig.safeMultisigSubmitVote.replaced',
        },
    ])(
        'does not sign after review detects $name',
        async ({ pending: hasPending, nextNonce, currentNonce, message }) => {
            const pending = makeTransaction({ nonce: '0' });
            getSafeNextNonceSpy.mockResolvedValue(
                generateSafeNextNonceResponse({
                    nextNonce: '0',
                    currentNonce: '0',
                }),
            );
            if (hasPending) {
                serviceTransaction = pending;
            }

            renderDialog(
                hasPending ? { pendingTransaction: pending } : undefined,
            );
            await waitForSignStep();
            getSafeNextNonceSpy.mockResolvedValue(
                generateSafeNextNonceResponse({
                    nextNonce,
                    currentNonce,
                }),
            );
            await clickPrimary(actionLabels.signSubmit);

            await waitFor(() => {
                expect(screen.getByText(message)).toBeInTheDocument();
            });
            expect(protocolKit.signTypedData).not.toHaveBeenCalled();
            expect(confirmMutateAsync).not.toHaveBeenCalled();
            expect(proposeMutateAsync).not.toHaveBeenCalled();
        },
    );

    it('uses fresh service confirmations instead of stale queue props', async () => {
        const pending = makeTransaction({
            confirmations: [
                generateSafeConfirmation({
                    owner: secondOwner,
                    signature: `0x${'4'.repeat(130)}`,
                }),
            ],
            confirmationsRequired: 2,
        });
        serviceTransaction = makeTransaction({
            confirmations: [
                generateSafeConfirmation({
                    owner,
                    signature: signatureData,
                }),
                generateSafeConfirmation({
                    owner: secondOwner,
                    signature: `0x${'4'.repeat(130)}`,
                }),
            ],
            confirmationsRequired: 2,
        });

        renderDialog({ pendingTransaction: pending });
        await waitForExecuteStep();

        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(confirmMutateAsync).not.toHaveBeenCalled();
    });

    it('rechecks owner authority before execution', async () => {
        configureThresholdOne();
        protocolKit.getOwners.mockResolvedValue([secondOwner]);

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.authorityChanged',
                ),
            ).toBeInTheDocument();
        });
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('rechecks the Safe threshold before execution', async () => {
        configureThresholdOne();

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();

        protocolKit.getThreshold.mockResolvedValue(2);
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.authorityChanged',
                ),
            ).toBeInTheDocument();
        });
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('keeps a simulation rejection before any execution is submitted', async () => {
        configureThresholdOne();
        protocolKit.isValidTransaction.mockResolvedValue(false);

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionRejected',
                ),
            ).toBeInTheDocument();
        });
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('signs the reviewed Safe transaction as EIP-712 data', async () => {
        configureThresholdOne();

        renderDialog();
        await waitForSignStep();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => {
            expect(protocolKit.signTypedData).toHaveBeenCalledWith(
                safeTransaction,
            );
        });
    });

    it('keeps the frozen three-step plan while actions advance', async () => {
        configureThresholdOne();
        safeInfo.threshold = 1;

        renderDialog();

        const expectFrozenPlan = (current: number): void => {
            expect(
                screen.getByText(
                    'app.safe.safeProposalTransactionDialog.steps.sign_submit',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'app.safe.safeProposalTransactionDialog.steps.execute',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    `app.shared.transactionStatus.info.current (current=${current})`,
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'app.shared.transactionStatus.info.total (total=2)',
                ),
            ).toBeInTheDocument();
        };
        await waitForSignStep();
        expect(
            screen.queryByText(
                'app.safe.safeProposalTransactionDialog.steps.sign_submit',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.safe.safeProposalTransactionDialog.steps.execute',
            ),
        ).not.toBeInTheDocument();
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();

        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        expectFrozenPlan(2);
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('executes immediately after a threshold-one service acceptance', async () => {
        configureThresholdOne({ nonce: 6, currentNonce: 6, nextNonce: 6 });
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            successfulReceipt(),
        );

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(WagmiActions.waitForTransactionReceipt).toHaveBeenCalled();
        });
        expect(
            jest.mocked(WagmiActions.sendTransaction).mock.calls[0][1],
        ).toEqual(expect.objectContaining({ data: '0xexecTransaction' }));
        expect(WagmiActions.waitForTransactionReceipt).toHaveBeenCalled();
    });

    it('reports an execute wallet rejection without creating recovery custody', async () => {
        configureThresholdOne();
        const rejection = Object.assign(
            new Error('User rejected the request'),
            { code: 4001 },
        );
        jest.mocked(WagmiActions.sendTransaction).mockRejectedValueOnce(
            rejection,
        );

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionWalletRejected',
                ),
            ).toBeInTheDocument();
        });
        expect(pendingTransactionManager.get(intentId)).toBeUndefined();
    });

    it('persists uncertain execution without trusting an error hash or retrying send', async () => {
        configureThresholdOne();
        const transportError = Object.assign(new Error('transport failed'), {
            hash: submittedHash,
        });
        jest.mocked(WagmiActions.sendTransaction).mockRejectedValueOnce(
            transportError,
        );

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionSubmissionUnknown',
                ),
            ).toBeInTheDocument();
        });

        const pending = pendingTransactionManager.get(intentId);
        expect(pending).toEqual(
            expect.objectContaining({
                status: 'PENDING',
                chainId,
                recovery: expect.any(Object),
            }),
        );
        expect(pending?.hash).toBeUndefined();

        const persisted = JSON.parse(
            sessionStorage.getItem('aragon.pendingTransactions') ?? '{}',
        ) as Record<string, { hash?: unknown }>;
        expect(persisted[intentId]).toEqual(
            expect.objectContaining({ status: 'PENDING', chainId }),
        );
        expect(persisted[intentId]).not.toHaveProperty('hash');

        await clickPrimary(actionLabels.retry);
        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionSubmissionUnknown',
                ),
            ).toBeInTheDocument();
        });
        expect(WagmiActions.sendTransaction).toHaveBeenCalledTimes(1);
    });
    it('executes a 2-of-3 envelope without a third owner signature', async () => {
        const existing = makeTransaction({
            confirmations: [
                generateSafeConfirmation({
                    owner,
                    signature: signatureData,
                }),
                generateSafeConfirmation({
                    owner: secondOwner,
                    signature: `0x${'4'.repeat(130)}`,
                }),
            ],
            confirmationsRequired: 2,
        });
        serviceTransaction = existing;
        protocolKit.getOwners.mockResolvedValue([
            owner,
            secondOwner,
            thirdOwner,
        ]);
        protocolKit.getThreshold.mockResolvedValue(2);
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            successfulReceipt(),
        );

        renderDialog({ pendingTransaction: existing });
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(WagmiActions.sendTransaction).toHaveBeenCalled();
        });
        expect(protocolKit.signTypedData).not.toHaveBeenCalled();
    });

    it('does not execute while the allocated nonce is behind the Safe queue', async () => {
        configureThresholdOne({ nonce: 7, currentNonce: 6, nextNonce: 7 });

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());

        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('can stop after signing without executing onchain', async () => {
        configureThresholdOne({ nonce: 6, currentNonce: 6, nextNonce: 6 });

        renderDialog({ bundleExecution: false });
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);

        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('requires the plugin report effect after a successful Safe event', async () => {
        configureThresholdOne();
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            successfulReceipt(false),
        );

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionRecordedNothing',
                ),
            ).toBeInTheDocument();
        });
    });

    it.each([
        {
            name: 'another contract',
            report: reportLog({ emitter: `0x${'cd'.repeat(20)}` as Hex }),
        },
        {
            name: 'another proposal',
            report: reportLog({ proposalId: BigInt(99) }),
        },
        {
            name: 'another stage',
            report: reportLog({ stageIndex: 7 }),
        },
    ])('rejects a report effect from $name', async ({ report }) => {
        configureThresholdOne();
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receiptWithLogs([safeExecutionLog(), report]),
        );

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionRecordedNothing',
                ),
            ).toBeInTheDocument();
        });
    });

    it('reports an outer execution revert without claiming a result', async () => {
        configureThresholdOne();
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receiptWithLogs([], 'reverted'),
        );

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionReverted',
                ),
            ).toBeInTheDocument();
        });
    });

    it('distinguishes an inner Safe call failure from an outer revert', async () => {
        configureThresholdOne();
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receiptWithLogs([safeExecutionLog(safeTxHash, true)]),
        );

        renderDialog();
        await waitForSignStep();
        await clickPrimary(actionLabels.signSubmit);
        await waitFor(() => expect(proposeMutateAsync).toHaveBeenCalled());
        await waitForExecuteStep();
        await clickPrimary(actionLabels.execute);

        await waitFor(() => {
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.executionInnerFailed',
                ),
            ).toBeInTheDocument();
        });
    });

    it('uses the Safe event signature and indexed topic for report effects', () => {
        expect(
            toEventSelector('ProposalResultReported(uint256,uint16,address)'),
        ).toBe(
            '0xbfaa970a350cc4e6c21888b5c4b888e2750f035ce824e40cfc7dc5f07e3936c5',
        );
        expect(reportLog().topics[1]).toBe(
            '0x0000000000000000000000000000000000000000000000000000000000000000',
        );
    });
});
