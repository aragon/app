import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { useFormContext } from 'react-hook-form';
import { ProcessStageType } from '../../../../components/createProcessForm';
import type { ISetupStageSettingsForm } from '../../setupStageSettingsDialogDefinitions';

export interface ISetupStageApprovalsProps {
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

export const SetupStageApprovals: React.FC<ISetupStageApprovalsProps> = (props) => {
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
            label={t(`app.createDao.setupStageSettingsDialog.fields.stageApprovals.${labelContext}.label`)}
            helpText={t(`app.createDao.setupStageSettingsDialog.fields.stageApprovals.${labelContext}.helpText`)}
            min={0}
            fieldName="requiredApprovals"
            valueLabel={requiredApprovals.toString()}
            defaultValue={requiredApprovalsDefaultValue}
            total={bodyCount}
            totalLabel={t('app.createDao.setupStageSettingsDialog.fields.stageApprovals.summary', {
                count: bodyCount,
            })}
        />
    );
};
