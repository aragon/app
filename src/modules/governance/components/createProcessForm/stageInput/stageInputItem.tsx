import {
    CreateProcessFormTimingDialog,
    ICreateProcessFormTimingValues,
} from '@/modules/governance/components/createProcessForm/createProcessFormTimingDialog/createProcessFormTimingDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { IDateDuration } from '@/shared/utils/dateUtils';
import {
    Button,
    Card,
    DefinitionList,
    IconType,
    InputContainer,
    InputText,
    RadioCard,
    RadioGroup,
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

    console.log('VOTING PERIOD FIELD', votingPeriodField);

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

    const handleSaveTimingValues = (values: ICreateProcessFormTimingValues) => {
        setValue(votingPeriodFieldName, values.votingPeriod);
        setValue(earlyStageFieldName, values.earlyStage);
        setValue(stageExpirationFieldName, values.stageExpiration);
        setIsTimingDialogOpen(false);
    };

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
                            <DefinitionList.Item term="Voting period">
                                {`${votingPeriodField.value.days} days, ${votingPeriodField.value.hours} hours, ${votingPeriodField.value.minutes} minutes`}
                            </DefinitionList.Item>
                            <DefinitionList.Item term="Early stage advance">
                                <Tag
                                    className="w-fit"
                                    label={earlyStageField.value === true ? 'Yes' : 'No'}
                                    variant={earlyStageField.value === true ? 'primary' : 'neutral'}
                                />
                            </DefinitionList.Item>
                            <DefinitionList.Item term="Stage expiration">
                                <Tag
                                    className="w-fit"
                                    label={stageExpirationField.value === true ? 'Yes' : 'No'}
                                    variant={stageExpirationField.value === true ? 'primary' : 'neutral'}
                                />
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
                <CreateProcessFormTimingDialog
                    isTimingDialogOpen={isTimingDialogOpen}
                    setIsTimingDialogOpen={setIsTimingDialogOpen}
                    earlyStageField={earlyStageField}
                    stageExpirationField={stageExpirationField}
                    votingPeriodField={votingPeriodField}
                    handleSaveTimingValues={handleSaveTimingValues}
                />
            </Card>
        </>
    );
};
