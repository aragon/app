import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdvancedDateInputDuration, type IAdvancedDateInputDurationProps } from './advancedDateInputDuration';

describe('<AdvancedDateInputDuration /> component', () => {
    const createTestComponent = (props?: Partial<IAdvancedDateInputDurationProps>) => {
        const completeProps: IAdvancedDateInputDurationProps = {
            field: 'startTime',
            label: 'Test Label',
            ...props,
        };

        return (
            <FormWrapper>
                <AdvancedDateInputDuration {...completeProps} />
            </FormWrapper>
        );
    };

    it('validates duration input with minimum 1 hour', async () => {
        const label = 'Duration';
        const infoText = 'Minimum duration is 1 hour';
        const minDuration = { days: 0, hours: 1, minutes: 0 };
        const validateMinDuration = true;

        render(createTestComponent({ label, infoText, minDuration, validateMinDuration }));

        const minutesInput = screen.getByLabelText(/shared.advancedDateInput.duration.minutes/);
        const hoursInput = screen.getByLabelText(/shared.advancedDateInput.duration.hours/);
        const daysInput = screen.getByLabelText(/shared.advancedDateInput.duration.days/);
        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent(infoText);

        // Set a duration less than minDuration
        await userEvent.clear(minutesInput);
        await userEvent.clear(hoursInput);
        await userEvent.clear(daysInput);
        await userEvent.type(minutesInput, '30');
        await userEvent.tab();

        await waitFor(() => expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=Duration/));

        // Set a valid duration
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '2');
        await userEvent.tab();

        await waitFor(() => expect(alert).toHaveTextContent(infoText));
    });

    it('does not allow invalid values on inputs', async () => {
        render(createTestComponent());

        const minutesInput = screen.getByLabelText(/shared.advancedDateInput.duration.minutes/);
        const hoursInput = screen.getByLabelText(/shared.advancedDateInput.duration.hours/);

        // Try to set minutes to 60. Only the 6 should be accepted
        await userEvent.clear(minutesInput);
        await userEvent.type(minutesInput, '60');

        expect(minutesInput).toHaveValue('6 min');

        // Try to set hours to 24. Only 2 should be accepted
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '24');

        expect(hoursInput).toHaveValue('2 h');
    });
});
