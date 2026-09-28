import { GukModulesProvider } from '@aragon/gov-ui-kit';
import type * as ReactQuery from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import * as DaoService from '@/shared/api/daoService';
import type { IDialogLocation } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogProps,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { GovernanceServiceKey } from '../../api/governanceService';
import { generateProposal } from '../../testUtils';
import { type IVoteDialogParams, VoteDialog } from './voteDialog';

jest.mock('@tanstack/react-query', () => {
    const actual = jest.requireActual<typeof ReactQuery>(
        '@tanstack/react-query',
    );
    return {
        ...actual,
        useQueryClient: jest.fn(),
    };
});

jest.mock('@/shared/components/transactionDialog', () => {
    const actual = jest.requireActual<
        typeof import('@/shared/components/transactionDialog')
    >('@/shared/components/transactionDialog');
    return {
        ...actual,
        TransactionDialog: jest.fn((props: { children: ReactNode }) => (
            <div data-testid="transaction-dialog">{props.children}</div>
        )),
    };
});

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));

describe('<VoteDialog />', () => {
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const invalidateQueries = jest.fn();

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: '0x1111111111111111111111111111111111111111',
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useDaoSpy.mockReset();
        invalidateQueries.mockReset();
        (TransactionDialog as jest.Mock).mockClear();
    });

    const generateDialogLocation = (
        params?: Partial<IVoteDialogParams>,
    ): IDialogLocation<IVoteDialogParams> => ({
        id: 'test',
        params: {
            daoId: 'test-dao',
            plugin: generateDaoPlugin(),
            proposal: generateProposal(),
            vote: { label: 'yes', value: 1 },
            ...params,
        },
    });

    const createTestComponent = (
        location: IDialogLocation<IVoteDialogParams>,
    ) => (
        <GukModulesProvider>
            <VoteDialog location={location} />
        </GukModulesProvider>
    );

    it('preserves vote-list invalidation and notifies the caller after indexing', () => {
        const onIndexed = jest.fn();
        const onSuccess = jest.fn();
        const location = generateDialogLocation({ onIndexed, onSuccess });

        render(createTestComponent(location));

        const transactionDialogProps = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as ITransactionDialogProps;

        expect(transactionDialogProps.onSuccess).toBe(onSuccess);

        act(() => {
            transactionDialogProps.onIndexed?.({ slug: undefined });
        });

        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: [GovernanceServiceKey.VOTE_LIST],
        });
        expect(onIndexed).toHaveBeenCalledTimes(1);
        expect(invalidateQueries.mock.invocationCallOrder[0]).toBeLessThan(
            onIndexed.mock.invocationCallOrder[0],
        );
    });

    it('keeps indexing behavior unchanged when the caller omits the callback', () => {
        const location = generateDialogLocation();

        render(createTestComponent(location));

        const transactionDialogProps = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as ITransactionDialogProps;

        expect(() => {
            act(() => {
                transactionDialogProps.onIndexed?.({ slug: undefined });
            });
        }).not.toThrow();
        expect(invalidateQueries).toHaveBeenCalledTimes(1);
    });
});
