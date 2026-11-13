import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as connectedWalletGuardApi from '@/modules/application/hooks/useConnectedWalletGuard';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import type { IUseEnsNameReturn } from '@/modules/ens';
import * as ensModule from '@/modules/ens';
import {
    generateSafeConfirmation,
    generateSafeMultisigTransaction,
} from '@/plugins/safeMultisigPlugin/testUtils';
import { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import * as safeService from '@/shared/api/safeService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    generateDialogContext,
    generateReactQueryResultError,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
    generateReactQueryResultSuccessWithData,
} from '@/shared/testUtils';
import { generateSafeInfo } from '@/shared/testUtils/generators/safeInfo';
import {
    generateSafeInfoResponse,
    generateSafeQueueResponse,
} from '@/shared/testUtils/generators/safeResponse';
import { SafeDialogId } from '../../constants/safeDialogId';
import { safeTransactionUtils } from '../../utils/safeTransactionUtils';
import {
    type ISafeTransactionVotingProps,
    SafeTransactionVoting,
} from './safeTransactionVoting';

describe('<SafeTransactionVoting /> component', () => {
    const ownerOne = '0x1111111111111111111111111111111111111111' as const;
    const ownerTwo = '0x2222222222222222222222222222222222222222';
    const nonOwner = '0x3333333333333333333333333333333333333333' as const;
    const safeAddress = '0x5F2c8A1b9D3e7C4a6B0d2E8f1A3c5B7d9E0f2A4c';
    const safeTxHash = '0xabc';
    const rejectionTxHash = '0xdef';

    const useSafeInfoSpy = jest.spyOn(safeService, 'useSafeInfo');
    const useSafePendingTransactionSpy = jest.spyOn(
        safeService,
        'useSafePendingTransaction',
    );
    const useSafePendingTransactionsSpy = jest.spyOn(
        safeService,
        'useSafePendingTransactions',
    );
    const isRejectionSpy = jest.spyOn(safeTransactionUtils, 'isRejection');
    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );
    const useConnectedWalletGuardSpy = jest.spyOn(
        connectedWalletGuardApi,
        'useConnectedWalletGuard',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');

    const open = jest.fn();
    const checkWalletConnection = jest.fn();

    const mockSafe = (params: {
        transaction?: ISafeMultisigTransaction;
        queue?: ISafeMultisigTransaction[];
        nonce?: string;
        threshold?: number;
    }) => {
        const { transaction, queue = [], nonce = '10', threshold = 2 } = params;

        useSafePendingTransactionsSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeQueueResponse({ results: queue }),
            }),
        );

        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({
                    ...generateSafeInfo({
                        owners: [ownerOne, ownerTwo],
                        threshold,
                        nonce,
                    }),
                }),
            }),
        );
        useSafePendingTransactionSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(transaction ?? null),
        );
    };

    const mockWallet = (address?: `0x${string}`) =>
        useWalletAccountSpy.mockReturnValue({
            address,
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });

    const generateTransaction = (
        signers: string[],
        nonce = '10',
    ): ISafeMultisigTransaction =>
        generateSafeMultisigTransaction({
            safeTxHash,
            nonce,
            confirmations: signers.map((owner) =>
                generateSafeConfirmation({ owner }),
            ),
        });

    const generateRejection = (
        signers: string[],
        nonce?: string,
    ): ISafeMultisigTransaction => ({
        ...generateTransaction(signers, nonce),
        safeTxHash: rejectionTxHash,
    });

    beforeEach(() => {
        isRejectionSpy.mockImplementation(
            (params) => params.safeTxHash === rejectionTxHash,
        );
        useSafePendingTransactionsSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeService.useSafePendingTransactions
            >,
        );
        mockWallet(ownerOne);
        useConnectedWalletGuardSpy.mockReturnValue({
            check: checkWalletConnection,
            result: true,
        });
        checkWalletConnection.mockImplementation(({ onSuccess } = {}) =>
            onSuccess?.(),
        );
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        const unresolved = {
            data: null,
            isLoading: false,
        } as unknown as IUseEnsNameReturn;
        useEnsNameSpy.mockReturnValue(unresolved);
        useEnsAvatarSpy.mockReturnValue(
            unresolved as unknown as ReturnType<typeof ensModule.useEnsAvatar>,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        useSafeInfoSpy.mockReset();
        useSafePendingTransactionSpy.mockReset();
        useSafePendingTransactionsSpy.mockReset();
        isRejectionSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeTransactionVotingProps>,
    ) => {
        const completeProps: ISafeTransactionVotingProps = {
            network: Network.ETHEREUM_SEPOLIA,
            safeAddress,
            safeTxHash,
            ...props,
        };

        return (
            <GukModulesProvider>
                <SafeTransactionVoting {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the breakdown, votes and settings tabs of the transaction', () => {
        mockSafe({ transaction: generateTransaction([ownerTwo]) });
        render(createTestComponent());

        expect(
            screen.getByRole('tab', { name: 'Breakdown' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Votes' })).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: 'Settings' }),
        ).toBeInTheDocument();
    });

    it('opens the Safe transaction dialog once the wallet is connected when an owner approves', async () => {
        const onSafeStateChange = jest.fn();
        mockSafe({ transaction: generateTransaction([ownerTwo]) });
        render(createTestComponent({ onSafeStateChange }));

        await userEvent.click(
            screen.getByRole('button', {
                name: /safeTransactionVoting.approve/,
            }),
        );

        expect(checkWalletConnection).toHaveBeenCalled();
        expect(open).toHaveBeenCalledWith(SafeDialogId.TRANSACTION, {
            params: {
                network: Network.ETHEREUM_SEPOLIA,
                safeAddress,
                safeTxHash,
                onSafeStateChange,
            },
        });
    });

    it('opens the rejection of the transaction nonce once the wallet is connected when an owner rejects', async () => {
        const onSafeStateChange = jest.fn();
        mockSafe({ transaction: generateTransaction([ownerTwo], '12') });
        render(createTestComponent({ onSafeStateChange }));

        await userEvent.click(
            screen.getByRole('button', {
                name: /safeTransactionVoting.reject/,
            }),
        );

        expect(checkWalletConnection).toHaveBeenCalled();
        expect(open).toHaveBeenCalledWith(SafeDialogId.CREATE_TRANSACTION, {
            params: {
                network: Network.ETHEREUM_SEPOLIA,
                safeAddress,
                rejectedNonce: '12',
                onCreated: onSafeStateChange,
            },
        });
    });

    it.each([
        { label: 'the owner already approved', signers: [ownerOne] },
        { label: 'is ready to execute', signers: [ownerOne, ownerTwo] },
        {
            label: 'waits for an earlier nonce',
            signers: [ownerOne, ownerTwo],
            nonce: '12',
        },
    ])('offers the rejection of a transaction that $label', (params) => {
        const { signers, nonce } = params;
        mockSafe({ transaction: generateTransaction(signers, nonce) });
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting.reject/,
            }),
        ).toBeEnabled();
    });

    it('does not offer to reject a rejection, and reads no queue for it', () => {
        mockSafe({ transaction: generateRejection([ownerTwo]) });
        render(createTestComponent({ safeTxHash: rejectionTxHash }));

        expect(isRejectionSpy).toHaveBeenCalledWith({
            safeTxHash: rejectionTxHash,
            nonce: '10',
            safeAddress,
            chainId: networkDefinitions[Network.ETHEREUM_SEPOLIA].id,
        });
        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting.approve/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: /safeTransactionVoting.reject/,
            }),
        ).not.toBeInTheDocument();
        expect(useSafePendingTransactionsSpy).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({ enabled: false }),
        );
    });

    it('reports the rejection queued on the nonce of the transaction, which the owner can still sign', () => {
        mockSafe({
            transaction: generateTransaction([ownerTwo]),
            queue: [generateRejection([ownerTwo])],
        });
        render(createTestComponent());

        expect(
            screen.getByText(/safeTransactionVoting.rejectionQueued.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /rejectionQueued.description \(approvals=1,threshold=2,nonce=10\)/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting\.reject$/,
            }),
        ).toBeEnabled();
    });

    it('still offers the rejection when the queue could not be read', () => {
        mockSafe({ transaction: generateTransaction([ownerTwo]) });
        useSafePendingTransactionsSpy.mockReturnValue(
            generateReactQueryResultError({
                error: new Error('Upstream error'),
            }) as ReturnType<typeof safeService.useSafePendingTransactions>,
        );
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting\.reject$/,
            }),
        ).toBeEnabled();
        expect(
            screen.queryByText(/safeTransactionVoting.rejectionQueued/),
        ).not.toBeInTheDocument();
    });

    it('renders a disabled rejection signed button when the connected owner already signed the rejection', () => {
        mockSafe({
            transaction: generateTransaction([ownerTwo]),
            queue: [generateRejection([ownerOne])],
        });
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting\.rejected$/,
            }),
        ).toBeDisabled();
        expect(
            screen.queryByRole('button', {
                name: /safeTransactionVoting\.reject$/,
            }),
        ).not.toBeInTheDocument();
    });

    it.each([
        {
            label: 'queued on another nonce',
            transaction: generateTransaction([ownerTwo]),
            rejectionNonce: '11',
        },
        {
            label: 'of a transaction whose nonce was used',
            transaction: generateTransaction([ownerTwo], '9'),
            rejectionNonce: '9',
        },
    ])('does not report a rejection $label', (params) => {
        const { transaction, rejectionNonce } = params;
        mockSafe({
            transaction,
            queue: [generateRejection([ownerOne], rejectionNonce)],
        });
        render(createTestComponent());

        expect(
            screen.queryByText(/safeTransactionVoting.rejectionQueued/),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: /safeTransactionVoting\.rejected$/,
            }),
        ).not.toBeInTheDocument();
    });

    it('offers the approval to a disconnected viewer', () => {
        mockWallet(undefined);
        mockSafe({ transaction: generateTransaction([ownerTwo]) });
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting.approve/,
            }),
        ).toBeInTheDocument();
    });

    it('renders a disabled approved button when the connected owner already approved', () => {
        mockSafe({ transaction: generateTransaction([ownerOne]) });
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting.approved/,
            }),
        ).toBeDisabled();
    });

    it('renders no action to a connected wallet that is not an owner', () => {
        mockWallet(nonOwner);
        mockSafe({ transaction: generateTransaction([ownerTwo]) });
        render(createTestComponent());

        expect(
            screen.queryByRole('button', { name: /safeTransactionVoting/ }),
        ).not.toBeInTheDocument();
    });

    it('offers the execution once the transaction is approved on the current nonce', async () => {
        mockSafe({ transaction: generateTransaction([ownerOne, ownerTwo]) });
        render(createTestComponent());

        const executeButton = screen.getByRole('button', {
            name: /safeTransactionVoting.execute/,
        });
        expect(executeButton).toBeEnabled();

        await userEvent.click(executeButton);
        expect(open).toHaveBeenCalledWith(
            SafeDialogId.TRANSACTION,
            expect.anything(),
        );
    });

    it('disables the execution and explains why while an earlier nonce is queued', () => {
        mockSafe({
            transaction: generateTransaction([ownerOne, ownerTwo], '12'),
            nonce: '10',
        });
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting.execute/,
            }),
        ).toBeDisabled();
        expect(
            screen.getByText(
                /safeTransactionVoting.waitingForNonce.title \(currentNonce=10\)/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /safeTransactionVoting.waitingForNonce.description \(nonce=12\)/,
            ),
        ).toBeInTheDocument();
    });

    it('explains that a transaction whose nonce was used can no longer be executed', () => {
        mockSafe({
            transaction: generateTransaction([ownerTwo], '9'),
            nonce: '10',
        });
        render(createTestComponent());

        expect(
            screen.getByText(/safeTransactionVoting.superseded/),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /safeTransactionVoting/ }),
        ).not.toBeInTheDocument();
    });

    it('ignores the confirmations of addresses that are no longer owners', () => {
        mockSafe({
            transaction: generateTransaction([ownerOne, nonOwner]),
        });
        render(createTestComponent());

        // One current owner confirmed out of a threshold of two, so the transaction still awaits approvals.
        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting.approved/,
            }),
        ).toBeInTheDocument();
    });

    it('offers no action to a former owner whose approval no longer counts', () => {
        mockWallet(nonOwner);
        mockSafe({ transaction: generateTransaction([nonOwner, ownerTwo]) });
        render(createTestComponent());

        expect(
            screen.queryByRole('button', { name: /safeTransactionVoting/ }),
        ).not.toBeInTheDocument();
    });

    it('counts an owner listed twice once, so the threshold is not reached early', () => {
        mockSafe({ transaction: generateTransaction([ownerTwo, ownerTwo]) });
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /safeTransactionVoting.approve/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: /safeTransactionVoting.execute/,
            }),
        ).not.toBeInTheDocument();
    });

    it('reports a Safe that could not be read instead of loading forever', () => {
        mockSafe({ transaction: generateTransaction([ownerTwo]) });
        useSafePendingTransactionSpy.mockReturnValue(
            generateReactQueryResultError({
                error: new Error('Upstream error'),
            }) as ReturnType<typeof safeService.useSafePendingTransaction>,
        );
        render(createTestComponent());

        expect(
            screen.getByText(/safeTransactionVoting.loadError/),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('tab', { name: 'Breakdown' }),
        ).not.toBeInTheDocument();
    });

    it('renders nothing once the transaction has left the queue', () => {
        mockSafe({});
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });

    it('renders the card without actions while the Safe is loading', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeService.useSafeInfo
            >,
        );
        useSafePendingTransactionSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeService.useSafePendingTransaction
            >,
        );
        render(createTestComponent());

        expect(
            screen.getByRole('tab', { name: 'Breakdown' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /safeTransactionVoting/ }),
        ).not.toBeInTheDocument();
    });
});
