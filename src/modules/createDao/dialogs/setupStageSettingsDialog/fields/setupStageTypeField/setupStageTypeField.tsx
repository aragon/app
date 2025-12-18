import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { ProcessStageType } from '../../../../components/createProcessForm';
import type { ISetupStageSettingsForm } from '../../setupStageSettingsDialogDefinitions';

export interface IStageTypeFieldProps {}

export const SetupStageTypeField: React.FC = () => {
    const { t } = useTranslations();
    const { control, setValue } = useFormContext<ISetupStageSettingsForm>();

    const {
        value: stageType,
        onChange: onTypeChange,
        ...stageTypeField
    } = useFormField<ISetupStageSettingsForm, 'type'>('type', {
        label: t('app.createDao.setupStageSettingsDialog.fields.stageTypeField.label'),
        defaultValue: ProcessStageType.NORMAL,
        control,
    });

    const handleTypeChange = (value: string) => {
        onTypeChange(value);

        // Make sure earlyStageAdvance is false when stage type is optimistic
        if (value === ProcessStageType.OPTIMISTIC) {
            setValue('earlyStageAdvance', false);
        }
    };

    return (
        <RadioGroup
            helpText={t('app.createDao.setupStageSettingsDialog.fields.stageTypeField.helpText')}
            onValueChange={handleTypeChange}
            value={stageType}
            {...stageTypeField}
        >
            {Object.values(ProcessStageType).map((type) => (
                <RadioCard
                    description={t(`app.createDao.setupStageSettingsDialog.fields.stageTypeField.${type}.description`)}
                    key={type}
                    label={t(`app.createDao.setupStageSettingsDialog.fields.stageTypeField.${type}.label`)}
                    value={type}
                />
            ))}
        </RadioGroup>
    );
};
