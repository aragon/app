import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import type {
    ISafeMultisigTransaction,
    ISafeQueueResponse,
} from '@/shared/api/safeService';
import * as safeServiceApi from '@/shared/api/safeService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDialogContext,
    generateReactQueryResultSuccess,
    generateSafeConfirmation,
    generateSafeQueueResponse,
    generateSafeTransaction,
} from '@/shared/testUtils';
import { SafeDialogId } from '../../constants';
import {
    type ISafePendingTransactionListProps,
    SafePendingTransactionList,
} from './safePendingTransactionList';

describe('<SafePendingTransactionList /> component', () => {
    const useSafePendingTransactionsSpy = jest.spyOn(
        safeServiceApi,
        'useSafePendingTransactions',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const openDialog = jest.fn();

    const generateResponse = (results: ISafeMultisigTransaction[]) =>
        generateReactQueryResultSuccess<ISafeQueueResponse, Error>({
            data: generateSafeQueueResponse({
                count: results.length,
                results,
            }),
        });

    beforeEach(() => {
        useSafePendingTransactionsSpy.mockReturnValue(generateResponse([]));
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openDialog }),
        );
    });

    afterEach(() => {
        useSafePendingTransactionsSpy.mockReset();
        useDialogContextSpy.mockReset();
        openDialog.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafePendingTransactionListProps>,
    ) => {
        const completeProps: ISafePendingTransactionListProps = {
            network: Network.ETHEREUM_MAINNET,
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            currentNonce: '10',
            chainId: 1,
            safeVersion: '1.4.1',
            ...props,
        };

        return (
            <GukModulesProvider>
                <SafePendingTransactionList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the nonce and confirmation progress of every queued transaction', () => {
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({
                    nonce: '11',
                    safeTxHash: '0xTxHash',
                    confirmations: [generateSafeConfirmation()],
                    confirmationsRequired: 2,
                }),
            ]),
        );
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.confirmations (count=1,required=2)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.nonce (nonce=11)',
            ),
        ).toBeInTheDocument();
    });

    it('renders an empty state when the queue is empty', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.empty.heading',
            ),
        ).toBeInTheDocument();
    });

    it('hides transactions whose nonce the Safe has already consumed', () => {
        // The backend returns every unexecuted transaction and does not filter by nonce, so a
        // permanently dead one must be dropped here rather than shown as pending.
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({ nonce: '4', safeTxHash: '0xdead' }),
                generateSafeTransaction({ nonce: '6', safeTxHash: '0xlive' }),
            ]),
        );

        render(createTestComponent({ currentNonce: '6' }));

        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.nonce (nonce=6)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.safe.safePendingTransactionList.item.nonce (nonce=4)',
            ),
        ).not.toBeInTheDocument();
    });

    it('reads the queue without waiting for the nonce', () => {
        // The two reads are independent now: gating the queue on the nonce made every view a
        // two-hop waterfall for no benefit, since liveness is derived after both have arrived.
        render(createTestComponent({ currentNonce: undefined }));

        expect(useSafePendingTransactionsSpy).toHaveBeenCalledWith({
            urlParams: expect.anything(),
        });
    });

    it('sends the exact queued transaction to review instead of confirming from the list', async () => {
        // The list shows a summary; the payload an owner authorises is the envelope itself. Passing
        // the transaction through keeps the reviewed bytes and the signed bytes the same object.
        const transaction = generateSafeTransaction({
            nonce: '11',
            safeTxHash: '0xTxHash',
        });
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([transaction]),
        );
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.safe.safePendingTransactionList.item.review',
            }),
        );

        expect(openDialog).toHaveBeenCalledWith(
            SafeDialogId.TRANSACTION_REVIEW,
            {
                params: expect.objectContaining({
                    transaction,
                    safeAddress: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
                    network: Network.ETHEREUM_MAINNET,
                    safeVersion: '1.4.1',
                }),
            },
        );
    });
});
