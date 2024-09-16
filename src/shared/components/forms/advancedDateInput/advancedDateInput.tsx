import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/ods';
import { useTranslations } from '../../translationsProvider';
import type { IAdvancedDateInputProps } from './advancedDateInput.api';
import { AdvancedDateInputDuration } from './advancedDateInputDuration';
import { AdvancedDateInputFixed } from './advancedDateInputFixed';

export const AdvancedDateInput: React.FC<IAdvancedDateInputProps> = (props) => {
    const { useDuration = false, label, helpText, minDuration, field, infoText, minTime, validateMinDuration } = props;
    const { t } = useTranslations();

    const dateModeFieldName = `${field}Mode`;
    const dateFixedFieldName = `${field}Fixed`;
    const dateDurationFieldName = `${field}Duration`;

    const inputModeField = useFormField<Record<string, 'duration' | 'now' | 'fixed'>, typeof dateModeFieldName>(
        dateModeFieldName,
        { label, defaultValue: useDuration ? 'duration' : 'now' },
    );

    const radioLabel = useDuration
        ? t('app.shared.advancedDateInput.duration.label')
        : t('app.shared.advancedDateInput.now');

    return (
        <div className="flex flex-col gap-2">
            <RadioGroup
                className="flex gap-4 md:!flex-row"
                helpText={helpText}
                onValueChange={inputModeField.onChange}
                {...inputModeField}
            >
                <RadioCard
                    className="w-full"
                    label={radioLabel}
                    description=""
                    value={useDuration ? 'duration' : 'now'}
                />
                <RadioCard
                    className="w-full"
                    label={t('app.shared.advancedDateInput.fixed.label')}
                    description=""
                    value="fixed"
                />
            </RadioGroup>
            {inputModeField.value === 'fixed' && (
                <AdvancedDateInputFixed
                    field={dateFixedFieldName}
                    label={label}
                    infoText={infoText}
                    minDuration={minDuration}
                    minTime={minTime}
                    validateMinDuration={validateMinDuration}
                />
            )}
            {inputModeField.value === 'duration' && (
                <AdvancedDateInputDuration
                    field={dateDurationFieldName}
                    label={label}
                    infoText={infoText}
                    minDuration={minDuration}
                    validateMinDuration={validateMinDuration}
                />
            )}
        </div>
    );
};
