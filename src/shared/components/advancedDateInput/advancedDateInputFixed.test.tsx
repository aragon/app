import { FormWrapper } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdvancedDateInputFixed, type IAdvancedDateInputFixedProps } from './advancedDateInputFixed';

describe('<AdvancedDateInputFixed /> component', () => {
    const createTestComponent = (props?: Partial<IAdvancedDateInputFixedProps>) => {
        const completeProps: IAdvancedDateInputFixedProps = {
            field: 'testField',
            label: 'Test Label',
            minDuration: 3600,
            ...props,
        };

        return (
            <FormWrapper>
                <AdvancedDateInputFixed {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the fixed date-time inputs', () => {
        render(createTestComponent());

        expect(screen.getByLabelText(/shared.advancedDateInput.fixed.date/)).toBeInTheDocument();
        expect(screen.getByLabelText(/shared.advancedDateInput.fixed.time/)).toBeInTheDocument();
    });

    it('validates fixed date-time input', async () => {
        const startTime = { date: '2024-09-01', time: '12:00' };
        render(
            createTestComponent({
                label: 'End Time',
                infoText: 'End time must be after start time',
                startTime,
            }),
        );

        const dateInput = screen.getByLabelText(/shared.advancedDateInput.fixed.date/);
        const timeInput = screen.getByLabelText(/shared.advancedDateInput.fixed.time/);
        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent('End time must be after start time');

        // Set an end time less than minDuration from start time
        await userEvent.clear(dateInput);
        await userEvent.type(dateInput, '2024-09-01');
        await userEvent.clear(timeInput);
        await userEvent.type(timeInput, '12:30');

        expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=End Time\)/);

        // Set a valid date-time
        await userEvent.clear(timeInput);
        await userEvent.type(timeInput, '13:30');

        expect(alert).toHaveTextContent('End time must be after start time');
    });
});
