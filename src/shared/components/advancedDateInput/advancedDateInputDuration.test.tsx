import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdvancedDateInputDuration, type IAdvancedDateInputDurationProps } from './advancedDateInputDuration';

describe('<AdvancedDateInputDuration /> component', () => {
    const createTestComponent = (props?: Partial<IAdvancedDateInputDurationProps>) => {
        const completeProps: IAdvancedDateInputDurationProps = {
            field: 'testField',
            label: 'Test Label',
            minDuration: 3600,
            ...props,
        };

        return (
            <FormWrapper>
                <AdvancedDateInputDuration {...completeProps} />
            </FormWrapper>
        );
    };

    it('validates duration input', async () => {
        render(
            createTestComponent({
                label: 'Duration',
                infoText: 'Minimum duration is 1 hour',
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

        await waitFor(() => {
            expect(alert).toHaveTextContent(/shared.formField.error.validate \(name=Duration\)/);
        });

        // Set a valid duration
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '2');

        await waitFor(() => {
            expect(alert).toHaveTextContent('Minimum duration is 1 hour');
        });
    });
});
