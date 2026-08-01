import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { UnrecognizedConditionSlot } from './unrecognizedConditionSlot';

describe('<UnrecognizedConditionSlot /> component', () => {
    const conditionAddress = '0x1234567890abcdef1234567890abcdef12345678';

    const createTestComponent = (
        props?: ComponentProps<typeof UnrecognizedConditionSlot>,
    ) => (
        <GukModulesProvider>
            <UnrecognizedConditionSlot {...props} />
        </GukModulesProvider>
    );

    it('renders a compact placeholder when the condition address is missing', () => {
        render(createTestComponent());

        expect(screen.getByTestId('unrecognized-condition')).toHaveTextContent(
            '-',
        );
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders the unrecognized condition address with explorer access', () => {
        render(createTestComponent({ chainId: 1, conditionAddress }));

        expect(
            screen.getByTestId('unrecognized-condition'),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionsList.details.condition/),
        ).toBeInTheDocument();

        const conditionLink = screen.getByRole('link', {
            name: /0x1234.*5678/i,
        });

        expect(conditionLink).toHaveAttribute(
            'href',
            expect.stringContaining(conditionAddress),
        );
    });
});
