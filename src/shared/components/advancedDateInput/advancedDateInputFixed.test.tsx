import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { AdvancedDateInputFixed, type IAdvancedDateInputFixedProps } from './advancedDateInputFixed';

describe('<AdvancedDateInputFixed /> component', () => {
    const createTestComponent = (props?: Partial<IAdvancedDateInputFixedProps>) => {
        const completeProps: IAdvancedDateInputFixedProps = {
            field: 'testField',
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

        expect(screen.getByLabelText(/shared.advancedDateInput.fixed.date/)).toBeInTheDocument();
        expect(screen.getByLabelText(/shared.advancedDateInput.fixed.time/)).toBeInTheDocument();
    });

    it('validates fixed date-time input', async () => {
        const minTime = DateTime.fromISO('2024-09-01T12:00:00');
        render(
            createTestComponent({
                label: 'End Time',
                infoText: 'End time must be after start time',
                minDuration: { days: 0, hours: 1, minutes: 0 },
                minTime,
                validateMinDuration: true,
            }),
        );

        const dateInput = screen.getByLabelText(/shared.advancedDateInput.fixed.date/);
        const timeInput = screen.getByLabelText(/shared.advancedDateInput.fixed.time/);
        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent('End time must be after start time');

        // Set an end time less than minDuration from start time
        await userEvent.clear(dateInput);
        await userEvent.clear(timeInput);
        await userEvent.type(dateInput, '2024-09-01');
        await userEvent.type(timeInput, '12:30');

        await waitFor(() => {
            expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=End Time\)/);
        });

        // Set a valid date-time
        await userEvent.clear(timeInput);
        await userEvent.type(timeInput, '13:30');

        await waitFor(() => {
            expect(alert).toHaveTextContent('End time must be after start time');
        });
    });

    it('validates fixed date-time input without minDuration', async () => {
        const minTime = DateTime.fromISO('2024-09-01T12:00:00');
        render(
            createTestComponent({
                label: 'End Time',
                infoText: 'End time must be after start time',
                minTime,
                minDuration: undefined,
                validateMinDuration: false,
            }),
        );

        const dateInput = screen.getByLabelText(/shared.advancedDateInput.fixed.date/);
        const timeInput = screen.getByLabelText(/shared.advancedDateInput.fixed.time/);
        const alert = screen.getByRole('alert');

        // Set a time exactly at minTime
        await userEvent.clear(dateInput);
        await userEvent.clear(timeInput);
        await userEvent.type(dateInput, '2024-09-01');
        await userEvent.type(timeInput, '12:00');

        await waitFor(() => {
            expect(alert).toHaveTextContent('End time must be after start time');
        });

        // Set a time before minTime
        await userEvent.clear(timeInput);
        await userEvent.type(timeInput, '11:59');

        await waitFor(() => {
            expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=End Time\)/);
        });
    });

    it('validates fixed date-time input when past date is passed', async () => {
        const now = DateTime.now();
        render(
            createTestComponent({
                label: 'End Time',
                infoText: 'End time must be in the future',
                minTime: now,
                minDuration: undefined,
                validateMinDuration: false,
            }),
        );

        const dateInput = screen.getByLabelText(/shared.advancedDateInput.fixed.date/);
        const timeInput = screen.getByLabelText(/shared.advancedDateInput.fixed.time/);
        const alert = screen.getByRole('alert');

        // Set a date in the past
        await userEvent.clear(dateInput);
        await userEvent.clear(timeInput);
        await userEvent.type(dateInput, now.minus({ days: 1 }).toFormat('yyyy-MM-dd'));
        await userEvent.type(timeInput, now.toFormat('HH:mm'));

        await waitFor(() => {
            expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=End Time\)/);
        });

        // Set a valid future date
        await userEvent.clear(dateInput);
        await userEvent.type(dateInput, now.plus({ days: 1 }).toFormat('yyyy-MM-dd'));

        await waitFor(() => {
            expect(alert).toHaveTextContent('End time must be in the future');
        });
    });
});
