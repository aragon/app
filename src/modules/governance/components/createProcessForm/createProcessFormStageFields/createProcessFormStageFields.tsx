import { CreateProcessFormBodyDialog } from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialog';
import { CreateProcessFormBodySummary } from '@/modules/governance/components/createProcessForm/createProcessFormBodySummary';
import {
    IMultisigVotingMember,
    ITokenVotingMember,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { type ICreateProcessFormStageFieldsProps } from '@/modules/governance/components/createProcessForm/createProcessFormStageFields';
import { CreateProcessFormTimingDialog } from '@/modules/governance/components/createProcessForm/createProcessFormTimingDialog';
import { CreateProcessFormTimingSummary } from '@/modules/governance/components/createProcessForm/createProcessFormTimingSummary';
import { useBodiesFieldArray } from '@/modules/governance/components/createProcessForm/hooks/useBodyFieldArray';
import { useStageFields } from '@/modules/governance/components/createProcessForm/hooks/useStagesFields';
import {
    addressUtils,
    Button,
    Card,
    ChainEntityType,
    Dropdown,
    IconType,
    InputContainer,
    InputText,
    Link,
    RadioCard,
    RadioGroup,
    useBlockExplorer,
} from '@aragon/ods';
import type React from 'react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useChainId } from 'wagmi';

export interface IOpenDialogState {
    dialogOpen: boolean;
    editBodyIndex?: number;
}

export const CreateProcessFormStageFields: React.FC<ICreateProcessFormStageFieldsProps> = (props) => {
    const { stagesFieldArray, stageName, stageIndex, stageRemove } = props;
    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);
    const [isBodyDialogOpen, setIsBodyDialogOpen] = useState<IOpenDialogState>({
        dialogOpen: false,
        editBodyIndex: undefined,
    });
    const { getValues } = useFormContext();

    const chainId = useChainId();

    const { buildEntityUrl } = useBlockExplorer();

    const stageFields = useStageFields(stageName, stageIndex);

    const { stageNameField, stageTypeField } = stageFields;

    const { bodiesFieldArray, removeBody, updateBody } = useBodiesFieldArray(stageName, stageIndex);

    const handleAddBody = () => {
        setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: undefined });
    };

    const handleEditBody = (index: number) => {
        setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: index });
    };

    const formattedAddressWithBlockExplorer = (memberType?: ITokenVotingMember | IMultisigVotingMember) => {
        const url = buildEntityUrl({ id: memberType?.address?.address, chainId, type: ChainEntityType.ADDRESS });

        return (
            <Link href={url} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                {addressUtils.truncateAddress(memberType?.address?.address)}
            </Link>
        );
    };

    return (
        <>
            <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
                <InputText
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
                    id={`timingSummary.${name}.${stageIndex}`}
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
                    className="flex flex-col gap-2 rounded-xl"
                    id="resourcesInput"
                    label="Voting bodies"
                    helpText="Add at least one voting body which has to participate in this stage. We recommend not to add more than 3 bodies per stage."
                    useCustomWrapper={true}
                >
                    {bodiesFieldArray.length > 0 && (
                        <CreateProcessFormBodySummary
                            bodyFieldsArray={bodiesFieldArray}
                            setIsBodyDialogOpen={() =>
                                setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: undefined })
                            }
                            removeBody={removeBody}
                            stageName={stageName}
                            stageIndex={stageIndex}
                            formattedAddressWithBlockExplorer={formattedAddressWithBlockExplorer}
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
