import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Card, Dialog, InputContainer, Switch } from '@aragon/gov-ui-kit';
import { useState, type FormEvent } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ProcessStageType, type ICreateProcessFormStageTiming } from '../../../createProcessFormDefinitions';

export interface IGovernanceStageTimingFieldDialogProps {
    /**
     * Callback triggered when dialog is closed.
     */
    onClose: () => void;
    /**
     * Callback called on form submit.
     */
    onSubmit: (values: ICreateProcessFormStageTiming) => void;
    /**
     * Default values for the dialog form.
     */
    defaultValues: ICreateProcessFormStageTiming;
    /**
     * Type of the stage.
     */
    stageType: ProcessStageType;
}

const defaultExpiration = { days: 7, hours: 0, minutes: 0 };

const formId = 'stageTimingForm';

export const GovernanceStageTimingFieldDialog: React.FC<IGovernanceStageTimingFieldDialogProps> = (props) => {
    const { onClose, stageType, defaultValues, onSubmit } = props;

    const { t } = useTranslations();

    const [displayExpiration, setDisplayExpiration] = useState(defaultValues.stageExpiration != null);

    const formMethods = useForm<ICreateProcessFormStageTiming>({ mode: 'onTouched', defaultValues });
    const { control, handleSubmit, setValue } = formMethods;

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const {
        value: earlyStage,
        onChange: onEarlyStageChange,
        ...earlyStageField
    } = useFormField<ICreateProcessFormStageTiming, 'earlyStageAdvance'>('earlyStageAdvance', {
        label: t('app.createDao.createProcessForm.governance.stageTimingField.dialog.earlyAdvance.label'),
        control,
    });

    const handleToggleExpiration = (checked: boolean) => {
        setDisplayExpiration(checked);
        // The timeout here is needed because the advanced-date component needs to be rendered and the form field to be
        // registered before we can set its value on the form.
        setTimeout(() => setValue('stageExpiration', checked ? defaultExpiration : undefined), 0);
    };

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        void handleSubmit(onSubmit)(event);
    };

    const context = isTimelockStage ? 'timelockPeriod' : 'votingPeriod';
    const votingPeriodInfoText = !isTimelockStage
        ? t('app.createDao.createProcessForm.governance.stageTimingField.dialog.votingPeriod.infoText')
        : undefined;

    return (
        <Dialog.Root
            size="lg"
            hiddenDescription={t('app.createDao.createProcessForm.governance.stageTimingField.dialog.a11y.description')}
            open={true}
            onOpenChange={onClose}
        >
            <FormProvider {...formMethods}>
                <Dialog.Header title={t('app.createDao.createProcessForm.governance.stageTimingField.dialog.title')} />
                <Dialog.Content>
                    <form className="flex flex-col gap-6 py-4" onSubmit={handleFormSubmit} id={formId}>
                        <InputContainer
                            className="flex flex-col"
                            id="minDuration"
                            useCustomWrapper={true}
                            helpText={t(
                                `app.createDao.createProcessForm.governance.stageTimingField.dialog.${context}.helpText`,
                            )}
                            label={t(
                                `app.createDao.createProcessForm.governance.stageTimingField.dialog.${context}.label`,
                            )}
                        >
                            <Card className="border border-neutral-100">
                                <AdvancedDateInputDuration
                                    field="votingPeriod"
                                    label={t(
                                        `app.createDao.createProcessForm.governance.stageTimingField.dialog.${context}.label`,
                                    )}
                                    infoDisplay="inline"
                                    infoText={votingPeriodInfoText}
                                />
                            </Card>
                        </InputContainer>
                        {!isOptimisticStage && !isTimelockStage && (
                            <Switch
                                helpText={t(
                                    'app.createDao.createProcessForm.governance.stageTimingField.dialog.earlyAdvance.helpText',
                                )}
                                inlineLabel={t(
                                    `app.createDao.createProcessForm.governance.stageTimingField.${earlyStage ? 'yes' : 'no'}`,
                                )}
                                onCheckedChanged={(checked) => onEarlyStageChange(checked)}
                                checked={earlyStage}
                                {...earlyStageField}
                            />
                        )}
                        <Switch
                            label={t(
                                'app.createDao.createProcessForm.governance.stageTimingField.dialog.expiration.label',
                            )}
                            helpText={t(
                                'app.createDao.createProcessForm.governance.stageTimingField.dialog.expiration.helpText',
                            )}
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
                                    label={t(
                                        'app.createDao.createProcessForm.governance.stageTimingField.dialog.expiration.label',
                                    )}
                                    infoText={t(
                                        'app.createDao.createProcessForm.governance.stageTimingField.dialog.expiration.infoText',
                                    )}
                                    infoDisplay="inline"
                                />
                            </Card>
                        )}
                    </form>
                </Dialog.Content>
                <Dialog.Footer
                    primaryAction={{
                        label: t('app.createDao.createProcessForm.governance.stageTimingField.dialog.action.save'),
                        type: 'submit',
                        form: formId,
                    }}
                    secondaryAction={{
                        label: t('app.createDao.createProcessForm.governance.stageTimingField.dialog.action.cancel'),
                        onClick: onClose,
                    }}
                />
            </FormProvider>
        </Dialog.Root>
    );
};
