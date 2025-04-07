import {
    type ITransactionStatusTitle,
    TransactionStatusTitle,
} from '@/shared/components/transactionStatus/transactionStatusTitle/transactionStatusTitle';
import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';

describe('<TransactionStatusTitle /> component', () => {
    const createTestComponent = (props?: Partial<ITransactionStatusTitle>) => {
        const completeProps: ITransactionStatusTitle = {
            title: 'test',
            current: 1,
            total: 2,
            ...props,
        };

        return <TransactionStatusTitle {...completeProps} />;
    };

    it('renders the title and step values for current and total', () => {
        const title = 'Transaction Status Title';
        const current = 1;
        const total = 3;
        render(createTestComponent({ title, current, total }));

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText((text) => text.includes(`current=${current.toString()}`))).toBeInTheDocument();
        expect(screen.getByText((text) => text.includes(`total=${total.toString()}`))).toBeInTheDocument();
    });

    it('throws an error when current is greater than total', () => {
        testLogger.suppressErrors();
        const title = 'Transaction Status Title';
        const current = 4;
        const total = 3;

        expect(() => render(createTestComponent({ title, current, total }))).toThrow();
    });

    it('throws an error when current is less than 0', () => {
        testLogger.suppressErrors();
        const title = 'Transaction Status Title';
        const current = -1;
        const total = 3;

        expect(() => render(createTestComponent({ title, current, total }))).toThrow();
    });
});
