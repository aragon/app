import { Card, Dialog, InputText } from '@aragon/ods';
import { useState } from 'react';

export interface ICreateProcessFormAddBodyDialogProps {
    isBodyDialogOpen: boolean;
    setIsBodyDialogOpen: (value: boolean) => void;
    handleSaveBodyValues: (value: any) => void;
    bodyNameField: any;
}

export interface ICreateProcessFormBodyValues {
    name: string;
}

const StepOne = (bodyNameField: any) => {
    return (
        <InputText
            placeholder="Enter a name"
            helpText="Give modules a name so members are able to recognise which body is participating."
            {...bodyNameField}
        />
    );
};
const StepTwo = () => <Card className="p-6">STEP 2</Card>;
const StepThree = () => <Card className="p-6">STEP 3</Card>;

export const CreateProcessFormAddBodyDialog: React.FC<ICreateProcessFormAddBodyDialogProps> = (props) => {
    const { bodyNameField, handleSaveBodyValues } = props;
    const [step, setStep] = useState(0);
    const { isBodyDialogOpen, setIsBodyDialogOpen } = props;

    const handleStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <StepOne bodyNameField={bodyNameField} />;
            case 1:
                return <StepTwo />;
            case 2:
                return <StepThree />;
            default:
                return <StepOne />;
        }
    };

    console.log('BODYFIELD', bodyNameField);

    return (
        <Dialog.Root
            containerClassName="!max-w-[640px]"
            open={isBodyDialogOpen}
            onOpenChange={() => setIsBodyDialogOpen(false)}
        >
            <Dialog.Header title="Add voting body" />
            <Dialog.Content className="flex flex-col gap-6">{handleStepContent(step)}</Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: step === 0 ? 'Cancel' : 'Back',
                    onClick: step === 0 ? () => setIsBodyDialogOpen(false) : () => setStep(step - 1),
                }}
                secondaryAction={{
                    label: step === 2 ? 'Save' : 'Next',
                    onClick:
                        step === 2
                            ? () => {
                                  handleSaveBodyValues({ name: bodyNameField.value });
                                  setStep(0);
                              }
                            : () => setStep(step + 1),
                }}
            />
        </Dialog.Root>
    );
};
