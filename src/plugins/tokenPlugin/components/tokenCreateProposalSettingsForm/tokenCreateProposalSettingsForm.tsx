import { AdvancedDateInput } from '@/shared/components/advancedDateInput';
import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputDate, InputNumber, InputText, InputTime } from '@aragon/ods';
import { useState } from 'react';

export interface ITokenCreateProposalSettingsFormProps {}

export interface ICreateProposalFormFixedDateTime {
    date: string;
    time: string;
}

export interface ICreateProposalFormDuration {
    minutes: number;
    hours: number;
    days: number;
}

export interface ICreateProposalFormData {
    startTimeMode: 'now' | 'fixed';
    startTimeFixed?: ICreateProposalFormFixedDateTime;
    endTimeMode: 'duration' | 'fixed';
    endTimeDuration: ICreateProposalFormDuration;
    endTimeFixed: ICreateProposalFormFixedDateTime;
}

export const TokenCreateProposalSettingsForm: React.FC<ITokenCreateProposalSettingsFormProps> = () => {
    const [startTimeMode, setStartTimeMode] = useState<'now' | 'fixed'>('now');
    const [endTimeMode, setEndTimeMode] = useState<'duration' | 'fixed'>('duration');

    const startDateField = useFormField('start date', {
        label: 'Start date',
        rules: { required: startTimeMode === 'fixed' },
    });

    const startTimeField = useFormField('start time', {
        label: 'Start time',
        rules: { required: startTimeMode === 'fixed' },
    });

    const endDateField = useFormField('endTimeFixed.date', {
        label: 'End date',
        rules: {
            required: endTimeMode === 'fixed',
            validate: (value) => {
                if (startTimeMode === 'fixed' && endTimeMode === 'fixed') {
                    const startDate = new Date(`${startDateField.value}T${startTimeField.value}`);
                    const endDate = new Date(`${value}T${endTimeField.value}`);
                    return endDate > startDate || 'End time must be after start time';
                }
                return true;
            },
        },
    });

    const endTimeField = useFormField('endTimeFixed.time', {
        label: 'End time',
        rules: { required: endTimeMode === 'fixed' },
    });

    const endDurationMinutesField = useFormField('endTimeDuration.minutes', {
        label: 'Minutes',
        rules: { required: endTimeMode === 'duration', min: 0, max: 59 },
    });

    const endDurationHoursField = useFormField('endTimeDuration.hours', {
        label: 'Hours',
        rules: { required: endTimeMode === 'duration', min: 0, max: 23 },
    });

    const endDurationDaysField = useFormField('endTimeDuration.days', {
        label: 'Days',
        rules: { required: endTimeMode === 'duration', min: 0 },
    });

    const durationErrors = endDurationDaysField.alert ?? endDurationHoursField.alert ?? endDurationMinutesField.alert;
    const fixedErrors = endDateField.alert ?? endTimeField.alert;

    return (
        <>
            <AdvancedDateInput
                label="Start Time"
                helpText="Define when a proposal should be active to receive approvals. If now is selected, the proposal is immediately active after publishing."
                useDuration={false}
                value={startTimeMode}
                onChange={(value) => setStartTimeMode(value as 'now' | 'fixed')}
            />
            {startTimeMode === 'fixed' && (
                <Card className="flex flex-row justify-between gap-4 p-6">
                    <InputDate className="flex-1" {...startDateField} />
                    <InputTime className="flex-1" {...startTimeField} />
                    <InputText className="flex-1" label="Timezone" placeholder="UTC +2" disabled={true} />
                </Card>
            )}
            <AdvancedDateInput
                label="Expiration Time"
                helpText="Define when a proposal should expire. After the expiration time, there is no way to approve or execute the proposal."
                useDuration={true}
                value={endTimeMode}
                onChange={(value) => setEndTimeMode(value as 'duration' | 'fixed')}
            />
            {endTimeMode === 'fixed' && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-row justify-between gap-4">
                        <InputDate className="flex-1" {...endDateField} />
                        <InputTime className="flex-1" {...endTimeField} />
                        <InputText className="flex-1" label="Timezone" placeholder="UTC +2" disabled={true} />
                    </div>
                    <AlertCard
                        message="Expiration time"
                        description={
                            fixedErrors
                                ? 'One hour is the minimum expiration time'
                                : "It's recommended to have an expiration time of five days, so you have a clean proposal list."
                        }
                        variant={fixedErrors ? 'critical' : 'info'}
                    />
                </Card>
            )}
            {endTimeMode === 'duration' && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-row justify-between gap-4">
                        <InputNumber className="flex-1" placeholder="0 min" {...endDurationMinutesField} />
                        <InputNumber className="flex-1" placeholder="0 h" {...endDurationHoursField} />
                        <InputNumber className="flex-1" placeholder="7 d" {...endDurationDaysField} />
                    </div>
                    <AlertCard
                        message="Expiration time"
                        description={
                            durationErrors
                                ? 'One hour is the minimum expiration time'
                                : "It's recommended to have an expiration time of five days, so you have a clean proposal list."
                        }
                        variant={durationErrors ? 'critical' : 'info'}
                    />
                </Card>
            )}
        </>
    );
};
