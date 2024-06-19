import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList/financeDetailsList';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { render, screen } from '@testing-library/react';
import { DaoTransactionsPageClient, type IDaoTransactionsPageClientProps } from './daoTransactionsPageClient';

jest.mock('@/shared/api/daoService', () => ({
    useDao: jest.fn(),
}));

jest.mock('@/shared/components/translationsProvider', () => ({
    useTranslations: jest.fn(),
}));

jest.mock('@/modules/finance/components/financeDetailsList/financeDetailsList', () => ({
    FinanceDetailsList: jest.fn(() => <div>Mocked FinanceDetailsList</div>),
}));

jest.mock('@/modules/finance/components/transactionList/transactionList', () => ({
    TransactionList: jest.fn(() => <div>Mocked TransactionList</div>),
}));

jest.mock('@/shared/components/page', () => ({
    Page: {
        Content: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
        Main: (props: { title: string; action: { label: string }; children: React.ReactNode }) => (
            <div>{props.children}</div>
        ),
        Aside: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
    },
}));

describe('<DaoTransactionsPageClient /> component', () => {
    const createTestComponent = (props?: Partial<IDaoTransactionsPageClientProps>) => {
        const completeProps: IDaoTransactionsPageClientProps = { id: 'test-id', ...props };
        return <DaoTransactionsPageClient {...completeProps} />;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useTranslations as jest.Mock).mockReturnValue({
            t: jest.fn(),
        });
        (useDao as jest.Mock).mockReturnValue({
            data: {
                network: 'Ethereum',
                address: '0x123',
                ens: 'dao.eth',
            },
        });
    });

    it('renders the DaoTransactionsPageClient with the provided id', () => {
        const id = 'new-test-id';
        render(createTestComponent({ id }));
        expect(screen.getByText('Mocked TransactionList')).toBeInTheDocument();
        expect(screen.getByText('Mocked FinanceDetailsList')).toBeInTheDocument();
        expect(useDao).toHaveBeenCalledWith({ urlParams: { id: id } });
    });

    it('passes the correct props to FinanceDetailsList', () => {
        render(createTestComponent());
        expect(FinanceDetailsList).toHaveBeenCalledWith(
            {
                network: 'Ethereum',
                vaultAddress: '0x123',
                ensAddress: 'dao.eth',
            },
            {},
        );
    });
});
