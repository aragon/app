import { FormWrapper } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { AdvancedDateInput } from './advancedDateInput';
import { type IAdvancedDateInputProps } from './advancedDateInput.api';

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
            field: 'startTime',
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

    it('renders the label and the radio-group to select the date input type', () => {
        const label = 'input-label';
        const helpText = 'input-help-text';
        render(createTestComponent({ label, helpText }));

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(helpText)).toBeInTheDocument();
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('renders AdvancedDateInputFixed when mode is fixed', async () => {
        render(createTestComponent());

        const fixedRadio = screen.getByRole('radio', { name: /advancedDateInput.fixed.label/ });
        await userEvent.click(fixedRadio);

        expect(screen.getByTestId('fixed-input-mock')).toBeInTheDocument();
    });

    it('renders AdvancedDateInputDuration when useDuration is true and mode is duration', async () => {
        render(createTestComponent({ useDuration: true }));

        const durationRadio = screen.getByRole('radio', { name: /advancedDateInput.duration.label/ });
        await userEvent.click(durationRadio);

        expect(screen.getByTestId('duration-input-mock')).toBeInTheDocument();
    });

    it('switches between input modes correctly', async () => {
        render(createTestComponent({ useDuration: true }));

        const durationRadio = screen.getByRole('radio', { name: /advancedDateInput.duration.label/ });
        const fixedRadio = screen.getByRole('radio', { name: /advancedDateInput.fixed.label/ });

        await userEvent.click(fixedRadio);
        expect(screen.getByTestId('fixed-input-mock')).toBeInTheDocument();

        await userEvent.click(durationRadio);
        expect(screen.getByTestId('duration-input-mock')).toBeInTheDocument();
    });
});
