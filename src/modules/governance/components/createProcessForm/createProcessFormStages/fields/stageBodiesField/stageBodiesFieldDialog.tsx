import { Dialog } from '@aragon/ods';
import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    BodyCreationDialogSteps,
    CreateProcessFormBodyDialogStepper,
    orderedBodyCreationDialogSteps,
} from '../../../createProcessFormBodyDialogStepper/createProcessFormBodyDialogStepper';
import type { ICreateProcessFormBody } from '../../../createProcessFormDefinitions';
import { CreateProcessFormBodyDialogSteps, validationMap } from './stageBodiesFieldDefinitions';

export interface IStageBodiesFieldDialogProps {
    /**
     * The name of the stage
     */
    stageFieldName: string;
    /**
     * Function to remove a body from the stage.
     */
    removeBody: (index: number) => void;
    /**
     * Function to update a body from the stage.
     */
    updateBody: (index: number, values: ICreateProcessFormBody) => void;
    /**
     * Callback called on dialog close.
     */
    onClose: () => void;
    /**
     * Defines if the dialog is open or not.
     */
    isOpen: boolean;
    /**
     * The index of the body to be edited.
     */
    bodyIndex: number;
    /**
     * Displays the plugin-select view when creating a new body.
     */
    isNewBody?: boolean;
}

export const StageBodiesFieldDialog: React.FC<IStageBodiesFieldDialogProps> = (props) => {
    const { stageFieldName, removeBody, updateBody, isOpen, bodyIndex, isNewBody, onClose } = props;
    const { getValues, setError, trigger } = useFormContext();
    const [currentStep, setCurrentStep] = useState<BodyCreationDialogSteps>(
        isNewBody ? BodyCreationDialogSteps.PLUGIN_SELECT : BodyCreationDialogSteps.PLUGIN_METADATA,
    );

    const fieldPrefix = `${stageFieldName}.bodies.${bodyIndex}`;
    const bodyGovernanceType = useWatch<Record<string, 'tokenVoting' | 'multisig'>>({
        name: `${fieldPrefix}.governanceType`,
    });

    const initialStateRef = useRef<ICreateProcessFormBody | null>(null);

    useEffect(() => {
        if (isOpen) {
            const currentState = getValues(fieldPrefix);
            initialStateRef.current = JSON.parse(JSON.stringify(currentState));
        }
    }, [isOpen, getValues, fieldPrefix]);

    const handleCancel = () => {
        if (isNewBody) {
            removeBody(bodyIndex);
        } else if (initialStateRef.current) {
            updateBody(bodyIndex, initialStateRef.current);
        }
        setCurrentStep(BodyCreationDialogSteps.PLUGIN_SELECT);
        onClose();
    };

    const handleSave = () => {
        setCurrentStep(BodyCreationDialogSteps.PLUGIN_SELECT);
        onClose();
    };

    const stepComponentProps = { fieldPrefix, bodyGovernanceType };
    const currentStepComponent = CreateProcessFormBodyDialogSteps[currentStep](stepComponentProps);
    const totalSteps = orderedBodyCreationDialogSteps.length;

    const handleValidateStep = async (step: BodyCreationDialogSteps): Promise<boolean> => {
        const validationFunction = validationMap[step];

        if (validationFunction) {
            return await validationFunction({
                step,
                trigger,
                getValues,
                setError,
                stageFieldName,
                bodyIndex,
                bodyGovernanceType,
            });
        }

        return false;
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
            open={isOpen}
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
                    editMode={!isNewBody}
                    validateStep={handleValidateStep}
                >
                    {currentStepComponent}
                </CreateProcessFormBodyDialogStepper>
            </Dialog.Content>
            <Dialog.Footer />
        </Dialog.Root>
    );
};
