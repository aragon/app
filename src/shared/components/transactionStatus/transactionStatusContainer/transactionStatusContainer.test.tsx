import { render, screen } from '@testing-library/react';
import type { TransactionStatusState } from '../transactionStatusStep';
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

    it('renders a success feedback when last step has success state', () => {
        const states = ['idle', 'success'] as const;
        const steps = states.map((state, index) => ({
            id: index.toString(),
            order: index,
            meta: { label: index.toString(), state },
        }));
        render(createTestComponent({ steps }));
        expect(screen.getByRole('list').className).toMatch(/success/);
    });

    it.each([
        { feedback: 'error', states: ['success', 'error', 'idle'], className: 'critical' },
        { feedback: 'warning', states: ['success', 'warning'], className: 'warning' },
        { feedback: 'loading', states: ['success', 'success', 'pending', 'idle'], className: 'primary' },
    ])('renders a $feedback state when one of the steps $feedback state', ({ states, className }) => {
        const steps = states.map((state, index) => ({
            id: index.toString(),
            order: index,
            meta: { label: index.toString(), state: state as TransactionStatusState },
        }));
        render(createTestComponent({ steps }));
        expect(screen.getByRole('list').className).toMatch(new RegExp(className));
    });
});
