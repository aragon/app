import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import type { ICreateProcessFormStage } from '../../../createProcessFormDefinitions';

export interface IStageTypeFieldProps {
    /**
     * Prefix to be prepended to the field name.
     */
    fieldPrefix: string;
}

export const StageTypeField: React.FC<IStageTypeFieldProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const { onChange: onTypeChange, ...stageTypeField } = useFormField<ICreateProcessFormStage, 'type'>('type', {
        label: 'Type',
        defaultValue: 'normal',
        fieldPrefix: fieldPrefix,
    });

    const handleTypeChange = (value: string) => {
        onTypeChange(value);

        // Make sure earlyStageAdvance is false when governance type is optimistic
        if (value === 'optimistic' || value === 'timelock') {
            setValue(`${fieldPrefix}.earlyStageAdvance`, false);
        }
        // If a user has previously set a body for the stage, clear it when changing the stage type to timelock
        if (value === 'timelock') {
            setValue(`${fieldPrefix}.bodies`, []);
        }
    };

    return (
        <RadioGroup
            onValueChange={handleTypeChange}
            helpText={t('app.governance.createProcessForm.stage.type.helpText')}
            {...stageTypeField}
        >
            <RadioCard
                className="w-full"
                label={t('app.governance.createProcessForm.stage.type.normal.label')}
                description={t('app.governance.createProcessForm.stage.type.normal.description')}
                value="normal"
            />
            <RadioCard
                className="w-full"
                label={t('app.governance.createProcessForm.stage.type.optimistic.label')}
                description={t('app.governance.createProcessForm.stage.type.optimistic.description')}
                value="optimistic"
            />
            <RadioCard
                className="w-full"
                label={t('app.governance.createProcessForm.stage.type.timelock.label')}
                description={t('app.governance.createProcessForm.stage.type.timelock.description')}
                value="timelock"
            />
        </RadioGroup>
    );
};
