import * as daoService from '@/shared/api/daoService';
import { type IAdvancedDateInputProps } from '@/shared/components/advancedDateInput/types';
import { FormWrapper, generateReactQueryResultSuccess } from '@/shared/testUtils';
import * as createProposalUtils from '@/shared/utils/createProposalUtils';
import { convertSecondsToDaysHoursMinutes } from '@/shared/utils/createProposalUtils';
import { render, screen } from '@testing-library/react';
import { useWatch } from 'react-hook-form';
import { generateDaoTokenSettings } from '../../testUtils';
import {
    TokenCreateProposalSettingsForm,
    type ITokenCreateProposalSettingsFormProps,
} from './tokenCreateProposalSettingsForm';

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
        minDuration,
    }: IAdvancedDateInputProps) => (
        <div data-testid="advanced-date-input">
            <div>Label: {label}</div>
            <div>Help Text: {helpText}</div>
            <div>Field: {field}</div>
            <div>Info Text: {infoText}</div>
            <div>Is Start Field: {isStartField ? 'true' : 'false'}</div>
            <div>Use Duration: {useDuration ? 'true' : 'false'}</div>
            <div>Start Time: {JSON.stringify(startTime)}</div>
            <div>Min Duration: {minDuration}</div>
        </div>
    ),
}));

describe('<TokenCreateProposalSettingsForm /> component', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');
    const useConvertSecondsToDaysHoursMinutesSpy = jest.spyOn(createProposalUtils, 'convertSecondsToDaysHoursMinutes');

    beforeEach(() => {
        (useWatch as jest.Mock).mockReturnValue({ date: '2024-09-01', time: '12:00' });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));
        useConvertSecondsToDaysHoursMinutesSpy.mockReturnValue({ days: 0, hours: 1, minutes: 0 });
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
        useConvertSecondsToDaysHoursMinutesSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenCreateProposalSettingsFormProps>) => {
        const completeProps: ITokenCreateProposalSettingsFormProps = {
            daoId: 'test-dao-id',
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

    it('passes correct props to start time AdvancedDateInput', () => {
        render(createTestComponent());
        const startTimeInput = screen.getAllByTestId('advanced-date-input')[0];
        expect(startTimeInput).toHaveTextContent('Label: app.plugins.token.createProposalSettingsForm.startTime.label');
        expect(startTimeInput).toHaveTextContent(
            'Help Text: app.plugins.token.createProposalSettingsForm.startTime.helpText',
        );
        expect(startTimeInput).toHaveTextContent('Field: app.plugins.token.createProposalSettingsForm.startTime.field');
        expect(startTimeInput).toHaveTextContent('Is Start Field: true');
    });

    it('passes correct props to end time AdvancedDateInput', () => {
        render(createTestComponent());
        const endTimeInput = screen.getAllByTestId('advanced-date-input')[1];
        expect(endTimeInput).toHaveTextContent('Label: app.plugins.token.createProposalSettingsForm.endTime.label');
        expect(endTimeInput).toHaveTextContent(
            'Help Text: app.plugins.token.createProposalSettingsForm.endTime.helpText',
        );
        expect(endTimeInput).toHaveTextContent('Field: app.plugins.token.createProposalSettingsForm.endTime.field');
        expect(endTimeInput).toHaveTextContent(
            'Info Text: app.plugins.token.createProposalSettingsForm.endTime.infoText (days=0,hours=1,minutes=0)',
        );
        expect(endTimeInput).toHaveTextContent('Use Duration: true');
        expect(endTimeInput).toHaveTextContent('Start Time: {"date":"2024-09-01","time":"12:00"}');
        expect(endTimeInput).toHaveTextContent('Min Duration: 0');
    });

    it('fetches DAO settings with correct params', () => {
        render(createTestComponent({ daoId: 'My DAO' }));
        expect(useDaoSettingsSpy).toHaveBeenCalledWith({ urlParams: { daoId: 'My DAO' } });
    });

    it('watches for startTimeFixed changes', () => {
        render(createTestComponent());
        expect(useWatch).toHaveBeenCalledWith({ name: 'startTimeFixed' });
    });

    it('fetches the correct min duration from the dao settings', () => {
        const baseSettings = generateDaoTokenSettings();
        const daoSettings = generateDaoTokenSettings({
            ...baseSettings,
            settings: { ...baseSettings.settings, minDuration: 3600 },
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: daoSettings }));
        render(createTestComponent());
        expect(convertSecondsToDaysHoursMinutes).toHaveBeenCalledWith(3600);
    });

    it('handles undefined minDuration', () => {
        render(createTestComponent());
        const endTimeInput = screen.getAllByTestId('advanced-date-input')[1];
        expect(endTimeInput).toHaveTextContent('Min Duration: 0');
        expect(useConvertSecondsToDaysHoursMinutesSpy).toHaveBeenCalledWith(0);
    });
});
