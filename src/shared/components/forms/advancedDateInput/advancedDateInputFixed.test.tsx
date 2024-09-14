import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { AdvancedDateInputFixed, type IAdvancedDateInputFixedProps } from './advancedDateInputFixed';

describe('<AdvancedDateInputFixed /> component', () => {
    const createTestComponent = (props?: Partial<IAdvancedDateInputFixedProps>) => {
        const completeProps: IAdvancedDateInputFixedProps = {
            field: 'startTime',
            label: 'Test Label',
            minDuration: { days: 0, hours: 1, minutes: 0 },
            minTime: DateTime.now(),
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

        expect(screen.getByLabelText(/advancedDateInput.fixed.date/)).toBeInTheDocument();
        expect(screen.getByLabelText(/advancedDateInput.fixed.time/)).toBeInTheDocument();
    });

    it('validates fixed date-time input', async () => {
        const minTime = DateTime.fromISO('2024-09-01T12:00:00');
        const infoText = 'End time must be after start time';
        const minDuration = { days: 0, hours: 1, minutes: 0 };
        const label = 'End Time';
        render(createTestComponent({ label, infoText, minDuration, minTime }));

        const dateInput = screen.getByLabelText(/advancedDateInput.fixed.date/);
        const timeInput = screen.getByLabelText(/advancedDateInput.fixed.time/);
        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent(infoText);

        // Set an end time less than minDuration from start time
        await userEvent.clear(dateInput);
        await userEvent.clear(timeInput);
        await userEvent.type(dateInput, '2024-09-01');
        await userEvent.type(timeInput, '12:30');
        await userEvent.tab();

        await waitFor(() => expect(alert).toHaveTextContent(/formField.error.validate \(name=End Time\)/));

        // Set a valid date-time
        await userEvent.clear(timeInput);
        await userEvent.type(timeInput, '13:30');
        await userEvent.tab();

        await waitFor(() => expect(alert).toHaveTextContent(infoText));
    });
});
