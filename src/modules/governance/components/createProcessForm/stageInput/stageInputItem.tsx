import {
    CreateProcessFormTimingDialog,
    type ICreateProcessFormTimingValues,
} from '@/modules/governance/components/createProcessForm/createProcessFormTimingDialog/createProcessFormTimingDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { type IDateDuration } from '@/shared/utils/dateUtils';
import {
    Accordion,
    Button,
    Card,
    DefinitionList,
    Dropdown,
    IconType,
    InputContainer,
    InputText,
    RadioCard,
    RadioGroup,
    Tag,
} from '@aragon/ods';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CreateProcessFormAddBodyDialog } from '../createProcessFormAddBodyDialog/createProcessFormAddBodyDialog';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StageInputItemBaseForm = Record<string, any>;

export const StageInputItem: React.FC<IStageInputItemProps> = (props) => {
    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);
    const [addBodyDialogOpen, setAddBodyDialogOpen] = useState(false);
    const { name, index, remove } = props;

    const { setValue } = useFormContext();

    const bodyFieldArrayName = `${name}.${index}.body`;
    const { fields, append, remove: removeBody } = useFieldArray({ name: bodyFieldArrayName });

    const { t } = useTranslations();

    const nameFieldName = `${name}.${index}.name`;
    const nameField = useFormField<StageInputItemBaseForm, typeof nameFieldName>(nameFieldName, {
        label: 'Name',
        rules: { required: true },
        defaultValue: '',
    });

    const typeFieldName = `${name}.${index}.type`;
    const typeField = useFormField<StageInputItemBaseForm, typeof typeFieldName>(typeFieldName, {
        label: 'Type',
        rules: { required: true },
        defaultValue: 'normal',
    });

    const timingFieldName = `${name}.${index}.timing`;
    const timingField = useFormField<StageInputItemBaseForm, typeof timingFieldName>(timingFieldName, {
        label: 'Timing',
        rules: { required: true },
        defaultValue: 'normal',
    });

    const votingPeriodFieldName = `${name}.${index}.votingPeriod`;

    const votingPeriodField = useFormField<Record<string, IDateDuration>, typeof votingPeriodFieldName>(
        votingPeriodFieldName,
        {
            label: 'Voting Period',
            defaultValue: {
                minutes: 0,
                hours: 0,
                days: 7,
            },
        },
    );

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

    const addBody = () => {
        setAddBodyDialogOpen(true);
    };

    return (
        <>
            <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
                <InputText
                    helpText="Name the stage, so members are able to recognize it"
                    placeholder="Type a name"
                    {...nameField}
                />
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
                        helpText="Define the timing of the stage, so all bodies have enough time to execute and advance the proposals."
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
                        label="Voting bodies"
                        helpText="Add at least one voting body which has to participate in this stage. We recommend not to add more than 3 bodies per stage."
                        useCustomWrapper={true}
                    />
                    {fields.length > 0 && (
                        <div className="flex flex-col gap-3 md:gap-2">
                            {fields.map((field, index) => (
                                <Accordion.Container isMulti={false}>
                                    <Accordion.Item value={field.id} className="w-full">
                                        <Accordion.ItemHeader>BODY NAME</Accordion.ItemHeader>
                                        <Accordion.ItemContent className="flex w-full grow">
                                            <DefinitionList.Container className="w-full">
                                                <DefinitionList.Item term="Name">{field.id}</DefinitionList.Item>
                                                <DefinitionList.Item term="Name">{field.id}</DefinitionList.Item>
                                                <DefinitionList.Item term="Name">{field.id}</DefinitionList.Item>
                                            </DefinitionList.Container>
                                            <div className="flex self-end">
                                                <Dropdown.Container
                                                    constrainContentWidth={false}
                                                    size="md"
                                                    customTrigger={
                                                        <Button
                                                            className="w-fit"
                                                            variant="tertiary"
                                                            size="lg"
                                                            iconLeft={IconType.DOTS_VERTICAL}
                                                        >
                                                            More
                                                        </Button>
                                                    }
                                                >
                                                    <Dropdown.Item onClick={() => removeBody(index)}>
                                                        Remove body
                                                    </Dropdown.Item>
                                                </Dropdown.Container>
                                            </div>
                                        </Accordion.ItemContent>
                                    </Accordion.Item>
                                </Accordion.Container>
                            ))}
                        </div>
                    )}
                    <Button size="md" variant="tertiary" className="w-fit" iconLeft={IconType.PLUS} onClick={addBody}>
                        Add a body
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
                <CreateProcessFormAddBodyDialog
                    open={addBodyDialogOpen}
                    setOpen={setAddBodyDialogOpen}
                    append={append}
                />
                <div className="flex self-end">
                    <Dropdown.Container
                        constrainContentWidth={false}
                        size="md"
                        customTrigger={
                            <Button className="w-fit" variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL}>
                                More
                            </Button>
                        }
                    >
                        <Dropdown.Item onClick={() => remove(index)}>Remove stage</Dropdown.Item>
                    </Dropdown.Container>
                </div>
            </Card>
        </>
    );
};
