import { GukModulesProvider } from '@aragon/gov-ui-kit';
import type * as ReactQuery from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as Wagmi from 'wagmi';
import * as DaoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
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
import {
    governanceServiceKeys,
    type IProposal,
} from '../../api/governanceService';
import { generateProposal } from '../../testUtils';
import {
    type IVoteDialogParams,
    type IVoteDialogProps,
    VoteDialog,
} from './voteDialog';

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
    useParams: jest.fn(() => ({})),
}));

describe('<VoteDialog />', () => {
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const invalidateQueries = jest.fn();

    beforeEach(() => {
        useConnectionSpy.mockReturnValue({
            address: '0xVoter',
        } as unknown as Wagmi.UseConnectionReturnType);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({
                    plugins: [generateDaoPlugin({ address: '0xVotePlugin' })],
                }),
            }),
        );
        (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });
    });

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDaoSpy.mockReset();
        invalidateQueries.mockReset();
        (TransactionDialog as jest.Mock).mockClear();
    });

    const generateDialogLocation = (
        proposal: IProposal,
    ): IDialogLocation<IVoteDialogParams> => ({
        id: 'test',
        params: {
            daoId: 'test-dao',
            plugin: generateDaoPlugin({ address: proposal.pluginAddress }),
            proposal,
            vote: { label: 'yes', value: 1 },
        },
    });

    const createTestComponent = (props: IVoteDialogProps) => (
        <GukModulesProvider>
            <VoteDialog {...props} />
        </GukModulesProvider>
    );

    it('invalidates the connected user vote query after indexing completes', () => {
        const proposal = generateProposal({
            id: 'proposal-id',
            network: Network.ETHEREUM_SEPOLIA,
            pluginAddress: '0xVotePlugin',
        });
        const location = generateDialogLocation(proposal);

        render(createTestComponent({ location }));

        expect(invalidateQueries).not.toHaveBeenCalled();

        const { onIndexed } = (TransactionDialog as jest.Mock).mock
            .calls[0][0] as ITransactionDialogProps;

        expect(onIndexed).toBeInstanceOf(Function);

        act(() => {
            onIndexed!({ slug: undefined });
        });

        const queryKey = governanceServiceKeys.voteList({
            queryParams: {
                proposalId: proposal.id,
                pluginAddress: proposal.pluginAddress,
                address: '0xVoter',
                network: proposal.network,
            },
        });

        expect(invalidateQueries).toHaveBeenCalledTimes(1);
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey });
    });
});
