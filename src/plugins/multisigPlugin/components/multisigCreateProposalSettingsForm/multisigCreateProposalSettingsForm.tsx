import { AdvancedDateInput } from '@/shared/components/advancedDateInput';
import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputDate, InputNumber, InputText, InputTime } from '@aragon/ods';
import { useState } from 'react';

export interface IMultisigCreateProposalSettingsFormProps {}

export const MultisigCreateProposalSettingsForm: React.FC<IMultisigCreateProposalSettingsFormProps> = () => {
    const [startValue, setStartValue] = useState('now');
    const [endValue, setEndValue] = useState('duration');

    const startDateField = useFormField('start date', {
        label: 'Start date',
        rules: { required: true },
    });

    const startTimeField = useFormField('start time', {
        label: 'Start time',
        rules: { required: true },
    });

    const endDateField = useFormField('end date', {
        label: 'End date',
        rules: { required: true },
    });

    const endTimeField = useFormField('end time', {
        label: 'End time',
        rules: { required: true },
    });

    return (
        <>
            <AdvancedDateInput
                label="Start Time"
                helpText="Define when a proposal should be active to receive approvals. If now is selected, the proposal is immediately active after publishing."
                useDuration={false}
                value={startValue}
                onChange={setStartValue}
            />
            {startValue === 'fixed' && (
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
                value={endValue}
                onChange={setEndValue}
            />
            {endValue === 'fixed' && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-row justify-between gap-4">
                        <InputDate className="flex-1" {...endDateField} />
                        <InputTime className="flex-1" {...endTimeField} />
                        <InputText className="flex-1" label="Timezone" placeholder="UTC +2" disabled={true} />
                    </div>
                    <AlertCard
                        message="Expiration time"
                        description="It’s recommended to have an expiration time of five days, so you have a clean proposal list."
                    />
                </Card>
            )}
            {endValue === 'duration' && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-row justify-between gap-4">
                        <InputNumber className="flex-1" label="Minutes" placeholder="0 min" />
                        <InputNumber className="flex-1" label="Hours" placeholder="0 h" />
                        <InputNumber className="flex-1" label="Days" placeholder="7 d" />
                    </div>

                    <AlertCard
                        message="Expiration time"
                        description="It’s recommended to have an expiration time of five days, so you have a clean proposal list."
                    />
                </Card>
            )}
        </>
    );
};
