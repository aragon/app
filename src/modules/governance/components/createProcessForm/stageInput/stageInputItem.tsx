import {
    ICreateProcessFormData,
    type ICreateProcessFormBody,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import {
    CreateProcessFormTimingDialog,
    type ICreateProcessFormTimingValues,
} from '@/modules/governance/components/createProcessForm/createProcessFormTimingDialog';

import { CreateProcessFormBodyField } from '@/modules/governance/components/createProcessForm/createProcessFormBodyField/createProcessFormBodyField';
import { CreateProcessFormTimingSummary } from '@/modules/governance/components/createProcessForm/createProcessFormTimingSummary/createProcessFormTimingSummary';
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
import { CreateProcessFormAddBodyDialog } from '../createProcessFormAddBodyDialog';
import { getAllStageFields } from '../getFormFields/getFormFields';

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
    const chainId = useChainId();

    const { setValue, formState, getValues } = useFormContext();
    const { buildEntityUrl } = useBlockExplorer();

    /** @ts-expect-error need to figure out formData typing in several places */
    const currentValues: ICreateProcessFormData = getValues();

    const {
        stageNameField,
        typeField,
        votingPeriodField,
        earlyStageField,
        stageExpirationField,
        stageExpirationPeriodField,
        supportThresholdPercentageField,
        minimumParticipationPercentageField,
        voteChangeField,
        tokenNameField,
        tokenSymbolField,
        bodyNameField,
        bodyGovernanceTypeField,
        multisigThresholdField,
        bodyFields: { fields: bodyFields, append: appendBody, remove: removeBody, update: updateBody },
    } = getAllStageFields(name, index);

    const handleSaveTimingValues = (values: ICreateProcessFormTimingValues) => {
        setValue(votingPeriodField.name, values.votingPeriod);
        setValue(earlyStageField.name, values.earlyStage);
        setValue(stageExpirationField.name, values.stageExpiration);
        setIsTimingDialogOpen(false);
    };

    const handleSaveBodyValues = (values: ICreateProcessFormBody) => {
        const newBody = {
            bodyName: values.bodyName,
            governanceType: values.governanceType,
            tokenName: tokenNameField.value,
            tokenSymbol: tokenSymbolField.value,
            members: values.members,
            supportThresholdPercentage: supportThresholdPercentageField.value,
            minimumParticipationPercentage: minimumParticipationPercentageField.value,
            voteChange: voteChangeField.value,
            multisigThreshold: multisigThresholdField.value,
        };

        if (selectedBodyIndex >= 0 && selectedBodyIndex < bodyFields.length) {
            updateBody(selectedBodyIndex, newBody);
        } else {
            appendBody(newBody);
        }

        setIsBodyDialogOpen(false);
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
                    id={`timingSummary.${name}.${index}`}
                    useCustomWrapper={true}
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
                        <CreateProcessFormBodyField
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
                    typeValue={typeField.value}
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
                    supportThresholdPercentageField={supportThresholdPercentageField}
                    minimumParticipationPercentageField={minimumParticipationPercentageField}
                    voteChangeField={voteChangeField}
                    multisigThresholdField={multisigThresholdField}
                    initialValues={
                        selectedBodyIndex >= 0 && selectedBodyIndex < bodyFields.length
                            ? {
                                  /** @ts-expect-error will replace */
                                  bodyName: bodyFields[selectedBodyIndex].bodyName,
                                  /** @ts-expect-error will replace */
                                  governanceType: bodyFields[selectedBodyIndex].governanceType,
                                  /** @ts-expect-error will replace */
                                  tokenName: bodyFields[selectedBodyIndex].tokenName,
                                  /** @ts-expect-error will replace */
                                  tokenSymbol: bodyFields[selectedBodyIndex].tokenSymbol,
                                  /** @ts-expect-error will replace */
                                  members: bodyFields[selectedBodyIndex].members,
                                  /** @ts-expect-error will replace */
                                  supportThresholdPercentage: bodyFields[selectedBodyIndex].supportThresholdPercentage,
                                  minimumParticipationPercentage:
                                      /** @ts-expect-error will replace */
                                      bodyFields[selectedBodyIndex].minimumParticipationPercentage,
                                  /** @ts-expect-error will replace */
                                  voteChange: bodyFields[selectedBodyIndex].voteChange,
                                  /** @ts-expect-error will replace */
                                  multisigThreshold: bodyFields[selectedBodyIndex].multisigThreshold,
                              }
                            : null
                    }
                />
                {currentValues.stages.length > 1 && (
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
                            <Dropdown.Item onClick={() => remove(index)}>Remove stage</Dropdown.Item>
                        </Dropdown.Container>
                    </div>
                )}
            </Card>
        </>
    );
};
