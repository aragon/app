import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import type {
    ISafeMultisigTransaction,
    ISafePaginatedResponse,
} from '@/shared/api/safeService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateReactQueryResultSuccess,
    generateSafeConfirmation,
    generateSafeTransaction,
} from '@/shared/testUtils';
import {
    type ISafePendingTransactionListProps,
    SafePendingTransactionList,
} from './safePendingTransactionList';

describe('<SafePendingTransactionList /> component', () => {
    const useSafePendingTransactionsSpy = jest.spyOn(
        safeServiceApi,
        'useSafePendingTransactions',
    );

    const generateResponse = (results: ISafeMultisigTransaction[]) =>
        generateReactQueryResultSuccess<
            ISafePaginatedResponse<ISafeMultisigTransaction>,
            Error
        >({
            data: {
                count: results.length,
                next: null,
                previous: null,
                results,
            },
        });

    beforeEach(() => {
        useSafePendingTransactionsSpy.mockReturnValue(generateResponse([]));
    });

    afterEach(() => {
        useSafePendingTransactionsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafePendingTransactionListProps>,
    ) => {
        const completeProps: ISafePendingTransactionListProps = {
            network: Network.ETHEREUM_MAINNET,
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            currentNonce: '10',
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

    it('does not query the queue until the current nonce of the Safe is known', () => {
        render(createTestComponent({ currentNonce: undefined }));

        expect(useSafePendingTransactionsSpy).toHaveBeenCalledWith(
            expect.anything(),
            { enabled: false },
        );
        expect(
            screen.queryByText(
                'app.safe.safePendingTransactionList.empty.heading',
            ),
        ).not.toBeInTheDocument();
    });
});
