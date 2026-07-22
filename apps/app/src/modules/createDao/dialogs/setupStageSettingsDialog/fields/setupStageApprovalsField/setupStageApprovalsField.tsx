import { useFormContext } from 'react-hook-form';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ISetupStageSettingsForm } from '../../setupStageSettingsDialogDefinitions';

export interface ISetupStageApprovalsFieldProps {
    /**
     * Number of approving bodies in the stage.
     */
    approvingBodyCount: number;
    /**
     * Number of vetoing bodies in the stage.
     */
    vetoingBodyCount: number;
}

const thresholdDefaultValue = 1;

export const SetupStageApprovalsField: React.FC<
    ISetupStageApprovalsFieldProps
> = (props) => {
    const { approvingBodyCount, vetoingBodyCount } = props;

    const { t } = useTranslations();
    const { control } = useFormContext<ISetupStageSettingsForm>();

    const { value: approvalThreshold } = useFormField<
        ISetupStageSettingsForm,
        'approvalThreshold'
    >('approvalThreshold', { control });

    const { value: vetoThreshold } = useFormField<
        ISetupStageSettingsForm,
        'vetoThreshold'
    >('vetoThreshold', { control });

    return (
        <>
            {approvingBodyCount > 0 && (
                <NumberProgressInput
                    defaultValue={thresholdDefaultValue}
                    fieldName="approvalThreshold"
                    helpText={t(
                        'app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.approve.helpText',
                    )}
                    label={t(
                        'app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.approve.label',
                    )}
                    min={0}
                    total={approvingBodyCount}
                    totalLabel={t(
                        'app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.summary',
                        { count: approvingBodyCount },
                    )}
                    valueLabel={approvalThreshold.toString()}
                />
            )}
            {vetoingBodyCount > 0 && (
                <NumberProgressInput
                    defaultValue={thresholdDefaultValue}
                    fieldName="vetoThreshold"
                    helpText={t(
                        'app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.veto.helpText',
                    )}
                    label={t(
                        'app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.veto.label',
                    )}
                    min={0}
                    total={vetoingBodyCount}
                    totalLabel={t(
                        'app.createDao.setupStageSettingsDialog.fields.stageApprovalsField.summary',
                        { count: vetoingBodyCount },
                    )}
                    valueLabel={vetoThreshold.toString()}
                />
            )}
        </>
    );
};
