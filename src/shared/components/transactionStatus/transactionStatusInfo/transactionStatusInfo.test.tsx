import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { TransactionStatusInfo, type ITransactionStatusInfoProps } from './transactionStatusInfo';

describe('<TransactionStatusInfo /> component', () => {
    const createTestComponent = (props?: Partial<ITransactionStatusInfoProps>) => {
        const completeProps: ITransactionStatusInfoProps = {
            title: 'Default Title',
            ...props,
        };

        return <TransactionStatusInfo {...completeProps} />;
    };

    it('renders only the title when current and total are not provided', () => {
        const title = 'Solo Title';

        render(createTestComponent({ title }));

        expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
        expect(screen.queryByText('app.shared.transactionStatus.info.current')).not.toBeInTheDocument();
        expect(screen.queryByText('app.shared.transactionStatus.info.total')).not.toBeInTheDocument();
    });

    it('renders title, current and total if all transaction info is provided', () => {
        const title = 'Multi Title';
        const current = 1;
        const total = 3;

        render(createTestComponent({ title, current, total }));

        expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
        expect(screen.getByText(/transactionStatus\.info\.current \(current=1\)/)).toBeInTheDocument();
        expect(screen.getByText(/transactionStatus\.info\.total \(total=3\)/)).toBeInTheDocument();
    });

    it('throws an error if current is provided without total', () => {
        testLogger.suppressErrors();
        const current = 1;

        expect(() => render(createTestComponent({ current }))).toThrow();
    });

    it('throws an error if total is provided without current', () => {
        testLogger.suppressErrors();
        const total = 2;

        expect(() => render(createTestComponent({ total }))).toThrow();
    });
});
