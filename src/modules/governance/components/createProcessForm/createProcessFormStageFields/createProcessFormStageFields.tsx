import { CreateProcessFormBodyDialog } from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialog';
import { CreateProcessFormBodySummary } from '@/modules/governance/components/createProcessForm/createProcessFormBodySummary';
import type { IOpenDialogState } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { type ICreateProcessFormStageFieldsProps } from '@/modules/governance/components/createProcessForm/createProcessFormStageFields';
import { CreateProcessFormTimingDialog } from '@/modules/governance/components/createProcessForm/createProcessFormTimingDialog';
import { CreateProcessFormTimingSummary } from '@/modules/governance/components/createProcessForm/createProcessFormTimingSummary';
import { useBodiesFieldArray } from '@/modules/governance/components/createProcessForm/hooks/useBodyFieldArray';
import { useStageFields } from '@/modules/governance/components/createProcessForm/hooks/useStagesFields';
import {
    Button,
    Card,
    Dropdown,
    IconType,
    InputContainer,
    InputNumber,
    InputText,
    Progress,
    RadioCard,
    RadioGroup,
} from '@aragon/ods';
import type React from 'react';
import { useState } from 'react';

export const CreateProcessFormStageFields: React.FC<ICreateProcessFormStageFieldsProps> = (props) => {
    const { stagesFieldArray, stageName, stageIndex, stageRemove } = props;
    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);
    const [isBodyDialogOpen, setIsBodyDialogOpen] = useState<IOpenDialogState>({
        dialogOpen: false,
        editBodyIndex: undefined,
    });

    const stageFields = useStageFields(stageName, stageIndex);

    const { stageNameField, stageTypeField, bodyThresholdField } = stageFields;

    const { bodiesFieldArray, removeBody, updateBody } = useBodiesFieldArray(stageName, stageIndex);
    const handleAddBody = () => {
        setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: undefined });
    };

    const handleEditBody = (index: number) => {
        setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: index });
    };

    return (
        <>
            <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
                <InputText
                    maxLength={40}
                    helpText="Name the stage, so members are able to recognize it"
                    placeholder="Type a name"
                    {...stageNameField}
                />
                <RadioGroup
                    className="flex flex-col gap-x-4 md:!flex-row"
                    onValueChange={stageTypeField.onChange}
                    helpText="Specify what kind of stage"
                    {...stageTypeField}
                >
                    <RadioCard className="w-full" label="Normal" description="" value="normal" />
                    <RadioCard className="w-full" label="Optimistic" description="" value="optimistic" />
                </RadioGroup>

                <InputContainer
                    id={`timingSummary.${stageName}.${stageIndex}`}
                    useCustomWrapper={true}
                    label="Timing"
                    className="flex w-full flex-col items-start gap-y-3"
                    helpText="Define the timing of the stage, so all bodies have enough time to execute and advance the proposals."
                >
                    <CreateProcessFormTimingSummary
                        stageName={stageName}
                        stageIndex={stageIndex}
                        onEditTimingClick={() => setIsTimingDialogOpen(true)}
                    />
                </InputContainer>

                <InputContainer
                    className="flex flex-col gap-2"
                    id="resourcesInput"
                    label={stageTypeField.value === 'optimistic' ? 'Vetoing bodies' : 'Voting bodies'}
                    helpText="Add at least one voting body which has to participate in this stage. We recommend not to add more than 3 bodies per stage."
                    useCustomWrapper={true}
                >
                    {bodiesFieldArray?.length > 0 && (
                        <CreateProcessFormBodySummary
                            bodyFieldsArray={bodiesFieldArray}
                            setIsBodyDialogOpen={() =>
                                setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: undefined })
                            }
                            removeBody={removeBody}
                            stageName={stageName}
                            stageIndex={stageIndex}
                            onEditBody={handleEditBody}
                        />
                    )}
                    <Button
                        size="md"
                        variant="tertiary"
                        className="w-fit"
                        iconLeft={IconType.PLUS}
                        onClick={handleAddBody}
                    >
                        Add
                    </Button>
                </InputContainer>

                {stagesFieldArray.length > 1 && (
                    <div className="flex self-end">
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
                            <Dropdown.Item onClick={() => stageRemove(stageIndex)}>Remove stage</Dropdown.Item>
                        </Dropdown.Container>
                    </div>
                )}
                {bodiesFieldArray.length > 0 && stageTypeField.value !== 'optimistic' && (
                    <InputContainer
                        id="bodyThreshold"
                        label="Bodies required to approve"
                        useCustomWrapper={true}
                        helpText="The amount of bodies that must approve the proposal in order for it to advance to the next stage or become executable."
                    >
                        <div className="flex w-full items-center gap-x-4 rounded-xl border border-neutral-100 p-6">
                            <InputNumber min={0} max={bodiesFieldArray.length} {...bodyThresholdField} />
                            <div className="my-auto flex size-full flex-col justify-center">
                                <Progress value={(bodyThresholdField.value / bodiesFieldArray.length) * 100} />
                                <p className="text-right">
                                    {bodyThresholdField.value} of {bodiesFieldArray.length} bodies
                                </p>
                            </div>
                        </div>
                    </InputContainer>
                )}
            </Card>
            <CreateProcessFormTimingDialog
                stageName={stageName}
                stageIndex={stageIndex}
                isTimingDialogOpen={isTimingDialogOpen}
                setIsTimingDialogOpen={setIsTimingDialogOpen}
            />
            {isBodyDialogOpen.dialogOpen && (
                <CreateProcessFormBodyDialog
                    removeBody={removeBody}
                    updateBody={updateBody}
                    isBodyDialogOpen={isBodyDialogOpen}
                    setIsBodyDialogOpen={setIsBodyDialogOpen}
                    stageName={stageName}
                    stageIndex={stageIndex}
                />
            )}
        </>
    );
};
