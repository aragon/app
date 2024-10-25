import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
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

    const { onChange: onTypeChange, ...stageTypeField } = useFormField<ICreateProcessFormStage, 'type'>('type', {
        label: 'Type',
        defaultValue: 'normal',
        fieldPrefix: fieldPrefix,
    });

    return (
        <RadioGroup
            className="flex flex-col gap-x-4 md:!flex-row"
            onValueChange={onTypeChange}
            helpText={t('app.governance.createProcessForm.stage.type.helpText')}
            {...stageTypeField}
        >
            <RadioCard
                className="w-full"
                label={t('app.governance.createProcessForm.stage.type.normal')}
                value="normal"
            />
            <RadioCard
                className="w-full"
                label={t('app.governance.createProcessForm.stage.type.optimistic')}
                value="optimistic"
            />
        </RadioGroup>
    );
};
