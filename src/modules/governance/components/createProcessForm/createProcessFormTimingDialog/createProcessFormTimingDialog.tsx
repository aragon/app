import { useTranslations } from '@/shared/components/translationsProvider';
import { IDateDuration } from '@/shared/utils/dateUtils';
import { AlertInline, Dialog, InputContainer, InputNumber, Switch } from '@aragon/ods';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormTimingDialogProps {
    isTimingDialogOpen: boolean;
    setIsTimingDialogOpen: (value: boolean) => void;
    handleSaveTimingValues: (values: ICreateProcessFormTimingValues) => void;
    stageExpirationField: any;
    earlyStageField: any;
    votingPeriodField: any;
}

export interface ICreateProcessFormTimingValues {
    votingPeriod: IDateDuration;
    earlyStage: boolean;
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

    console.log('PROPS', props);
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
            <Dialog.Content className="flex flex-col gap-6">
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
                    inlineLabel={t('app.governance.createProposalForm.metadata.actions.label')}
                    onCheckedChanged={(e) =>
                        setTimingValues({
                            ...timingValues,
                            earlyStage: !earlyStageField.value,
                        })
                    }
                    checked={timingValues.earlyStage}
                    {...earlyStageField}
                />
                <Switch
                    helpText={t('app.governance.createProposalForm.metadata.actions.helpText')}
                    inlineLabel={t('app.governance.createProposalForm.metadata.actions.label')}
                    onCheckedChanged={(e) =>
                        setTimingValues({
                            ...timingValues,
                            stageExpiration: !stageExpirationField.value,
                        })
                    }
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
