import { GovernanceStageApprovalsField } from '@/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceStageApprovalsField';
import { GovernanceStageTypeField } from '@/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceStageTypeField';
import { useDialogContext } from '@/shared/components/dialogProvider';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Card, Dialog, InputContainer, invariant, Switch } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { type Control, FormProvider, useForm } from 'react-hook-form';
import { ProcessStageType, type ICreateProcessFormStage } from '../../components/createProcessForm';
import type { ISetupStageTimingForm } from '@/modules/createDao/dialogs/setupStageTimingDialog/setupStageTimingDialogDefinitions';


export interface ISetupStageSettingsDialogParams {
    /**
     * Callback called on form submit.
     */
    onSubmit: (values: ICreateProcessFormStage) => void;
    /**
     * Default values for the dialog form.
     */
    defaultValues: Pick<ICreateProcessFormStage, 'type' | 'timing' | 'requiredApprovals'>;
    /**
     * Type of the stage.
     */
    stageType: ProcessStageType;
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
}

export interface ISetupStageSettingsProps extends IDialogComponentProps<ISetupStageSettingsDialogParams> {}

const defaultExpiration = { days: 7, hours: 0, minutes: 0 };
const minVotingPeriod = { days: 0, hours: 1, minutes: 0 };

const formId = 'stageSettingsForm';

export const SetupStageSettingsDialog: React.FC<ISetupStageSettingsProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'SetupStageSettingsDialog: required parameters must be set.');

    const { stageType, defaultValues, onSubmit, fieldPrefix } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [displayExpiration, setDisplayExpiration] = useState(true);

    const formMethods = useForm<ICreateProcessFormStage>({ mode: 'onTouched', defaultValues });
    const { handleSubmit, setValue, control } = formMethods;

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const {
        value: earlyStage,
        onChange: onEarlyStageChange,
        ...earlyStageField
    } = useFormField<ICreateProcessFormStage['timing'], 'earlyStageAdvance'>('earlyStageAdvance', {
        label: t('app.createDao.setupStageTimingDialog.earlyAdvance.label'),
        control: control as unknown as Control<ISetupStageTimingForm>,
    });

    const handleToggleExpiration = (checked: boolean) => {
        setDisplayExpiration(checked);
        // The timeout here is needed because the advanced-date component needs to be rendered and the form field to be
        // registered before we can set its value on the form.
        setTimeout(() => setValue('timing.stageExpiration', checked ? defaultExpiration : undefined), 0);
    };

    const onFormSubmit = (values: ICreateProcessFormStage) => {
        onSubmit(values);
        close();
    };

    const context = isTimelockStage ? 'timelockPeriod' : 'votingPeriod';
    const votingPeriodInfoText = !isTimelockStage
        ? t('app.createDao.setupStageTimingDialog.votingPeriod.infoText')
        : undefined;

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header title={t('app.createDao.setupStageSettingsDialog.title')} />
            <Dialog.Content>
                <form className="flex flex-col gap-6 py-4" onSubmit={handleSubmit(onFormSubmit)} id={formId}>
                    <GovernanceStageTypeField fieldPrefix={fieldPrefix} />
                    <GovernanceStageApprovalsField
                        fieldPrefix={fieldPrefix}
                        isOptimisticStage={stageType === ProcessStageType.OPTIMISTIC}
                    />
                    <InputContainer
                        className="flex flex-col"
                        id="minDuration"
                        useCustomWrapper={true}
                        helpText={t(`app.createDao.setupStageTimingDialog.${context}.helpText`)}
                        label={t(`app.createDao.setupStageTimingDialog.${context}.label`)}
                    >
                        <Card className="border border-neutral-100">
                            <AdvancedDateInputDuration
                                field="votingPeriod"
                                label={t(`app.createDao.setupStageTimingDialog.${context}.label`)}
                                infoDisplay="inline"
                                infoText={votingPeriodInfoText}
                                validateMinDuration={true}
                                minDuration={minVotingPeriod}
                            />
                        </Card>
                    </InputContainer>
                    {!isOptimisticStage && !isTimelockStage && (
                        <Switch
                            helpText={t('app.createDao.setupStageTimingDialog.earlyAdvance.helpText')}
                            inlineLabel={t(
                                `app.createDao.createProcessForm.governance.stageTimingField.${earlyStage ? 'yes' : 'no'}`,
                            )}
                            onCheckedChanged={(checked) => onEarlyStageChange(checked)}
                            checked={earlyStage}
                            {...earlyStageField}
                        />
                    )}
                    <Switch
                        label={t('app.createDao.setupStageTimingDialog.expiration.label')}
                        helpText={t('app.createDao.setupStageTimingDialog.expiration.helpText')}
                        inlineLabel={t(
                            `app.createDao.createProcessForm.governance.stageTimingField.${displayExpiration ? 'yes' : 'no'}`,
                        )}
                        onCheckedChanged={handleToggleExpiration}
                        checked={displayExpiration}
                    />
                    {displayExpiration && (
                        <Card className="border border-neutral-100">
                            <AdvancedDateInputDuration
                                field="stageExpiration"
                                label={t('app.createDao.setupStageTimingDialog.expiration.label')}
                                infoText={t('app.createDao.setupStageTimingDialog.expiration.infoText')}
                                infoDisplay="inline"
                            />
                        </Card>
                    )}
                </form>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.createDao.setupStageSettings.action.save'),
                    type: 'submit',
                    form: formId,
                }}
                secondaryAction={{
                    label: t('app.createDao.setupStageSettings.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </FormProvider>
    );
};
