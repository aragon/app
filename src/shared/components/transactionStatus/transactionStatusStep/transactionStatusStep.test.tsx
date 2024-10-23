import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { TransactionStatusStep } from './transactionStatusStep';
import type { ITransactionStatusStepProps } from './transactionStatusStep.api';

describe('<TransactionStatusStep /> component', () => {
    const createTestComponent = (props?: Partial<ITransactionStatusStepProps>) => {
        const completeProps: ITransactionStatusStepProps = {
            id: 'test',
            order: 0,
            meta: { label: 'label', state: 'idle' },
            ...props,
        };

        return <TransactionStatusStep {...completeProps} />;
    };

    it('renders a list item with the specified label', () => {
        const meta = { label: 'step-label', state: 'idle' as const };
        render(createTestComponent({ meta }));
        expect(screen.getByRole('listitem')).toBeInTheDocument();
        expect(screen.getByText(meta.label)).toBeInTheDocument();
    });

    it('renders a spinner on idle state', () => {
        render(createTestComponent({ meta: { label: '', state: 'idle' as const } }));
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders a spinner on pending state', () => {
        render(createTestComponent({ meta: { label: '', state: 'pending' as const } }));
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders a warning icon on warning state', () => {
        render(createTestComponent({ meta: { label: '', state: 'warning' as const } }));
        expect(screen.getByTestId(IconType.WARNING)).toBeInTheDocument();
    });

    it('renders a critical icon on error state', () => {
        render(createTestComponent({ meta: { label: '', state: 'error' as const } }));
        expect(screen.getByTestId(IconType.CRITICAL)).toBeInTheDocument();
    });

    it('renders a success icon on success state', () => {
        render(createTestComponent({ meta: { label: '', state: 'success' as const } }));
        expect(screen.getByTestId(IconType.CHECKMARK)).toBeInTheDocument();
    });

    it('renders a link when the addon property is a link', () => {
        const meta = {
            label: '',
            state: 'idle' as const,
            addon: { href: '/test', label: 'link-addon' },
        };
        render(createTestComponent({ meta }));
        expect(screen.getByRole('link', { name: meta.addon.label })).toBeInTheDocument();
    });

    it('renders the addon label and icon when set', () => {
        const meta = {
            label: '',
            state: 'idle' as const,
            addon: { label: 'text-addon', icon: IconType.BLOCKCHAIN_WALLET },
        };
        render(createTestComponent({ meta }));
        expect(screen.getByText(meta.addon.label)).toBeInTheDocument();
        expect(screen.getByTestId(meta.addon.icon)).toBeInTheDocument();
    });

    it('renders the errorLabel instead of the label when state is error', () => {
        const meta = { label: 'default-label', errorLabel: 'error-label', state: 'error' as const };
        render(createTestComponent({ meta }));
        expect(screen.getByText(meta.errorLabel)).toBeInTheDocument();
        expect(screen.queryByText(meta.label)).not.toBeInTheDocument();
    });

    it('renders the warningLabel instead of the label when state is warning', () => {
        const meta = { label: 'default-label', warningLabel: 'warning-label', state: 'warning' as const };
        render(createTestComponent({ meta }));
        expect(screen.getByText(meta.warningLabel)).toBeInTheDocument();
        expect(screen.queryByText(meta.label)).not.toBeInTheDocument();
    });

    it('renders the label when state is error but errorLabel is not set', () => {
        const meta = { label: 'my-label', errorLabel: undefined, state: 'error' as const };
        render(createTestComponent({ meta }));
        expect(screen.getByText(meta.label)).toBeInTheDocument();
    });
});
