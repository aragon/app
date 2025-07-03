import type { ISetupStageTimingForm } from '@/modules/createDao/dialogs/setupStageTimingDialog/setupStageTimingDialogDefinitions';
import { useDialogContext } from '@/shared/components/dialogProvider';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Card, Dialog, InputContainer, invariant, RadioCard, RadioGroup, Switch } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ProcessStageType } from '../../components/createProcessForm';

export interface ISetupStageSettingsDialogParams {
    /**
     * Callback called on form submit.
     */
    onSubmit: (values: ISetupStageTimingForm) => void;
    /**
     * Default values for the dialog form.
     */
    defaultValues: ISetupStageTimingForm;
    /**
     * Number of bodies of the stage.
     */
    bodyCount: number;
}

export interface ISetupStageSettingsProps extends IDialogComponentProps<ISetupStageSettingsDialogParams> {}

const defaultExpiration = { days: 7, hours: 0, minutes: 0 };
const minVotingPeriod = { days: 0, hours: 1, minutes: 0 };
const requiredApprovalsDefaultValue = 1;

const formId = 'stageSettingsForm';

export const SetupStageSettingsDialog: React.FC<ISetupStageSettingsProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'SetupStageSettingsDialog: required parameters must be set.');

    const { defaultValues, onSubmit, bodyCount } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [displayExpiration, setDisplayExpiration] = useState(defaultValues.stageExpiration != null);

    const formMethods = useForm<ISetupStageTimingForm>({ mode: 'onTouched', defaultValues });
    const { handleSubmit, setValue, control } = formMethods;

    const {
        value: stageType,
        onChange: onTypeChange,
        ...stageTypeField
    } = useFormField<ISetupStageTimingForm, 'type'>('type', {
        label: t('app.createDao.setupStageSettingsDialog.governanceType.label'),
        defaultValue: ProcessStageType.NORMAL,
        control,
    });

    const handleTypeChange = (value: string) => {
        onTypeChange(value);

        // Make sure earlyStageAdvance is false when stage type is optimistic or timelock
        if (value === ProcessStageType.OPTIMISTIC) {
            setValue(`earlyStageAdvance`, false);
        }
    };

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const {
        value: earlyStageAdvance,
        onChange: onEarlyStageAdvanceChange,
        ...earlyStageField
    } = useFormField<ISetupStageTimingForm, 'earlyStageAdvance'>('earlyStageAdvance', {
        label: t('app.createDao.setupStageSettingsDialog.earlyAdvance.label'),
        control,
    });

    const { value: requiredApprovals } = useFormField<ISetupStageTimingForm, 'requiredApprovals'>('requiredApprovals', {
        control,
    });

    const handleToggleExpiration = (checked: boolean) => {
        setDisplayExpiration(checked);
        // The timeout here is needed because the advanced-date component needs to be rendered and the form field to be
        // registered before we can set its value on the form.
        setTimeout(() => setValue('stageExpiration', checked ? defaultExpiration : undefined), 0);
    };

    const onFormSubmit = (values: ISetupStageTimingForm) => {
        onSubmit(values);
        close();
    };

    const votingPeriodInfoText = !isTimelockStage
        ? t('app.createDao.setupStageSettingsDialog.votingPeriod.infoText')
        : undefined;

    const labelContext = isOptimisticStage ? 'veto' : 'approve';

    // Filter out timelocks as we are not showing them in this part of the UI
    const availableProcessesTypes = Object.values(ProcessStageType).filter(
        (type) => type !== ProcessStageType.TIMELOCK,
    );

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header title={t('app.createDao.setupStageSettingsDialog.title')} />
            <Dialog.Content>
                <form className="flex flex-col gap-6 py-4" onSubmit={handleSubmit(onFormSubmit)} id={formId}>
                    <RadioGroup
                        value={stageType}
                        onValueChange={handleTypeChange}
                        helpText={t('app.createDao.setupStageSettingsDialog.governanceType.helpText')}
                        {...stageTypeField}
                    >
                        {availableProcessesTypes.map((type) => (
                            <RadioCard
                                key={type}
                                label={t(`app.createDao.setupStageSettingsDialog.governanceType.${type}.label`)}
                                description={t(
                                    `app.createDao.setupStageSettingsDialog.governanceType.${type}.description`,
                                )}
                                value={type}
                            />
                        ))}
                    </RadioGroup>
                    {bodyCount > 0 && (
                        <NumberProgressInput
                            label={t(
                                `app.createDao.createProcessForm.governance.stageApprovalsField.${labelContext}.label`,
                            )}
                            helpText={t(
                                `app.createDao.createProcessForm.governance.stageApprovalsField.${labelContext}.helpText`,
                            )}
                            min={0}
                            fieldName="requiredApprovals"
                            valueLabel={requiredApprovals.toString()}
                            defaultValue={requiredApprovalsDefaultValue}
                            total={bodyCount}
                            totalLabel={t('app.createDao.createProcessForm.governance.stageApprovalsField.summary', {
                                count: bodyCount,
                            })}
                        />
                    )}
                    <InputContainer
                        className="flex flex-col"
                        id="minDuration"
                        useCustomWrapper={true}
                        helpText={t(`app.createDao.setupStageSettingsDialog.votingPeriod.helpText`)}
                        label={t(`app.createDao.setupStageSettingsDialog.votingPeriod.label`)}
                    >
                        <Card className="border border-neutral-100">
                            <AdvancedDateInputDuration
                                field="votingPeriod"
                                label={t(`app.createDao.setupStageSettingsDialog.votingPeriod.label`)}
                                infoDisplay="inline"
                                infoText={votingPeriodInfoText}
                                validateMinDuration={true}
                                minDuration={minVotingPeriod}
                            />
                        </Card>
                    </InputContainer>
                    {!isOptimisticStage && !isTimelockStage && (
                        <Switch
                            helpText={t('app.createDao.setupStageSettingsDialog.earlyAdvance.helpText')}
                            inlineLabel={t(
                                `app.createDao.createProcessForm.governance.stageSettingsField.${earlyStageAdvance ? 'yes' : 'no'}`,
                            )}
                            onCheckedChanged={(checked) => onEarlyStageAdvanceChange(checked)}
                            checked={earlyStageAdvance}
                            {...earlyStageField}
                        />
                    )}
                    <Switch
                        label={t('app.createDao.setupStageSettingsDialog.expiration.label')}
                        helpText={t('app.createDao.setupStageSettingsDialog.expiration.helpText')}
                        inlineLabel={t(
                            `app.createDao.createProcessForm.governance.stageSettingsField.${displayExpiration ? 'yes' : 'no'}`,
                        )}
                        onCheckedChanged={handleToggleExpiration}
                        checked={displayExpiration}
                    />
                    {displayExpiration && (
                        <Card className="border border-neutral-100">
                            <AdvancedDateInputDuration
                                field="stageExpiration"
                                label={t('app.createDao.setupStageSettingsDialog.expiration.label')}
                                infoText={t('app.createDao.setupStageSettingsDialog.expiration.infoText')}
                                infoDisplay="inline"
                            />
                        </Card>
                    )}
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
