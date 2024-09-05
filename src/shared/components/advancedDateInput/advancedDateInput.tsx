import { type ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/ods';
import { useWatch } from 'react-hook-form';
import { useTranslations } from '../translationsProvider';
import { AdvancedDateInputDuration } from './advancedDateInputDuration';
import { AdvancedDateInputFixed } from './advancedDateInputFixed';
import { type IAdvancedDateInputProps, InputModeOptions } from './advancedInput.api';

export const AdvancedDateInput: React.FC<IAdvancedDateInputProps> = (props) => {
    const { useDuration = false, label, helpText, minDuration = 0, field, infoText } = props;
    const { t } = useTranslations();

    // Add min duration to the form values for later use
    useFormField('minDuration', { defaultValue: minDuration });

    const modeField = useFormField(`${field}Mode`, {
        label,
        defaultValue: useDuration ? InputModeOptions.DURATION : InputModeOptions.NOW,
    });

    const startTime = useWatch<ICreateProposalFormData, 'startTimeFixed'>({ name: 'startTimeFixed' });

    return (
        <>
            <RadioGroup
                className="flex gap-4 md:!flex-row"
                helpText={helpText}
                onValueChange={modeField.onChange}
                {...modeField}
            >
                <RadioCard
                    className="w-full"
                    label={
                        useDuration
                            ? t('app.shared.advancedDateInput.duration.label')
                            : t('app.shared.advancedDateInput.now')
                    }
                    description=""
                    value={useDuration ? InputModeOptions.DURATION : InputModeOptions.NOW}
                />
                <RadioCard
                    className="w-full"
                    label={t('app.shared.advancedDateInput.fixed.label')}
                    description=""
                    value="fixed"
                />
            </RadioGroup>
            {modeField.value === InputModeOptions.FIXED && (
                <AdvancedDateInputFixed
                    field={field}
                    label={label}
                    infoText={infoText}
                    minDuration={minDuration}
                    startTime={startTime}
                />
            )}
            {modeField.value === InputModeOptions.DURATION && (
                <AdvancedDateInputDuration field={field} label={label} infoText={infoText} minDuration={minDuration} />
            )}
        </>
    );
};
