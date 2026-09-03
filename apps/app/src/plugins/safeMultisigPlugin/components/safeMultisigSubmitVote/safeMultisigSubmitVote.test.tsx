import { ProposalStatus } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
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
import * as transactionServiceApi from '@/shared/api/transactionService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as networkSwitchApi from '@/shared/hooks/useNetworkSwitch';
import {
    generateDialogContext,
    generateSafeNextNonceResponse,
} from '@/shared/testUtils';
import {
    SafeMultisigPluginDialogId,
    safeIndexingTimeout,
} from '../../constants';
import * as safeBodyStateApi from '../../hooks/useSafeMultisigBodyState';
import {
    generateSafeBodyState,
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
    const getSafeNextNonceSpy = jest.spyOn(
        safeServiceApi.safeService,
        'getSafeNextNonce',
    );
    const useTransactionStatusSpy = jest.spyOn(
        transactionServiceApi,
        'useTransactionStatus',
    );
    const dialogOpen = jest.fn();
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useBytecodeSpy = jest.spyOn(Wagmi, 'useBytecode');
    const proposeMutateAsync = jest.fn();
    const confirmMutateAsync = jest.fn();

    const safeInfo = generateSafeInfo({ threshold: 1, owners: [owner] });

    const baseState = generateSafeBodyState({
        safeInfo,
        minApprovals: 1,
        membersCount: 1,
    });

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
        // Standing in for the owner confirming the dialog, so the tests below exercise the signing
        // path rather than stopping at the confirmation step.
        dialogOpen.mockImplementation((_id, options) => {
            const params = options?.params as
                | { onConfirm?: () => void }
                | undefined;
            params?.onConfirm?.();
        });
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: dialogOpen }),
        );
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
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '0',
                currentNonce: '0',
            }),
        );
        // The report stays unattributed unless a test says otherwise, so the indexing hold is the
        // default post-execution state rather than a network-dependent one.
        useTransactionStatusSpy.mockReturnValue({ data: undefined } as never);
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
            externalAddress: safeInfo.address,
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

    it('states that the Safe can still act after the voting window closed', () => {
        // The most surprising thing about a Safe body: Aragon's window closes, the Safe queue has
        // no deadline, and a verdict still counts while the stage can still advance.
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            canStillAffectOutcome: true,
        });

        render(
            createTestComponent({
                stage: generateSppStage({
                    stageIndex: 1,
                    voteDuration: 60,
                    maxAdvance: 60 * 60 * 24,
                }),
                proposal: generateSppProposal({
                    network: Network.ETHEREUM_SEPOLIA,
                    stageIndex: 1,
                    lastStageTransition: Math.floor(Date.now() / 1000) - 3600,
                }),
            }),
        );

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.windowClosed',
            ),
        ).toBeInTheDocument();
    });

    it('withholds the action and names the expiry once the stage can never advance', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            canStillAffectOutcome: false,
        });

        render(createTestComponent());

        // Executing would still succeed against the Safe and still change nothing, so offering it
        // would be a lie.
        expect(
            screen.queryByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.stageExpired',
            ),
        ).toBeInTheDocument();
    });

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
            isExecutableNow: true,
        });

        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        ).toBeEnabled();
    });

    it('confirms the governance effect before producing a signature', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        );

        expect(dialogOpen).toHaveBeenCalledWith(
            SafeMultisigPluginDialogId.CONFIRM_SIGNATURE,
            expect.objectContaining({
                params: expect.objectContaining({
                    isVeto: false,
                    safeAddress: safeInfo.address,
                    signerAddress: owner,
                }),
            }),
        );
    });

    it('sends execution straight to the wallet, which already prices the transaction', async () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '0',
                    confirmationsRequired: 1,
                    confirmations: [generateSafeConfirmation({ owner })],
                }),
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
            isExecutableNow: true,
        });

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        );

        // A gasless-signature confirmation in front of a gas-paying transaction would be a lie.
        expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('offers a re-queue when the pending report lost its nonce', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: generateSafeMultisigTransaction({
                    confirmationsRequired: 1,
                    confirmations: [generateSafeConfirmation({ owner })],
                }),
                report: {
                    proposalId: BigInt(1),
                    stageId: 1,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
                state: SafeTransactionState.SUPERSEDED,
                status: ProposalStatus.EXPIRED,
                hasNonceCompetition: false,
            },
            hasConnectedWalletSigned: true,
            approvalsAmount: 1,
        });

        render(createTestComponent());

        // A superseded report has collected signatures but can never execute, so the owner must be
        // able to sign a replacement rather than being told to wait for the other owners.
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.requeueSafeTransaction',
            }),
        ).toBeEnabled();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.replaced',
            ),
        ).toBeInTheDocument();
    });

    it('withholds execution while earlier Safe transactions are still ahead', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            safeInfo: generateSafeInfo({
                threshold: 1,
                owners: [owner],
                nonce: '4',
            }),
            pendingReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '6',
                    confirmationsRequired: 1,
                    confirmations: [generateSafeConfirmation({ owner })],
                }),
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
            isExecutableNow: false,
            transactionsAhead: 2,
        });

        render(createTestComponent());

        // Fully confirmed but not executable: a Safe runs in nonce order and a confirmation is
        // bound to its slot, so the owner is waiting on the queue. The action stays named for what
        // is pending - executing the Safe transaction - but must not be offered as available.
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        ).toBeDisabled();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.nonceQueued (count=2)',
            ),
        ).toBeInTheDocument();
    });

    it('names execution as the second gate once the threshold is met', () => {
        // gov-ui-kit's card says "approval reached" at threshold, but a Safe body has told Aragon
        // nothing until its transaction executes - so the card alone overstates the position.
        useSafeBodyStateSpy.mockReturnValue({
            ...baseState,
            pendingReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '0',
                    confirmationsRequired: 1,
                    confirmations: [generateSafeConfirmation({ owner })],
                }),
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
            isExecutableNow: true,
        });

        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.executeSafeTransaction',
            }),
        ).toBeEnabled();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.awaitingExecution',
            ),
        ).toBeInTheDocument();
    });

    it('offers a retry when the Safe read is stale, instead of passing the count off as current', () => {
        useSafeBodyStateSpy.mockReturnValue({ ...baseState, isStale: true });

        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigSubmitVote.unreachable',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.retry',
            }),
        ).toBeEnabled();
    });

    const mockThresholdOneExecution = () => {
        const signature = {
            signer: owner,
            data: '0xsignature',
            isContractSignature: false,
            staticPart: jest.fn(),
            dynamicPart: jest.fn(),
        };
        const safeTransaction = {
            data: {
                to: safeInfo.address,
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

        return { signature, safeTransaction, protocolKit, protocolKitModule };
    };

    it('proposes gaslessly and executes after a threshold-one signature', async () => {
        const { signature, safeTransaction, protocolKit, protocolKitModule } =
            mockThresholdOneExecution();
        // The Safe sits at nonce 6 and the queue already occupies it, so the backend resolves the
        // next free nonce to 7. Signing at the current nonce would compete with what is there.
        getSafeNextNonceSpy.mockResolvedValue(
            generateSafeNextNonceResponse({
                nextNonce: '7',
                currentNonce: '6',
            }),
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
        // The service reads the live nonce itself; nothing from the polled body state is passed in,
        // because a polled value can lag and a stale floor allocates a consumed nonce.
        expect(getSafeNextNonceSpy).toHaveBeenCalledWith({
            urlParams: {
                network: Network.ETHEREUM_SEPOLIA,
                address: safeInfo.address,
            },
        });
        expect(protocolKit.createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ options: { nonce: 7 } }),
        );
        expect(protocolKitModule.buildSignatureBytes).toHaveBeenCalledWith([
            signature,
        ]);
        expect(
            jest.mocked(WagmiActions.sendTransaction).mock.calls[0][1],
        ).toEqual(expect.objectContaining({ data: '0xexecTransaction' }));
        expect(WagmiActions.waitForTransactionReceipt).toHaveBeenCalled();
    });

    it('holds the action while an executed report is not indexed yet', async () => {
        mockThresholdOneExecution();

        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
            }),
        );

        // The executed report has left the Safe queue but the indexed body result does not exist
        // yet. Re-offering the idle CTA here would invite a duplicate report at the next nonce.
        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.finalizing',
                }),
            ).toBeDisabled();
        });
    });

    it('releases the hold when the executed report is never indexed', async () => {
        jest.useFakeTimers();

        try {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            });
            mockThresholdOneExecution();

            render(createTestComponent());
            await user.click(
                screen.getByRole('button', {
                    name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
                }),
            );
            await waitFor(() =>
                expect(
                    WagmiActions.waitForTransactionReceipt,
                ).toHaveBeenCalled(),
            );

            // A stalled indexer is indistinguishable from a slow one, so the hold must expire
            // instead of leaving the owner behind a permanent spinner with no way out.
            await act(async () => {
                jest.advanceTimersByTime(safeIndexingTimeout);
                await Promise.resolve();
            });

            expect(
                screen.getByRole('button', {
                    name: 'app.plugins.safeMultisig.safeMultisigSubmitVote.approve',
                }),
            ).toBeEnabled();
            expect(
                screen.getByText(
                    'app.plugins.safeMultisig.safeMultisigSubmitVote.indexingDelayed',
                ),
            ).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });
});
