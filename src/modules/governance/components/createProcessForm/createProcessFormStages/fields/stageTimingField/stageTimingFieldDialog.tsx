import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AlertInline, Dialog, InputContainer, InputNumber, Switch } from '@aragon/gov-ui-kit';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ICreateProcessFormStage } from '../../../createProcessFormDefinitions';

export interface IStageTimingFieldDialogProps {
    /**
     * Whether the dialog is open or not.
     */
    isTimingDialogOpen: boolean;
    /**
     * Callback to set the dialog open state.
     */
    setIsTimingDialogOpen: (value: boolean) => void;
    /**
     * The name of the current stage.
     */
    stageFieldName: string;
    /**
     * Type of the stage (normal, optimistic, timelock).
     */
    stageType: ICreateProcessFormStage['type'];
}

export const StageTimingFieldDialog: React.FC<IStageTimingFieldDialogProps> = (props) => {
    const { isTimingDialogOpen, setIsTimingDialogOpen, stageFieldName, stageType } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const isOptimisticStage = stageType === 'optimistic';
    const isTimelockStage = stageType === 'timelock';

    const periodLabel = isTimelockStage
        ? t('app.governance.createProcessForm.stage.timing.dialog.timelockPeriod.label')
        : t('app.governance.createProcessForm.stage.timing.dialog.votingPeriod.label');

    const periodHelpText = isTimelockStage
        ? t('app.governance.createProcessForm.stage.timing.dialog.timelockPeriod.helpText')
        : t('app.governance.createProcessForm.stage.timing.dialog.votingPeriod.helpText');

    const votingPeriodField = useFormField<ICreateProcessFormStage, 'votingPeriod'>('votingPeriod', {
        label: periodLabel,
        fieldPrefix: stageFieldName,
    });

    const earlyStageField = useFormField<ICreateProcessFormStage, 'earlyStageAdvance'>('earlyStageAdvance', {
        label: t('app.governance.createProcessForm.stage.timing.dialog.earlyAdvance.label'),
        fieldPrefix: stageFieldName,
    });

    const { onChange: onStageExpirationChange } = useFormField<ICreateProcessFormStage, 'stageExpiration'>(
        'stageExpiration',
        { fieldPrefix: stageFieldName },
    );

    const stageExpirationName = `${stageFieldName}.stageExpiration`;
    const stageExpiration = useWatch<Record<string, ICreateProcessFormStage['stageExpiration']>>({
        name: stageExpirationName,
    });

    const handleExpirationCheckChange = (checked: boolean) => {
        const newValue = checked ? { days: 7, minutes: 0, hours: 0 } : undefined;
        onStageExpirationChange(newValue);
    };

    return (
        <Dialog.Root
            containerClassName="!max-w-[640px]"
            open={isTimingDialogOpen}
            onOpenChange={() => setIsTimingDialogOpen(false)}
        >
            <Dialog.Header title={t('app.governance.createProcessForm.stage.timing.dialog.title')} />
            <Dialog.Content className="flex flex-col gap-6 py-4">
                <InputContainer
                    id={votingPeriodField.name}
                    useCustomWrapper={true}
                    helpText={periodHelpText}
                    {...votingPeriodField}
                />
                <div className="flex flex-col space-y-6 rounded-xl border border-neutral-100 p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <InputNumber
                            label={t('app.shared.advancedDateInput.duration.minutes')}
                            min={0}
                            max={59}
                            className="w-full md:w-1/3"
                            placeholder="0 min"
                            suffix="m"
                            value={votingPeriodField.value.minutes}
                            onChange={(e) =>
                                setValue(votingPeriodField.name, { ...votingPeriodField.value, minutes: Number(e) })
                            }
                        />
                        <InputNumber
                            label={t('app.shared.advancedDateInput.duration.hours')}
                            min={0}
                            max={23}
                            className="w-full md:w-1/3"
                            placeholder="0 h"
                            suffix="h"
                            value={votingPeriodField.value.hours}
                            onChange={(e) =>
                                setValue(votingPeriodField.name, { ...votingPeriodField.value, hours: Number(e) })
                            }
                        />
                        <InputNumber
                            label={t('app.shared.advancedDateInput.duration.days')}
                            min={0}
                            className="w-full md:w-1/3"
                            placeholder="7 d"
                            suffix="d"
                            value={votingPeriodField.value.days}
                            onChange={(e) =>
                                setValue(votingPeriodField.name, { ...votingPeriodField.value, days: Number(e) })
                            }
                        />
                    </div>
                    {!isTimelockStage && (
                        <AlertInline message={t('app.governance.createProcessForm.stage.timing.dialog.helpInfo')} />
                    )}
                </div>
                {!isOptimisticStage && !isTimelockStage && (
                    <Switch
                        helpText={t('app.governance.createProcessForm.stage.timing.dialog.earlyAdvance.helpText')}
                        inlineLabel={
                            earlyStageField.value
                                ? t('app.governance.createProcessForm.stage.timing.dialog.yes')
                                : t('app.governance.createProcessForm.stage.timing.dialog.no')
                        }
                        onCheckedChanged={(checked) => setValue(earlyStageField.name, checked)}
                        checked={earlyStageField.value}
                        {...earlyStageField}
                    />
                )}
                <Switch
                    label={t('app.governance.createProcessForm.stage.timing.dialog.expiration.label')}
                    helpText={t('app.governance.createProcessForm.stage.timing.dialog.expiration.helpText')}
                    inlineLabel={t(
                        `app.governance.createProcessForm.stage.timing.dialog.${stageExpiration ? 'yes' : 'no'}`,
                    )}
                    onCheckedChanged={handleExpirationCheckChange}
                    checked={stageExpiration != null}
                />

                {stageExpiration != null && (
                    <div className="flex flex-col space-y-6 rounded-xl border border-neutral-100 p-6">
                        <div className="flex flex-col justify-between gap-4 md:flex-row">
                            <InputNumber
                                label={t('app.shared.advancedDateInput.duration.minutes')}
                                min={0}
                                max={59}
                                className="w-full md:w-1/3"
                                value={stageExpiration.minutes}
                                placeholder="0 m"
                                suffix="m"
                                onChange={(e) =>
                                    setValue(stageExpirationName, { ...stageExpiration, minutes: Number(e) })
                                }
                            />
                            <InputNumber
                                label={t('app.shared.advancedDateInput.duration.hours')}
                                min={0}
                                max={23}
                                className="w-full md:w-1/3"
                                value={stageExpiration.hours}
                                placeholder="0 h"
                                suffix="h"
                                onChange={(e) =>
                                    setValue(stageExpirationName, { ...stageExpiration, hours: Number(e) })
                                }
                            />
                            <InputNumber
                                label={t('app.shared.advancedDateInput.duration.days')}
                                min={0}
                                className="w-full md:w-1/3"
                                value={stageExpiration.days}
                                placeholder="0 d"
                                suffix="d"
                                onChange={(e) => setValue(stageExpirationName, { ...stageExpiration, days: Number(e) })}
                            />
                        </div>
                        <AlertInline message={t('app.governance.createProcessForm.stage.timing.dialog.helpInfo')} />
                    </div>
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{ label: 'Save', onClick: () => setIsTimingDialogOpen(false) }}
                secondaryAction={{ label: 'Cancel', onClick: () => setIsTimingDialogOpen(false) }}
            />
        </Dialog.Root>
    );
};
