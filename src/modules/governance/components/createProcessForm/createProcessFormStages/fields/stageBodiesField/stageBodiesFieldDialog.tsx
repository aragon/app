import { Dialog } from '@aragon/ods';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
    BodyCreationDialogSteps,
    CreateProcessFormBodyDialogStepper,
    orderedBodyCreationDialogSteps,
} from '../../../createProcessFormBodyDialogStepper/createProcessFormBodyDialogStepper';
import type { ICreateProcessFormBody, IOpenDialogState } from '../../../createProcessFormDefinitions';
import { useBodyFields } from '../../../hooks';
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
     * State to control the dialog open state.
     */
    isBodyDialogOpen: IOpenDialogState;
    /**
     * Function to set the dialog open state.
     */
    setIsBodyDialogOpen: (value: IOpenDialogState) => void;
}

export const StageBodiesFieldDialog: React.FC<IStageBodiesFieldDialogProps> = (props) => {
    const { stageFieldName, removeBody, updateBody, isBodyDialogOpen, setIsBodyDialogOpen } = props;
    const { getValues, setError, trigger } = useFormContext();
    const [currentStep, setCurrentStep] = useState<BodyCreationDialogSteps>(
        isBodyDialogOpen.newBody ? BodyCreationDialogSteps.PLUGIN_SELECT : BodyCreationDialogSteps.PLUGIN_METADATA,
    );

    const [bodyIndex] = useState<number>(() => isBodyDialogOpen.editBodyIndex);

    const bodyFields = useBodyFields(stageFieldName, bodyIndex);

    const { bodyGovernanceTypeField } = bodyFields;

    const initialStateRef = useRef<ICreateProcessFormBody | null>(null);

    useEffect(() => {
        if (isBodyDialogOpen.dialogOpen) {
            const currentState = getValues(`${stageFieldName}.bodies.${bodyIndex}`);
            initialStateRef.current = JSON.parse(JSON.stringify(currentState));
        }
    }, [isBodyDialogOpen.dialogOpen, bodyIndex, getValues, stageFieldName]);

    const handleCancel = () => {
        if (isBodyDialogOpen.newBody) {
            removeBody(bodyIndex);
        } else if (initialStateRef.current) {
            updateBody(bodyIndex, initialStateRef.current);
        }
        setCurrentStep(BodyCreationDialogSteps.PLUGIN_SELECT);
        setIsBodyDialogOpen({ dialogOpen: false, editBodyIndex: 0 });
    };

    const handleSave = () => {
        setCurrentStep(BodyCreationDialogSteps.PLUGIN_SELECT);
        setIsBodyDialogOpen({ dialogOpen: false, editBodyIndex: 0 });
    };

    const stepComponentProps = {
        stageFieldName,
        bodyIndex,
        bodyGovernanceType: bodyGovernanceTypeField.value,
    };

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
                bodyGovernanceType: bodyGovernanceTypeField.value,
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
