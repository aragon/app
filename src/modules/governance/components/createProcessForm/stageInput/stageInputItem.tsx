import {
    ITokenVotingMember,
    type ICreateProcessFormBody,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import {
    CreateProcessFormTimingDialog,
    type ICreateProcessFormTimingValues,
} from '@/modules/governance/components/createProcessForm/createProcessFormTimingDialog/createProcessFormTimingDialog';
import { useFormField } from '@/shared/hooks/useFormField';
import { type IDateDuration } from '@/shared/utils/dateUtils';
import {
    Accordion,
    Button,
    Card,
    DefinitionList,
    Dropdown,
    formatterUtils,
    Heading,
    IconType,
    InputContainer,
    InputText,
    NumberFormat,
    RadioCard,
    RadioGroup,
    Tag,
} from '@aragon/ods';
import type React from 'react';
import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { CreateProcessFormAddBodyDialog } from '../createProcessFormAddBodyDialog/createProcessFormAddBodyDialog';

export interface IStageInputItemProps {
    /**
     * Name of the field.
     */
    name: string;
    /**
     * The index of the stage in the list.
     */
    index: number;
    /**
     * Callback to remove the proposed stage.
     */
    remove: (index: number) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StageInputItemBaseForm = Record<string, any>;

export const StageInputItem: React.FC<IStageInputItemProps> = (props) => {
    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);
    const [isBodyDialogOpen, setIsBodyDialogOpen] = useState(false);
    const [selectedBodyIndex, setSelectedBodyIndex] = useState<number>(0);
    const { name, index, remove } = props;

    const { setValue } = useFormContext();

    const bodyFieldArrayName = `${name}.${index}.bodies`;
    const {
        fields: bodyFields,
        append: appendBody,
        remove: removeBody,
        update: updateBody,
    } = useFieldArray({ name: bodyFieldArrayName });

    console.log('bodyFields', bodyFields);

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

    const typeValue = useWatch({ name: typeFieldName });

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
                days: 7,
                hours: 0,
                minutes: 0,
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

    const stageExpirationPeriodFieldName = `${name}.${index}.expirationPeriod`;
    const stageExpirationPeriodField = useFormField<
        Record<string, IDateDuration>,
        typeof stageExpirationPeriodFieldName
    >(stageExpirationPeriodFieldName, {
        label: 'Expiration Period',
        defaultValue: {
            days: 7,
            hours: 0,
            minutes: 0,
        },
    });

    const bodyNameFieldName = `${name}.${index}.bodyName`;
    const bodyNameField = useFormField<StageInputItemBaseForm, typeof bodyNameFieldName>(bodyNameFieldName, {
        label: 'Name',
        defaultValue: '',
    });

    const bodyGovernanceTypeFieldName = `${name}.${index}.bodyGovernanceType`;
    const bodyGovernanceTypeField = useFormField<StageInputItemBaseForm, typeof bodyGovernanceTypeFieldName>(
        bodyGovernanceTypeFieldName,
        {
            label: 'Governance type',
            defaultValue: 'tokenVoting',
        },
    );

    const tokenNameFieldName = `${name}.${index}.tokenName`;
    const tokenNameField = useFormField<StageInputItemBaseForm, typeof tokenNameFieldName>(tokenNameFieldName, {
        label: 'Name',
        defaultValue: '',
    });

    const tokenSymbolFieldName = `${name}.${index}.tokenSymbol`;
    const tokenSymbolField = useFormField<StageInputItemBaseForm, typeof tokenSymbolFieldName>(tokenSymbolFieldName, {
        label: 'Symbol',
        defaultValue: '',
        rules: { maxLength: 10, validate: (value) => /^[A-Za-z]+$/.test(value) ?? 'Only letters are allowed' },
    });

    const handleSaveTimingValues = (values: ICreateProcessFormTimingValues) => {
        setValue(votingPeriodFieldName, values.votingPeriod);
        setValue(earlyStageFieldName, values.earlyStage);
        setValue(stageExpirationFieldName, values.stageExpiration);
        setIsTimingDialogOpen(false);
    };

    const handleSaveBodyValues = (values: ICreateProcessFormBody) => {
        const newBody = {
            bodyName: values.bodyName,
            governanceType: values.governanceType,
            tokenName: tokenNameField.value,
            tokenSymbol: tokenSymbolField.value,
            members: values.members,
        };

        if (selectedBodyIndex >= 0 && selectedBodyIndex < bodyFields.length) {
            updateBody(selectedBodyIndex, newBody);
        } else {
            appendBody(newBody);
        }

        setIsBodyDialogOpen(false);
    };

    console.log('hello', bodyFields[selectedBodyIndex]);

    return (
        <>
            <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
                <InputText
                    helpText="Name the stage, so members are able to recognize it"
                    placeholder="Type a name"
                    {...nameField}
                />
                <RadioGroup
                    className="flex flex-col gap-x-4 md:!flex-row"
                    onValueChange={typeField.onChange}
                    helpText="Specify what kind of stage"
                    {...typeField}
                >
                    <RadioCard className="w-full" label="Normal" description="" value="normal" />
                    <RadioCard className="w-full" label="Optimistic" description="" value="optimistic" />
                </RadioGroup>

                <InputContainer
                    useCustomWrapper={true}
                    className="flex w-full flex-col items-start gap-y-3"
                    id={timingFieldName}
                    helpText="Define the timing of the stage, so all bodies have enough time to execute and advance the proposals."
                    {...timingField}
                >
                    <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                        <DefinitionList.Item term="Voting period">
                            {`${votingPeriodField.value.days} days, ${votingPeriodField.value.hours} hours, ${votingPeriodField.value.minutes} minutes`}
                        </DefinitionList.Item>
                        {typeValue === 'normal' && (
                            <DefinitionList.Item term="Early stage advance">
                                <Tag
                                    className="w-fit"
                                    label={earlyStageField.value === true ? 'Yes' : 'No'}
                                    variant={earlyStageField.value === true ? 'primary' : 'neutral'}
                                />
                            </DefinitionList.Item>
                        )}
                        <DefinitionList.Item term="Stage expiration">
                            <Tag
                                className="w-fit"
                                label={stageExpirationField.value === true ? 'Yes' : 'No'}
                                variant={stageExpirationField.value === true ? 'primary' : 'neutral'}
                            />
                        </DefinitionList.Item>
                        {stageExpirationField.value && (
                            <DefinitionList.Item term="Expiration period">
                                {`${stageExpirationPeriodField.value.days} days, ${stageExpirationPeriodField.value.hours} hours, ${stageExpirationPeriodField.value.minutes} minutes`}
                            </DefinitionList.Item>
                        )}
                    </DefinitionList.Container>
                </InputContainer>
                <Button onClick={() => setIsTimingDialogOpen(true)} variant="tertiary" size="md" className="w-fit">
                    Edit timing
                </Button>

                <InputContainer
                    className="flex flex-col gap-2 rounded-xl"
                    id="resourcesInput"
                    label="Voting bodies"
                    helpText="Add at least one voting body which has to participate in this stage. We recommend not to add more than 3 bodies per stage."
                    useCustomWrapper={true}
                >
                    {bodyFields.length > 0 && (
                        <div className="flex flex-col gap-3 md:gap-2">
                            {bodyFields.map((field: any, index) => (
                                <Card key={field.id} className="overflow-hidden border border-neutral-100">
                                    <Accordion.Container isMulti={true}>
                                        <Accordion.Item value={field.id}>
                                            <Accordion.ItemHeader>
                                                <Heading size="h4">{field.bodyName}</Heading>
                                            </Accordion.ItemHeader>
                                            <Accordion.ItemContent>
                                                <DefinitionList.Container className="w-full">
                                                    <DefinitionList.Item term="Token">
                                                        {field.tokenName} (${field.tokenSymbol})
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item term="Distribution">
                                                        {field.members?.length} token holders
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item term="Supply">
                                                        {field.members
                                                            ? `${formatterUtils.formatNumber(
                                                                  field.members.reduce(
                                                                      (sum: number, member: ITokenVotingMember) =>
                                                                          sum + Number(member.tokenAmount),
                                                                      0,
                                                                  ),
                                                                  { format: NumberFormat.TOKEN_AMOUNT_LONG },
                                                              )} $${field.tokenSymbol}`
                                                            : 0}
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item term="Approval threshold">
                                                        TK
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item term="Minimum participation">
                                                        TK
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item term="Voting change">
                                                        <Tag label="No" variant="neutral" className="max-w-fit" />
                                                    </DefinitionList.Item>
                                                </DefinitionList.Container>
                                                <div className="flex w-full grow justify-between">
                                                    <Button
                                                        className="justify-end"
                                                        variant="secondary"
                                                        size="md"
                                                        onClick={() => {
                                                            setSelectedBodyIndex(index);
                                                            setIsBodyDialogOpen(true);
                                                        }}
                                                    >
                                                        Edit body
                                                    </Button>
                                                    <Dropdown.Container
                                                        constrainContentWidth={false}
                                                        size="md"
                                                        customTrigger={
                                                            <Button
                                                                className="w-fit"
                                                                variant="tertiary"
                                                                size="md"
                                                                iconRight={IconType.DOTS_VERTICAL}
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
                                </Card>
                            ))}
                        </div>
                    )}
                    <Button
                        size="md"
                        variant="tertiary"
                        className="w-fit"
                        iconLeft={IconType.PLUS}
                        onClick={() => {
                            setSelectedBodyIndex(-1);
                            setIsBodyDialogOpen(true);
                        }}
                    >
                        Add
                    </Button>
                </InputContainer>
                <CreateProcessFormTimingDialog
                    isTimingDialogOpen={isTimingDialogOpen}
                    setIsTimingDialogOpen={setIsTimingDialogOpen}
                    earlyStageField={earlyStageField}
                    stageExpirationField={stageExpirationField}
                    stageExpirationPeriodField={stageExpirationPeriodField}
                    votingPeriodField={votingPeriodField}
                    handleSaveTimingValues={handleSaveTimingValues}
                    typeValue={typeValue}
                    bodyGovernanceTypeField={bodyGovernanceTypeField}
                />
                <CreateProcessFormAddBodyDialog
                    isBodyDialogOpen={isBodyDialogOpen}
                    setIsBodyDialogOpen={setIsBodyDialogOpen}
                    handleSaveBodyValues={handleSaveBodyValues}
                    bodyNameField={bodyNameField}
                    bodyIndex={selectedBodyIndex} // Passing selectedBodyIndex here
                    stageIndex={index}
                    bodyGovernanceTypeField={bodyGovernanceTypeField}
                    tokenSymbolField={tokenSymbolField}
                    tokenNameField={tokenNameField}
                    initialValues={
                        selectedBodyIndex >= 0 && selectedBodyIndex < bodyFields.length
                            ? {
                                  /** @ts-ignore */
                                  bodyName: bodyFields[selectedBodyIndex].bodyName,
                                  /** @ts-ignore */
                                  governanceType: bodyFields[selectedBodyIndex].governanceType,
                                  /** @ts-ignore */
                                  tokenName: bodyFields[selectedBodyIndex].tokenName,
                                  /** @ts-ignore */
                                  tokenSymbol: bodyFields[selectedBodyIndex].tokenSymbol,
                                  /** @ts-ignore */
                                  members: bodyFields[selectedBodyIndex].members,
                              }
                            : null
                    }
                />
                <div className="flex self-end">
                    <Dropdown.Container
                        constrainContentWidth={false}
                        size="md"
                        customTrigger={
                            <Button className="w-fit" variant="tertiary" size="md" iconRight={IconType.DOTS_VERTICAL}>
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
