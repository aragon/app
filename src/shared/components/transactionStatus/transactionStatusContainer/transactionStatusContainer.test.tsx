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
        expect(list.className).toMatch(/primary/);
    });

    it('renders an error feedback when one of the steps has error state', () => {
        const states = ['success', 'error', 'idle'] as const;
        const steps = states.map((state, index) => ({
            id: `${index}`,
            order: index,
            meta: { label: `${index}`, state },
        }));
        render(createTestComponent({ steps }));
        expect(screen.getByRole('list').className).toMatch(/critical/);
    });

    it('renders a success feedback all the steps have success state', () => {
        const states = ['success', 'success'] as const;
        const steps = states.map((state, index) => ({
            id: `${index}`,
            order: index,
            meta: { label: `${index}`, state },
        }));
        render(createTestComponent({ steps }));
        expect(screen.getByRole('list').className).toMatch(/success/);
    });
});
