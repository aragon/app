import { type StageInputItemBaseForm } from '@/modules/governance/components/createProcessForm/stageInput/stageInputItem';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IUseFormFieldReturn } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import { AlertInline, Dialog, InputContainer, InputNumber, Switch } from '@aragon/ods';
import { useFormContext, useWatch } from 'react-hook-form';

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
    stageExpirationField: IUseFormFieldReturn<StageInputItemBaseForm, string>;
    /**
     * Whether the stage should expire.
     */
    stageExpirationPeriodField: IUseFormFieldReturn<Record<string, IDateDuration>, string>;
    /**
     * The early stage field.
     */
    earlyStageField: IUseFormFieldReturn<StageInputItemBaseForm, string>;
    /**
     * The voting period field.
     */
    votingPeriodField: IUseFormFieldReturn<Record<string, IDateDuration>, string>;
    /**
     * The type of process.
     */
    typeField: IUseFormFieldReturn<StageInputItemBaseForm, string>;
    /**
     * The body governance type field.
     */
    bodyGovernanceTypeField: IUseFormFieldReturn<StageInputItemBaseForm, string>;
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
        stageExpirationPeriodField,
        earlyStageField,
        votingPeriodField,
        typeField,
    } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const votingPeriod = useWatch({ name: votingPeriodField.name });
    const earlyStage = useWatch({ name: earlyStageField.name });
    const stageExpiration = useWatch({ name: stageExpirationField.name });
    const expirationPeriod = useWatch({ name: stageExpirationPeriodField.name });

    return (
        <Dialog.Root
            containerClassName="!max-w-[640px]"
            open={isTimingDialogOpen}
            onOpenChange={() => setIsTimingDialogOpen(false)}
        >
            <Dialog.Header title="Timing" />
            <Dialog.Content className="flex flex-col gap-6 pb-4">
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
                            value={votingPeriod.minutes}
                            onChange={(e) =>
                                setValue(votingPeriodField.name, {
                                    ...votingPeriod,
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
                            value={votingPeriod.hours}
                            onChange={(e) =>
                                setValue(votingPeriodField.name, {
                                    ...votingPeriod,
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
                            value={votingPeriod.days}
                            onChange={(e) =>
                                setValue(votingPeriodField.name, {
                                    ...votingPeriod,
                                    days: Number(e),
                                })
                            }
                        />
                    </div>
                    <AlertInline message="Recommended minimum expiration time is 7 days" />
                </div>
                {typeField.value === 'normal' && (
                    <Switch
                        helpText="Should the proposal be able to advance this stage early, if it’s successful?"
                        inlineLabel={earlyStage ? 'Yes' : 'No'}
                        onCheckedChanged={(checked) => setValue(earlyStageField.name, checked)}
                        checked={earlyStage}
                        {...earlyStageField}
                    />
                )}
                <Switch
                    helpText="The amount of time that the proposal will be eligible to be advanced to the next stage."
                    inlineLabel={stageExpiration ? 'Yes' : 'No'}
                    onCheckedChanged={(checked) => setValue(stageExpirationField.name, checked)}
                    checked={stageExpiration}
                    {...stageExpirationField}
                />

                {stageExpiration === true && (
                    <div className="flex flex-col space-y-6 rounded-xl border border-neutral-100 p-6">
                        <div className="flex flex-col justify-between gap-4 md:flex-row">
                            <InputNumber
                                label="Expiration Minutes"
                                min={0}
                                max={59}
                                className="w-full md:w-1/3"
                                value={expirationPeriod.minutes}
                                placeholder="0 m"
                                suffix="m"
                                onChange={(e) =>
                                    setValue(stageExpirationPeriodField.name, {
                                        ...expirationPeriod,
                                        minutes: Number(e),
                                    })
                                }
                            />
                            <InputNumber
                                label="Expiration Hours"
                                min={0}
                                max={23}
                                className="w-full md:w-1/3"
                                value={expirationPeriod.hours}
                                placeholder="0 h"
                                suffix="h"
                                onChange={(e) =>
                                    setValue(stageExpirationPeriodField.name, {
                                        ...expirationPeriod,
                                        hours: Number(e),
                                    })
                                }
                            />
                            <InputNumber
                                label="Expiration Days"
                                min={0}
                                className="w-full md:w-1/3"
                                value={expirationPeriod.days}
                                placeholder="0 d"
                                suffix="d"
                                onChange={(e) =>
                                    setValue(stageExpirationPeriodField.name, {
                                        ...expirationPeriod,
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
                    onClick: () =>
                        handleSaveTimingValues({
                            votingPeriod,
                            earlyStage,
                            stageExpiration,
                        }),
                }}
                secondaryAction={{ label: 'Cancel', onClick: () => setIsTimingDialogOpen(false) }}
            />
        </Dialog.Root>
    );
};
