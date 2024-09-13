import { useTranslations } from '@/shared/components/translationsProvider';
import { IDateDuration } from '@/shared/utils/dateUtils';
import { AlertInline, Dialog, InputContainer, InputNumber, Switch } from '@aragon/ods';
import { useState } from 'react';

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
     * Callback to save the timing values.
     */
    handleSaveTimingValues: (values: ICreateProcessFormTimingValues) => void;
    /**
     * The stage expiration field.
     */
    stageExpirationField: any;
    /**
     * The early stage field.
     */
    earlyStageField: any;
    /**
     * The voting period field.
     */
    votingPeriodField: any;
}

export interface ICreateProcessFormTimingValues {
    /**
     * The voting period.
     */
    votingPeriod: IDateDuration;
    /**
     * Whether the proposal should be able to advance this stage early, if it’s successful.
     */
    earlyStage: boolean;
    /**
     * Whether the stage should expire.
     */
    stageExpiration: boolean;
}

export const CreateProcessFormTimingDialog: React.FC<ICreateProcessFormTimingDialogProps> = (props) => {
    const {
        isTimingDialogOpen,
        setIsTimingDialogOpen,
        handleSaveTimingValues,
        stageExpirationField,
        earlyStageField,
        votingPeriodField,
    } = props;

    const [timingValues, setTimingValues] = useState<ICreateProcessFormTimingValues>({
        votingPeriod: votingPeriodField.value,
        earlyStage: earlyStageField.value,
        stageExpiration: stageExpirationField.value,
    });

    const { t } = useTranslations();

    return (
        <Dialog.Root
            containerClassName="!max-w-[640px]"
            open={isTimingDialogOpen}
            onOpenChange={() => setIsTimingDialogOpen(false)}
        >
            <Dialog.Header title="Timing" />
            <Dialog.Content className="flex flex-col gap-6 pb-4">
                <InputContainer
                    id={votingPeriodField.id}
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
                            value={timingValues.votingPeriod.minutes}
                            onChange={(e) =>
                                setTimingValues({
                                    ...timingValues,
                                    votingPeriod: { ...timingValues.votingPeriod, minutes: Number(e) },
                                })
                            }
                        />
                        <InputNumber
                            label={t('app.shared.advancedDateInput.duration.hours')}
                            min={0}
                            max={23}
                            className="w-full md:w-1/3"
                            placeholder="0 h"
                            value={timingValues.votingPeriod.hours}
                            onChange={(e) =>
                                setTimingValues({
                                    ...timingValues,
                                    votingPeriod: { ...timingValues.votingPeriod, hours: Number(e) },
                                })
                            }
                        />
                        <InputNumber
                            label={t('app.shared.advancedDateInput.duration.days')}
                            min={0}
                            className="w-full md:w-1/3"
                            placeholder="7 d"
                            value={timingValues.votingPeriod.days}
                            onChange={(e) =>
                                setTimingValues({
                                    ...timingValues,
                                    votingPeriod: { ...timingValues.votingPeriod, days: Number(e) },
                                })
                            }
                        />
                    </div>
                    <AlertInline message="Recommended minimum expiration time is 7 days" />
                </div>
                <Switch
                    helpText="Should the proposal be able to advance this stage early, if it’s successful?"
                    inlineLabel={timingValues.earlyStage ? 'Yes' : 'No'}
                    onCheckedChanged={(checked) => setTimingValues((prev) => ({ ...prev, earlyStage: checked }))}
                    checked={timingValues.earlyStage}
                    {...earlyStageField}
                />
                <Switch
                    helpText="The amount of time that the proposal will be eligible to be advanced to the next stage."
                    inlineLabel={timingValues.stageExpiration ? 'Yes' : 'No'}
                    onCheckedChanged={(checked) => setTimingValues((prev) => ({ ...prev, stageExpiration: checked }))}
                    checked={timingValues.stageExpiration}
                    {...stageExpirationField}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{ label: 'Save', onClick: () => handleSaveTimingValues(timingValues) }}
                secondaryAction={{ label: 'Cancel', onClick: () => setIsTimingDialogOpen(false) }}
            />
        </Dialog.Root>
    );
};
