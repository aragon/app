import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import {
    AdvancedDateInputDuration,
    type IAdvancedDateInputDurationProps,
} from './advancedDateInputDuration';

const testField = 'startTime';

const getDurationInputs = () => ({
    minutesInput: screen.getByLabelText(
        /shared.advancedDateInput.duration.minutes/,
    ),
    hoursInput: screen.getByLabelText(
        /shared.advancedDateInput.duration.hours/,
    ),
    daysInput: screen.getByLabelText(/shared.advancedDateInput.duration.days/),
});

describe('<AdvancedDateInputDuration /> component', () => {
    // The assertions read the value this component writes onto the form, which is its own output.
    // Asserting the rendered input value instead would assert how the kit masks keystrokes.
    let form: UseFormReturn | undefined;

    const createTestComponent = (
        props?: Partial<IAdvancedDateInputDurationProps>,
    ) => {
        const completeProps: IAdvancedDateInputDurationProps = {
            field: testField,
            label: 'Test Label',
            ...props,
        };

        const TestHarness = () => {
            form = useForm();

            return (
                <FormProvider {...form}>
                    <AdvancedDateInputDuration {...completeProps} />
                </FormProvider>
            );
        };

        return <TestHarness />;
    };

    afterEach(() => {
        form = undefined;
    });

    it('sets the parsed minutes, hours and days on the form field', async () => {
        render(createTestComponent());
        const { minutesInput, hoursInput, daysInput } = getDurationInputs();

        await userEvent.type(minutesInput, '30');
        await userEvent.type(hoursInput, '2');
        await userEvent.type(daysInput, '5');

        expect(form?.getValues(testField)).toEqual({
            days: 5,
            hours: 2,
            minutes: 30,
        });
    });

    it('sets zero on the form field when an input is emptied', async () => {
        render(createTestComponent());
        const { minutesInput } = getDurationInputs();

        await userEvent.type(minutesInput, '30');
        await userEvent.clear(minutesInput);

        expect(form?.getValues(testField)).toEqual({
            days: 0,
            hours: 0,
            minutes: 0,
        });
    });

    it('sets the duration as seconds on the form field when useSecondsFormat is set', async () => {
        render(createTestComponent({ useSecondsFormat: true }));
        const { hoursInput } = getDurationInputs();

        await userEvent.type(hoursInput, '2');

        expect(form?.getValues(testField)).toBe(7200);
    });

    it('sets a min-duration error on the form field and clears it once the duration is valid', async () => {
        render(
            createTestComponent({
                minDuration: { days: 0, hours: 1, minutes: 0 },
                validateMinDuration: true,
            }),
        );
        const { minutesInput, hoursInput } = getDurationInputs();

        await userEvent.clear(hoursInput);
        await userEvent.type(minutesInput, '30');
        await userEvent.tab();

        expect(form?.getFieldState(testField).error?.message).toBe(
            'app.shared.advancedDateInput.duration.error.minDuration',
        );

        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '2');
        await userEvent.tab();

        expect(form?.getFieldState(testField).error).toBeUndefined();
    });
});
