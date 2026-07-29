import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { FormProvider, useForm } from 'react-hook-form';
import { useDialogContext } from '@/shared/components/dialogProvider';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { SetupStageApprovalsField } from './fields/setupStageApprovalsField';
import { SetupStageDurationField } from './fields/setupStageDurationField';
import { SetupStageEarlyAdvanceField } from './fields/setupStageEarlyAdvanceField';
import { SetupStageExpirationField } from './fields/setupStageExpirationField';
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
     * Number of approving bodies in the stage.
     */
    approvingBodyCount: number;
    /**
     * Number of vetoing bodies in the stage.
     */
    vetoingBodyCount: number;
}

export interface ISetupStageSettingsProps
    extends IDialogComponentProps<ISetupStageSettingsDialogParams> {}

const formId = 'stageSettingsForm';

export const SetupStageSettingsDialog: React.FC<ISetupStageSettingsProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'SetupStageSettingsDialog: required parameters must be set.',
    );

    const { defaultValues, onSubmit, approvingBodyCount, vetoingBodyCount } =
        location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const formMethods = useForm<ISetupStageSettingsForm>({
        mode: 'onTouched',
        defaultValues,
    });
    const { handleSubmit } = formMethods;

    const bodyCount = approvingBodyCount + vetoingBodyCount;
    // Early advance is not available when the stage has vetoing bodies: the veto
    // window must fully elapse before the stage can advance.
    const canConfigureEarlyAdvance = bodyCount > 0 && vetoingBodyCount === 0;

    const onFormSubmit = (values: ISetupStageSettingsForm) => {
        onSubmit(values);
        close();
    };

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header
                title={t('app.createDao.setupStageSettingsDialog.title')}
            />
            <Dialog.Content>
                <form
                    className="flex flex-col gap-6 py-4"
                    id={formId}
                    onSubmit={handleSubmit(onFormSubmit)}
                >
                    {bodyCount > 0 && (
                        <SetupStageApprovalsField
                            approvingBodyCount={approvingBodyCount}
                            vetoingBodyCount={vetoingBodyCount}
                        />
                    )}
                    <SetupStageDurationField bodyCount={bodyCount} />
                    {canConfigureEarlyAdvance && (
                        <SetupStageEarlyAdvanceField />
                    )}
                    <SetupStageExpirationField
                        defaultExpirationValue={defaultValues.stageExpiration}
                    />
                </form>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.createDao.setupStageSettingsDialog.action.save',
                    ),
                    type: 'submit',
                    form: formId,
                }}
                secondaryAction={{
                    label: t(
                        'app.createDao.setupStageSettingsDialog.action.cancel',
                    ),
                    onClick: () => close(),
                }}
            />
        </FormProvider>
    );
};
