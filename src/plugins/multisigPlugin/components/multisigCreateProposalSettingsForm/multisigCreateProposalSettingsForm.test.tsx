import type { IAdvancedDateInputProps } from '@/shared/components/advancedDateInput';
import { FormWrapper } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { useWatch } from 'react-hook-form';
import {
    MultisigCreateProposalSettingsForm,
    type IMultisigCreateProposalSettingsFormProps,
} from './multisigCreateProposalSettingsForm';

jest.mock('react-hook-form');
jest.mock('@/shared/components/advancedDateInput', () => ({
    AdvancedDateInput: ({ label, helpText, field, infoText, useDuration, startTime }: IAdvancedDateInputProps) => (
        <div data-testid="advanced-date-input">
            <div>Label: {label}</div>
            <div>Help Text: {helpText}</div>
            <div>Field: {field}</div>
            <div>Info Text: {infoText}</div>
            <div>Use Duration: {useDuration ? 'true' : 'false'}</div>
            <div>Start Time: {JSON.stringify(startTime)}</div>
        </div>
    ),
}));

describe('<MultisigCreateProposalSettingsForm /> component', () => {
    beforeEach(() => {
        (useWatch as jest.Mock).mockReturnValue({ date: '2024-09-01', time: '12:00' });
    });

    const createTestComponent = (props?: Partial<IMultisigCreateProposalSettingsFormProps>) => {
        const completeProps: IMultisigCreateProposalSettingsFormProps = {
            ...props,
        };
        return (
            <FormWrapper>
                <MultisigCreateProposalSettingsForm {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders two AdvancedDateInput components', () => {
        render(createTestComponent());
        const dateInputs = screen.getAllByTestId('advanced-date-input');
        expect(dateInputs).toHaveLength(2);
    });

    it('passes correct props to start time AdvancedDateInput', () => {
        render(createTestComponent());
        const startTimeInput = screen.getAllByTestId('advanced-date-input')[0];
        expect(startTimeInput).toHaveTextContent(/multisigCreateProposalSettingsForm.startTime.label/);
        expect(startTimeInput).toHaveTextContent(/multisigCreateProposalSettingsForm.startTime.helpText/);
        expect(startTimeInput).toHaveTextContent('startTime');
    });

    it('passes correct props to end time AdvancedDateInput', () => {
        render(createTestComponent());
        const endTimeInput = screen.getAllByTestId('advanced-date-input')[1];
        expect(endTimeInput).toHaveTextContent(/multisigCreateProposalSettingsForm.endTime.label/);
        expect(endTimeInput).toHaveTextContent(/multisigCreateProposalSettingsForm.endTime.helpText/);
        expect(endTimeInput).toHaveTextContent('endTime');
        expect(endTimeInput).toHaveTextContent(/multisigCreateProposalSettingsForm.endTime.infoText/);
        expect(endTimeInput).toHaveTextContent('Use Duration: true');
        expect(endTimeInput).toHaveTextContent('Start Time: {"date":"2024-09-01","time":"12:00"}');
    });

    it('watches for startTimeFixed changes', () => {
        render(createTestComponent());
        expect(useWatch).toHaveBeenCalledWith({ name: 'startTimeFixed' });
    });
});
