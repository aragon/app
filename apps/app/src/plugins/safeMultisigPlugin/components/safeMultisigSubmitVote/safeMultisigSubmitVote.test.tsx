import { ProposalStatus } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Wagmi from 'wagmi';
import * as WagmiActions from 'wagmi/actions';
import * as connectedWalletGuardApi from '@/modules/application/hooks/useConnectedWalletGuard';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import {
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import * as networkSwitchApi from '@/shared/hooks/useNetworkSwitch';
import * as safeBodyStateApi from '../../hooks/useSafeMultisigBodyState';
import {
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { SafeTransactionState } from '../../types';
import {
    type ISafeMultisigSubmitVoteProps,
    SafeMultisigSubmitVote,
} from './safeMultisigSubmitVote';

jest.mock('wagmi/actions', () => ({
    ...jest.requireActual('wagmi/actions'),
    getConnection: jest.fn(),
    sendTransaction: jest.fn(),
    waitForTransactionReceipt: jest.fn(),
}));

jest.mock('@safe-global/protocol-kit', () => ({
    __esModule: true,
    default: { init: jest.fn() },
    buildSignatureBytes: jest.fn(),
    EthSafeSignature: jest.fn(),
    EthSafeTransaction: jest.fn(),
}));

describe('<SafeMultisigSubmitVote /> component', () => {
    const owner = '0x0000000000000000000000000000000000000011';
    const nonOwner = '0x0000000000000000000000000000000000000099';
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
    const useSafeBodyStateSpy = jest.spyOn(
        safeBodyStateApi,
        'useSafeMultisigBodyState',
    );
    const useProposeSpy = jest.spyOn(
        safeServiceApi,
        'useProposeSafeTransaction',
    );
    const useConfirmSpy = jest.spyOn(
        safeServiceApi,
        'useConfirmSafeTransaction',
    );
    const useBytecodeSpy = jest.spyOn(Wagmi, 'useBytecode');
    const proposeMutateAsync = jest.fn();
    const confirmMutateAsync = jest.fn();

    const baseState = {
        safeInfo: generateSafeInfo({ threshold: 1, owners: [owner] }),
        isLoading: false,
        isError: false,
        pendingReport: undefined,
        settledResultType: undefined,
        signers: [],
        hasConnectedWalletSigned: false,
        approvalsAmount: 0,
        minApprovals: 1,
        membersCount: 1,
    } satisfies safeBodyStateApi.IUseSafeMultisigBodyStateReturn;

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: owner,
            chainId: 11_155_111,
            isConnecting: false,
            isReconnecting: false,
        });
        useConnectedWalletGuardSpy.mockReturnValue({
            check: ({ onSuccess } = {}) => onSuccess?.(),
            result: true,
        });
        useNetworkSwitchSpy.mockReturnValue({
            requiredChainId: 11_155_111,
            isCrossNetworkTransaction: false,
            networkName: 'Sepolia',
            switchChainStatus: 'idle',
            withNetworkSwitch: (callback) => callback(),
        });
        useSafeBodyStateSpy.mockReturnValue(baseState);
        useProposeSpy.mockReturnValue({
            mutateAsync: proposeMutateAsync,
        } as never);
        useConfirmSpy.mockReturnValue({
            mutateAsync: confirmMutateAsync,
        } as never);
        useBytecodeSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as ReturnType<typeof Wagmi.useBytecode>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (
        props?: Partial<ISafeMultisigSubmitVoteProps>,
    ) => {
        const completeProps: ISafeMultisigSubmitVoteProps = {
            daoId: `sep:${owner}`,
            proposal: generateSppProposal({
                network: Network.ETHEREUM_SEPOLIA,
            }),
            externalAddress: baseState.safeInfo.address,
            stage: generateSppStage({ stageIndex: 1 }),
            isVeto: false,
            ...props,
        };

        return (
            <QueryClientProvider client={new QueryClient()}>
                <SafeMultisigSubmitVote {...completeProps} />
            </QueryClientProvider>
        );
    };

    it('rejects a connected wallet that is not a live Safe owner', async () => {
        useWalletAccountSpy.mockReturnValue({
            address: nonOwner,
            chainId: 11_155_111,
            isConnecting: false,
            isReconnecting: false,
        });
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        );

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.ownerRequired',
            ),
        ).toBeInTheDocument();
        expect(screen.queryByText(/WalletConnect/i)).not.toBeInTheDocument();
    });

    it('keeps an EOA owner actionable on a pre-v1.4.1 Safe', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                owners: [owner],
                threshold: 1,
                version: '1.3.0',
            }),
        });

        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).toBeEnabled();
    });

    it('degrades explicitly for a contract owner on a pre-v1.4.1 Safe', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                owners: [owner],
                threshold: 1,
                version: '1.3.0',
            }),
        });
        useBytecodeSpy.mockReturnValue({
            data: '0x1234',
            isLoading: false,
        } as ReturnType<typeof Wagmi.useBytecode>);

        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.versionUnsupported (version=1.3.0)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).toBeDisabled();
    });

    it('offers execution when the pending report has reached threshold', () => {
        const transaction = generateSafeMultisigTransaction({
            confirmationsRequired: 1,
            confirmations: [generateSafeConfirmation({ owner })],
        });
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction,
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.LIVE,
                status: ProposalStatus.ACTIVE,
                hasNonceCompetition: false,
            },
            hasConnectedWalletSigned: true,
            approvalsAmount: 1,
        });

        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeApproval',
            }),
        ).toBeEnabled();
    });

    it('proposes gaslessly and executes after a threshold-one signature', async () => {
        const signature = {
            signer: owner,
            data: '0xsignature',
            isContractSignature: false,
            staticPart: jest.fn(),
            dynamicPart: jest.fn(),
        };
        const safeTransaction = {
            data: {
                to: baseState.safeInfo.address,
                value: '0',
                data: '0xreport',
                operation: 0,
                safeTxGas: '0',
                baseGas: '0',
                gasPrice: '0',
                gasToken: '0x0000000000000000000000000000000000000000',
                refundReceiver: '0x0000000000000000000000000000000000000000',
                nonce: 0,
            },
            addSignature: jest.fn(),
            encodedSignatures: jest.fn(() => '0xsignatureBytes'),
        };
        const protocolKit = {
            createTransaction: jest.fn().mockResolvedValue(safeTransaction),
            getTransactionHash: jest
                .fn()
                .mockResolvedValue(`0x${'1'.repeat(64)}`),
            signHash: jest.fn().mockResolvedValue(signature),
            getEncodedTransaction: jest
                .fn()
                .mockResolvedValue('0xexecTransaction'),
        };
        const protocolKitModule = jest.requireMock(
            '@safe-global/protocol-kit',
        ) as {
            default: { init: jest.Mock };
            buildSignatureBytes: jest.Mock;
        };
        protocolKitModule.default.init.mockResolvedValue(protocolKit);
        protocolKitModule.buildSignatureBytes.mockReturnValue(
            '0xsignatureBytes',
        );
        jest.mocked(WagmiActions.getConnection).mockReturnValue({
            connector: {
                getProvider: jest
                    .fn()
                    .mockResolvedValue({ request: jest.fn() }),
            },
        } as never);
        jest.mocked(WagmiActions.sendTransaction).mockResolvedValue(
            `0x${'2'.repeat(64)}`,
        );
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            {} as never,
        );

        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        );

        await waitFor(() => {
            expect(proposeMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        safeTransactionData: safeTransaction.data,
                        senderAddress: owner,
                        senderSignature: signature.data,
                    }),
                }),
            );
        });
        expect(protocolKit.createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ options: { nonce: 0 } }),
        );
        expect(protocolKitModule.buildSignatureBytes).toHaveBeenCalledWith([
            signature,
        ]);
        expect(
            jest.mocked(WagmiActions.sendTransaction).mock.calls[0][1],
        ).toEqual(expect.objectContaining({ data: '0xexecTransaction' }));
        expect(WagmiActions.waitForTransactionReceipt).toHaveBeenCalled();
    });
});
