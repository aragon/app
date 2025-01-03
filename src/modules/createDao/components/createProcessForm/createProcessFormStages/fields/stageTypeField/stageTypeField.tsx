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

        // Make sure earlyStageAdvance is false when governance type is optimistic
        if (value === ProcessStageType.OPTIMISTIC || value === ProcessStageType.TIMELOCK) {
            setValue(`${fieldPrefix}.earlyStageAdvance`, false);
        }
        // If a user has previously set a body for the stage, clear it when changing the stage type to timelock
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
            <RadioCard
                className="w-full"
                label={t('app.createDao.createProcessForm.stages.type.normal.label')}
                description={t('app.createDao.createProcessForm.stages.type.normal.description')}
                value={ProcessStageType.NORMAL}
            />
            <RadioCard
                className="w-full"
                label={t('app.createDao.createProcessForm.stages.type.optimistic.label')}
                description={t('app.createDao.createProcessForm.stages.type.optimistic.description')}
                value={ProcessStageType.OPTIMISTIC}
            />
            <RadioCard
                className="w-full"
                label={t('app.createDao.createProcessForm.stages.type.timelock.label')}
                description={t('app.createDao.createProcessForm.stages.type.timelock.description')}
                value={ProcessStageType.TIMELOCK}
            />
        </RadioGroup>
    );
};
