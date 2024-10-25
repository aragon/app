import { Button } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';

export enum BodyCreationDialogSteps {
    PLUGIN_SELECT = 'PLUGIN_SELECT',
    PLUGIN_METADATA = 'PLUGIN_METADATA',
    GOVERNANCE_DISTRO = 'GOVERNANCE_DISTRO',
    GOVERNANCE_PARAMS = 'GOVERNANCE_PARAMS',
}

export const orderedBodyCreationDialogSteps: BodyCreationDialogSteps[] = [
    BodyCreationDialogSteps.PLUGIN_SELECT,
    BodyCreationDialogSteps.PLUGIN_METADATA,
    BodyCreationDialogSteps.GOVERNANCE_DISTRO,
    BodyCreationDialogSteps.GOVERNANCE_PARAMS,
];

export interface ICreateProcessFormBodyDialogStepperProps {
    currentStep: BodyCreationDialogSteps;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    onCancel: () => void;
    onSave: () => void;
    validateStep: (step: BodyCreationDialogSteps) => Promise<boolean>;
    editMode: boolean;
    children: React.ReactNode;
}

export const CreateProcessFormBodyDialogStepper: React.FC<ICreateProcessFormBodyDialogStepperProps> = (props) => {
    const { currentStep, onNext, onBack, onCancel, onSave, validateStep, editMode, children } = props;
    const { formState } = useFormContext();

    const handleNext = async () => {
        const isValid = await validateStep(currentStep);
        if (isValid) {
            if (currentStep !== BodyCreationDialogSteps.GOVERNANCE_PARAMS) {
                onNext();
            } else {
                onSave();
            }
        }
    };

    const handleBack = () => {
        if (currentStep !== BodyCreationDialogSteps.PLUGIN_SELECT) {
            onBack();
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-1.5 pt-6">
            {children}
            <div className="flex w-full justify-between">
                <Button
                    variant="tertiary"
                    disabled={currentStep === BodyCreationDialogSteps.PLUGIN_METADATA && editMode}
                    onClick={currentStep === BodyCreationDialogSteps.PLUGIN_SELECT ? onCancel : handleBack}
                >
                    {currentStep === BodyCreationDialogSteps.PLUGIN_SELECT ? 'Cancel' : 'Back'}
                </Button>
                <Button type="button" onClick={handleNext} disabled={formState.isSubmitting}>
                    {currentStep === BodyCreationDialogSteps.GOVERNANCE_PARAMS ? 'Save' : 'Next'}
                </Button>
            </div>
        </div>
    );
};
