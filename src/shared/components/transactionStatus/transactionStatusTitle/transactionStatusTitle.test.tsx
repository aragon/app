import {
    type ITransactionStatusTitleProps,
    TransactionStatusTitle,
} from '@/shared/components/transactionStatus/transactionStatusTitle/transactionStatusTitle';
import { render, screen } from '@testing-library/react';

describe('<TransactionStatusTitle /> component', () => {
    const renderComponent = (props?: Partial<ITransactionStatusTitleProps>) => {
        const completeProps: ITransactionStatusTitleProps = {
            title: 'Test Title',
            ...props,
        };

        return render(<TransactionStatusTitle {...completeProps} />);
    };

    it('renders only the title when multistep is not provided', () => {
        const title = 'Solo Test Title';
        renderComponent({ title });

        expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();

        expect(screen.queryByText(/Step/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/of/i)).not.toBeInTheDocument();
    });

    it('renders the title from multistep when passed explicitly and multistep info when provided', () => {
        const multistep = {
            title: 'Multistep Title',
            current: 2,
            total: 5,
        };

        renderComponent({ title: multistep.title, multistep });

        expect(screen.getByRole('heading', { name: multistep.title })).toBeInTheDocument();

        expect(
            screen.getByText((text) => text.includes(`current=${multistep.current.toString()}`)),
        ).toBeInTheDocument();
        expect(screen.getByText((text) => text.includes(`total=${multistep.total.toString()}`))).toBeInTheDocument();
    });
});
