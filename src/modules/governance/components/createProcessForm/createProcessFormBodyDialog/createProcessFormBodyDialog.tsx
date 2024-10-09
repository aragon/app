/* eslint-disable @typescript-eslint/no-explicit-any */

import { CreateProcessFormBodyDialogSteps } from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialog/createProcessFormBodyDialogSteps/createProcessFormBodyDialogSteps';
import { validateStep } from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialog/createProcessFormBodyDialogStepsValidation/createProcessFormBodyDialogStepsValidation';
import {
    BodyCreationDialogSteps,
    CreateProcessFormBodyDialogStepper,
    orderedBodyCreationDialogSteps,
} from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialogStepper/createProcessFormBodyDialogStepper';
import type {
    ICreateProcessFormBodyData,
    IOpenDialogState,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useBodyFields } from '@/modules/governance/components/createProcessForm/hooks/useBodyFields';
import { Dialog } from '@aragon/ods';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormBodyDialogProps {
    /**
     * The name of the stage
     */
    stageName: string;
    /**
     * The index of the stage
     */
    stageIndex: number;
    /**
     * Function to remove a body from the stage.
     */
    removeBody: (index: number) => void;
    /**
     * Function to update a body from the stage.
     */
    updateBody: (index: number, values: ICreateProcessFormBodyData) => void;
    /**
     * State to control the dialog open state.
     */
    isBodyDialogOpen: IOpenDialogState;
    /**
     * Function to set the dialog open state.
     */
    setIsBodyDialogOpen: (value: IOpenDialogState) => void;
}

export const CreateProcessFormBodyDialog: React.FC<ICreateProcessFormBodyDialogProps> = (props) => {
    const { stageName, stageIndex, removeBody, updateBody, isBodyDialogOpen, setIsBodyDialogOpen } = props;
    const { getValues, setError, trigger } = useFormContext();
    const [currentStep, setCurrentStep] = useState<BodyCreationDialogSteps>(
        isBodyDialogOpen.editBodyIndex != null
            ? BodyCreationDialogSteps.PLUGIN_METADATA
            : BodyCreationDialogSteps.PLUGIN_SELECT,
    );

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
        setCurrentStep(BodyCreationDialogSteps.PLUGIN_SELECT);
        setIsBodyDialogOpen({ dialogOpen: false, editBodyIndex: undefined });
    };

    const handleSave = () => {
        setCurrentStep(BodyCreationDialogSteps.PLUGIN_SELECT);
        setIsBodyDialogOpen({ dialogOpen: false, editBodyIndex: undefined });
    };
    const stepComponentProps = {
        stageName,
        stageIndex,
        bodyIndex,
        bodyGovernanceType: bodyGovernanceTypeField.value,
    };

    const currentStepComponent = CreateProcessFormBodyDialogSteps[currentStep](stepComponentProps);

    const totalSteps = orderedBodyCreationDialogSteps.length;

    const handleValidateStep = async (step: BodyCreationDialogSteps): Promise<boolean> => {
        return await validateStep({
            step,
            trigger,
            getValues,
            setError,
            stageName,
            stageIndex,
            bodyIndex,
            bodyGovernanceType: bodyGovernanceTypeField.value,
        });
    };

    const handleNext = () => {
        const currentIndex = orderedBodyCreationDialogSteps.indexOf(currentStep);
        if (currentIndex < orderedBodyCreationDialogSteps.length - 1) {
            setCurrentStep(orderedBodyCreationDialogSteps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const currentIndex = orderedBodyCreationDialogSteps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(orderedBodyCreationDialogSteps[currentIndex - 1]);
        }
    };

    return (
        <Dialog.Root
            containerClassName="!max-w-[640px]"
            open={isBodyDialogOpen.dialogOpen}
            onPointerDownOutside={(e) => e.preventDefault()}
            role="dialog"
            aria-labelledby="dialog-title"
            aria-modal="true"
        >
            <Dialog.Header id="dialog-title" title="Add voting body" onCloseClick={handleCancel} />
            <Dialog.Content>
                <CreateProcessFormBodyDialogStepper
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={handleNext}
                    onBack={handleBack}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    editMode={isBodyDialogOpen.editBodyIndex != null}
                    validateStep={handleValidateStep}
                >
                    {currentStepComponent}
                </CreateProcessFormBodyDialogStepper>
            </Dialog.Content>
            <Dialog.Footer />
        </Dialog.Root>
    );
};
