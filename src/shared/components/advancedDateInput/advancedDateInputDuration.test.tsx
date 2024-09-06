import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdvancedDateInputDuration, type IAdvancedDateInputDurationProps } from './advancedDateInputDuration';

describe('<AdvancedDateInputDuration /> component', () => {
    const createTestComponent = (props?: Partial<IAdvancedDateInputDurationProps>) => {
        const completeProps: IAdvancedDateInputDurationProps = {
            field: 'startTime',
            label: 'Test Label',
            minDuration: { days: 0, hours: 1, minutes: 0 },
            validateMinDuration: true,
            ...props,
        };

        return (
            <FormWrapper>
                <AdvancedDateInputDuration {...completeProps} />
            </FormWrapper>
        );
    };

    it('validates duration input with minimum 1 hour', async () => {
        render(
            createTestComponent({
                label: 'Duration',
                infoText: 'Minimum duration is 1 hour',
                validateMinDuration: true,
            }),
        );

        const minutesInput = screen.getByLabelText(/shared.advancedDateInput.duration.minutes/);
        const hoursInput = screen.getByLabelText(/shared.advancedDateInput.duration.hours/);
        const daysInput = screen.getByLabelText(/shared.advancedDateInput.duration.days/);
        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent('Minimum duration is 1 hour');

        // Set a duration less than minDuration
        await userEvent.clear(minutesInput);
        await userEvent.clear(hoursInput);
        await userEvent.clear(daysInput);
        await userEvent.type(minutesInput, '30');
        await userEvent.tab();

        await waitFor(() => {
            expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=Duration\)/);
        });

        // Set a valid duration
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '2');
        await userEvent.tab();

        await waitFor(() => {
            expect(alert).toHaveTextContent('Minimum duration is 1 hour');
        });
    });

    it('validates duration input with minimum 2 days', async () => {
        render(
            createTestComponent({
                label: 'Duration',
                infoText: 'Minimum duration is 2 days',
                minDuration: { days: 2, hours: 0, minutes: 0 },
                validateMinDuration: true,
            }),
        );

        const daysInput = screen.getByLabelText(/shared.advancedDateInput.duration.days/);
        const alert = screen.getByRole('alert');

        // Set a duration less than minDuration
        await userEvent.clear(daysInput);
        await userEvent.type(daysInput, '1');
        await userEvent.tab();

        await waitFor(() => {
            expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=Duration\)/);
        });

        // Set a valid duration
        await userEvent.clear(daysInput);
        await userEvent.type(daysInput, '3');
        await userEvent.tab();

        await waitFor(() => {
            expect(alert).toHaveTextContent('Minimum duration is 2 days');
        });
    });

    it('handles min duration with days and hours set', async () => {
        render(
            createTestComponent({
                label: 'Duration',
                infoText: 'Minimum duration is 1 day and 1 hour',
                minDuration: { days: 1, hours: 1, minutes: 0 },
                validateMinDuration: true,
            }),
        );

        const hoursInput = screen.getByLabelText(/shared.advancedDateInput.duration.hours/);
        const daysInput = screen.getByLabelText(/shared.advancedDateInput.duration.days/);
        const alert = screen.getByRole('alert');

        // Set duration less than minDuration
        await userEvent.clear(hoursInput);
        await userEvent.clear(daysInput);
        await userEvent.type(daysInput, '1');
        await userEvent.tab();

        await waitFor(() => {
            expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=Duration\)/);
        });

        // Set duration to a valid amount
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '3');
        await userEvent.tab();

        await waitFor(() => {
            expect(alert).toHaveTextContent('Minimum duration is 1 day and 1 hour');
        });
    });

    it('Does not allow invalid values on inputs', async () => {
        render(createTestComponent());

        const minutesInput = screen.getByLabelText(/shared.advancedDateInput.duration.minutes/);
        const hoursInput = screen.getByLabelText(/shared.advancedDateInput.duration.hours/);

        // Try to set minutes to 60. Only the 6 should be accepted
        await userEvent.clear(minutesInput);
        await userEvent.type(minutesInput, '60');

        expect(minutesInput).toHaveValue('6');

        // Try to set hours to 24. Only 2 should be accepted
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '24');

        expect(hoursInput).toHaveValue('2');
    });
});
