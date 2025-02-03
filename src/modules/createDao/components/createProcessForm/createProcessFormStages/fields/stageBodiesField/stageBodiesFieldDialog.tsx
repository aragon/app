import { Button, Dialog } from '@aragon/gov-ui-kit';
import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ICreateProcessFormBody, ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import {
    BodyCreationDialogSteps,
    CreateProcessFormBodyDialogSteps,
    orderedBodyCreationDialogSteps,
    validationMap,
} from './stageBodiesFieldDefinitions';

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
    const { getValues, setError, trigger, formState } = useFormContext<ICreateProcessFormData>();
    const [currentStep, setCurrentStep] = useState<BodyCreationDialogSteps>(
        isNewBody ? BodyCreationDialogSteps.PLUGIN_SELECT : BodyCreationDialogSteps.PLUGIN_METADATA,
    );

    const fieldPrefix = `${stageFieldName}.bodies.${bodyIndex.toString()}` as `stages.${number}.bodies.${number}`;
    const bodyGovernanceType = useWatch<Record<string, 'tokenVoting' | 'multisig'>>({
        name: `${fieldPrefix}.governanceType`,
    });

    const initialStateRef = useRef<ICreateProcessFormBody | null>(null);

    useEffect(() => {
        if (isOpen) {
            const currentState = getValues(fieldPrefix);
            initialStateRef.current = JSON.parse(JSON.stringify(currentState)) as ICreateProcessFormBody;
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

    const handleValidateStep = async (step: BodyCreationDialogSteps): Promise<boolean> => {
        const validationFunction = validationMap[step];

        return await validationFunction({
            step,
            trigger,
            getValues,
            setError,
            stageFieldName,
            bodyIndex,
            bodyGovernanceType,
        });
    };

    const handleNext = async () => {
        const isValid = await handleValidateStep(currentStep);

        if (isValid) {
            if (currentStep !== BodyCreationDialogSteps.GOVERNANCE_PARAMS) {
                const currentIndex = orderedBodyCreationDialogSteps.indexOf(currentStep);
                if (currentIndex < orderedBodyCreationDialogSteps.length - 1) {
                    setCurrentStep(orderedBodyCreationDialogSteps[currentIndex + 1]);
                }
            } else {
                handleSave();
            }
        }

        const currentIndex = orderedBodyCreationDialogSteps.indexOf(currentStep);
        if (currentIndex < orderedBodyCreationDialogSteps.length - 1) {
            setCurrentStep(orderedBodyCreationDialogSteps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        if (currentStep !== BodyCreationDialogSteps.PLUGIN_SELECT) {
            const currentIndex = orderedBodyCreationDialogSteps.indexOf(currentStep);
            if (currentIndex > 0) {
                setCurrentStep(orderedBodyCreationDialogSteps[currentIndex - 1]);
            }
        }
    };

    return (
        <Dialog.Root
            size="lg"
            open={isOpen}
            onPointerDownOutside={(e) => e.preventDefault()}
            hiddenDescription="Add voting body"
        >
            <Dialog.Header title="Add voting body" onClose={handleCancel} />
            <Dialog.Content>
                <div className="flex flex-col gap-6 pb-1.5 pt-6">
                    {currentStepComponent}
                    <div className="flex w-full justify-between">
                        <Button
                            variant="tertiary"
                            disabled={currentStep === BodyCreationDialogSteps.PLUGIN_METADATA && !isNewBody}
                            onClick={currentStep === BodyCreationDialogSteps.PLUGIN_SELECT ? handleCancel : handleBack}
                        >
                            {currentStep === BodyCreationDialogSteps.PLUGIN_SELECT ? 'Cancel' : 'Back'}
                        </Button>
                        <Button type="button" onClick={handleNext} disabled={formState.isSubmitting}>
                            {currentStep === BodyCreationDialogSteps.GOVERNANCE_PARAMS ? 'Save' : 'Next'}
                        </Button>
                    </div>
                </div>
            </Dialog.Content>
            <Dialog.Footer />
        </Dialog.Root>
    );
};
