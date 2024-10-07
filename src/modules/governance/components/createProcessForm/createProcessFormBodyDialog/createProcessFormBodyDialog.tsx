/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ICreateProcessFormBodyData } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { CreateProcessFormMultisigDetails } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMultisigDetails/createProcessFormMultisigDetails';
import { CreateProcessFormMultisigParams } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMultsigParams/createProcessFormMultisigParams';
import { CreateProcessFormTokenVotingDetails } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingDetails/createProcessFormTokenVotingDetails';
import { CreateProcessFormTokenVotingParams } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingParams/createProcessFormTokenVotingParams';
import { IOpenDialogState } from '@/modules/governance/components/createProcessForm/createProcessFormStageFields/createProcessFormStageFields';
import { useBodyFields } from '@/modules/governance/components/createProcessForm/hooks/useBodyFields';
import { Button, Dialog, InputText, RadioCard, RadioGroup } from '@aragon/ods';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormBodyDialogProps {
    stageName: string;
    stageIndex: number;
    removeBody: (index: number) => void;
    updateBody: (index: number, values: ICreateProcessFormBodyData) => void;
    isBodyDialogOpen: IOpenDialogState;
    setIsBodyDialogOpen: (value: IOpenDialogState) => void;
}

export const CreateProcessFormBodyDialog: React.FC<ICreateProcessFormBodyDialogProps> = (props) => {
    const { stageName, stageIndex, removeBody, updateBody, isBodyDialogOpen, setIsBodyDialogOpen } = props;
    const [step, setStep] = useState(0);
    const { setValue, getValues } = useFormContext();

    const bodies = getValues(`${stageName}.${stageIndex}.bodies`);

    const [bodyIndex] = useState<number>(() => isBodyDialogOpen.editBodyIndex ?? bodies.length);

    const bodyFields = useBodyFields(stageName, stageIndex, bodyIndex);

    const { bodyNameField, bodyGovernanceTypeField } = bodyFields;

    const initialStateRef = useRef<ICreateProcessFormBodyData | null>(null);

    useEffect(() => {
        if (isBodyDialogOpen.dialogOpen) {
            const currentState = getValues(`${stageName}.${stageIndex}.bodies.${bodyIndex}`);

            initialStateRef.current = JSON.parse(JSON.stringify(currentState));
        }
    }, [isBodyDialogOpen.dialogOpen]);

    const handleCancel = () => {
        if (isBodyDialogOpen.editBodyIndex === undefined) {
            removeBody(bodyIndex);
        } else if (initialStateRef.current) {
            updateBody(bodyIndex, initialStateRef.current);
        }

        setIsBodyDialogOpen({ dialogOpen: false, editBodyIndex: undefined });
    };

    const handleSave = () => {
        setStep(0);

        setIsBodyDialogOpen({ dialogOpen: false, editBodyIndex: undefined });
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
                            helpText="Choose your governance plugin primitive."
                            onValueChange={(value) => setValue(bodyGovernanceTypeField.name, value)}
                            {...bodyGovernanceTypeField}
                            defaultValue={bodyGovernanceTypeField.value}
                        >
                            <RadioCard
                                className="w-full"
                                label="Token voting"
                                description="Create or import an ERC-20 token"
                                value="tokenVoting"
                            />
                            <RadioCard
                                className="w-full"
                                label="Multisig"
                                description="Define which addresses are members"
                                value="multisig"
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
            open={isBodyDialogOpen.dialogOpen}
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
