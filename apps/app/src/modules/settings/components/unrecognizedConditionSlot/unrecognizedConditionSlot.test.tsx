import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { UnrecognizedConditionSlot } from './unrecognizedConditionSlot';

describe('<UnrecognizedConditionSlot /> component', () => {
    const createTestComponent = () => (
        <GukModulesProvider>
            <UnrecognizedConditionSlot />
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
});
