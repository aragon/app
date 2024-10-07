import { useStageFields } from '@/modules/governance/components/createProcessForm/hooks/useStagesFields';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AlertInline, Dialog, InputContainer, InputNumber, Switch } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormTimingDialogProps {
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
    stageName: string;
    /**
     * The index of the current stage.
     */
    stageIndex: number;
}

export const CreateProcessFormTimingDialog: React.FC<ICreateProcessFormTimingDialogProps> = (props) => {
    const { isTimingDialogOpen, setIsTimingDialogOpen, stageName, stageIndex } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const { votingPeriodField, earlyStageField, stageExpirationField, stageExpirationPeriodField, stageTypeField } =
        useStageFields(stageName, stageIndex) as {
            votingPeriodField: { name: string; value: { minutes: number; hours: number; days: number } };
            earlyStageField: { name: string; value: boolean };
            stageExpirationField: { name: string; value: boolean };
            stageExpirationPeriodField: { name: string; value: { minutes: number; hours: number; days: number } };
            stageTypeField: { name: string; value: string };
        };

    return (
        <Dialog.Root
            containerClassName="!max-w-[640px]"
            open={isTimingDialogOpen}
            onOpenChange={() => setIsTimingDialogOpen(false)}
            aria-describedby="Edit timing of governance process stage."
        >
            <Dialog.Header title="Timing" />
            <Dialog.Content
                aria-describedby="Edit timing of governance process stage."
                className="flex flex-col gap-6 pb-4"
            >
                <InputContainer
                    id={votingPeriodField.name}
                    useCustomWrapper={true}
                    helpText="The shortest period of time a proposal is open for voting. Proposals can be created with a longer duration, but not shorter."
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
                                setValue(votingPeriodField.name, {
                                    ...(typeof votingPeriodField.value === 'object' ? votingPeriodField.value : {}),
                                    minutes: Number(e),
                                })
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
                                setValue(votingPeriodField.name, {
                                    ...votingPeriodField.value,
                                    hours: Number(e),
                                })
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
                                setValue(votingPeriodField.name, {
                                    ...votingPeriodField.value,
                                    days: Number(e),
                                })
                            }
                        />
                    </div>
                    <AlertInline message="Recommended minimum expiration time is 7 days" />
                </div>
                {stageTypeField.value === 'normal' && (
                    <Switch
                        helpText="Should the proposal be able to advance this stage early, if it’s successful?"
                        inlineLabel={earlyStageField ? 'Yes' : 'No'}
                        onCheckedChanged={(checked) => setValue(earlyStageField.name, checked)}
                        checked={earlyStageField.value}
                        {...earlyStageField}
                    />
                )}
                <Switch
                    helpText="The amount of time that the proposal will be eligible to be advanced to the next stage."
                    inlineLabel={stageExpirationField ? 'Yes' : 'No'}
                    onCheckedChanged={(checked) => setValue(stageExpirationField.name, checked)}
                    checked={stageExpirationField.value}
                    {...stageExpirationField}
                />

                {stageExpirationField.value === true && (
                    <div className="flex flex-col space-y-6 rounded-xl border border-neutral-100 p-6">
                        <div className="flex flex-col justify-between gap-4 md:flex-row">
                            <InputNumber
                                label="Expiration Minutes"
                                min={0}
                                max={59}
                                className="w-full md:w-1/3"
                                value={stageExpirationPeriodField.value.minutes}
                                placeholder="0 m"
                                suffix="m"
                                onChange={(e) =>
                                    setValue(stageExpirationPeriodField.name, {
                                        ...stageExpirationPeriodField.value,
                                        minutes: Number(e),
                                    })
                                }
                            />
                            <InputNumber
                                label="Expiration Hours"
                                min={0}
                                max={23}
                                className="w-full md:w-1/3"
                                value={stageExpirationPeriodField.value.hours}
                                placeholder="0 h"
                                suffix="h"
                                onChange={(e) =>
                                    setValue(stageExpirationPeriodField.name, {
                                        ...stageExpirationPeriodField.value,
                                        hours: Number(e),
                                    })
                                }
                            />
                            <InputNumber
                                label="Expiration Days"
                                min={0}
                                className="w-full md:w-1/3"
                                value={stageExpirationPeriodField.value.days}
                                placeholder="0 d"
                                suffix="d"
                                onChange={(e) =>
                                    setValue(stageExpirationPeriodField.name, {
                                        ...stageExpirationPeriodField.value,
                                        days: Number(e),
                                    })
                                }
                            />
                        </div>
                        <AlertInline message="Recommended minimum expiration time is 7 days" />
                    </div>
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: 'Save',
                    onClick: () => setIsTimingDialogOpen(false),
                }}
                secondaryAction={{ label: 'Cancel', onClick: () => setIsTimingDialogOpen(false) }}
            />
        </Dialog.Root>
    );
};
