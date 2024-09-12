import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { IDateDuration } from '@/shared/utils/dateUtils';
import {
    AlertInline,
    Button,
    Card,
    DefinitionList,
    Dialog,
    IconType,
    InputContainer,
    InputNumber,
    InputText,
    RadioCard,
    RadioGroup,
    Switch,
    Tag,
} from '@aragon/ods';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export interface IStageInputItemProps {
    /**
     * Name of the field.
     */
    name: string;
    /**
     * The index of the resource item in the list.
     */
    index: number;
    /**
     * Callback to remove the resource item.
     */
    remove: (index: number) => void;
}

type StageInputItemBaseForm = Record<string, any>;

export const StageInputItem: React.FC<IStageInputItemProps> = (props) => {
    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);
    const { name, index, remove } = props;

    const { setValue, trigger } = useFormContext();

    const bodyFieldArrayName = `${name}.${index}.body`;
    const { fields, append, remove: removeBody } = useFieldArray<StageInputItemBaseForm>({ name: bodyFieldArrayName });

    const { t } = useTranslations();

    const nameFieldName = `${name}.${index}.name`;
    const nameField = useFormField<StageInputItemBaseForm, typeof nameFieldName>(nameFieldName, {
        label: t('app.shared.resourcesInput.labelInput.title'),
        rules: { required: true },
        defaultValue: '',
    });

    const typeFieldName = `${name}.${index}.type`;
    const typeField = useFormField<StageInputItemBaseForm, typeof typeFieldName>(typeFieldName, {
        label: t('app.shared.resourcesInput.labelInput.title'),
        rules: { required: true },
        defaultValue: 'normal',
    });

    const timingFieldName = `${name}.${index}.timing`;
    const timingField = useFormField<StageInputItemBaseForm, typeof timingFieldName>(timingFieldName, {
        label: t('app.shared.resourcesInput.labelInput.title'),
        rules: { required: true },
        defaultValue: 'normal',
    });

    const votingPeriodFieldName = `${name}.${index}.votingPeriod`;

    const votingPeriodField = useFormField<Record<string, IDateDuration>, typeof votingPeriodFieldName>(
        votingPeriodFieldName,
        {
            label: 'Voting Period',
            shouldUnregister: true,
            defaultValue: {
                minutes: 0,
                hours: 0,
                days: 7,
            },
        },
    );

    const handleDurationChange = (type: string) => (value: string) => {
        const parsedValue = parseInt(value, 10);
        const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
        const newValue = { ...votingPeriodField.value, [type]: numericValue };
        setValue(votingPeriodFieldName, newValue, { shouldValidate: false });
    };

    const earlyStageFieldName = `${name}.${index}.earlyStage`;
    const earlyStageField = useFormField<StageInputItemBaseForm, typeof earlyStageFieldName>(earlyStageFieldName, {
        label: 'Early stage advance',
        defaultValue: false,
    });

    const stageExpirationFieldName = `${name}.${index}.stageExpiration`;
    const stageExpirationField = useFormField<StageInputItemBaseForm, typeof stageExpirationFieldName>(
        stageExpirationFieldName,
        {
            label: 'Stage expiration',
            defaultValue: false,
        },
    );

    return (
        <>
            <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
                <InputText placeholder={t('app.shared.resourcesInput.labelInput.placeholder')} {...nameField} />
                <RadioGroup
                    className="flex !flex-row gap-x-4"
                    onValueChange={typeField.onChange}
                    helpText="Specify what kind of stage"
                    {...typeField}
                >
                    <RadioCard className="w-full" label="Normal" description="" value="normal" />
                    <RadioCard className="w-full" label="Optimistic" description="" value="optimistic" />
                </RadioGroup>
                <div className="flex flex-col items-start gap-y-3">
                    <InputContainer
                        useCustomWrapper={true}
                        className="w-full"
                        id={timingFieldName}
                        helpText="Define the timing"
                        {...timingField}
                    >
                        <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                            <DefinitionList.Item term="Voting period">7 days</DefinitionList.Item>
                            <DefinitionList.Item term="Early stage advance">
                                <Tag className="w-fit" label="Yes" variant="primary" />
                            </DefinitionList.Item>
                            <DefinitionList.Item term="Stage expiration">
                                <Tag className="w-fit" label="No" variant="neutral" />
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </InputContainer>
                    <Button onClick={() => setIsTimingDialogOpen(true)} variant="tertiary" size="md">
                        Edit timing
                    </Button>
                </div>
                <div className="flex flex-col gap-2 md:gap-3">
                    <InputContainer
                        id="resourcesInput"
                        label={t('app.shared.title')}
                        helpText="Add a body"
                        useCustomWrapper={true}
                    />
                    {fields.length > 0 && (
                        <div className="flex flex-col gap-3 md:gap-2">
                            {fields.map((field, index) => (
                                <p key={field.id}>{`TOUCH MY BODY ${index}`}</p>
                            ))}
                        </div>
                    )}
                    <Button
                        size="md"
                        variant="tertiary"
                        className="w-fit"
                        iconLeft={IconType.PLUS}
                        onClick={() => append({ name: '', url: '' })}
                    >
                        {t('app.shared.resourcesInput.addBody')}
                    </Button>
                </div>
            </Card>
            <Dialog.Root open={isTimingDialogOpen}>
                <Dialog.Header title="Timing" />
                <Dialog.Content className="flex flex-col gap-6">
                    <InputContainer
                        id={votingPeriodFieldName}
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
                                value={votingPeriodField.value.minutes}
                                onChange={handleDurationChange('minutes')}
                            />
                            <InputNumber
                                label={t('app.shared.advancedDateInput.duration.hours')}
                                min={0}
                                max={23}
                                className="w-full md:w-1/3"
                                placeholder="0 h"
                                value={votingPeriodField.value.hours}
                                onChange={handleDurationChange('hours')}
                            />
                            <InputNumber
                                label={t('app.shared.advancedDateInput.duration.days')}
                                min={0}
                                className="w-full md:w-1/3"
                                placeholder="7 d"
                                value={votingPeriodField.value.days}
                                onChange={handleDurationChange('days')}
                            />
                        </div>
                        <AlertInline message="Recommended minimum expiration time is 7 days" />
                    </div>
                    <Switch
                        helpText="Should the proposal be able to advance this stage early, if it’s successful?"
                        inlineLabel={t('app.governance.createProposalForm.metadata.actions.label')}
                        onCheckedChanged={earlyStageField.onChange}
                        checked={earlyStageField.value}
                        {...earlyStageField}
                    />
                    <Switch
                        helpText={t('app.governance.createProposalForm.metadata.actions.helpText')}
                        inlineLabel={t('app.governance.createProposalForm.metadata.actions.label')}
                        onCheckedChanged={stageExpirationField.onChange}
                        checked={stageExpirationField.value}
                        {...stageExpirationField}
                    />
                </Dialog.Content>
                <Dialog.Footer
                    primaryAction={{ label: 'Save' }}
                    secondaryAction={{ label: 'Cancel', onClick: () => setIsTimingDialogOpen(false) }}
                />
            </Dialog.Root>
        </>
    );
};
