import { type IAdvancedDateInputProps } from '@/shared/components/advancedDateInput/types';
import { FormWrapper } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { useWatch } from 'react-hook-form';
import {
    MultisigCreateProposalSettingsForm,
    type IMultisigCreateProposalSettingsFormProps,
} from './multisigCreateProposalSettingsForm';

jest.mock('react-hook-form');
jest.mock('@/shared/components/advancedDateInput', () => ({
    AdvancedDateInput: ({
        label,
        helpText,
        field,
        infoText,
        isStartField,
        useDuration,
        startTime,
    }: IAdvancedDateInputProps) => (
        <div data-testid="advanced-date-input">
            <div>Label: {label}</div>
            <div>Help Text: {helpText}</div>
            <div>Field: {field}</div>
            <div>Info Text: {infoText}</div>
            <div>Is Start Field: {isStartField ? 'true' : 'false'}</div>
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
        return (
            <FormWrapper>
                <MultisigCreateProposalSettingsForm {...props} />
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
        expect(startTimeInput).toHaveTextContent(
            'Label: app.plugins.multisig.createProposalSettingsForm.startTime.label',
        );
        expect(startTimeInput).toHaveTextContent(
            'Help Text: app.plugins.multisig.createProposalSettingsForm.startTime.helpText',
        );
        expect(startTimeInput).toHaveTextContent(
            'Field: app.plugins.multisig.createProposalSettingsForm.startTime.field',
        );
        expect(startTimeInput).toHaveTextContent(
            'Info Text: app.plugins.multisig.createProposalSettingsForm.startTime.infoText',
        );
        expect(startTimeInput).toHaveTextContent('Is Start Field: true');
    });

    it('passes correct props to end time AdvancedDateInput', () => {
        render(createTestComponent());
        const endTimeInput = screen.getAllByTestId('advanced-date-input')[1];
        expect(endTimeInput).toHaveTextContent('Label: app.plugins.multisig.createProposalSettingsForm.endTime.label');
        expect(endTimeInput).toHaveTextContent(
            'Help Text: app.plugins.multisig.createProposalSettingsForm.endTime.helpText',
        );
        expect(endTimeInput).toHaveTextContent('Field: app.plugins.multisig.createProposalSettingsForm.endTime.field');
        expect(endTimeInput).toHaveTextContent(
            'Info Text: app.plugins.multisig.createProposalSettingsForm.endTime.infoText',
        );
        expect(endTimeInput).toHaveTextContent('Use Duration: true');
        expect(endTimeInput).toHaveTextContent('Start Time: {"date":"2024-09-01","time":"12:00"}');
    });

    it('watches for startTimeFixed changes', () => {
        render(createTestComponent());
        expect(useWatch).toHaveBeenCalledWith({ name: 'startTimeFixed' });
    });
});
