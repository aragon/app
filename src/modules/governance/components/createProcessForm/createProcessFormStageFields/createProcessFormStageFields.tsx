import { type ICreateProcessFormBody } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import {
    CreateProcessFormTimingDialog,
    type ICreateProcessFormTimingValues,
} from '@/modules/governance/components/createProcessForm/createProcessFormTimingDialog';

import { CreateProcessFormBodySummary } from '@/modules/governance/components/createProcessForm/createProcessFormBodySummary';
import { ICreateProcessFormStageFieldsProps } from '@/modules/governance/components/createProcessForm/createProcessFormStageFields';
import { CreateProcessFormTimingSummary } from '@/modules/governance/components/createProcessForm/createProcessFormTimingSummary';
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
import { CreateProcessFormBodyDialog } from '../createProcessFormBodyDialog';
import { getBodyFieldsArray } from '../utils/getBodyFields';
import { getAllStageFields } from '../utils/getStageFields';

export const CreateProcessFormStageFields: React.FC<ICreateProcessFormStageFieldsProps> = (props) => {
    const { stageFields, stageName, stageIndex, stageRemove } = props;
    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);
    const [isBodyDialogOpen, setIsBodyDialogOpen] = useState(false);
    const [selectedBodyIndex, setSelectedBodyIndex] = useState<number>(-1);
    const chainId = useChainId();

    const { setValue, getValues } = useFormContext();
    const { buildEntityUrl } = useBlockExplorer();

    const {
        stageNameField,
        typeField,
        votingPeriodField,
        earlyStageField,
        stageExpirationField,
        stageExpirationPeriodField,
    } = getAllStageFields(stageName, stageIndex);

    const { fields: bodyFields, appendBody, removeBody, updateBody } = getBodyFieldsArray(stageName, stageIndex);

    const handleSaveTimingValues = (values: ICreateProcessFormTimingValues) => {
        setValue(votingPeriodField.name, values.votingPeriod);
        setValue(earlyStageField.name, values.earlyStage);
        setValue(stageExpirationField.name, values.stageExpiration);
        setIsTimingDialogOpen(false);
    };

    const handleSaveBodyValues = (values: ICreateProcessFormBody) => {
        if (selectedBodyIndex >= 0 && selectedBodyIndex < bodyFields.length) {
            updateBody(selectedBodyIndex, values);
        } else {
            appendBody(values);
        }

        setIsBodyDialogOpen(false);
        setSelectedBodyIndex(-1);
    };

    const handleAddBody = () => {
        setSelectedBodyIndex(bodyFields.length);
        setIsBodyDialogOpen(true);
    };

    const formattedAddressWithBlockExplorer = (address: string) => {
        const url = buildEntityUrl({ id: address, chainId, type: ChainEntityType.ADDRESS });
        return (
            <Link href={url} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                <li>{addressUtils.truncateAddress(address)}</li>
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
                    onValueChange={typeField.onChange}
                    helpText="Specify what kind of stage"
                    {...typeField}
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
                        votingPeriodField={votingPeriodField}
                        earlyStageField={earlyStageField}
                        stageExpirationField={stageExpirationField}
                        stageExpirationPeriodField={stageExpirationPeriodField}
                        typeFieldValue={typeField.value}
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
                    {bodyFields.length > 0 && (
                        <CreateProcessFormBodySummary
                            bodyFields={bodyFields}
                            setSelectedBodyIndex={setSelectedBodyIndex}
                            setIsBodyDialogOpen={setIsBodyDialogOpen}
                            removeBody={removeBody}
                            formattedAddressWithBlockExplorer={formattedAddressWithBlockExplorer}
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
                <CreateProcessFormTimingDialog
                    isTimingDialogOpen={isTimingDialogOpen}
                    earlyStageField={earlyStageField}
                    stageExpirationField={stageExpirationField}
                    stageExpirationPeriodField={stageExpirationPeriodField}
                    votingPeriodField={votingPeriodField}
                    typeField={typeField}
                    setIsTimingDialogOpen={setIsTimingDialogOpen}
                    handleSaveTimingValues={handleSaveTimingValues}
                />
                {isBodyDialogOpen && (
                    <CreateProcessFormBodyDialog
                        isBodyDialogOpen={isBodyDialogOpen}
                        setIsBodyDialogOpen={setIsBodyDialogOpen}
                        handleSaveBodyValues={handleSaveBodyValues}
                        stageName={stageName}
                        stageIndex={stageIndex}
                        bodyIndex={selectedBodyIndex}
                        /** @ts-expect-error will fix types between initial values and formData TODO */
                        initialValues={
                            selectedBodyIndex >= 0 && selectedBodyIndex < bodyFields.length
                                ? bodyFields[selectedBodyIndex]
                                : null
                        }
                    />
                )}
                {stageFields.length > 1 && (
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
        </>
    );
};
