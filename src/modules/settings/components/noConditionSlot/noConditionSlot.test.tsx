import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { NoConditionSlot } from './noConditionSlot';

describe('<NoConditionSlot /> component', () => {
    const createTestComponent = () => (
        <GukModulesProvider>
            <NoConditionSlot />
        </GukModulesProvider>
    );

    it('renders the no condition heading and description copy', () => {
        render(createTestComponent());

        expect(screen.getByText(/noConditionSlot.heading/)).toBeInTheDocument();
        expect(
            screen.getByText(/noConditionSlot.description/),
        ).toBeInTheDocument();
    });
});
