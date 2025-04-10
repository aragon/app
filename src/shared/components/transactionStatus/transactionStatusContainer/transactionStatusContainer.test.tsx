import { render, screen } from '@testing-library/react';
import { type ITransactionStatusContainerProps, TransactionStatusContainer } from './transactionStatusContainer';

describe('<TransactionStatusContainer /> component', () => {
    const createTestComponent = (props?: Partial<ITransactionStatusContainerProps>) => {
        const completeProps: ITransactionStatusContainerProps = {
            steps: [],
            ...props,
        };

        return <TransactionStatusContainer {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'test';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders a list with default state', () => {
        const steps = [{ id: '0', order: 0, meta: { label: '0', state: 'idle' as const } }];
        render(createTestComponent({ steps }));
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        expect(list.className).toMatch(/neutral/);
    });
});
