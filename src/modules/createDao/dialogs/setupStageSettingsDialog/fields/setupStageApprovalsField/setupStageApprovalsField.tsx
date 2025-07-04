import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { useFormContext } from 'react-hook-form';
import { ProcessStageType } from '../../../../components/createProcessForm';
import type { ISetupStageSettingsForm } from '../../setupStageSettingsDialogDefinitions';

export interface ISetupStageApprovalsFieldProps {
    /**
     * Type of the stage.
     */
    stageType: ProcessStageType;
    /**
     * Number of bodies of the stage.
     */
    bodyCount: number;
}

const requiredApprovalsDefaultValue = 1;

export const SetupStageApprovalsField: React.FC<ISetupStageApprovalsFieldProps> = (props) => {
    const { stageType, bodyCount } = props;

    const { t } = useTranslations();
    const { control } = useFormContext<ISetupStageSettingsForm>();

    const { value: requiredApprovals } = useFormField<ISetupStageSettingsForm, 'requiredApprovals'>(
        'requiredApprovals',
        { control },
    );

    const labelContext = stageType === ProcessStageType.OPTIMISTIC ? 'veto' : 'approve';

    return (
        <NumberProgressInput
            label={t(`app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.${labelContext}.label`)}
            helpText={t(`app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.${labelContext}.helpText`)}
            min={0}
            fieldName="requiredApprovals"
            valueLabel={requiredApprovals.toString()}
            defaultValue={requiredApprovalsDefaultValue}
            total={bodyCount}
            totalLabel={t('app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.summary', {
                count: bodyCount,
            })}
        />
    );
};
