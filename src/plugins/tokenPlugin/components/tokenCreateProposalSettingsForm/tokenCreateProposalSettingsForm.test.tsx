import type { IAdvancedDateInputProps } from '@/shared/components/forms/advancedDateInput';
import { FormWrapper, generateDaoPlugin } from '@/shared/testUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { render, screen } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import { generateTokenPluginSettings } from '../../testUtils';
import {
    TokenCreateProposalSettingsForm,
    type ITokenCreateProposalSettingsFormProps,
} from './tokenCreateProposalSettingsForm';

jest.mock('@/shared/components/forms/advancedDateInput', () => ({
    AdvancedDateInput: ({ label, helpText, field, infoText, useDuration, minDuration }: IAdvancedDateInputProps) => (
        <div data-testid="advanced-date-input">
            <div>Label: {label}</div>
            <div>Help Text: {helpText}</div>
            <div>Field: {field}</div>
            <div>Info Text: {infoText}</div>
            <div>Use Duration: {useDuration ? 'true' : 'false'}</div>
            <div>Min Duration: {JSON.stringify(minDuration)}</div>
        </div>
    ),
}));

describe('<TokenCreateProposalSettingsForm /> component', () => {
    const secondsToDaysHoursMinutesSpy = jest.spyOn(dateUtils, 'secondsToDuration');
    const useWatchSpy = jest.spyOn(ReactHookForm, 'useWatch');

    beforeEach(() => {
        secondsToDaysHoursMinutesSpy.mockReturnValue({ days: 0, hours: 1, minutes: 0 });
        useWatchSpy.mockReturnValue({ date: '2024-09-01', time: '12:00' });
    });

    afterEach(() => {
        secondsToDaysHoursMinutesSpy.mockReset();
        useWatchSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenCreateProposalSettingsFormProps>) => {
        const completeProps: ITokenCreateProposalSettingsFormProps = {
            plugin: generateDaoPlugin({ settings: generateTokenPluginSettings() }),
            ...props,
        };
        return (
            <FormWrapper>
                <TokenCreateProposalSettingsForm {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders two AdvancedDateInput components', () => {
        render(createTestComponent());
        const dateInputs = screen.getAllByTestId('advanced-date-input');
        expect(dateInputs).toHaveLength(2);
    });

    it('watches for startTimeFixed changes', () => {
        render(createTestComponent());
        expect(useWatchSpy).toHaveBeenCalledWith({ name: 'startTimeFixed' });
    });

    it('passes correct props to start time AdvancedDateInput', () => {
        render(createTestComponent());
        const startTimeInput = screen.getAllByTestId('advanced-date-input')[0];
        expect(startTimeInput).toHaveTextContent(/tokenCreateProposalSettingsForm.startTime.label/);
        expect(startTimeInput).toHaveTextContent(/tokenCreateProposalSettingsForm.startTime.helpText/);
        expect(startTimeInput).toHaveTextContent('startTime');
    });

    it('passes correct props to end time AdvancedDateInput', () => {
        render(createTestComponent());
        const endTimeInput = screen.getAllByTestId('advanced-date-input')[1];
        expect(endTimeInput).toHaveTextContent(/tokenCreateProposalSettingsForm.endTime.label/);
        expect(endTimeInput).toHaveTextContent(/tokenCreateProposalSettingsForm.endTime.helpText/);
        expect(endTimeInput).toHaveTextContent('endTime');
        expect(endTimeInput).toHaveTextContent(
            /tokenCreateProposalSettingsForm.endTime.infoText \(days=0,hours=1,minutes=0\)/,
        );
        expect(endTimeInput).toHaveTextContent('Use Duration: true');
        expect(endTimeInput).toHaveTextContent('Min Duration: {"days":0,"hours":1,"minutes":0}');
    });

    it('uses the correct min duration from the plugin settings', () => {
        const pluginSettings = generateTokenPluginSettings({ minDuration: 3600 });
        const plugin = generateDaoPlugin({ settings: pluginSettings });
        render(createTestComponent({ plugin }));
        expect(secondsToDaysHoursMinutesSpy).toHaveBeenCalledWith(3600);
    });
});
