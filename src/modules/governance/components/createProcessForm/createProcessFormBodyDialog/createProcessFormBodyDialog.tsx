/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    ICreateProcessFormBodyData,
    IOpenDialogState,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { CreateProcessFormMultisigDetails } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMultisigDetails/createProcessFormMultisigDetails';
import { CreateProcessFormMultisigParams } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMultsigParams/createProcessFormMultisigParams';
import { CreateProcessFormPluginMetadata } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormPluginMetadata/createProcessFormPluginMetadata';
import { CreateProcessFormPluginSelect } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormPluginSelect/createProcessFormPluginSelect';
import { CreateProcessFormTokenVotingDetails } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingDetails/createProcessFormTokenVotingDetails';
import { CreateProcessFormTokenVotingParams } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingParams/createProcessFormTokenVotingParams';
import { useBodyFields } from '@/modules/governance/components/createProcessForm/hooks/useBodyFields';
import { Button, Dialog } from '@aragon/ods';
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
    const [step, setStep] = useState(isBodyDialogOpen.editBodyIndex != null ? 1 : 0);
    const { getValues } = useFormContext();

    const bodies = getValues(`${stageName}.${stageIndex}.bodies`);

    const [bodyIndex] = useState<number>(() => isBodyDialogOpen.editBodyIndex ?? bodies.length);

    const bodyFields = useBodyFields(stageName, stageIndex, bodyIndex);

    const { bodyGovernanceTypeField } = bodyFields;

    const initialStateRef = useRef<ICreateProcessFormBodyData | null>(null);

    useEffect(() => {
        if (isBodyDialogOpen.dialogOpen) {
            const currentState = getValues(`${stageName}.${stageIndex}.bodies.${bodyIndex}`);

            initialStateRef.current = JSON.parse(JSON.stringify(currentState));
        }
    }, [isBodyDialogOpen.dialogOpen, bodyIndex, getValues, stageIndex, stageName]);

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
            setStep(step + 1);
        }

        if (step === 3) {
            handleSave();
        }
    };

    const handleStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <CreateProcessFormPluginSelect
                        stageName={stageName}
                        stageIndex={stageIndex}
                        bodyIndex={bodyIndex}
                    />
                );
            case 1:
                return (
                    <CreateProcessFormPluginMetadata
                        stageName={stageName}
                        stageIndex={stageIndex}
                        bodyIndex={bodyIndex}
                    />
                );
            case 2:
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
            case 3:
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
            onPointerDownOutside={(e) => e.preventDefault()}
        >
            <Dialog.Header title="Add voting body" onCloseClick={handleCancel} />
            <Dialog.Content className="flex flex-col gap-6 pb-1.5 pt-6">
                {handleStepContent(step)}
                <div className="flex w-full justify-between">
                    <Button
                        variant="tertiary"
                        disabled={isBodyDialogOpen.editBodyIndex != null && step === 1}
                        onClick={step === 0 ? handleCancel : () => setStep(step - 1)}
                    >
                        {step === 0 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button type="submit" onClick={handleAdvanceStep}>
                        {step === 3 ? 'Save' : 'Next'}
                    </Button>
                </div>
            </Dialog.Content>
            <Dialog.Footer />
        </Dialog.Root>
    );
};
