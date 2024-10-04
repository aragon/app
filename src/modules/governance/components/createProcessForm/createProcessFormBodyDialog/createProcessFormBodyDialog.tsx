/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ICreateProcessFormBody } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { CreateProcessFormMultisigDetails } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMultisigDetails/createProcessFormMultisigDetails';
import { CreateProcessFormMultisigParams } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMultsigParams/createProcessFormMultisigParams';
import { CreateProcessFormTokenVotingDetails } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingDetails/createProcessFormTokenVotingDetails';
import { CreateProcessFormTokenVotingParams } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingParams/createProcessFormTokenVotingParams';
import { getAllBodyFields } from '@/modules/governance/components/createProcessForm/utils/getBodyFields';
import { Button, Dialog, InputText, RadioCard, RadioGroup } from '@aragon/ods';
import type React from 'react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormBodyDialogProps {
    stageName: string;
    stageIndex: number;
    bodyIndex: number;
    isBodyDialogOpen: boolean;
    setIsBodyDialogOpen: (value: boolean) => void;
    handleSaveBodyValues: (value: ICreateProcessFormBody) => void;
}

export const CreateProcessFormBodyDialog: React.FC<ICreateProcessFormBodyDialogProps> = (props) => {
    const { handleSaveBodyValues, bodyIndex, stageName, stageIndex, isBodyDialogOpen, setIsBodyDialogOpen } = props;
    const [step, setStep] = useState(0);
    const { resetField, setValue, watch } = useFormContext();

    const {
        bodyNameField,
        bodyGovernanceTypeField,
        tokenNameField,
        tokenSymbolField,
        supportThresholdPercentageField,
        minimumParticipationPercentageField,
        voteChangeField,
        multisigThresholdField,
    } = getAllBodyFields(stageName, stageIndex, bodyIndex);

    const handleSave = () => {
        const values = {
            bodyName: watch(bodyNameField.name),
            governanceType: watch(bodyGovernanceTypeField.name),
            tokenName: watch(tokenNameField.name),
            tokenSymbol: watch(tokenSymbolField.name),
            supportThresholdPercentage: watch(supportThresholdPercentageField.name),
            minimumParticipationPercentage: watch(minimumParticipationPercentageField.name),
            voteChange: watch(voteChangeField.name),
            multisigThreshold: watch(multisigThresholdField.name),
            members: watch(`${stageName}.${stageIndex}.bodies.${bodyIndex}.members`),
        };
        handleSaveBodyValues(values);
        setIsBodyDialogOpen(false);
    };

    const handleCancel = () => {
        resetField(bodyNameField.name);
        resetField(bodyGovernanceTypeField.name);
        resetField(tokenNameField.name);
        resetField(tokenSymbolField.name);
        resetField(supportThresholdPercentageField.name);
        resetField(minimumParticipationPercentageField.name);
        resetField(voteChangeField.name);
        resetField(`${stageName}.${stageIndex}.bodies.${bodyIndex}.members`);

        setStep(0);
        setIsBodyDialogOpen(false);
    };
    const handleAdvanceStep = async () => {
        if (step === 0) {
            setStep(step + 1);
        }

        if (step === 1) {
            setStep(step + 1);
        }

        if (step === 2) {
            handleSave();
        }
    };
    console.log('bodyGovernanceTypeField', bodyGovernanceTypeField.value);
    const handleStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <InputText
                            placeholder="Enter a name"
                            helpText="Give modules a name so members are able to recognise which body is participating."
                            {...bodyNameField}
                        />
                        <RadioGroup
                            className="flex gap-4"
                            helpText={`${stageName}.${stageIndex}.${bodyIndex}`}
                            onValueChange={(value) => setValue(bodyGovernanceTypeField.name, value)}
                            {...bodyGovernanceTypeField}
                            defaultValue={bodyGovernanceTypeField.value}
                        >
                            <RadioCard
                                className="w-full"
                                label="Token voting"
                                description="Create or import an ERC-20 token"
                                value="tokenVoting"
                                disabled={
                                    bodyGovernanceTypeField.value === 'multisig' &&
                                    bodyGovernanceTypeField.value !== undefined
                                }
                            />
                            <RadioCard
                                className="w-full"
                                label="Multisig"
                                description="Define which addresses are members"
                                value="multisig"
                                disabled={
                                    bodyGovernanceTypeField.value === 'tokenVoting' &&
                                    bodyGovernanceTypeField.value === undefined
                                }
                            />
                        </RadioGroup>
                    </>
                );
            case 1:
                if (bodyGovernanceTypeField.value === 'tokenVoting') {
                    return (
                        <CreateProcessFormTokenVotingDetails
                            bodyIndex={bodyIndex}
                            stageName={stageName}
                            stageIndex={stageIndex}
                        />
                    );
                } else if (bodyGovernanceTypeField.value === 'multisig') {
                    return (
                        <CreateProcessFormMultisigDetails
                            bodyIndex={bodyIndex}
                            stageName={stageName}
                            stageIndex={stageIndex}
                        />
                    );
                }
                break;
            case 2:
                if (bodyGovernanceTypeField.value === 'tokenVoting') {
                    return (
                        <CreateProcessFormTokenVotingParams
                            stageIndex={stageIndex}
                            stageName={stageName}
                            bodyIndex={bodyIndex}
                        />
                    );
                } else if (bodyGovernanceTypeField.value === 'multisig') {
                    return (
                        <CreateProcessFormMultisigParams
                            stageIndex={stageIndex}
                            stageName={stageName}
                            bodyIndex={bodyIndex}
                        />
                    );
                }
                break;
            default:
                return <></>;
        }
    };

    return (
        <Dialog.Root
            containerClassName="!max-w-[640px]"
            open={isBodyDialogOpen}
            onOpenChange={() => setIsBodyDialogOpen(false)}
            onPointerDownOutside={handleCancel}
            aria-describedby={`Add a body to governance process stage.`}
        >
            <Dialog.Header title="Add voting body" onCloseClick={handleCancel} />
            <Dialog.Content
                aria-describedby={`Add a body to governance process stage.`}
                className="flex flex-col gap-6 pb-1.5"
            >
                {handleStepContent(step)}
                <div className="flex w-full justify-between">
                    <Button variant="tertiary" onClick={step === 0 ? handleCancel : () => setStep(step - 1)}>
                        {step === 0 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button type="submit" onClick={handleAdvanceStep}>
                        {step === 2 ? 'Save' : 'Next'}
                    </Button>
                </div>
            </Dialog.Content>
            <Dialog.Footer />
        </Dialog.Root>
    );
};
