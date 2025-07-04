import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { ProcessStageType } from '../../../../components/createProcessForm';
import type { ISetupStageSettingsForm } from '../../setupStageSettingsDialogDefinitions';

export interface IStageTypeFieldProps {}

export const SetupStageType: React.FC = () => {
    const { t } = useTranslations();
    const { control, setValue } = useFormContext<ISetupStageSettingsForm>();

    const {
        value: stageType,
        onChange: onTypeChange,
        ...stageTypeField
    } = useFormField<ISetupStageSettingsForm, 'type'>('type', {
        label: t('app.createDao.setupStageSettingsDialog.fields.stageType.label'),
        defaultValue: ProcessStageType.NORMAL,
        control,
    });

    const handleTypeChange = (value: string) => {
        onTypeChange(value);

        // Make sure earlyStageAdvance is false when stage type is optimistic or timelock
        if (value === ProcessStageType.OPTIMISTIC) {
            setValue(`earlyStageAdvance`, false);
        }
    };

    // Filter out timelocks as we are not showing them in this part of the UI
    const availableProcessesTypes = Object.values(ProcessStageType).filter(
        (type) => type !== ProcessStageType.TIMELOCK,
    );

    return (
        <RadioGroup
            value={stageType}
            onValueChange={handleTypeChange}
            helpText={t('app.createDao.setupStageSettingsDialog.fields.stageType.helpText')}
            {...stageTypeField}
        >
            {availableProcessesTypes.map((type) => (
                <RadioCard
                    key={type}
                    label={t(`app.createDao.setupStageSettingsDialog.fields.stageType.${type}.label`)}
                    description={t(`app.createDao.setupStageSettingsDialog.fields.stageType.${type}.description`)}
                    value={type}
                />
            ))}
        </RadioGroup>
    );
};
