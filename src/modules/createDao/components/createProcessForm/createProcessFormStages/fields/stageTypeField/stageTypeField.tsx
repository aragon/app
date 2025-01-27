import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { ProcessStageType, type ICreateProcessFormStage } from '../../../createProcessFormDefinitions';

export interface IStageTypeFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
}

export const StageTypeField: React.FC<IStageTypeFieldProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const { onChange: onTypeChange, ...stageTypeField } = useFormField<ICreateProcessFormStage, 'type'>('type', {
        label: t('app.createDao.createProcessForm.stages.type.label'),
        defaultValue: ProcessStageType.NORMAL,
        fieldPrefix: fieldPrefix,
    });

    const handleTypeChange = (value: string) => {
        onTypeChange(value);

        // Make sure earlyStageAdvance is false when stage type is optimistic or timelock
        if (value === ProcessStageType.OPTIMISTIC || value === ProcessStageType.TIMELOCK) {
            setValue(`${fieldPrefix}.earlyStageAdvance`, false);
        }

        // Make sure stage has no bodies when stage type is timelock
        if (value === ProcessStageType.TIMELOCK) {
            setValue(`${fieldPrefix}.bodies`, []);
        }
    };

    return (
        <RadioGroup
            onValueChange={handleTypeChange}
            helpText={t('app.createDao.createProcessForm.stages.type.helpText')}
            {...stageTypeField}
        >
            {Object.values(ProcessStageType).map((type) => (
                <RadioCard
                    key={type}
                    label={t(`app.createDao.createProcessForm.stages.type.list.${type}.label`)}
                    description={t(`app.createDao.createProcessForm.stages.type.list.${type}.description`)}
                    value={type}
                />
            ))}
        </RadioGroup>
    );
};
