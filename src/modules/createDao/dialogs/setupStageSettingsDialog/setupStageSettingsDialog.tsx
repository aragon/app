import { SetupStageEarlyAdvance } from '@/modules/createDao/dialogs/setupStageSettingsDialog/fields/setupStageEarlyAdvance';
import { useDialogContext } from '@/shared/components/dialogProvider';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { ProcessStageType } from '../../components/createProcessForm';
import { SetupStageApprovals } from './fields/setupStageApprovals';
import { SetupStageDuration } from './fields/setupStageDuration';
import { SetupStageExpiration } from './fields/setupStageExpiration';
import { SetupStageType } from './fields/setupStageType';
import type { ISetupStageSettingsForm } from './setupStageSettingsDialogDefinitions';

export interface ISetupStageSettingsDialogParams {
    /**
     * Callback called on form submit.
     */
    onSubmit: (values: ISetupStageSettingsForm) => void;
    /**
     * Default values for the dialog form.
     */
    defaultValues: ISetupStageSettingsForm;
    /**
     * Number of bodies of the stage.
     */
    bodyCount: number;
}

export interface ISetupStageSettingsProps extends IDialogComponentProps<ISetupStageSettingsDialogParams> {}

const formId = 'stageSettingsForm';

export const SetupStageSettingsDialog: React.FC<ISetupStageSettingsProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'SetupStageSettingsDialog: required parameters must be set.');

    const { defaultValues, onSubmit, bodyCount } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const formMethods = useForm<ISetupStageSettingsForm>({ mode: 'onTouched', defaultValues });
    const { handleSubmit, control } = formMethods;

    const stageType = useWatch<ISetupStageSettingsForm, 'type'>({
        name: 'type',
        control,
    });

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = bodyCount === 0;

    const onFormSubmit = (values: ISetupStageSettingsForm) => {
        onSubmit(values);
        close();
    };

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header title={t('app.createDao.setupStageSettingsDialog.title')} />
            <Dialog.Content>
                <form className="flex flex-col gap-6 py-4" onSubmit={handleSubmit(onFormSubmit)} id={formId}>
                    {!isTimelockStage && <SetupStageType />}
                    {bodyCount > 0 && <SetupStageApprovals stageType={stageType} bodyCount={bodyCount} />}
                    <SetupStageDuration bodyCount={bodyCount} />
                    {!isOptimisticStage && !isTimelockStage && <SetupStageEarlyAdvance />}
                    <SetupStageExpiration defaultExpirationValue={defaultValues.stageExpiration} />
                </form>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.createDao.setupStageSettingsDialog.action.save'),
                    type: 'submit',
                    form: formId,
                }}
                secondaryAction={{
                    label: t('app.createDao.setupStageSettingsDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </FormProvider>
    );
};
