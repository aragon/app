import { render, screen } from '@testing-library/react';
import { NoConditionSlot } from './noConditionSlot';

describe('<NoConditionSlot /> component', () => {
    it('renders only a compact dash placeholder', () => {
        render(<NoConditionSlot />);

        expect(
            screen.getByTestId('no-condition-placeholder'),
        ).toHaveTextContent('-');
        expect(screen.queryByText(/noConditionSlot/)).not.toBeInTheDocument();
    });
});
