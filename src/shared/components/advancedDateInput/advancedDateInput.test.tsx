import { FormWrapper } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { AdvancedDateInput } from './advancedDateInput';
import { AdvancedDateInputFields, type IAdvancedDateInputProps } from './advancedInput.api';

jest.mock('./advancedDateInputFixed', () => ({
    AdvancedDateInputFixed: () => <div data-testid="fixed-input-mock" />,
}));

jest.mock('./advancedDateInputDuration', () => ({
    AdvancedDateInputDuration: () => <div data-testid="duration-input-mock" />,
}));

describe('<AdvancedDateInput /> component', () => {
    const createTestComponent = (props?: Partial<IAdvancedDateInputProps>) => {
        const completeProps: IAdvancedDateInputProps = {
            label: 'Test Label',
            field: AdvancedDateInputFields.START_TIME,
            helpText: 'Test Help Text',
            minTime: DateTime.now(),
            ...props,
        };

        return (
            <FormWrapper>
                <AdvancedDateInput {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the component with default props', () => {
        render(createTestComponent());

        expect(screen.getByText('Test Help Text')).toBeInTheDocument();
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('renders AdvancedDateInputFixed when mode is FIXED', async () => {
        render(createTestComponent());

        const fixedRadio = screen.getByRole('radio', { name: /shared.advancedDateInput.fixed.label/ });
        await userEvent.click(fixedRadio);

        expect(screen.getByTestId('fixed-input-mock')).toBeInTheDocument();
    });

    it('renders AdvancedDateInputDuration when useDuration is true and mode is DURATION', async () => {
        render(createTestComponent({ useDuration: true }));

        const durationRadio = screen.getByRole('radio', { name: /shared.advancedDateInput.duration.label/ });
        await userEvent.click(durationRadio);

        expect(screen.getByTestId('duration-input-mock')).toBeInTheDocument();
    });

    it('switches between input modes correctly', async () => {
        render(createTestComponent({ useDuration: true }));

        const durationRadio = screen.getByRole('radio', { name: /shared.advancedDateInput.duration.label/ });
        const fixedRadio = screen.getByRole('radio', { name: /shared.advancedDateInput.fixed.label/ });

        await userEvent.click(fixedRadio);
        expect(screen.getByTestId('fixed-input-mock')).toBeInTheDocument();

        await userEvent.click(durationRadio);
        expect(screen.getByTestId('duration-input-mock')).toBeInTheDocument();
    });
});
