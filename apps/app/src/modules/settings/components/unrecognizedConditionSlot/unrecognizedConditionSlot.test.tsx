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

    it('renders the unrecognized condition heading and description copy', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/unrecognizedConditionSlot.heading/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/unrecognizedConditionSlot.description/),
        ).toBeInTheDocument();
    });

    it('renders the unrecognized condition address with explorer access', () => {
        render(createTestComponent({ chainId: 1, conditionAddress }));

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
