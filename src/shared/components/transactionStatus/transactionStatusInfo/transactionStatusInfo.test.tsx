import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { TransactionStatusInfo, type ITransactionStatusInfoProps } from './transactionStatusInfo';

describe('<TransactionStatusInfo /> component', () => {
    const renderComponent = (props?: Partial<ITransactionStatusInfoProps>) => {
        const completeProps: ITransactionStatusInfoProps = {
            title: 'Default Title',
            ...props,
        };

        return render(<TransactionStatusInfo {...completeProps} />);
    };

    it('renders only the title when current and total are not provided', () => {
        const title = 'Solo Title';

        renderComponent({ title });

        expect(screen.getByRole('heading', { name: 'Solo Title' })).toBeInTheDocument();
        expect(screen.queryByText(/Step/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/of/i)).not.toBeInTheDocument();
    });

    it('renders title, current and total if all transaction info is provided', () => {
        const title = 'Multi Title';
        const current = 1;
        const total = 3;

        renderComponent({ title, current, total });

        expect(screen.getByRole('heading', { name: 'Multi Title' })).toBeInTheDocument();
        expect(screen.getByText(/1/)).toBeInTheDocument();
        expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it('throws an error if only current is provided', () => {
        testLogger.suppressErrors();
        const current = 1;

        expect(() => renderComponent({ current })).toThrow();
    });

    it('throws an error if only total is provided', () => {
        testLogger.suppressErrors();
        const total = 2;

        expect(() => renderComponent({ total })).toThrow();
    });

    it('throws an error if current is greater than total', () => {
        testLogger.suppressErrors();
        const current = 5;
        const total = 2;

        expect(() => renderComponent({ current, total })).toThrow();
    });
});
